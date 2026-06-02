# Backend Architecture

Arquitectura del backend Cursinet API.

## Project Structure

```
Cursinet.sln
├── src/
│   ├── Domain/
│   │   ├── Entities/
│   │   │   ├── User.cs
│   │   │   ├── Account.cs
│   │   │   ├── Session.cs
│   │   │   ├── Verification.cs
│   │   │   ├── Category.cs
│   │   │   ├── Course.cs
│   │   │   ├── Tag.cs
│   │   │   ├── EmailVerificationLogs.cs
│   │   │   ├── LoginLogs.cs
│   │   │   ├── PasswordResetLogs.cs
│   │   │   └── UserTwoFactor.cs
│   │   ├── Enums/
│   │   │   ├── UserRole.cs          # Student, Instructor, Admin, Moderator
│   │   │   ├── CourseLevel.cs       # All, Beginner, Intermediate, Advanced
│   │   │   ├── LessonType.cs        # Video, Article, Quiz, Exercise
│   │   │   ├── PaymentStatus.cs     # Pending, Completed, Failed, Refunded
│   │   │   ├── SubcriptionPlan.cs   # Monthly, Annual, Lifetime
│   │   │   └── Permissions.cs       # Granular permission strings
│   │   └── Exceptions/
│   │       └── AppException.cs      # Base exception with status code
│   │
│   ├── Application/
│   │   ├── Common/
│   │   │   ├── Interfaces/          # Repository & service interfaces
│   │   │   │   ├── IUserRepository.cs
│   │   │   │   ├── IAccountRepository.cs
│   │   │   │   ├── ISessionRepository.cs
│   │   │   │   ├── IVerificationRepository.cs
│   │   │   │   ├── ICourseRepository.cs
│   │   │   │   ├── ICategoryRepository.cs
│   │   │   │   ├── IAuthService.cs
│   │   │   │   ├── ICourseService.cs
│   │   │   │   ├── IPasswordService.cs
│   │   │   │   └── ITokenService.cs
│   │   │   ├── Mapping/
│   │   │   │   ├── MappingUser.cs     # Extension methods: MapToDto()
│   │   │   │   └── MappingCourse.cs   # Extension methods: MapToDto()
│   │   │   ├── Models/
│   │   │   │   ├── UserDto.cs
│   │   │   │   ├── CourseResponse.cs
│   │   │   │   ├── CourseRequest.cs
│   │   │   │   ├── AuthResult.cs      # AuthResponse, RefreshResponse, etc.
│   │   │   │   └── AuthRequest.cs
│   │   │   └── Authorization/
│   │   │       └── RolePermissions.cs # Permission definitions per role
│   │   └── Features/
│   │       ├── Auth/
│   │       │   └── AuthService.cs     # register, login, logout, refresh, me
│   │       └── Courses/
│   │           └── CourseService.cs   # create, list, get by slug
│   │
│   ├── Infrastructure/
│   │   ├── Persistence/
│   │   │   ├── ApplicationDbContext.cs
│   │   │   ├── Configurations/       # IEntityTypeConfiguration<T> (Fluent API)
│   │   │   │   ├── UserConfiguration.cs
│   │   │   │   ├── AccountConfiguration.cs
│   │   │   │   ├── SessionConfiguration.cs
│   │   │   │   ├── VerificationConfiguration.cs
│   │   │   │   ├── CourseConfiguration.cs
│   │   │   │   ├── CategoryConfiguration.cs
│   │   │   │   ├── TagConfiguration.cs
│   │   │   │   ├── EmailVerificationLogsConfiguration.cs
│   │   │   │   ├── LoginLogsConfiguration.cs
│   │   │   │   ├── PasswordResetLogsConfiguration.cs
│   │   │   │   └── UserTwoFactorConfiguration.cs
│   │   │   ├── Repositories/
│   │   │   │   ├── UserRepository.cs
│   │   │   │   ├── AccountRepository.cs
│   │   │   │   ├── SessionRepository.cs
│   │   │   │   ├── VerificationRepository.cs
│   │   │   │   ├── CourseRepository.cs
│   │   │   │   └── CategoryRepository.cs
│   │   │   ├── DataSeeder.cs         # Seeds default users on startup
│   │   │   └── Migrations/           # EF Core migrations (auto-generated)
│   │   └── Services/
│   │       ├── TokenService.cs       # JWT generation & validation
│   │       └── PasswordService.cs    # BCrypt hashing
│   │
│   └── Api/
│       ├── Controllers/
│       │   ├── AuthController.cs     # /api/auth/*
│       │   ├── CourseController.cs   # /api/courses/*
│       │   ├── CategoryController.cs # /api/categories/*
│       │   └── TestController.cs     # /api/test/seed (dev only)
│       ├── DTOs/
│       │   ├── LoginRequest.cs
│       │   ├── RegisterRequest.cs
│       │   └── AuthResponse.cs
│       ├── Middleware/
│       │   └── ErrorHandlingMiddleware.cs
│       ├── Helpers/
│       │   ├── AuthHelper.cs         # Extracts user from HttpContext
│       │   ├── CookieHelper.cs       # Sets/clears auth cookies
│       │   └── TokenHelper.cs        # Token utilities
│       ├── Authorization/
│       │   ├── PermissionHandler.cs
│       │   ├── PermissionRequirement.cs
│       │   └── RequirePermissionAttribute.cs
│       └── Program.cs                # Startup & DI registration
└── *.slnx                            # Solution file (new .NET 10 format)
```

## Error Handling

### AppException (single class, factory methods)

```csharp
public class AppException : Exception
{
    public int StatusCode { get; }
    public string Code { get; }

    // Factory methods via static class:
    // AppExceptions.NotFound("msg")     → 404
    // AppExceptions.BadRequest("msg")   → 400
    // AppExceptions.Unauthorized("msg") → 401
    // AppExceptions.Forbidden("msg")    → 403
    // AppExceptions.Conflict("msg")     → 409
    // AppExceptions.Unprocessable("msg")→ 422
}
```

### Global Exception Middleware

Returns **ProblemDetails** (RFC 7807):

```json
{
  "type": "https://tools.ietf.org/html/rfc7807",
  "title": "Not Found",
  "status": 404,
  "detail": "Course with slug 'curso-falso' not found",
  "errors": null
}
```

## Clean Architecture Layers

| Layer | Responsibility |
|-------|---------------|
| **Domain** | Entities, Enums, Exceptions — zero dependencies |
| **Application** | Services, Interfaces, DTOs, Mapping — depends only on Domain |
| **Infrastructure** | EF Core, Repositories, External Services — depends on Application + Domain |
| **API** | Controllers, Middleware, DI registration — depends on Infrastructure + Application |

## Services Layer (replaces CQRS)

Instead of MediatR commands/queries, the backend uses direct service injection:

```
Controller → IService → Service → IRepository → Repository → DbContext
```

Each service method is a self-contained operation:
- `AuthService.RegisterAsync()` — validates, creates user, generates tokens
- `AuthService.LoginAsync()` — validates credentials, creates session, sets cookies
- `CourseService.CreateAsync()` — validates, creates course (instructor only)
- `CourseService.GetBySlugAsync()` — reads course with includes
