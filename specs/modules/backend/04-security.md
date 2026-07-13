# Security

Medidas de seguridad implementadas en el backend.

## Implemented

### Authentication
- **JWT tokens** stored exclusively in **HttpOnly cookies** (inaccesibles desde JavaScript)
- **SameSite=Strict** en todas las cookies
- **Secure** flag en producción (requiere HTTPS)
- **Refresh token rotation**: cada refresh genera un nuevo par de tokens y revoca el anterior
- **Session revocation**: al hacer logout, se elimina la session de la base de datos
- **Clock skew = Zero**: los tokens expiran exactamente cuando corresponde

### Cookie Configuration
```csharp
// HttpOnly → inaccesible desde JS
// SameSite.Strict → solo se envía en solicitudes del mismo sitio
// Secure → solo por HTTPS (en producción)
// Expires → tiempo de vida limitado (15 min / 7 días)
```

### Authorization (RBAC)
- **Permission-based** authorization via `[RequirePermission]` attribute
- Centralized `Permissions` catalog and `RolePermissions` mapping
- Example: `[RequirePermission(Permissions.CourseCreate)]` — solo Instructors y Admins
- Custom `PermissionHandler` + `PermissionRequirement` implementando `IAuthorizationHandler`

### Input Validation
- **FluentValidation** configured (package installed, ready to use)
- Validation errors return structured ProblemDetails responses

### Error Handling
- **Global exception middleware** catches all unhandled exceptions
- Returns RFC 7807 **ProblemDetails** responses
- No stack traces leaked to production
- Custom `AppException` with typed status codes (400, 401, 403, 404, 409, 422)

### Database
- **No raw SQL**: all queries via EF Core parameterized LINQ
- **Soft-delete** patrón: `DeletedAt` timestamp en lugar de DELETE físico
- **Snake_case** column naming consistent

### CORS
```csharp
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});
```
- Restringido a origen específico (`localhost:3000`)
- `AllowCredentials` necesario para cookies HttpOnly
- En producción, reemplazar con el dominio real

## Not Yet Implemented (Roadmap)

| Feature | Priority |
|---------|----------|
| **Rate limiting** | Medium — proteger endpoints auth contra brute force |
| **Email verification** | High — evitar registros con emails falsos |
| **Password recovery** | High — forgot/reset password flow |
| **Audit logs** | Medium — registrar acciones de administradores |
| **Security headers** | Low — X-Content-Type-Options, X-Frame-Options, HSTS |
| **CSRF protection** | Low — actualmente las cookies HttpOnly mitigan parcialmente |
| **Redis blacklist** | Low — revocar tokens inmediatamente (hoy se revoca en DB) |
