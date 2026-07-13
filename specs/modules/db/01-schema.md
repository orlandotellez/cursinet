# Database Schema

Esquema completo de la base de datos PostgreSQL de CURSINET.

> **Fuente oficial**: [`diagram.dbml`](./diagram.dbml) — el DBML es la fuente de verdad para las relaciones y constraints.

---

## Convenciones Generales

- **Primary Keys**: `UUID` generados con `uuid_generate_v4()` en todas las tablas (sin auto-increment)
- **Timestamps**: `created_at` y `updated_at` en todas las entidades; `deleted_at` para soft-delete
- **Soft-delete**: Las tablas con `deleted_at` no eliminan registros físicamente
- **Índices**: Todas las FK tienen índice; las columnas de búsqueda frecuente también
- **Naming**: `snake_case` para columnas, `PascalCase` para tablas

---

## Enums

### `user_role`
| Valor | Descripción |
|-------|-------------|
| `STUDENT` | Estudiante — consumidor de cursos |
| `INSTRUCTOR` | Instructor — crea y gestiona cursos |
| `ADMIN` | Administrador — control total |
| `MODERATOR` | Moderador — modera contenido |

### `course_level`
| Valor | Descripción |
|-------|-------------|
| `BEGINNER` | Principiante — sin conocimientos previos |
| `INTERMEDIATE` | Intermedio — conocimientos básicos |
| `ADVANCED` | Avanzado — dominio del tema |
| `EXPERT` | Experto — nivel profesional |

### `lesson_type`
| Valor | Descripción |
|-------|-------------|
| `VIDEO` | Lección en video |
| `TEXT` | Lección de texto/lectura |
| `CODE` | Lección práctica de código |
| `QUIZ` | Lección de evaluación |
| `RESOURCE` | Recurso descargable |

### `payment_status`
| Valor | Descripción |
|-------|-------------|
| `PENDING` | Pago iniciado, pendiente de confirmación |
| `COMPLETED` | Pago confirmado y completado |
| `FAILED` | Pago rechazado o fallido |
| `REFUNDED` | Pago reembolsado |

### `subscription_plan`
| Valor | Descripción |
|-------|-------------|
| `MONTHLY` | Suscripción mensual |
| `ANNUAL` | Suscripción anual |
| `LIFETIME` | Acceso vitalicio |

---

## Tablas

### 1. Users & Auth

#### `users`
Tabla central de usuarios. Soporta autenticación por email/password y OAuth (Google, GitHub).

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `uuid` | `PK` `DEFAULT uuid_generate_v4()` | Identificador único |
| `name` | `text` | `NOT NULL` | Nombre completo |
| `email` | `text` | `NOT NULL` `UNIQUE` | Email de acceso |
| `email_verified` | `boolean` | `NOT NULL` `DEFAULT false` | Verificación de email |
| `phone` | `text` | | Teléfono (opcional) |
| `image` | `text` | | URL de avatar/foto |
| `role` | `user_role` | `NOT NULL` `DEFAULT 'STUDENT'` | Rol del usuario |
| `username` | `varchar(50)` | `UNIQUE` | Nombre de usuario público |
| `bio` | `text` | | Biografía corta |
| `website_url` | `text` | | Sitio web personal |
| `github_url` | `text` | | Perfil de GitHub |
| `linkedin_url` | `text` | | Perfil de LinkedIn |
| `stripe_customer_id` | `varchar(100)` | | ID de cliente en Stripe |
| `is_active` | `boolean` | `NOT NULL` `DEFAULT true` | Cuenta activa/inactiva |
| `last_seen_at` | `timestamptz` | | Última vez online |
| `created_at` | `timestamptz` | `NOT NULL` `DEFAULT CURRENT_TIMESTAMP` | Fecha de registro |
| `updated_at` | `timestamptz` | `NOT NULL` `DEFAULT CURRENT_TIMESTAMP` | Última actualización |
| `deleted_at` | `timestamptz` | | Soft-delete |

**Índices**: `email`, `username`, `role`, `stripe_customer_id`, `created_at`

---

#### `session`
Sesiones activas de usuarios (JWT refresh tokens con persistencia).

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `uuid` | `PK` `DEFAULT uuid_generate_v4()` | |
| `expires_at` | `timestamptz` | `NOT NULL` | Fecha de expiración |
| `token` | `text` | `NOT NULL` `UNIQUE` | Token de sesión |
| `created_at` | `timestamptz` | `NOT NULL` | |
| `updated_at` | `timestamptz` | `NOT NULL` | |
| `ip_address` | `text` | | IP desde donde se creó |
| `user_agent` | `text` | | User-agent del cliente |
| `user_id` | `uuid` | `NOT NULL` `FK -> users.id` | Usuario propietario |

**Índices**: `token`, `user_id`, `expires_at`

> `Ref: session.user_id > users.id [delete: cascade]`

---

#### `account`
Cuentas OAuth vinculadas (Google, GitHub, etc.) o autenticación por password.

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `uuid` | `PK` | |
| `account_id` | `text` | `NOT NULL` | ID de la cuenta en el proveedor |
| `provider_id` | `text` | `NOT NULL` | Proveedor OAuth (google, github, credentials) |
| `user_id` | `uuid` | `NOT NULL` `FK -> users.id` | Usuario dueño |
| `access_token` | `text` | | Token de acceso OAuth |
| `refresh_token` | `text` | | Token de refresh OAuth |
| `id_token` | `text` | | ID token OAuth |
| `access_token_expires_at` | `timestamptz` | | Expiración del access token |
| `refresh_token_expires_at` | `timestamptz` | | Expiración del refresh token |
| `scope` | `text` | | Permisos otorgados |
| `password` | `text` | | Password hasheado (auth por credentials) |
| `created_at` | `timestamptz` | `NOT NULL` | |
| `updated_at` | `timestamptz` | `NOT NULL` | |

**Índices**: `user_id`, `provider_id`, `account_id`, **unique** `(provider_id, account_id)`

> `Ref: account.user_id > users.id [delete: cascade]`

---

#### `verification`
Tokens de verificación (email verification, password reset).

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `uuid` | `PK` | |
| `identifier` | `text` | `NOT NULL` | Identificador (email, phone) |
| `value` | `text` | `NOT NULL` | Token de verificación |
| `expires_at` | `timestamptz` | `NOT NULL` | Expiración del token |
| `created_at` | `timestamptz` | `NOT NULL` | |
| `updated_at` | `timestamptz` | `NOT NULL` | |

**Índices**: `identifier`, `value`, `expires_at`

---

#### `password_reset_logs`
Auditoría de solicitudes de reseteo de contraseña.

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `uuid` | `PK` | |
| `user_id` | `uuid` | `NOT NULL` `FK -> users.id` | Usuario que solicitó |
| `ip_address` | `text` | | IP de la solicitud |
| `user_agent` | `text` | | User-agent del navegador |
| `created_at` | `timestamptz` | `NOT NULL` | |

**Índices**: `user_id`, `created_at`

> `Ref: password_reset_logs.user_id > users.id [delete: cascade]`

---

#### `email_verification_logs`
Auditoría de verificaciones de email exitosas.

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `uuid` | `PK` | |
| `user_id` | `uuid` | `NOT NULL` `FK -> users.id` | |
| `verified_at` | `timestamptz` | `NOT NULL` | Momento de verificación |
| `ip_address` | `text` | | IP desde donde se verificó |
| `created_at` | `timestamptz` | `NOT NULL` | |

**Índices**: `user_id`, `verified_at`

> `Ref: email_verification_logs.user_id > users.id [delete: cascade]`

---

#### `user_two_factor`
Configuración de autenticación de dos factores (2FA).

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `uuid` | `PK` | |
| `user_id` | `uuid` | `NOT NULL` `FK -> users.id` | |
| `secret` | `text` | `NOT NULL` | Secreto TOTP |
| `backup_codes` | `text[]` | | Códigos de respaldo |
| `is_enabled` | `boolean` | `NOT NULL` `DEFAULT false` | 2FA activado |
| `created_at` | `timestamptz` | `NOT NULL` | |
| `updated_at` | `timestamptz` | `NOT NULL` | |

**Índices**: `user_id`

> `Ref: user_two_factor.user_id > users.id [delete: cascade]`

---

#### `login_logs`
Auditoría de intentos de inicio de sesión.

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `uuid` | `PK` | |
| `user_id` | `uuid` | `FK -> users.id` | Usuario (puede ser null si falló) |
| `email` | `text` | | Email intentado |
| `success` | `boolean` | `NOT NULL` | Login exitoso o no |
| `provider_id` | `text` | | Proveedor usado |
| `ip_address` | `text` | | IP del intento |
| `user_agent` | `text` | | Navegador/cliente |
| `failure_reason` | `text` | | Motivo del fallo |
| `created_at` | `timestamptz` | `NOT NULL` | |

**Índices**: `user_id`, `email`, `success`, `created_at`

> `Ref: login_logs.user_id > users.id [delete: set null]`

---

### 2. Categories & Tags

#### `categories`
Taxonomía jerárquica de categorías de cursos.

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `uuid` | `PK` | |
| `name` | `varchar(100)` | `NOT NULL` | Nombre visible |
| `slug` | `varchar(100)` | `NOT NULL` `UNIQUE` | Slug para URLs |
| `description` | `text` | | Descripción de la categoría |
| `icon_name` | `varchar(100)` | | Icono asociado |
| `color` | `varchar(50)` | | Color distintivo |
| `parent_id` | `uuid` | `FK -> categories.id` | Categoría padre (auto-referencia) |
| `sort_order` | `int` | `NOT NULL` `DEFAULT 0` | Orden de aparición |
| `is_active` | `boolean` | `NOT NULL` `DEFAULT true` | Visible o no |
| `created_at` | `timestamptz` | `NOT NULL` | |
| `updated_at` | `timestamptz` | `NOT NULL` | |
| `deleted_at` | `timestamptz` | | |

**Índices**: `slug`, `parent_id`, `is_active`

> `Ref: categories.parent_id > categories.id`

---

#### `tags`
Etiquetas para categorización transversal de cursos.

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `uuid` | `PK` | |
| `name` | `varchar(100)` | `NOT NULL` | Nombre visible |
| `slug` | `varchar(100)` | `NOT NULL` `UNIQUE` | Slug para URLs |
| `created_at` | `timestamptz` | `NOT NULL` | |
| `updated_at` | `timestamptz` | `NOT NULL` | |

**Índices**: `slug`

---

### 3. Courses

#### `courses`
Tabla principal de cursos. Contiene metadata, pricing, estadísticas y contenido de búsqueda.

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `uuid` | `PK` | |
| `instructor_id` | `uuid` | `NOT NULL` `FK -> users.id` | Instructor del curso |
| `category_id` | `uuid` | `NOT NULL` `FK -> categories.id` | Categoría del curso |
| `title` | `varchar(255)` | `NOT NULL` | Título del curso |
| `slug` | `varchar(255)` | `NOT NULL` `UNIQUE` | Slug para URL |
| `short_description` | `varchar(500)` | | Descripción breve (meta) |
| `description` | `text` | | Descripción completa del curso |
| `thumbnail_url` | `text` | | URL de miniatura |
| `preview_video_url` | `text` | | Video de preview |
| `level` | `course_level` | `NOT NULL` | Nivel del curso |
| `language` | `varchar(10)` | `NOT NULL` `DEFAULT 'es'` | Idioma del curso |
| `duration_minutes` | `int` | `NOT NULL` `DEFAULT 0` | Duración total en minutos |
| `students_count` | `int` | `NOT NULL` `DEFAULT 0` | Contador de estudiantes |
| `average_rating` | `decimal(3,2)` | `NOT NULL` `DEFAULT 0` | Rating promedio |
| `reviews_count` | `int` | `NOT NULL` `DEFAULT 0` | Cantidad de reseñas |
| `price` | `decimal(10,2)` | `NOT NULL` `DEFAULT 0` | Precio actual |
| `original_price` | `decimal(10,2)` | | Precio original (para descuentos) |
| `is_free` | `boolean` | `NOT NULL` `DEFAULT false` | Curso gratuito |
| `is_published` | `boolean` | `NOT NULL` `DEFAULT false` | Curso publicado |
| `is_featured` | `boolean` | `NOT NULL` `DEFAULT false` | Curso destacado |
| `requirements` | `text[]` | | Array de requisitos |
| `learning_objectives` | `text[]` | | Array de objetivos de aprendizaje |
| `search_vector` | `tsvector` | | Full-text search vector |
| `published_at` | `timestamptz` | | Fecha de publicación |
| `created_at` | `timestamptz` | `NOT NULL` | |
| `updated_at` | `timestamptz` | `NOT NULL` | |
| `deleted_at` | `timestamptz` | | |

**Índices**: `slug`, `instructor_id`, `category_id`, `is_published`, `is_featured`, `search_vector` (GIN)

> `Ref: courses.instructor_id > users.id`
> `Ref: courses.category_id > categories.id`

---

#### `course_tags`
Relación muchos-a-muchos entre cursos y tags.

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `course_id` | `uuid` | `PK` `FK -> courses.id` | |
| `tag_id` | `uuid` | `PK` `FK -> tags.id` | |

**Índices**: `(course_id, tag_id)` PK compuesta, `course_id`, `tag_id`

> `Ref: course_tags.course_id > courses.id`
> `Ref: course_tags.tag_id > tags.id`

---

### 4. Modules & Lessons

#### `modules`
Módulos o secciones dentro de un curso. Agrupan lecciones.

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `uuid` | `PK` | |
| `course_id` | `uuid` | `NOT NULL` `FK -> courses.id` | Curso al que pertenece |
| `title` | `varchar(255)` | `NOT NULL` | Título del módulo |
| `description` | `text` | | Descripción del módulo |
| `sort_order` | `int` | `NOT NULL` `DEFAULT 0` | Orden dentro del curso |
| `is_published` | `boolean` | `NOT NULL` `DEFAULT false` | Módulo publicado |
| `created_at` | `timestamptz` | `NOT NULL` | |
| `updated_at` | `timestamptz` | `NOT NULL` | |
| `deleted_at` | `timestamptz` | | |

**Índices**: `course_id`

> `Ref: modules.course_id > courses.id`

---

#### `lessons`
Lecciones individuales dentro de un módulo. Pueden ser de distintos tipos (video, texto, quiz, etc.).

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `uuid` | `PK` | |
| `module_id` | `uuid` | `NOT NULL` `FK -> modules.id` | Módulo al que pertenece |
| `course_id` | `uuid` | `NOT NULL` `FK -> courses.id` | Curso (denormalizado para queries) |
| `title` | `varchar(255)` | `NOT NULL` | Título de la lección |
| `slug` | `varchar(255)` | `NOT NULL` | Slug para URLs |
| `type` | `lesson_type` | `NOT NULL` | Tipo de lección |
| `video_url` | `text` | | URL del video (si type=VIDEO) |
| `video_duration_seconds` | `int` | | Duración del video en segundos |
| `content_markdown` | `text` | | Contenido en markdown (text/code) |
| `sort_order` | `int` | `NOT NULL` `DEFAULT 0` | Orden dentro del módulo |
| `is_published` | `boolean` | `NOT NULL` `DEFAULT false` | Lección publicada |
| `is_preview` | `boolean` | `NOT NULL` `DEFAULT false` | Lección visible sin login |
| `attachment_urls` | `text[]` | | URLs de archivos adjuntos |
| `created_at` | `timestamptz` | `NOT NULL` | |
| `updated_at` | `timestamptz` | `NOT NULL` | |
| `deleted_at` | `timestamptz` | | |

**Índices**: `module_id`, `course_id`, `slug`, `type`

> `Ref: lessons.module_id > modules.id`
> `Ref: lessons.course_id > courses.id`

---

### 5. Enrollments & Progress

#### `enrollments`
Registro de inscripción de un estudiante a un curso.

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `uuid` | `PK` | |
| `user_id` | `uuid` | `NOT NULL` `FK -> users.id` | Estudiante |
| `course_id` | `uuid` | `NOT NULL` `FK -> courses.id` | Curso |
| `payment_id` | `uuid` | `FK -> payments.id` | Pago asociado (si aplica) |
| `enrolled_at` | `timestamptz` | `NOT NULL` `DEFAULT CURRENT_TIMESTAMP` | Fecha de inscripción |
| `completed_at` | `timestamptz` | | Fecha de finalización |
| `progress_percentage` | `decimal(5,2)` | `NOT NULL` `DEFAULT 0` | Progreso 0-100% |
| `last_accessed_at` | `timestamptz` | | Último acceso |
| `created_at` | `timestamptz` | `NOT NULL` | |
| `updated_at` | `timestamptz` | `NOT NULL` | |
| `deleted_at` | `timestamptz` | | |

**Índices**: `user_id`, `course_id`, `payment_id`, **unique** `(user_id, course_id)`

> `Ref: enrollments.user_id > users.id`
> `Ref: enrollments.course_id > courses.id`
> `Ref: enrollments.payment_id > payments.id`

---

#### `lesson_progress`
Progreso individual de cada lección por estudiante.

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `uuid` | `PK` | |
| `user_id` | `uuid` | `NOT NULL` `FK -> users.id` | Estudiante |
| `lesson_id` | `uuid` | `NOT NULL` `FK -> lessons.id` | Lección |
| `is_completed` | `boolean` | `NOT NULL` `DEFAULT false` | Lección completada |
| `watched_seconds` | `int` | `NOT NULL` `DEFAULT 0` | Segundos vistos (video) |
| `last_position_seconds` | `int` | `NOT NULL` `DEFAULT 0` | Posición donde quedó |
| `updated_at` | `timestamptz` | `NOT NULL` `DEFAULT CURRENT_TIMESTAMP` | |
| `created_at` | `timestamptz` | `NOT NULL` `DEFAULT CURRENT_TIMESTAMP` | |

**Índices**: `user_id`, `lesson_id`, **unique** `(user_id, lesson_id)`

> `Ref: lesson_progress.user_id > users.id`
> `Ref: lesson_progress.lesson_id > lessons.id`

---

### 6. Quizzes

#### `quizzes`
Evaluación asociada a una lección de tipo QUIZ.

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `uuid` | `PK` | |
| `lesson_id` | `uuid` | `NOT NULL` `FK -> lessons.id` | Lección asociada |
| `title` | `varchar(255)` | `NOT NULL` | Título del quiz |
| `passing_score` | `int` | `NOT NULL` `DEFAULT 70` | Nota mínima para aprobar (0-100) |
| `max_attempts` | `int` | | Intentos máximos permitidos |
| `time_limit_minutes` | `int` | | Límite de tiempo en minutos |
| `created_at` | `timestamptz` | `NOT NULL` | |
| `updated_at` | `timestamptz` | `NOT NULL` | |

**Índices**: `lesson_id`

> `Ref: quizzes.lesson_id > lessons.id`

---

#### `quiz_questions`
Preguntas individuales de un quiz.

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `uuid` | `PK` | |
| `quiz_id` | `uuid` | `NOT NULL` `FK -> quizzes.id` | Quiz al que pertenece |
| `text` | `text` | `NOT NULL` | Enunciado de la pregunta |
| `type` | `varchar(50)` | `NOT NULL` | Tipo (single_choice, multiple_choice, code) |
| `explanation` | `text` | | Explicación de la respuesta correcta |
| `sort_order` | `int` | `NOT NULL` `DEFAULT 0` | Orden dentro del quiz |
| `created_at` | `timestamptz` | `NOT NULL` | |
| `updated_at` | `timestamptz` | `NOT NULL` | |

**Índices**: `quiz_id`

> `Ref: quiz_questions.quiz_id > quizzes.id`

---

#### `quiz_options`
Opciones de respuesta para cada pregunta.

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `uuid` | `PK` | |
| `question_id` | `uuid` | `NOT NULL` `FK -> quiz_questions.id` | Pregunta asociada |
| `text` | `text` | `NOT NULL` | Texto de la opción |
| `is_correct` | `boolean` | `NOT NULL` `DEFAULT false` | Es la opción correcta |
| `sort_order` | `int` | `NOT NULL` `DEFAULT 0` | Orden dentro de la pregunta |
| `created_at` | `timestamptz` | `NOT NULL` | |
| `updated_at` | `timestamptz` | `NOT NULL` | |

**Índices**: `question_id`

> `Ref: quiz_options.question_id > quiz_questions.id`

---

#### `quiz_attempts`
Intento de un estudiante en un quiz.

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `uuid` | `PK` | |
| `quiz_id` | `uuid` | `NOT NULL` `FK -> quizzes.id` | Quiz intentado |
| `user_id` | `uuid` | `NOT NULL` `FK -> users.id` | Estudiante |
| `score` | `decimal(5,2)` | | Puntaje obtenido |
| `is_passed` | `boolean` | `NOT NULL` `DEFAULT false` | Aprobó o no |
| `time_spent_seconds` | `int` | | Tiempo tomado |
| `started_at` | `timestamptz` | | Inicio del intento |
| `completed_at` | `timestamptz` | | Fin del intento |
| `created_at` | `timestamptz` | `NOT NULL` | |

**Índices**: `quiz_id`, `user_id`

> `Ref: quiz_attempts.quiz_id > quizzes.id`
> `Ref: quiz_attempts.user_id > users.id`

---

#### `quiz_attempt_answers`
Respuestas individuales de cada intento.

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `uuid` | `PK` | |
| `attempt_id` | `uuid` | `NOT NULL` `FK -> quiz_attempts.id` | Intento asociado |
| `question_id` | `uuid` | `NOT NULL` `FK -> quiz_questions.id` | Pregunta respondida |
| `selected_option_id` | `uuid` | `FK -> quiz_options.id` | Opción seleccionada |
| `code_answer` | `text` | | Respuesta de código (type=code) |
| `is_correct` | `boolean` | `NOT NULL` `DEFAULT false` | Respuesta correcta |
| `created_at` | `timestamptz` | `NOT NULL` | |

**Índices**: `attempt_id`, `question_id`, `selected_option_id`

> `Ref: quiz_attempt_answers.attempt_id > quiz_attempts.id`
> `Ref: quiz_attempt_answers.question_id > quiz_questions.id`
> `Ref: quiz_attempt_answers.selected_option_id > quiz_options.id`

---

### 7. Payments & Subscriptions

#### `payments`
Pagos de cursos individuales (one-time purchases).

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `uuid` | `PK` | |
| `user_id` | `uuid` | `NOT NULL` `FK -> users.id` | Comprador |
| `course_id` | `uuid` | `FK -> courses.id` | Curso comprado (nullable si es otro concepto) |
| `stripe_payment_intent_id` | `varchar(255)` | | ID de PaymentIntent en Stripe |
| `amount` | `decimal(10,2)` | `NOT NULL` | Monto pagado |
| `currency` | `varchar(10)` | `NOT NULL` `DEFAULT 'USD'` | Moneda |
| `status` | `payment_status` | `NOT NULL` | Estado del pago |
| `type` | `varchar(50)` | | Tipo de pago (course_purchase, subscription, etc.) |
| `paid_at` | `timestamptz` | | Fecha de pago confirmado |
| `refunded_at` | `timestamptz` | | Fecha de reembolso |
| `created_at` | `timestamptz` | `NOT NULL` | |
| `updated_at` | `timestamptz` | `NOT NULL` | |

**Índices**: `user_id`, `course_id`, `stripe_payment_intent_id`, `status`

> `Ref: payments.user_id > users.id`
> `Ref: payments.course_id > courses.id`

---

#### `subscriptions`
Suscripciones de los usuarios (plan mensual, anual, lifetime).

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `uuid` | `PK` | |
| `user_id` | `uuid` | `NOT NULL` `FK -> users.id` | Suscriptor |
| `stripe_subscription_id` | `varchar(255)` | | ID de Subscription en Stripe |
| `plan` | `subscription_plan` | `NOT NULL` | Plan contratado |
| `status` | `varchar(50)` | `NOT NULL` | Estado (active, past_due, canceled, etc.) |
| `current_period_start` | `timestamptz` | | Inicio del período actual |
| `current_period_end` | `timestamptz` | | Fin del período actual |
| `cancel_at_period_end` | `boolean` | `NOT NULL` `DEFAULT false` | Cancelar al final del período |
| `created_at` | `timestamptz` | `NOT NULL` | |
| `updated_at` | `timestamptz` | `NOT NULL` | |

**Índices**: `user_id`, `stripe_subscription_id`, `status`

> `Ref: subscriptions.user_id > users.id`

---

### 8. Certificates

#### `certificates`
Certificados emitidos a estudiantes al completar un curso.

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `uuid` | `PK` | |
| `user_id` | `uuid` | `NOT NULL` `FK -> users.id` | Estudiante |
| `course_id` | `uuid` | `NOT NULL` `FK -> courses.id` | Curso completado |
| `enrollment_id` | `uuid` | `NOT NULL` `FK -> enrollments.id` | Enrollment asociado |
| `certificate_number` | `varchar(100)` | `NOT NULL` `UNIQUE` | Número único del certificado |
| `pdf_url` | `text` | | URL del PDF generado |
| `issued_at` | `timestamptz` | `NOT NULL` | Fecha de emisión |
| `verification_url` | `text` | | URL pública de verificación |
| `created_at` | `timestamptz` | `NOT NULL` | |

**Índices**: `user_id`, `course_id`, `enrollment_id`, `certificate_number`

> `Ref: certificates.user_id > users.id`
> `Ref: certificates.course_id > courses.id`
> `Ref: certificates.enrollment_id > enrollments.id`

---

### 9. Reviews, Comments & Notifications

#### `reviews`
Reseñas y calificaciones de cursos por parte de estudiantes.

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `uuid` | `PK` | |
| `user_id` | `uuid` | `NOT NULL` `FK -> users.id` | Autor de la reseña |
| `course_id` | `uuid` | `NOT NULL` `FK -> courses.id` | Curso reseñado |
| `rating` | `int` | `NOT NULL` | Calificación (1-5) |
| `title` | `varchar(255)` | | Título de la reseña |
| `body` | `text` | | Cuerpo de la reseña |
| `helpful_count` | `int` | `NOT NULL` `DEFAULT 0` | Votos de útil |
| `created_at` | `timestamptz` | `NOT NULL` | |
| `updated_at` | `timestamptz` | `NOT NULL` | |
| `deleted_at` | `timestamptz` | | |

**Índices**: `user_id`, `course_id`

> `Ref: reviews.user_id > users.id`
> `Ref: reviews.course_id > courses.id`

---

#### `comments`
Comentarios en lecciones con soporte de respuestas anidadas (self-referencing).

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `uuid` | `PK` | |
| `lesson_id` | `uuid` | `NOT NULL` `FK -> lessons.id` | Lección comentada |
| `user_id` | `uuid` | `NOT NULL` `FK -> users.id` | Autor del comentario |
| `parent_id` | `uuid` | `FK -> comments.id` | Comentario padre (respuesta) |
| `body` | `text` | `NOT NULL` | Contenido del comentario |
| `likes_count` | `int` | `NOT NULL` `DEFAULT 0` | Contador de likes |
| `is_edited` | `boolean` | `NOT NULL` `DEFAULT false` | Fue editado |
| `created_at` | `timestamptz` | `NOT NULL` | |
| `updated_at` | `timestamptz` | `NOT NULL` | |
| `deleted_at` | `timestamptz` | | |

**Índices**: `lesson_id`, `user_id`, `parent_id`

> `Ref: comments.lesson_id > lessons.id`
> `Ref: comments.user_id > users.id`
> `Ref: comments.parent_id > comments.id`

---

#### `notifications`
Notificaciones push/in-app para los usuarios.

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `uuid` | `PK` | |
| `user_id` | `uuid` | `NOT NULL` `FK -> users.id` | Destinatario |
| `type` | `varchar(100)` | `NOT NULL` | Tipo de notificación |
| `title` | `varchar(255)` | `NOT NULL` | Título |
| `body` | `text` | `NOT NULL` | Cuerpo del mensaje |
| `image_url` | `text` | | URL de imagen asociada |
| `action_url` | `text` | | URL de acción (deep link) |
| `is_read` | `boolean` | `NOT NULL` `DEFAULT false` | Leída o no |
| `created_at` | `timestamptz` | `NOT NULL` | |

**Índices**: `user_id`, `type`, `is_read`

> `Ref: notifications.user_id > users.id`

---

### 10. Notes, Bookmarks & Audit

#### `lesson_notes`
Notas personales que los estudiantes toman en cada lección.

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `uuid` | `PK` | |
| `user_id` | `uuid` | `NOT NULL` `FK -> users.id` | Autor de la nota |
| `lesson_id` | `uuid` | `NOT NULL` `FK -> lessons.id` | Lección asociada |
| `content` | `text` | `NOT NULL` | Contenido de la nota |
| `video_timestamp_seconds` | `int` | | Timestamp del video asociado |
| `created_at` | `timestamptz` | `NOT NULL` | |
| `updated_at` | `timestamptz` | `NOT NULL` | |

**Índices**: `user_id`, `lesson_id`

> `Ref: lesson_notes.user_id > users.id`
> `Ref: lesson_notes.lesson_id > lessons.id`

---

#### `bookmarks`
Marcadores de cursos guardados por el estudiante (PK compuesta).

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `user_id` | `uuid` | `PK` `FK -> users.id` | |
| `course_id` | `uuid` | `PK` `FK -> courses.id` | |
| `created_at` | `timestamptz` | `NOT NULL` `DEFAULT CURRENT_TIMESTAMP` | |

**Índices**: `(user_id, course_id)` PK compuesta, `user_id`, `course_id`

> `Ref: bookmarks.user_id > users.id`
> `Ref: bookmarks.course_id > courses.id`

---

#### `audit_logs`
Log de auditoría para tracking de cambios importantes en el sistema.

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `uuid` | `PK` | |
| `user_id` | `uuid` | `FK -> users.id` | Usuario que realizó la acción |
| `action` | `varchar(255)` | `NOT NULL` | Acción realizada |
| `entity_type` | `varchar(255)` | `NOT NULL` | Tipo de entidad afectada |
| `entity_id` | `uuid` | | ID de la entidad afectada |
| `old_values` | `jsonb` | | Valores anteriores |
| `new_values` | `jsonb` | | Valores nuevos |
| `ip_address` | `varchar(45)` | | IP desde donde se realizó |
| `created_at` | `timestamptz` | `NOT NULL` | |

**Índices**: `user_id`, `entity_type`, `entity_id`, `created_at`

> `Ref: audit_logs.user_id > users.id`

---

## Diagrama de Relaciones

Para ver el diagrama completo de relaciones, consultar el archivo [`diagram.dbml`](./diagram.dbml).

Se puede visualizar con herramientas como:
- [dbdiagram.io](https://dbdiagram.io) — pegar el contenido del DBML
- [SchemaSpy](https://schemaspy.org/) — generación de documentación HTML
- VS Code extension: `DBML` (by Devart)

---

## Full-Text Search

La tabla `courses` tiene un índice GIN sobre `search_vector` (type `tsvector`) para búsqueda de texto completo:

```sql
CREATE INDEX idx_courses_search ON courses USING GIN(search_vector);
```

Esto permite búsquedas eficientes del tipo:

```sql
SELECT * FROM courses
WHERE search_vector @@ to_tsquery('spanish', 'javascript & react');
```
