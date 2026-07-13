# API Endpoints & Authentication

API REST de Cursinet.

## Base URL

```
http://localhost:5000/api/v1
```

## Auth Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No (solo si no hay sesión) | Registrar nuevo usuario |
| POST | `/auth/login` | No | Iniciar sesión |
| POST | `/auth/refresh` | No (requiere refresh token) | Renovar tokens |
| POST | `/auth/logout` | Sí | Cerrar sesión |

### Respuestas

**Register / Login** — la API **NO devuelve tokens en el body** por seguridad:
```json
{
  "message": "User registered successfully",
  "user": { "id": "...", "name": "...", "email": "...", "role": "Student" }
}
```

Los tokens se envían únicamente como **HttpOnly cookies**:
- `accessToken` — 15 min de vida
- `refreshToken` — 7 días de vida

### Register

```json
POST /api/v1/auth/register
{
  "name": "Sofía García",
  "email": "sofia@email.com",
  "password": "123456"
}
```

Validation:
- Name: required, max 255 chars
- Email: required, valid email format, unique
- Password: required, min 6 chars

### Login

```json
POST /api/v1/auth/login
{
  "email": "sofia@email.com",
  "password": "123456"
}
```

### Refresh

```json
POST /api/v1/auth/refresh
// body opcional — si no se envía, busca refreshToken en cookies
{ "refreshToken": "..." }
```

### Logout

```json
POST /api/v1/auth/logout
// Sin body — lee refreshToken de la cookie y la limpia
```

### Auth Flow

```
1. POST /auth/login → backend valida credenciales
2. → Crea session en DB
3. → Setea cookies HttpOnly: accessToken (15min) + refreshToken (7d)
4. → Response: { message, user } — SIN tokens en body
5. Frontend: cada request → cookie accessToken se envía automáticamente
6. 401 → frontend llama POST /auth/refresh → renueva cookies
7. POST /auth/logout → revoca session + limpia cookies
```

## Categories

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/categories` | No | Listar categorías activas |

## Courses

### Public

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/courses` | `courses:read` | Listar cursos (con filtros) |
| GET | `/courses/{id}` | `courses:read` | Curso por ID |
| GET | `/courses/by-slug/{slug}` | `courses:read` | Curso por slug |

Query params para `GET /courses`:
- `categoryId` (Guid) — filtrar por categoría
- `level` (All | Beginner | Intermediate | Advanced) — filtrar por nivel
- `isPublished` (bool) — filtrar por estado
- `isFeatured` (bool) — filtrar por destacado
- `search` (string) — búsqueda textual

### Instructor / Admin

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/courses` | `courses:create` | Crear curso |
| PUT | `/courses/{id}` | `courses:update` | Actualizar curso |
| DELETE | `/courses/{id}` | `courses:delete` | Soft-delete |
| POST | `/courses/{id}/publish` | `courses:publish` | Publicar curso |

### Course Create

```json
POST /api/v1/courses
{
  "title": "Curso de Angular",
  "slug": "curso-de-angular",
  "shortDescription": "Aprende Angular desde cero",
  "description": "Contenido extenso...",
  "level": "Beginner",
  "language": "es",
  "price": 49.99,
  "categoryId": "guid-de-categoria"
}
```

## RBAC Permissions

| Permission | Admin | Instructor | Moderator | Student |
|------------|-------|------------|-----------|---------|
| `courses:create` | ✅ | ✅ | ❌ | ❌ |
| `courses:read` | ✅ | ✅ | ✅ | ✅ |
| `courses:update` | ✅ | ✅ | ❌ | ❌ |
| `courses:delete` | ✅ | ✅ | ❌ | ❌ |
| `courses:publish` | ✅ | ✅ | ❌ | ❌ |
| `users:read` | ✅ | ✅ | ✅ | ❌ |
| `users:update` | ✅ | ❌ | ✅ | ❌ |
| `users:delete` | ✅ | ❌ | ❌ | ❌ |
| `categories:create` | ✅ | ❌ | ❌ | ❌ |
| `categories:read` | ✅ | ✅ | ✅ | ❌ |
| `categories:update` | ✅ | ❌ | ❌ | ❌ |
| `categories:delete` | ✅ | ❌ | ❌ | ❌ |
| `admin:panel` | ✅ | ❌ | ✅ | ❌ |
| `system:config` | ✅ | ❌ | ❌ | ❌ |

## Roles

```csharp
public enum UserRole { Student, Instructor, Admin, Moderator }
```

Uso en controllers:
```csharp
[RequirePermission(Permissions.CourseCreate)]
public async Task<ActionResult> Create(...)
```

## JWT Configuration

```json
{
  "Jwt:Secret": "your-super-secret-jwt-key-min-32-chars-long",
  "accessTokenExpiryMinutes": 15,
  "refreshTokenExpiryDays": 7
}
```

Los tokens se leen desde cookies HttpOnly via `JwtBearerEvents.OnMessageReceived`.

## Security Notes

- La API **nunca devuelve tokens en el body** de login/register/refresh
- Los tokens se transmiten exclusivamente por cookies HttpOnly, Secure, SameSite=Strict
- El refresh token se revoca en DB al hacer logout (se elimina la session)
- Todas las rutas protegidas requieren el permiso específico via `[RequirePermission]`

---

## Planned / Future Endpoints

Estos endpoints están definidos en el diseño conceptual pero aún no implementados:

| Feature | Endpoints |
|---------|-----------|
| **Email verification** | POST `/auth/verify-email`, `/auth/resend-verification` |
| **Password recovery** | POST `/auth/forgot-password`, `/auth/reset-password` |
| **User profile** | GET/PUT `/users/me`, GET `/users/{username}` |
| **Modules & Lessons** | POST `/courses/{id}/modules`, POST `/modules/{id}/lessons` |
| **Enrollments** | GET `/courses/{id}/enroll`, POST `/enrollments` |
| **Progress** | POST `/lessons/{id}/progress` |
| **Payments (Stripe)** | POST `/payments/checkout`, webhooks |
| **Certificates** | GET `/certificates/{number}` |
| **Admin panel** | GET `/admin/users`, `/admin/analytics` |
