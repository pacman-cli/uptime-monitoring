# AGENTS.md — Agent Instructions for uptime-monitoring

## Project Overview

Full-stack uptime monitoring app. Java 17 / Spring Boot 3.5.13 backend, PostgreSQL 16, two frontends (vanilla JS + React/Vite). Monitors target URLs on configurable intervals, tracks incidents with 3-strike rule, sends email alerts.

## Repository Layout

```
server/          — Spring Boot backend (Maven, Java 17)
  src/main/java/com/puspo/uptime/
    common/      — BaseEntity, exceptions
    config/      — Security, JWT, CORS, WebClient, rate limiting, caching
    modules/
      auth/      — Register, login, JWT, refresh tokens
      monitor/   — CRUD for monitors
      check/     — Scheduler → CheckService → HttpCheckWorker pipeline
      alert/     — Alert rules, incidents (3-strike logic)
      notification/ — Email dispatch (async)
      metrics/   — Uptime %, latency percentiles
  src/main/resources/
    application.yml         — All config via env vars (no hardcoded secrets)
    db/migration/           — Flyway SQL V1–V11
  src/test/                 — JUnit 5 + Mockito, H2 in-memory DB
frontend/
  *.html, app.js            — Vanilla JS dashboard (static served)
  web/                      — React/Vite frontend (separate project)
postgresDocker/             — docker-compose.yml for local PostgreSQL
```

## Commands

### Backend

```bash
cd server

# Start (requires PostgreSQL running first)
./mvnw spring-boot:run

# Build JAR
./mvnw clean package -DskipTests

# Tests (uses H2 in-memory DB, Flyway disabled)
./mvnw test                                          # All tests
./mvnw test -Dtest=CheckServiceTest                  # Single class
./mvnw test -Dtest=CheckServiceTest#methodName       # Single method
```

**Required order**: Start PostgreSQL first (`cd postgresDocker && docker-compose up -d`), then backend. Flyway runs automatically on startup.

### Frontend (Vanilla JS)

```bash
cd frontend
python3 -m http.server 3000
# Opens at http://localhost:3000
```

### Frontend (React/Vite)

```bash
cd frontend/web
npm install
npm run dev        # Dev server on port 5173
npm run build      # Production build (tsc + vite build)
npm run typecheck  # Type checking only
```

### Database

```bash
cd postgresDocker
docker-compose up -d    # PostgreSQL 16 on port 5433
```

DB credentials: `postgres` / `password` / database `uptime_monitor` (port 5433, not 5432).

## Key Architecture Facts

- **Modular monolith**: each feature in `modules/{feature}/` with controller → service → repository layers.
- **Scheduler loop**: `MonitorScheduler` (30s default) → `CheckService.processDueActiveMonitors()` → `HttpCheckWorker.check()` per due monitor. Uses Spring `@Scheduled(fixedDelayString)`.
- **Due check logic**: Compares `lastCheck.createdAt + intervalSeconds` against now. Monitors with no prior check are always due.
- **Alert rules**: 3 consecutive DOWN checks → open incident. First UP after open incident → resolve it. Email sent on status transitions only.
- **Frontend auth**: JWT stored in `localStorage` as `uptime_jwt`. Refresh tokens in `sessionStorage` as `uptime_refresh_token`. Auto-logout on 401/403 with token refresh attempt.
- **Frontend API URL**: Configurable via `window.__API_URL__`, defaults to Render deployment URL in `frontend/app.js`.
- **React frontend**: Vite + React 19 + TypeScript + Tailwind CSS. Path alias `@` → `./src`. Uses framer-motion, GSAP, Lenis for animations.
- **CORS origins**: Configurable via `APP_CORS_ALLOWED_ORIGINS` env var. Defaults include localhost:3000, localhost:5500, and production domains.

## Testing Quirks

- Tests run against **H2 in-memory DB** (not PostgreSQL). Flyway is disabled in test profile.
- Test files: `CheckServiceTest`, `MonitorServiceTest`, `AlertServiceImplTest`, `UptimeApplicationTests`.
- Uses Mockito `@Mock` + `@InjectMocks` pattern, not Spring context loading.
- To run a single test: `./mvnw test -Dtest=ClassName#methodName`.

## Migrations

Flyway SQL files in `server/src/main/resources/db/migration/`. Naming: `V{N}__description.sql`. Currently at V11. Hibernate runs in `validate` mode — schema must match entities exactly.

**Never edit applied migrations.** Create a new `V{next}__` file for any schema change.

## Configuration

All sensitive config is via environment variables in `application.yml`:
- `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`
- `APP_CORS_ALLOWED_ORIGINS`
- JWT secret/expiration managed via `app.jwt.*` properties

## CI/CD

GitHub Actions workflow `.github/workflows/publish-container.yml` builds and pushes Docker image to `ghcr.io` on push/PR to `main`. Root `Dockerfile` builds the server JAR. `server/Dockerfile` builds from the server directory.

## Conventions

- **Lombok** used throughout: `@RequiredArgsConstructor`, `@Slf4j`, `@Builder`, `@Data`.
- **DTOs** for API responses (e.g., `AlertResponse`, `IncidentResponse`). Entities not exposed directly.
- **Ownership pattern**: All data queries filter by `user_id`. Use `@AuthenticationPrincipal User` in controllers.
- **Exception handling**: Custom exceptions in `common.exception` (`ResourceNotFoundException`, `ConflictException`). Global handler returns generic error messages — no stack traces to client.
- **Frontend rendering**: Vanilla JS uses `innerHTML` with `escapeHtml()` on all user data. React frontend is a separate project in `frontend/web/`.
