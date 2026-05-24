# AlgoPatterns

A full-stack algorithm learning platform featuring a **production-ready Go backend** with clean architecture, secure code execution via Judge0, and a Next.js frontend.

![Go](https://img.shields.io/badge/Go-1.22+-00ADD8?style=flat-square&logo=go)
![Gin](https://img.shields.io/badge/Gin-1.10-00ADD8?style=flat-square)
![CockroachDB](https://img.shields.io/badge/CockroachDB-Distributed_SQL-6933FF?style=flat-square)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=flat-square&logo=docker)
![JWT](https://img.shields.io/badge/JWT-Authentication-000000?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)

[![Frontend Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=algopatterns-frontend&metric=alert_status&token=814c7aa24c5896498849c06dc3214e66f0381b57)](https://sonarcloud.io/summary/new_code?id=algopatterns-frontend)
[![Frontend Coverage](https://sonarcloud.io/api/project_badges/measure?project=algopatterns-frontend&metric=coverage&token=814c7aa24c5896498849c06dc3214e66f0381b57)](https://sonarcloud.io/summary/new_code?id=algopatterns-frontend)
[![Backend Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=algopatterns-backend&metric=alert_status&token=c5353301276bd028bdacf8fe193598b200aa0db3)](https://sonarcloud.io/summary/new_code?id=algopatterns-backend)
[![Backend Coverage](https://sonarcloud.io/api/project_badges/measure?project=algopatterns-backend&metric=coverage&token=c5353301276bd028bdacf8fe193598b200aa0db3)](https://sonarcloud.io/summary/new_code?id=algopatterns-backend)

## Backend

### Architecture & Design Patterns

- **Clean Architecture** - Separation of concerns with handlers, services, and repositories
- **Repository Pattern** - Database abstraction layer for testability
- **Service Layer** - Business logic isolated from HTTP handlers
- **Dependency Injection** - Constructor-based DI for loose coupling
- **DTO Pattern** - Request/Response models separate from domain entities

### Backend Features

- **RESTful API** with versioning (`/api/v1`)
- **JWT Authentication** with access/refresh token rotation
- **Rate Limiting** - Per-IP rate limiting to prevent abuse
- **Request Validation** - Struct-based validation with custom error messages
- **Structured Logging** - JSON logging with zerolog for observability
- **Graceful Shutdown** - Proper cleanup on SIGTERM/SIGINT
- **Health Checks** - Kubernetes-compatible liveness/readiness probes
- **Connection Pooling** - pgx with configurable pool settings
- **Database Migrations** - Version-controlled schema changes
- **CORS Configuration** - Configurable allowed origins

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              AlgoPatterns                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌───────────────┐                ┌────────────────────────────────────┐   │
│   │   Frontend    │     HTTP       │           Go Backend (Gin)         │   │
│   │   (Next.js)   │    ◄────►      │                                    │   │
│   │               │     API        │  ┌─────────────────────────────┐   │   │
│   │ • Monaco      │                │  │         Handlers            │   │   │
│   │   Editor      │                │  │  • Pattern, Problem, Auth   │   │   │
│   │ • Visualizers │                │  │  • Submission, Health       │   │   │
│   │ • React 19    │                │  └──────────────┬──────────────┘   │   │
│   └───────────────┘                │                 │                  │   │
│                                    │  ┌──────────────▼──────────────┐   │   │
│                                    │  │         Services            │   │   │
│                                    │  │  • JudgeService             │   │   │
│                                    │  │  • SubmissionService        │   │   │
│                                    │  │  • AuthService              │   │   │
│                                    │  └──────────────┬──────────────┘   │   │
│                                    │                 │                  │   │
│                                    │  ┌──────────────▼──────────────┐   │   │
│                                    │  │       Repositories          │   │   │
│                                    │  │  • PatternRepository        │   │   │
│                                    │  │  • ProblemRepository        │   │   │
│                                    │  │  • UserRepository           │   │   │
│                                    │  │  • SubmissionRepository     │   │   │
│                                    │  └──────────────┬──────────────┘   │   │
│                                    └─────────────────┼──────────────────┘   │
│                                                      │                      │
│   ┌──────────────────────────┐      ┌────────────────▼───────────────────┐  │
│   │       CockroachDB        │      │      Judge0 (Code Execution)       │  │
│   │                          │      │                                    │  │
│   │  • Users & Sessions      │      │  • Secure Sandbox (Isolate)        │  │
│   │  • Patterns & Problems   │      │  • PostgreSQL + Redis Workers      │  │
│   │  • Submissions & Results │      │  • 10+ Programming Languages       │  │
│   │  • Test Cases            │      │  • Resource Limits (CPU/Memory)    │  │
│   └──────────────────────────┘      └────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Backend Project Structure

```
backend/
├── cmd/
│   └── server/
│       └── main.go              # Application entry point, DI setup
├── internal/
│   ├── config/
│   │   └── config.go            # Environment-based configuration
│   ├── handlers/
│   │   ├── pattern_handler.go   # Pattern CRUD endpoints
│   │   ├── problem_handler.go   # Problem endpoints
│   │   ├── submission_handler.go # Code execution endpoints
│   │   ├── auth_handler.go      # Authentication endpoints
│   │   └── health_handler.go    # Health check endpoints
│   ├── middleware/
│   │   ├── auth.go              # JWT authentication middleware
│   │   ├── ratelimit.go         # Rate limiting middleware
│   │   └── middleware.go        # Request ID, logging, recovery
│   ├── models/
│   │   ├── pattern.go           # Pattern domain model
│   │   ├── problem.go           # Problem domain model
│   │   ├── submission.go        # Submission domain model
│   │   ├── user.go              # User domain model
│   │   └── dto.go               # Request/Response DTOs
│   ├── repository/
│   │   ├── db.go                # Database connection pool
│   │   ├── pattern_repository.go
│   │   ├── problem_repository.go
│   │   ├── submission_repository.go
│   │   └── user_repository.go
│   └── services/
│       ├── judge_service.go     # Judge0 API integration
│       ├── submission_service.go # Code execution orchestration
│       └── auth_service.go      # JWT token management
├── migrations/                   # SQL migration files
├── pkg/
│   └── response/                 # Standardized API responses
├── scripts/seed/                 # Database seeding scripts
├── Dockerfile                    # Multi-stage Docker build
├── docker-compose.yml            # App services
├── docker-compose.judge0.yml     # Judge0 services
├── Makefile                      # Build automation
└── railway.json                  # Railway deployment config
```

## Design Documents

Detailed design documents for major features:

| Document | Description |
|----------|-------------|
| [Highlight Feature](docs/design/highlight-feature.md) | User highlights with offline support, conflict resolution, and three-tier caching |
| [Judge0 Integration](docs/architecture-judge0-integration.md) | Secure code execution architecture with sandbox isolation |

## Code Execution Architecture

The backend integrates with Judge0 for secure, sandboxed code execution:

```
┌────────┐     ┌─────────────────┐     ┌──────────────┐     ┌─────────────┐
│ Client │────►│  Go Backend     │────►│ Judge0 API   │────►│  Workers    │
└────────┘     │                 │     │              │     │             │
               │ SubmissionSvc   │     │ POST /batch  │     │  Isolate    │
               │ JudgeService    │     │ GET /result  │     │  Sandbox    │
               └─────────────────┘     └──────────────┘     └─────────────┘
                       │                      │
                       ▼                      ▼
               ┌─────────────┐        ┌─────────────┐
               │ CockroachDB │        │  PostgreSQL │
               │ (App Data)  │        │  (Jobs)     │
               └─────────────┘        └─────────────┘
```

### Execution Flow

| Step | Component | Action |
|------|-----------|--------|
| 1 | Handler | Receives POST `/api/v1/submissions/run` with code + language |
| 2 | SubmissionService | Fetches test cases from CockroachDB |
| 3 | SubmissionService | Wraps user code with language-specific template |
| 4 | JudgeService | Sends batch request to Judge0 (base64 encoded) |
| 5 | Judge0 Workers | Executes code in Isolate sandbox with resource limits |
| 6 | JudgeService | Polls for results until execution completes |
| 7 | SubmissionService | Compares output with expected, determines pass/fail |
| 8 | Handler | Returns structured JSON response |

### Key Backend Components

**Judge Service** - External API integration with retry logic
```go
type JudgeService struct {
    cfg        *config.Judge0Config
    httpClient *http.Client
}

func (s *JudgeService) SubmitBatch(submissions []Submission) ([]string, error)
func (s *JudgeService) WaitForBatchResults(tokens []string) ([]Result, error)
```

**Submission Service** - Business logic orchestration
```go
type SubmissionService struct {
    submissionRepo *repository.SubmissionRepository
    problemRepo    *repository.ProblemRepository
    judgeService   *JudgeService
}

func (s *SubmissionService) RunCode(ctx context.Context, req RunRequest) (*RunResponse, error)
func (s *SubmissionService) Submit(ctx context.Context, req SubmitRequest) (*SubmitResponse, error)
```

## API Design

### RESTful Endpoints

**Authentication**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | User registration with validation |
| POST | `/api/v1/auth/login` | Login with JWT token response |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| POST | `/api/v1/auth/logout` | Invalidate refresh token |

**Problems & Patterns**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/patterns` | List patterns with pagination |
| GET | `/api/v1/patterns/:id` | Get pattern by ID |
| GET | `/api/v1/patterns/search?q=` | Full-text search |
| GET | `/api/v1/problems/:slug` | Get problem with test cases |

**Code Execution**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/submissions/run` | Run code against sample tests |
| POST | `/api/v1/submissions` | Full submission evaluation |
| GET | `/api/v1/submissions/:id` | Get submission result |

**Health Checks**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Full health with DB status |
| GET | `/health/live` | Kubernetes liveness probe |
| GET | `/health/ready` | Kubernetes readiness probe |

### Response Format

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "requestId": "550e8400-e29b-41d4-a716-446655440000",
    "version": "1.0.0"
  }
}
```

Error responses:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body",
    "details": { "email": "must be a valid email" }
  }
}
```

## Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Go 1.22+** | Backend language - fast, typed, great concurrency |
| **Gin** | HTTP framework - middleware support, fast routing |
| **CockroachDB** | Distributed SQL - PostgreSQL compatible, horizontally scalable |
| **pgx** | PostgreSQL driver - connection pooling, prepared statements |
| **JWT (v5)** | Authentication - stateless, refresh token rotation |
| **zerolog** | Structured logging - JSON output, zero allocation |
| **Docker** | Containerization - multi-stage builds |

### Code Execution
| Component | Purpose |
|-----------|---------|
| **Judge0** | Code execution API - secure sandboxing |
| **Isolate** | Linux sandbox - resource limits, network isolation |
| **PostgreSQL** | Job storage for Judge0 |
| **Redis** | Job queue for Judge0 workers |

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework with App Router |
| **React 19** | UI components |
| **Monaco Editor** | VS Code-powered code editor |
| **Tailwind CSS 4** | Styling |

## Why CockroachDB?

CockroachDB was chosen over AWS RDS PostgreSQL or other managed databases for several reasons:

| Factor | CockroachDB Serverless | AWS RDS PostgreSQL |
|--------|------------------------|-------------------|
| **Free Tier** | 10 GiB storage, 50M RUs/month (permanent) | 750 hrs/month for 12 months only |
| **Idle Costs** | $0 when not in use | ~$12-15/month minimum |
| **High Availability** | Built-in, no extra cost | Multi-AZ doubles the price |
| **Scaling** | Automatic, pay-per-use | Manual instance resizing |
| **PostgreSQL Compatibility** | Yes (uses pgx driver) | Native |

**Key benefits for this project:**

- **Cost-effective** - Free tier covers learning/demo usage; pay-per-query model means no charges during idle periods
- **Zero DevOps** - No need to manage replicas, failover, or backups
- **PostgreSQL wire-compatible** - Works with standard `pgx` driver, same SQL syntax, easy migration path if needed
- **Scales with usage** - From hobby project to production without infrastructure changes

## Security

- **JWT Authentication** - Access tokens (15min) + refresh tokens (7d)
- **Password Hashing** - bcrypt with configurable cost
- **Rate Limiting** - Per-IP request throttling
- **Input Validation** - Struct tags with custom validators
- **SQL Injection Prevention** - Parameterized queries via pgx
- **CORS** - Configurable allowed origins
- **Code Sandbox** - Isolate containers with no network access
- **Resource Limits** - CPU (5s), Memory (128MB), Processes (60)

## Getting Started

### Prerequisites

- Go 1.22+
- Docker & Docker Compose
- CockroachDB (cloud or local)

### Backend Setup

```bash
cd backend

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
make migrate-up

# Seed initial data
make seed

# Start the server
make run-dev
```

### Judge0 Setup (for code execution)

```bash
# Start Judge0 services
docker-compose -f docker-compose.judge0.yml up -d

# Verify Judge0 is running
curl http://localhost:2358/system_info
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## Deployment

### Backend
- **Railway** - Configured via `railway.json`
- **Docker** - Multi-stage Dockerfile included
- **Kubernetes** - Health probes configured

### Frontend
- **Vercel** - Automatic deployments from GitHub

## Development Commands

```bash
# Backend
make run-dev      # Start with hot reload
make test         # Run tests
make lint         # Run linter
make build        # Build binary
make docker-build # Build Docker image
make migrate-up   # Run migrations
make seed         # Seed database

# Frontend
npm run dev       # Development server
npm run build     # Production build
```

## License

MIT License - see [LICENSE](LICENSE)
