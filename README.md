# CURSINET 

**CURSINET** es una plataforma de aprendizaje online full-stack construida con **Next.js 16** en el frontend y **ASP.NET Core (.NET 10)** en el backend, con persistencia en **PostgreSQL**. Pensada para ofrecer una experiencia técnica, oscura y precisa, con todo el feature-set de una plataforma educativa moderna.

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![.NET 10](https://img.shields.io/badge/.NET_10-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)
![ASP.NET Core](https://img.shields.io/badge/ASP.NET_Core-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-F69220?style=for-the-badge&logo=pnpm&logoColor=white)

---

## Stack Tecnológico

### Frontend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Next.js** | 16 | App Router, Server Components, SSR, ISR |
| **React** | 19 | UI Library |
| **TypeScript** | 5+ | Tipado estricto (`strict: true`) |
| **Tailwind CSS** | 4 | Estilos utilitarios |
| **Zustand** | 5 | Estado global (~1KB, sin boilerplate) |
| **CSS Modules** | — | Estilos scoped para componentes complejos |
| **lucide-react** | — | Iconos SVG tree-shakeable |
| **recharts** | — | Gráficos para dashboards |
| **pnpm** | — | Package manager con workspaces |

**Patrones:** Feature-First, Container-Presentational (hooks como containers, componentes como vistas), Co-location de CSS Modules.

**Routing:** Route Groups — `(public)`, `(auth)`, `(dashboard)`, `(instructor)`, `(admin)` — cada uno con su layout y protección de ruta específica.

### Backend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **ASP.NET Core** | 10 | Web API |
| **C#** | 13 | Lenguaje |
| **Entity Framework Core** | 10 | ORM |
| **PostgreSQL** | 16 | Base de datos relacional |
| **MediatR** | — | CQRS (Commands / Queries) |
| **FluentValidation** | — | Validación de input |
| **JWT Bearer** | — | Autenticación con tokens |
| **BCrypt.Net** | — | Hashing de contraseñas |
| **Serilog** | — | Logging estructurado |
| **StackExchange.Redis** | — | Caché y rate limiting |
| **SignalR** | — | Notificaciones en tiempo real |
| **Hangfire** | — | Background jobs |
| **QuestPDF** | — | Generación de certificados PDF |
| **Stripe** | — | Pagos (one-time + suscripciones) |

**Arquitectura:** Clean Architecture (4 capas) + Vertical Slices + CQRS.

---

## Arquitectura del Backend

```
src/
├── Api/                     # Presentación (Controllers, Middleware, DTOs)
│   ├── Controllers/
│   ├── DTOs/
│   ├── Middleware/
│   └── Program.cs
├── Application/             # Casos de uso (CQRS, Behaviors, Interfaces)
│   ├── Common/
│   │   ├── Interfaces/      # IUserRepository, ITokenService, etc.
│   │   └── Mapping/
│   └── Features/
│       └── Auth/            # Commands + Queries de autenticación
├── Domain/                  # Entidades, Enums, Exceptions
│   ├── Entities/            # User, Account, Session, Verification
│   ├── Enums/               # UserRole, CourseLevel, LessonType, etc.
│   └── Exceptions/          # AppException
└── Infrastructure/          # Persistencia, Servicios externos
    ├── Persistence/
    │   ├── ApplicationDbContext.cs
    │   ├── Configurations/  # EF Fluent API
    │   └── Repositories/
    └── Services/            # PasswordService, TokenService
```

### MediatR Pipeline

1. **LoggingBehavior** — Logging estructurado por request
2. **ValidationBehavior** — Validación con FluentValidation
3. **TransactionBehavior** — Transacciones de base de datos

---

## Modelo de Dominio

### Entidades

| Entidad | Propósito |
|---------|-----------|
| `User` | Usuario del sistema con roles, perfil, linkedin/github, stripe ID |
| `Account` | Cuentas de autenticación vinculadas al usuario |
| `Session` | Sesiones JWT con refresh token, IP, User-Agent |
| `Verification` | Códigos de verificación (email, password reset) |

### Enums

| Enum | Valores |
|------|---------|
| `UserRole` | `Student`, `Instructor`, `Admin`, `Moderator` |
| `CourseLevel` | `Beginner`, `Intermediate`, `Advanced`, `Expert` |
| `LessonType` | `Video`, `Text`, `Code`, `Quiz`, `Resource` |
| `PaymentStatus` | `Pending`, `Completed`, `Failed`, `Refunded` |
| `SubscriptionPlan` | `Monthly`, `Annual`, `Lifetime` |

---

## Autenticación

- **Register** — registro con verificación de email
- **Login** — credenciales + bcrypt
- **JWT** — access token (15 min) + refresh token (30 días) en httpOnly cookies
- **Refresh** — rotación de refresh tokens
- **Logout** — revocación de sesiones
- **Forgot / Reset Password** — flujo completo con códigos

---

## Features Planeadas

- [x] Sistema de autenticación completo (register, login, refresh, logout, verify email, reset password)
- [ ] Catálogo de cursos con búsqueda full-text (tsvector + GIN)
- [ ] Video player con progreso de lecciones
- [ ] Quizzes y evaluaciones
- [ ] Panel de instructor (creación de cursos, analytics, revenue)
- [ ] Panel de administración (usuarios, cursos, analíticas)
- [ ] Pagos con Stripe (one-time + suscripciones mensual/anual/vitalicia)
- [ ] Certificados PDF descargables
- [ ] Notificaciones en tiempo real con SignalR
- [ ] Comentarios y reseñas

---

## Cómo Empezar

### Prerrequisitos

- **Node.js** 20+ y **pnpm**
- **.NET 10 SDK**
- **PostgreSQL** 16 (o Docker)
- **Redis** (opcional, para caché)

### Frontend

```bash
cd frontend
pnpm install
pnpm dev
# → http://localhost:3000
```

### Backend

```bash
cd backend/src/Api
dotnet run
# → http://localhost:5000
# → Health check: GET /health
```

### Base de datos

```bash
docker run -d --name cursinet-db \
  -e POSTGRES_DB=cursinet \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:16
```

---

## Estructura del Repositorio

```
/
├── frontend/                    # Next.js 16 App
│   ├── app/                     # App Router (rutas, layouts, pages)
│   │   ├── (public)/            # Landing, catálogo, detalle curso
│   │   ├── (auth)/              # Login, registro, recover
│   │   ├── (dashboard)/         # Dashboard estudiante, player
│   │   ├── (instructor)/        # Panel instructor
│   │   └── (admin)/             # Panel admin
│   └── src/
│       ├── features/            # Cursos, player, quiz, admin, etc.
│       └── shared/              # API layer, hooks, components, store, types
├── backend/                     # ASP.NET Core API
│   └── src/
│       ├── Api/                 # Controllers, DTOs, Middleware
│       ├── Application/         # CQRS, Interfaces
│       ├── Domain/              # Entities, Enums
│       └── Infrastructure/      # EF Core, Services, Repositories
└── openspec/                    # Especificación completa del proyecto
    ├── modules/
    │   ├── frontend/            # Stack, diseño, arquitectura, páginas
    │   ├── backend/             # Stack, arquitectura, API, seguridad
    │   └── db/                  # Schema SQL, setup Docker, casos de uso
    └── global-instruction.md    # Visión general del producto
```

---
