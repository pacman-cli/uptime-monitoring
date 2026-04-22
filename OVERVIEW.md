# Uptime Monitoring Project - Technical Overview

> Comprehensive documentation for contributors

---

## 📋 Project Summary

**Uptime Monitoring** is a full-stack application for monitoring website/service availability, tracking performance metrics, and sending alerts when issues are detected.

| Aspect | Details |
|--------|---------|
| **Backend** | Java 17+, Spring Boot 3.x |
| **Frontend** | Vanilla JavaScript, HTML5, CSS3 |
| **Database** | PostgreSQL 14+ |
| **Build Tool** | Maven |
| **Auth** | JWT-based authentication |
| **Email** | SMTP (Gmail configured) |
| **Monitoring** | Scheduled polling with configurable intervals |

---

## 🗂️ Project Structure

```
uptimeMonitoring/
├── server/                          # Spring Boot Backend
│   ├── src/main/java/com/puspo/uptime/
│   │   ├── UptimeApplication.java   # Application entry point
│   │   ├── common/                  # Shared utilities & exceptions
│   │   │   ├── BaseEntity.java
│   │   │   ├── exception/           # Global error handling
│   │   │   ├── response/            # API response wrappers
│   │   │   └── util/                # Helper utilities
│   │   ├── config/                  # Application configuration
│   │   │   ├── SecurityConfig.java  # Spring Security setup
│   │   │   ├── JwtAuthenticationFilter.java
│   │   │   ├── JwtUtil.java
│   │   │   ├── CorsConfig.java
│   │   │   ├── OpenApiConfig.java   # Swagger/OpenAPI docs
│   │   │   └── WebClientConfig.java
│   │   └── modules/                 # Feature modules
│   │       ├── auth/                # Authentication & authorization
│   │       ├── monitor/             # Monitor management (CRUD)
│   │       ├── check/               # Health check execution logic
│   │       ├── alert/               # Alert generation & management
│   │       ├── notification/        # Email/SMS notification dispatch
│   │       └── metrics/             # Performance metrics collection
│   ├── src/main/resources/
│   │   ├── application.yml          # Main config (DB, mail, scheduler)
│   │   └── db/migration/            # Flyway database migrations
│   ├── pom.xml                      # Maven dependencies
│   └── HELP.md                      # Spring Boot help guide
│
├── frontend/                        # Static Frontend
│   ├── index.html                   # Dashboard/main view
│   ├── login.html                   # Authentication page
│   ├── register.html                # User registration
│   ├── app.js                       # Main frontend logic
│   └── styles.css                   # Global styles
│
├── postgresDocker/                  # Docker config for local PostgreSQL
│   └── docker-compose.yml
│
├── architectures/                   # Architecture diagrams & docs
│
└── .github/                         # CI/CD workflows, templates
```

---

## ✅ Implemented Features

### Backend (Spring Boot)

#### Core Infrastructure
- [x] Spring Boot 3.x application setup
- [x] PostgreSQL integration with Spring Data JPA
- [x] Flyway database migration management
- [x] JWT-based stateless authentication
- [x] CORS configuration for frontend communication
- [x] Global exception handling with standardized responses
- [x] OpenAPI/Swagger documentation endpoint

#### Modules Status

| Module | Status | Key Components |
|--------|--------|---------------|
| **auth** | ✅ Complete | Login, register, JWT token generation, role-based access |
| **monitor** | ✅ Complete | CRUD operations for monitors, URL validation, status tracking |
| **check** | ✅ Complete | Scheduled HTTP health checks, response time measurement, status determination |
| **alert** | ✅ Complete | Alert entity, incident tracking, alert rules configuration |
| **notification** | ✅ Partial | Email service configured (SMTP), template rendering |
| **metrics** | 🔄 In Progress | Basic metrics collection, aggregation logic pending |

#### Scheduler Configuration
```yaml
uptime:
  scheduler:
    poll-interval-ms: 30000  # 30-second default check interval
```

### Frontend (Vanilla JS)

- [x] Login/Registration UI with form validation
- [x] Dashboard layout for monitor listing
- [x] Basic API integration with JWT token handling
- [x] Responsive CSS styling
- [ ] Real-time status updates (WebSocket/SSE - not implemented)
- [ ] Advanced filtering/sorting of monitors
- [ ] Charts/visualization for metrics

### Database Schema (via Flyway)

Key entities identified:
- `users` - Authentication & user profiles
- `monitors` - Target URLs, check intervals, thresholds
- `checks` - Historical check results (response time, status code, timestamp)
- `alerts` - Alert configurations per monitor
- `incidents` - Downtime incident records with resolution tracking

---

## 🔄 Pending / In-Progress Work

### High Priority
1. **Notification Module Completion**
   - SMS provider integration (Twilio/Amazon SNS)
   - Webhook notification support
   - Notification preference management per user

2. **Metrics Module Enhancement**
   - Implement time-series aggregation (hourly/daily uptime %)
   - Add response time percentile calculations (p50, p95, p99)
   - Create metrics export endpoints for external dashboards

3. **Frontend Feature Expansion**
   - Real-time monitor status updates (consider Server-Sent Events)
   - Interactive charts using Chart.js or similar
   - Monitor creation/editing forms with validation
   - Alert configuration UI

### Medium Priority
4. **Testing Coverage**
   - Unit tests for service layer (currently minimal)
   - Integration tests for API endpoints
   - Frontend component tests

5. **Observability**
   - Add structured logging with correlation IDs
   - Integrate Spring Boot Actuator for health/metrics endpoints
   - Consider OpenTelemetry for distributed tracing

6. **Security Hardening**
   - Implement refresh token rotation
   - Add rate limiting on auth endpoints
   - Security headers configuration (CSP, HSTS)

### Low Priority / Nice-to-Have
7. **Multi-tenant Support**
   - Organization/workspace isolation
   - Role-based permissions beyond basic auth

8. **Advanced Monitoring**
   - TCP/port checks
   - SSL certificate expiry monitoring
   - DNS resolution checks
   - Synthetic transaction scripts

9. **Deployment & DevOps**
   - Dockerfile for backend service
   - Kubernetes manifests for production deployment
   - GitHub Actions CI/CD pipeline

---

## 🚀 Getting Started for Contributors

### Prerequisites
- Java 17 or higher
- Maven 3.8+
- PostgreSQL 14+
- Node.js 18+ (optional, for frontend tooling if added later)

### Local Development Setup

1. **Start PostgreSQL**
```bash
cd postgresDocker
docker-compose up -d
```

2. **Configure Environment**
```bash
# Copy and edit application.yml if needed
cp server/src/main/resources/application.yml server/src/main/resources/application-local.yml
# Update DB credentials, email settings as needed
```

3. **Run Backend**
```bash
cd server
./mvnw spring-boot:run
# App starts at http://localhost:8080
# API docs: http://localhost:8080/swagger-ui.html
```

4. **Run Frontend**
```bash
# Simple static file serving (any method works):
cd frontend
python3 -m http.server 3000
# Or use VS Code Live Server extension
```

### Running Tests
```bash
cd server
./mvnw test          # Unit tests
./mvnw verify        # Integration tests (if configured)
```

### Code Style & Standards
- Follow existing package structure: `com.puspo.uptime.modules.{feature}`
- Use Lombok if present in dependencies (check pom.xml)
- Exception handling: Use custom exceptions in `common.exception`
- API responses: Wrap in `common.response.ApiResponse<T>`
- Entity relationships: Use JPA annotations, avoid N+1 queries

---

## 🔧 Configuration Reference

### Key application.yml Settings

```yaml
# Database
spring.datasource.url: jdbc:postgresql://localhost:5433/uptime_monitor

# Email Notifications
spring.mail.host: smtp.gmail.com
spring.mail.port: 587
uptime.alert.email.enabled: true

# Monitoring Scheduler
uptime.scheduler.poll-interval-ms: 30000  # Adjust check frequency

# App URLs
uptime.app.base-url: http://localhost:8080  # For callback/webhook URLs
```

### Environment Variables (Recommended for Production)
```bash
DB_URL=postgresql://prod-db:5432/uptime
DB_USERNAME=app_user
DB_PASSWORD=${SECRET}
MAIL_PASSWORD=${EMAIL_APP_PASSWORD}
JWT_SECRET=${LONG_RANDOM_SECRET}
```

---

## 📡 API Endpoints Overview

*(Verify with running Swagger UI at `/swagger-ui.html`)*

### Authentication
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Authenticate and receive JWT

### Monitors
- `GET /api/monitors` - List user's monitors
- `POST /api/monitors` - Create new monitor
- `GET /api/monitors/{id}` - Get monitor details
- `PUT /api/monitors/{id}` - Update monitor
- `DELETE /api/monitors/{id}` - Delete monitor

### Alerts & Incidents
- `GET /api/alerts` - List alerts for monitors
- `GET /api/incidents` - View downtime history
- `POST /api/alerts/{id}/acknowledge` - Acknowledge alert

### Metrics
- `GET /api/metrics/monitors/{id}` - Get performance stats
- `GET /api/metrics/uptime` - Aggregate uptime report

---

## 🤝 Contribution Guidelines

1. **Branch Strategy**
   - `main` - Production-ready code
   - `develop` - Integration branch for features
   - `feature/{name}` - New functionality
   - `fix/{issue}` - Bug fixes

2. **Pull Request Process**
   - Create feature branch from `develop`
   - Implement changes with tests
   - Update documentation if API/behavior changes
   - Submit PR with clear description and linked issue
   - Request review from maintainers

3. **Code Review Checklist**
   - [ ] Follows existing code style
   - [ ] No hardcoded secrets/credentials
   - [ ] Proper error handling implemented
   - [ ] Database migrations included if schema changed
   - [ ] API documentation updated (OpenAPI annotations)
   - [ ] Tests added for new functionality

4. **Commit Messages**
   - Use conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`
   - Example: `feat(alert): add SMS notification support`

---

## 🐛 Known Issues & Workarounds

| Issue | Impact | Workaround |
|-------|--------|------------|
| Email credentials in config file | Security risk | Use environment variables in production |
| Frontend lacks build tooling | Hard to scale frontend | Consider adding Vite/Webpack in future |
| No rate limiting on APIs | Potential abuse | Add Spring Cloud Gateway or custom filter |
| Check scheduler runs on every instance | Duplicate checks in clustered deploy | Use ShedLock or distributed scheduler |

---

## 📚 Additional Resources

- [Spring Boot Documentation](https://docs.spring.io/spring-boot/docs/current/reference/html/)
- [Flyway Migration Guide](https://flywaydb.org/documentation/)
- [JWT.io - Token Debugging](https://jwt.io/)
- [PostgreSQL Performance Tips](https://wiki.postgresql.org/wiki/Performance_Optimization)

---

*Last updated: $(date +%Y-%m-%d)*  
*Maintained by: @puspo*  
*For questions: Open an issue or contact the maintainers*
