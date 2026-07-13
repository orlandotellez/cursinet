# CURSINET — Platform Specification

Build a complete, production-ready online learning platform called "CURSINET" — a premium technical education platform for software engineers and developers. Think Platzi meets Linear in terms of quality. Full stack, no mocks, no placeholders, everything persists in PostgreSQL and works end to end.

---

## Project Overview

**CURSINET** is a technical education platform for software engineers with:
- Premium dark, precise, technical aesthetic
- Full-stack implementation (Next.js + ASP.NET Core)
- PostgreSQL persistence
- Real-time notifications via SignalR
- Stripe payments (one-time + subscriptions)
- PDF certificates

---

## Module Structure

The specification is organized into three main modules:

### 📁 [frontend/](modules/frontend/)
Frontend Next.js 16 implementation.

| File | Description |
|------|-------------|
| [01-stack](modules/frontend/01-stack.md) | Stack tecnológico |
| [02-design](modules/frontend/02-design.md) | Identidad visual, colores, tipografía |
| [03-architecture](modules/frontend/03-architecture.md) | Feature-First, Container-Presentational, CSS Modules |
| [04-pages](modules/frontend/04-pages.md) | Landing, curso, player, dashboard, instructor, admin |
| [05-quality](modules/frontend/05-quality.md) | Criterios de calidad |
| [06-realtime](modules/frontend/06-realtime.md) | Notificaciones SignalR |

### 📁 [backend/](modules/backend/)
Backend ASP.NET Core 9 implementation.

| File | Description |
|------|-------------|
| [01-stack](modules/backend/01-stack.md) | Stack tecnológico |
| [02-architecture](modules/backend/02-architecture.md) | Clean Architecture, MediatR, errores |
| [03-api](modules/backend/03-api.md) | Endpoints REST, JWT, autenticación |
| [04-security](modules/backend/04-security.md) | Medidas de seguridad |
| [05-testing](modules/backend/05-testing.md) | Estrategia de testing |
| [06-payments](modules/backend/06-payments.md) | Integración Stripe |
| [07-certificates](modules/backend/07-certificates.md) | Certificados PDF con QuestPDF |

### 📁 [db/](modules/db/)
Database PostgreSQL.

| File | Description |
|------|-------------|
| [01-schema](modules/db/01-schema.md) | Esquema SQL completo con tablas, enums y relaciones |
| [02-setup](modules/db/02-setup.md) | Setup local con Docker + migraciones |
| [03-use-cases](modules/db/03-use-cases.md) | Casos de uso con diagramas Mermaid |

---

## Quick Reference

### Stack
- **Frontend**: Next.js 16, TypeScript strict, CSS Modules, Zustand, fetch nativo, lucide-react, recharts
- **Backend**: ASP.NET Core 9, C# 13, Clean Architecture, CQRS with MediatR, FluentValidation
- **Database**: PostgreSQL 16, EF Core 9, full-text search (tsvector + GIN)
- **Infrastructure**: Docker, Redis, Nginx, Hangfire, SignalR

### Design System
- Dark theme (#020617 base)
- Accent: #2563EB (blue)
- Fonts: Geist (headings), Inter (body), Geist Mono (code)
- Border-radius: 8px cards, 6px inputs, 4px badges

### Auth
- JWT (15 min) + httpOnly refresh token (30 days)
- Role-based: STUDENT, INSTRUCTOR, ADMIN, MODERATOR

