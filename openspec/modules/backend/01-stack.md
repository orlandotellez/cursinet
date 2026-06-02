# Backend Stack

Stack tecnológico del backend — Cursinet API.

## Core Technologies

- **.NET 10 SDK** (net10.0)
- **C# 13**
- **ASP.NET Core 10** Web API
- **PostgreSQL 16+**
- **Entity Framework Core 10**

## Architecture

- **Clean Architecture** (Domain / Application / Infrastructure / API layers)
- **Service Layer pattern** in Application layer (no CQRS / MediatR)
- **Repository Pattern** with EF Core
- **Global Exception Middleware** with ProblemDetails (RFC 7807)

## Dependencies

### Api.csproj
```xml
<PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="10.0.0" />
<PackageReference Include="FluentValidation.AspNetCore" Version="11.3.0" />
<PackageReference Include="Microsoft.AspNetCore.OpenApi" Version="10.0.8" />
<PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="10.0.8" />
<PackageReference Include="Serilog.AspNetCore" Version="10.0.0" />
<PackageReference Include="StackExchange.Redis" Version="2.7.10" /> <!-- installed, not yet configured -->
```

### Infrastructure.csproj
```xml
<PackageReference Include="Microsoft.EntityFrameworkCore" Version="10.0.0" />
<PackageReference Include="Npgsql.EntityFrameworkCore.PostgreSQL" Version="10.0.0" />
<PackageReference Include="BCrypt.Net-Next" Version="4.0.3" />
<PackageReference Include="System.IdentityModel.Tokens.Jwt" Version="8.0.0" />
```

### Application.csproj
```xml
<ProjectReference Include="../Domain/Domain.csproj" />
```

### Domain.csproj
- No external dependencies — pure C# POCOs and enums.

## Key Patterns

| Pattern | Implementation |
|---------|---------------|
| **Service Layer** | `IAuthService` / `AuthService`, `ICourseService` / `CourseService` |
| **Repository** | `IUserRepository` / `UserRepository`, etc. |
| **Mapping** | Manual extension methods (`MappingUser.cs`, `MappingCourse.cs`) |
| **Validation** | FluentValidation (configured, usage: when implemented) |
| **Error handling** | `AppException` → `ErrorHandlingMiddleware` → ProblemDetails |
| **Auth** | JWT in HttpOnly cookies, RBAC with PermissionHandler |

## Notable Absences (vs. typical .NET template)

| Feature | Status |
|---------|--------|
| **CQRS / MediatR** | Not used — direct service injection instead |
| **AutoMapper** | Not used — manual extension methods |
| **Hangfire** | Not installed |
| **QuestPDF** | Not installed |
| **SignalR** | Not installed |
| **Redis** | Package installed, not yet configured/used |
| **Testing** | No test projects yet |

## Infrastructure Services

- **PostgreSQL** — primary database via EF Core
- **BCrypt** — password hashing
- **JWT** — authentication tokens (stored in HttpOnly cookies)
- **Serilog** — structured logging to console
- **OpenAPI** — `/openapi/v1.json` in development mode
