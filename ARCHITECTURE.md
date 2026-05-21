# UptimeMonitoring — System Architecture

## 1. System Architecture (High-Level)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                 │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────┐                │
│  │login.html│  │register.html │  │  index.html   │                │
│  └────┬─────┘  └──────┬───────┘  │  (Dashboard)  │                │
│       │                │          └───────┬───────┘                │
│       └────────────────┴──────────────────┘                        │
│                        │ app.js                                      │
│                        │ (Vanilla JS SPA logic)                     │
└────────────────────────┼────────────────────────────────────────────┘
                         │ HTTP (REST JSON)
                         │ Bearer JWT in Authorization header
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     SPRING BOOT SERVER                               │
│                                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐    │
│  │ Auth Module │  │Monitor Module│  │   Check Module          │    │
│  │  /auth/**   │  │ /monitors/** │  │  (Scheduler + Worker)   │    │
│  └─────────────┘  └──────────────┘  └────────────────────────┘    │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐    │
│  │Alert Module │  │Metrics Module│  │  Notification Module    │    │
│  │ /alerts/**  │  │ /metrics/**  │  │  (Email Service)        │    │
│  └─────────────┘  └──────────────┘  └────────────────────────┘    │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              Config Layer                                    │   │
│  │  SecurityConfig │ JwtFilter │ CORS │ WebClient │ OpenAPI    │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     DATA LAYER                                       │
│              PostgreSQL (JPA/Hibernate)                              │
│  Tables: users, monitors, monitor_logs, alerts, incidents           │
└─────────────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  EXTERNAL SERVICES                                   │
│  • Target URLs (HTTP checks via WebClient)                          │
│  • SMTP Server (email notifications)                                │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Authentication Flow

```
┌──────────┐                    ┌──────────────┐                ┌─────────┐
│  Client  │                    │  AuthController │              │   DB    │
└────┬─────┘                    └──────┬───────┘                └────┬────┘
     │                                 │                              │
     │  POST /api/v1/auth/register     │                              │
     │  {email, password}              │                              │
     ├────────────────────────────────►│                              │
     │                                 │  Check email uniqueness      │
     │                                 ├─────────────────────────────►│
     │                                 │  BCrypt encode password      │
     │                                 │  Save User                   │
     │                                 ├─────────────────────────────►│
     │                                 │  Generate JWT (HS256)        │
     │  {token: "eyJ..."}             │                              │
     │◄────────────────────────────────┤                              │
     │                                 │                              │
     │  POST /api/v1/auth/login        │                              │
     │  {email, password}              │                              │
     ├────────────────────────────────►│                              │
     │                                 │  AuthenticationManager       │
     │                                 │  .authenticate()             │
     │                                 │  (DaoAuthProvider + BCrypt)  │
     │                                 ├─────────────────────────────►│
     │  {token: "eyJ..."}             │                              │
     │◄────────────────────────────────┤                              │
     │                                 │                              │
     │  GET /api/v1/monitors           │                              │
     │  Authorization: Bearer <JWT>    │                              │
     ├────────────────────────────────►│                              │
     │         ┌───────────────────────┤                              │
     │         │ JwtAuthenticationFilter                              │
     │         │ 1. Extract token from header                         │
     │         │ 2. jwtUtil.extractUsername(token)                    │
     │         │ 3. loadUserByUsername(email)                         │
     │         │ 4. jwtUtil.isTokenValid(token, userDetails)          │
     │         │ 5. Set SecurityContext                               │
     │         └───────────────────────┤                              │
     │  200 OK + data                  │                              │
     │◄────────────────────────────────┤                              │
```

**JWT Details:**
- Algorithm: HS256
- Secret: configurable via `app.jwt.secret`
- Expiration: 24h (86400000ms, configurable via `app.jwt.expiration`)
- Subject: user email
- Storage: `localStorage` key `uptime_jwt` (client-side)

**Public endpoints (no auth):**
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/register`
- `/swagger-ui/**`, `/v3/api-docs/**`

**All other endpoints:** require valid Bearer JWT.

---

## 3. Backend Architecture (Layered)

```
┌─────────────────────────────────────────────────────────────┐
│  PRESENTATION LAYER (Controllers)                            │
│  MonitorController, AuthController, AlertController,         │
│  MetricsController                                           │
│  • @RestController, @RequestMapping                          │
│  • Input validation (@Valid)                                 │
│  • @AuthenticationPrincipal User injection                   │
├─────────────────────────────────────────────────────────────┤
│  APPLICATION / SERVICE LAYER                                 │
│  MonitorService, AuthService, CheckService, AlertServiceImpl,│
│  EmailNotificationService                                    │
│  • Business orchestration                                    │
│  • @Transactional boundaries                                 │
│  • DTO ↔ Entity mapping                                     │
├─────────────────────────────────────────────────────────────┤
│  DOMAIN LAYER (Entities)                                     │
│  User, Monitor, MonitorLog, Alert, Incident                  │
│  • JPA entities with BaseEntity (createdAt, updatedAt)       │
│  • Relationships defined via @ManyToOne                      │
├─────────────────────────────────────────────────────────────┤
│  INFRASTRUCTURE LAYER                                        │
│  • Repositories (Spring Data JPA)                            │
│  • WebClient (non-blocking HTTP for checks)                  │
│  • MonitorScheduler (@Scheduled polling)                     │
│  • HttpCheckWorker (reactive check execution)                │
│  • EmailNotificationService (SMTP)                           │
│  • JwtUtil, JwtAuthenticationFilter                          │
└─────────────────────────────────────────────────────────────┘
```

**Module structure:**
```
modules/
├── auth/          → User registration, login, JWT
├── monitor/       → CRUD monitors, metrics, history
├── check/         → Scheduler, worker, log persistence
├── alert/         → Alert rules, incidents, notifications
├── metrics/       → Uptime %, latency percentiles
└── notification/  → Email sending (UP/DOWN alerts)
```

---

## 4. Database Entity Relationship

```
┌──────────────────────┐
│        users         │
├──────────────────────┤
│ id          BIGINT PK│
│ email       VARCHAR UK│
│ password    VARCHAR   │
│ created_at  TIMESTAMP │
│ updated_at  TIMESTAMP │
└──────────┬───────────┘
           │ 1
           │
           │ N
┌──────────▼───────────────────────────────────┐
│                  monitors                     │
├───────────────────────────────────────────────┤
│ id                    BIGINT PK               │
│ user_id               BIGINT FK → users.id    │
│ name                  VARCHAR                 │
│ url                   VARCHAR                 │
│ method                VARCHAR(10)             │
│ interval_seconds      INT                     │
│ timeout_seconds       INT                     │
│ active                BOOLEAN                 │
│ headers               JSONB (nullable)        │
│ expected_status_codes VARCHAR(100) (nullable) │
│ expected_body_contains VARCHAR(500) (nullable)│
│ check_ssl_expiration  BOOLEAN (nullable)      │
│ ssl_expiry_days_threshold INT (nullable)      │
│ created_at            TIMESTAMP               │
│ updated_at            TIMESTAMP               │
└───┬──────────────┬──────────────┬────────────┘
    │ 1            │ 1            │ 1
    │              │              │
    │ N            │ N            │ N
┌───▼──────────┐ ┌▼───────────┐ ┌▼────────────┐
│ monitor_logs │ │   alerts   │ │  incidents   │
├──────────────┤ ├────────────┤ ├─────────────┤
│id      PK    │ │id      PK  │ │id       PK  │
│monitor_id FK │ │monitor_id FK│ │monitor_id FK│
│status VARCHAR│ │message  VARCHAR│ │opened_at TIMESTAMP│
│status_code INT│ │created_at   │ │resolved_at TIMESTAMP│
│response_time │ │updated_at   │ │created_at  │
│  BIGINT      │ └────────────┘ │updated_at  │
│created_at    │                 └─────────────┘
│updated_at    │
└──────────────┘
```

**Relationships:**
- `User` 1 ──── N `Monitor` (user owns monitors)
- `Monitor` 1 ──── N `MonitorLog` (check history)
- `Monitor` 1 ──── N `Alert` (triggered alerts)
- `Monitor` 1 ──── N `Incident` (outage tracking)

**BaseEntity** provides `created_at` + `updated_at` via JPA auditing on all entities.

---

## 5. Request Lifecycle

### 5a. API Request (User-initiated)

```
Client HTTP Request
       │
       ▼
┌─ CorsFilter ─────────────────────────────┐
│  Allow configured origins                 │
└───────────────────────────────────────────┘
       │
       ▼
┌─ JwtAuthenticationFilter ─────────────────┐
│  1. Extract "Bearer <token>" from header  │
│  2. Parse JWT → extract email (subject)   │
│  3. Load UserDetails from DB              │
│  4. Validate token (signature + expiry)   │
│  5. Set SecurityContext authentication    │
│  (Skip for /auth/** endpoints)            │
└───────────────────────────────────────────┘
       │
       ▼
┌─ SecurityFilterChain ─────────────────────┐
│  Authorize: public paths pass,            │
│  all others require authenticated context │
└───────────────────────────────────────────┘
       │
       ▼
┌─ Controller ──────────────────────────────┐
│  @Valid validates request body             │
│  @AuthenticationPrincipal injects User    │
│  Delegates to Service layer               │
└───────────────────────────────────────────┘
       │
       ▼
┌─ Service ─────────────────────────────────┐
│  Business logic + ownership checks        │
│  Calls Repository for persistence         │
│  Returns DTO                              │
└───────────────────────────────────────────┘
       │
       ▼
┌─ GlobalExceptionHandler ──────────────────┐
│  Catches: ResourceNotFoundException → 404 │
│           ConflictException → 409         │
│           MethodArgumentNotValid → 400    │
│           Generic → 500                   │
└───────────────────────────────────────────┘
       │
       ▼
  HTTP Response (JSON)
```

### 5b. Scheduled Check Lifecycle (Background)

```
@Scheduled (every 30s default)
       │
       ▼
MonitorScheduler.executeDueMonitorChecks()
       │
       ▼
CheckService.processDueActiveMonitors()
       │
       ├─ 1. Fetch all active monitors
       ├─ 2. Filter: only those past their interval
       │      (last log created_at + intervalSeconds < now)
       ▼
HttpCheckWorker.check(monitor)  [for each due monitor]
       │
       ├─ Build WebClient request (method + URL + custom headers)
       ├─ Execute HTTP call (reactive, non-blocking)
       ├─ On response:
       │     ├─ Validate status code (expected or 2xx default)
       │     ├─ Validate body contains (if configured)
       │     └─ Determine UP or DOWN
       ├─ On error/timeout:
       │     └─ Mark as DOWN
       ▼
HttpCheckWorker.saveLogs(monitor, status, statusCode, latency)
       │
       ├─ Save MonitorLog to DB
       ├─ Compare with previous log status
       │     ├─ Was DOWN, now UP → EmailNotificationService.sendUpAlert()
       │     └─ Was UP, now DOWN → EmailNotificationService.sendDownAlert()
       ▼
AlertService.evaluateMonitorRules(monitor)
       │
       ├─ Fetch last 3 logs
       ├─ If latest = UP and open incident exists → resolve incident + save alert
       ├─ If all 3 = DOWN and no open incident → open incident + save alert
       └─ Otherwise → no action
```

---

## 6. Frontend Page Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Vanilla JS)                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  login.html ──────► Auth gate (redirect if JWT exists)       │
│  register.html ───► Auth gate (redirect if JWT exists)       │
│  index.html ──────► Dashboard (redirect to login if no JWT)  │
│                                                              │
│  app.js (single file, all logic):                            │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  State Management                                      │ │
│  │  dashboardState = {monitors, alerts, incidents,        │ │
│  │                     selectedMonitorId, editingMonitorId}│ │
│  ├────────────────────────────────────────────────────────┤ │
│  │  API Layer                                             │ │
│  │  fetchWithAuth() — auto-attach JWT, auto-logout on 401│ │
│  │  readErrorMessage() — parse error responses            │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │  Render Functions (innerHTML-based)                    │ │
│  │  renderMonitors(), renderAlerts(), renderIncidents(),  │ │
│  │  renderOverview(), renderMonitorDetails()              │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │  Event Handlers                                        │ │
│  │  loginForm.submit, registerForm.submit,                │ │
│  │  monitorForm.submit, toggleMonitorActive(),            │ │
│  │  deleteMonitor(), openEditModal()                      │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │  UI Utilities                                          │ │
│  │  showNotice(), openScaleModal(), closeScaleModal(),    │ │
│  │  escapeHtml(), formatDateTime(), formatLatency()       │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  styles.css ── minimal custom styles (animations)            │
│  Tailwind CSS via CDN (dark mode, utility-first)             │
└─────────────────────────────────────────────────────────────┘
```

**Page flow:**
```
[No JWT] ──► login.html ──► POST /auth/login ──► store JWT ──► index.html
                                                                    │
[Has JWT] ──► index.html ──► loadDashboard() ──► render all ◄──────┘
                                                                    │
                              401/403 response ──► logout() ──► login.html
```

**Dashboard sections:**
- Overview cards (total/healthy/failing/pending counts)
- Monitor grid (status, latency, HTTP code, actions)
- Alerts panel (recent DOWN/UP notifications)
- Incidents panel (open/resolved outages with duration)
- Modals: Add/Edit monitor, View details, Delete confirmation

---

## 7. Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  TRANSPORT                                                   │
│  • CORS configured (allowed origins)                         │
│  • CSRF disabled (stateless JWT, no cookies)                 │
│  • Stateless sessions (SessionCreationPolicy.STATELESS)      │
│                                                              │
│  AUTHENTICATION                                              │
│  • JWT (HS256) with configurable secret + expiry             │
│  • BCrypt password hashing (DaoAuthenticationProvider)        │
│  • JwtAuthenticationFilter (OncePerRequestFilter)            │
│  • Token validation: signature + expiration + user existence │
│                                                              │
│  AUTHORIZATION                                               │
│  • Resource ownership: all monitor/alert queries filtered    │
│    by user_id (getOwnedMonitor pattern)                      │
│  • No role-based access (single role: authenticated user)    │
│  • @AuthenticationPrincipal injects current User entity      │
│                                                              │
│  INPUT VALIDATION                                            │
│  • @Valid + Jakarta Bean Validation on request DTOs           │
│  • GlobalExceptionHandler catches validation errors → 400    │
│                                                              │
│  OUTPUT SAFETY                                               │
│  • Frontend: escapeHtml() on all user-supplied data          │
│  • Backend: parameterized queries via JPA (no SQL injection) │
│                                                              │
│  ERROR HANDLING                                              │
│  • GlobalExceptionHandler — no stack traces to client        │
│  • JwtException caught silently (invalid token → no auth)    │
│  • 401/403 → client auto-logout                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Security boundaries:**
```
PUBLIC                          AUTHENTICATED
─────────────────────────────── ──────────────────────────────
POST /api/v1/auth/register      GET    /api/v1/monitors
POST /api/v1/auth/login         POST   /api/v1/monitors
GET  /swagger-ui/**             PUT    /api/v1/monitors/:id
GET  /v3/api-docs/**            DELETE /api/v1/monitors/:id
                                GET    /api/v1/monitors/:id/last-check
                                GET    /api/v1/monitors/:id/history
                                GET    /api/v1/alerts
                                GET    /api/v1/alerts/incidents
                                GET    /api/v1/metrics/monitor/:id
```

**Known security considerations:**
- JWT stored in localStorage (XSS-vulnerable; httpOnly cookie preferred)
- No rate limiting on auth endpoints (brute-force risk)
- No refresh token mechanism (24h hard expiry, re-login required)
- No email verification on registration
- CORS config should restrict to known frontend origins in production
