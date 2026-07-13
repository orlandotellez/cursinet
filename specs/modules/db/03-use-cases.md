# Casos de Uso — NEXORA

Diagramas de flujo funcionales con Mermaid para cada caso de uso principal de la plataforma.

---

## Índice

1. [Registro de Usuario (Email + OAuth)](#1-registro-de-usuario)
2. [Inicio de Sesión y Autenticación](#2-inicio-de-sesión)
3. [Recuperación de Contraseña](#3-recuperación-de-contraseña)
4. [Verificación de Email](#4-verificación-de-email)
5. [Autenticación de Dos Factores (2FA)](#5-autenticación-de-dos-factores)
6. [Creación y Publicación de Curso (Instructor)](#6-creación-y-publicación-de-curso)
7. [Inscripción a Curso (Pago o Gratuito)](#7-inscripción-a-curso)
8. [Reproducción de Lecciones y Tracking de Progreso](#8-reproducción-de-lecciones)
9. [Evaluación con Quizzes](#9-evaluación-con-quizzes)
10. [Pago de Curso con Stripe](#10-pago-de-curso-con-stripe)
11. [Suscripción (Plan Mensual/Anual)](#11-suscripción)
12. [Emisión de Certificado](#12-emisión-de-certificado)
13. [Reseñas y Calificaciones](#13-reseñas-y-calificaciones)
14. [Comentarios en Lecciones](#14-comentarios-en-lecciones)
15. [Notificaciones Push/In-App](#15-notificaciones)
16. [Notas y Bookmarks](#16-notas-y-bookmarks)
17. [Búsqueda de Cursos (Full-Text Search)](#17-búsqueda-de-cursos)
18. [Auditoría de Acciones](#18-auditoría-de-acciones)

---

## 1. Registro de Usuario

**Descripción**: Un nuevo usuario se registra en la plataforma, ya sea con email y contraseña o mediante OAuth (Google/GitHub).

**Actores**: Usuario no autenticado, Sistema

**Precondiciones**: El email no debe estar registrado previamente.

**Tablas involucradas**: `users`, `account`, `session`, `email_verification_logs`

### Flujo: Registro vía OAuth

```mermaid
sequenceDiagram
    actor U as Usuario
    participant F as Frontend
    participant B as Backend (API)
    participant O as Proveedor OAuth (Google/GitHub)
    participant DB as PostgreSQL

    U->>F: Click "Registrarse con Google"
    F->>O: Redirige a OAuth provider
    O->>U: Solicita consentimiento
    U->>O: Acepta permisos
    O->>B: Callback con code + access_token
    B->>O: Verifica token
    O-->>B: Datos del perfil (email, name, avatar)
    B->>DB: Busca user por email
    alt Usuario existe
        B->>DB: Crea account vinculada (si no existe)
    else Usuario no existe
        B->>DB: INSERT INTO users (name, email, image, role='STUDENT', email_verified=true)
        B->>DB: INSERT INTO account (user_id, provider_id, account_id, access_token)
        B->>DB: INSERT INTO email_verification_logs (user_id, verified_at)
    end
    B->>DB: INSERT INTO session (user_id, token, expires_at, ip_address)
    B-->>F: Set httpOnly cookie + user data
    F->>U: Redirige a dashboard
```

### Flujo: Registro vía Email/Password

```mermaid
sequenceDiagram
    actor U as Usuario
    participant F as Frontend
    participant B as Backend (API)
    participant DB as PostgreSQL
    participant M as Mail Service

    U->>F: Completa formulario (name, email, password)
    F->>B: POST /auth/register
    B->>DB: Verifica email no existe
    alt Email ya registrado
        B-->>F: 409 Conflict - Email en uso
        F-->>U: Muestra error
    else Email disponible
        B->>DB: INSERT INTO users (name, email, role='STUDENT')
        B->>DB: INSERT INTO account (user_id, provider_id='credentials', password=hash)
        B->>B: Genera token de verificación
        B->>DB: INSERT INTO verification (identifier=email, value=token, expires_at)
        B->>M: Envía email de verificación
        B-->>F: 201 Created + mensaje
        F-->>U: "Verifica tu email"
    end
```

---

## 2. Inicio de Sesión

**Descripción**: Un usuario existente inicia sesión con email/password o mediante OAuth.

**Actores**: Usuario, Sistema

**Precondiciones**: La cuenta debe estar activa (`is_active = true`).

**Tablas involucradas**: `users`, `account`, `session`, `login_logs`

```mermaid
sequenceDiagram
    actor U as Usuario
    participant F as Frontend
    participant B as Backend (API)
    participant DB as PostgreSQL

    U->>F: Ingresa email + password
    F->>B: POST /auth/login
    B->>DB: SELECT * FROM users WHERE email = ?
    alt Usuario no existe o inactivo
        B->>DB: INSERT INTO login_logs (email, success=false, failure_reason='user_not_found')
        B-->>F: 401 Credenciales inválidas
        F-->>U: Muestra error
    else Usuario existe
        B->>DB: SELECT * FROM account WHERE user_id = ? AND provider_id = 'credentials'
        B->>B: Verifica password hash
        alt Password incorrecto
            B->>DB: INSERT INTO login_logs (user_id, success=false, failure_reason='wrong_password')
            B-->>F: 401 Credenciales inválidas
            F-->>U: Muestra error
        else Password correcto
            B->>DB: Verifica 2FA habilitado (user_two_factor)
            alt 2FA activo
                B-->>F: 200 { requires_2fa: true }
                F->>U: Solicita código 2FA
                U->>F: Ingresa código TOTP
                F->>B: POST /auth/verify-2fa
                B->>DB: Verifica código contra user_two_factor.secret
            end
            B->>DB: INSERT INTO session (user_id, token, expires_at, ip_address, user_agent)
            B->>DB: INSERT INTO login_logs (user_id, success=true)
            B->>DB: UPDATE users SET last_seen_at = NOW()
            B-->>F: Set httpOnly cookie + tokens
            F->>U: Redirige a dashboard
        end
    end
```

---

## 3. Recuperación de Contraseña

**Descripción**: Un usuario solicita restablecer su contraseña olvidada.

**Actores**: Usuario, Sistema

**Tablas involucradas**: `verification`, `password_reset_logs`, `account`

```mermaid
sequenceDiagram
    actor U as Usuario
    participant F as Frontend
    participant B as Backend (API)
    participant DB as PostgreSQL
    participant M as Mail Service

    U->>F: Click "Olvidé mi contraseña"
    F->>B: POST /auth/forgot-password (email)
    B->>DB: Busca user por email
    alt Email no encontrado
        B-->>F: 200 (respuesta genérica por seguridad)
        F-->>U: "Si el email existe, recibirás instrucciones"
    else Email encontrado
        B->>B: Genera token de reseteo
        B->>DB: INSERT INTO verification (identifier=email, value=token, expires_at=NOW()+1h)
        B->>DB: INSERT INTO password_reset_logs (user_id, ip_address, user_agent)
        B->>M: Envía email con link de reseteo
        B-->>F: 200
        F-->>U: "Revisa tu email"
    end

    Note over U,B: Usuario abre el link

    U->>F: Ingresa nueva contraseña
    F->>B: POST /auth/reset-password (token, new_password)
    B->>DB: SELECT * FROM verification WHERE value = ? AND expires_at > NOW()
    alt Token inválido o expirado
        B-->>F: 400 Token inválido
        F-->>U: "Link expirado, solicita uno nuevo"
    else Token válido
        B->>DB: UPDATE account SET password = hash WHERE user_id = ?
        B->>DB: DELETE FROM verification WHERE value = ? (o marca usado)
        B->>DB: Revoca todas las sessions del usuario
        B-->>F: 200 Contraseña actualizada
        F-->>U: "Contraseña actualizada. Inicia sesión."
    end
```

---

## 4. Verificación de Email

**Descripción**: Un usuario verifica su dirección de email después del registro.

**Actores**: Usuario, Sistema

**Tablas involucradas**: `verification`, `users`, `email_verification_logs`

```mermaid
sequenceDiagram
    actor U as Usuario
    participant F as Frontend
    participant B as Backend (API)
    participant DB as PostgreSQL

    U->>F: Click en link de verificación (token)
    F->>B: GET /auth/verify-email?token=xxx
    B->>DB: SELECT * FROM verification WHERE value = ? AND identifier = ? AND expires_at > NOW()
    alt Token inválido
        B-->>F: 400 Token inválido o expirado
        F-->>U: "Link inválido o expirado"
    else Token válido
        B->>DB: UPDATE users SET email_verified = true WHERE email = ?
        B->>DB: INSERT INTO email_verification_logs (user_id, verified_at, ip_address)
        B->>DB: DELETE FROM verification WHERE value = ?
        B-->>F: 200 Email verificado
        F-->>U: "Email verificado correctamente"
    end
```

---

## 5. Autenticación de Dos Factores

**Descripción**: Un usuario habilita/deshabilita la verificación en dos pasos (2FA) con TOTP.

**Actores**: Usuario autenticado, Sistema

**Tablas involucradas**: `user_two_factor`

```mermaid
sequenceDiagram
    actor U as Usuario
    participant F as Frontend
    participant B as Backend (API)
    participant DB as PostgreSQL

    Note over U,B: Habilitar 2FA

    U->>F: Configuración → "Activar 2FA"
    F->>B: POST /auth/2fa/enable
    B->>B: Genera secreto TOTP + QR
    B-->>F: 200 { secret, qr_code_url, backup_codes[] }
    F->>U: Muestra QR + backup codes
    U->>F: Escanea QR con Google Auth / Authy
    U->>F: Ingresa código 2FA de confirmación
    F->>B: POST /auth/2fa/verify (code)
    B->>B: Verifica código contra el secreto
    alt Código incorrecto
        B-->>F: 400 Código inválido
    else Código correcto
        B->>DB: INSERT INTO user_two_factor (user_id, secret, backup_codes, is_enabled=true)
        B-->>F: 200 2FA activado
        F-->>U: "2FA activado correctamente"
    end

    Note over U,B: Deshabilitar 2FA

    U->>F: Configuración → "Desactivar 2FA"
    F->>B: POST /auth/2fa/disable (password)
    B->>DB: Verifica password
    alt Password incorrecto
        B-->>F: 401 Password inválido
    else Password correcto
        B->>DB: UPDATE user_two_factor SET is_enabled=false WHERE user_id = ?
        -->>B: O DELETE FROM user_two_factor WHERE user_id = ?
        B-->>F: 200 2FA desactivado
    end
```

---

## 6. Creación y Publicación de Curso

**Descripción**: Un instructor crea un curso, agrega módulos y lecciones, y lo publica.

**Actores**: Instructor, Sistema

**Precondiciones**: El usuario debe tener rol `INSTRUCTOR` o `ADMIN`.

**Tablas involucradas**: `courses`, `modules`, `lessons`, `categories`, `course_tags`, `tags`

```mermaid
sequenceDiagram
    actor I as Instructor
    participant F as Frontend
    participant B as Backend (API)
    participant DB as PostgreSQL

    I->>F: Panel Instructor → "Nuevo Curso"
    F->>B: POST /instructor/courses (title, description, category_id, level, price)
    B->>DB: INSERT INTO courses (instructor_id, category_id, title, slug, level, ...)
    B-->>F: 201 Course created
    F->>I: Editor de curso

    Note over I,F: Agregar Módulos

    I->>F: "Agregar Módulo" (title)
    F->>B: POST /instructor/courses/:id/modules
    B->>DB: INSERT INTO modules (course_id, title, sort_order)
    B-->>F: 201 Module created

    Note over I,F: Agregar Lecciones

    I->>F: "Agregar Lección" (title, type, content/video)
    F->>B: POST /instructor/courses/:id/lessons
    B->>DB: INSERT INTO lessons (module_id, course_id, title, slug, type, ...)
    B-->>F: 201 Lesson created

    Note over I,F: Publicar

    I->>F: Click "Publicar"
    F->>B: PATCH /instructor/courses/:id/publish
    B->>DB: Verifica que tiene al menos 1 módulo y 1 lección publicados
    alt Validación falla
        B-->>F: 422 "Debe tener al menos un módulo con lecciones"
    else Todo OK
        B->>DB: UPDATE courses SET is_published=true, published_at=NOW()
        B-->>F: 200 Curso publicado
        F-->>I: "Curso publicado exitosamente"
    end
```

---

## 7. Inscripción a Curso

**Descripción**: Un estudiante se inscribe en un curso. Si es gratuito, se inscribe directamente. Si es pago, requiere completar el pago primero.

**Actores**: Estudiante, Sistema

**Precondiciones**: El curso debe estar publicado (`is_published = true`). El estudiante no debe estar ya inscrito.

**Tablas involucradas**: `enrollments`, `payments`, `courses`

### Flujo: Curso gratuito

```mermaid
sequenceDiagram
    actor E as Estudiante
    participant F as Frontend
    participant B as Backend (API)
    participant DB as PostgreSQL

    E->>F: Click "Inscribirme Gratis"
    F->>B: POST /courses/:slug/enroll
    B->>DB: Verifica is_free = true y is_published = true
    B->>DB: Verifica no existe enrollment previo
    alt Ya está inscrito
        B-->>F: 409 Ya estás inscrito
        F-->>E: "Ya estás inscrito en este curso"
    else No inscrito
        B->>DB: INSERT INTO enrollments (user_id, course_id, enrolled_at=NOW())
        B->>DB: UPDATE courses SET students_count = students_count + 1
        B->>DB: INSERT INTO notifications (user_id, type='enrollment', title, body, ...)
        B-->>F: 201 Inscrito correctamente
        F->>E: Redirige al player del curso
    end
```

### Flujo: Curso pago (con Stripe)

> Ver [Caso de Uso #10 — Pago de Curso con Stripe](#10-pago-de-curso-con-stripe)

---

## 8. Reproducción de Lecciones

**Descripción**: Un estudiante inscrito reproduce lecciones, y el sistema trackea el progreso automáticamente.

**Actores**: Estudiante, Sistema

**Precondiciones**: El estudiante debe estar inscrito (`enrollments` existe).

**Tablas involucradas**: `lesson_progress`, `enrollments`, `lessons`, `modules`

```mermaid
sequenceDiagram
    actor E as Estudiante
    participant F as Frontend (Player)
    participant P as Progress Tracker
    participant DB as PostgreSQL

    E->>F: Abre lección del curso
    F->>B: GET /courses/:id/lessons/:lessonId
    B->>DB: Obtiene lección + módulo
    B-->>F: Lesson data (video_url, content_markdown, etc.)
    F->>E: Renderiza contenido (video, texto, código)

    Note over F,P: Tracking automático de progreso

    loop Cada 30 segundos (video) / al navegar (texto)
        F->>P: PATCH /progress/:lessonId { watched_seconds, last_position }
        P->>DB: UPSERT lesson_progress
        P->>DB: Calcula progreso total del curso
        alt Progreso cambió significativamente
            P->>DB: UPDATE enrollments SET progress_percentage = ?, last_accessed_at = NOW()
        end
        P-->>F: 200 { progress_updated }
    end

    Note over E,F: Completar lección

    E->>F: Marca como completada (o se completa automáticamente)
    F->>P: POST /progress/:lessonId/complete
    P->>DB: UPDATE lesson_progress SET is_completed = true
    P->>DB: Recalcula progreso del curso
    P->>DB: UPDATE enrollments SET progress_percentage = ?

    alt Todas las lecciones completadas
        P->>DB: UPDATE enrollments SET completed_at = NOW(), progress_percentage = 100
        P->>DB: Dispara evento para generación de certificado
    end

    P-->>F: 200 { completed, course_progress }
    F->>E: Muestra "Lección completada" + siguiente lección
```

---

## 9. Evaluación con Quizzes

**Descripción**: Un estudiante realiza un quiz asociado a una lección. El sistema evalúa las respuestas automáticamente y registra el resultado.

**Actores**: Estudiante, Sistema

**Precondiciones**: El estudiante debe estar inscrito en el curso.

**Tablas involucradas**: `quizzes`, `quiz_questions`, `quiz_options`, `quiz_attempts`, `quiz_attempt_answers`

```mermaid
sequenceDiagram
    actor E as Estudiante
    participant F as Frontend
    participant B as Backend (API)
    participant DB as PostgreSQL

    E->>F: Abre lección tipo QUIZ
    F->>B: GET /lessons/:id/quiz
    B->>DB: SELECT * FROM quizzes WHERE lesson_id = ?
    B->>DB: SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY sort_order
    B->>DB: SELECT * FROM quiz_options WHERE question_id IN (...) ORDER BY sort_order
    Note over B: No envía is_correct al frontend
    B-->>F: Quiz data (sin respuestas correctas)
    F->>E: Muestra preguntas + opciones

    E->>F: Responde todas las preguntas y envía

    F->>B: POST /quizzes/:id/attempt { answers: [{ question_id, selected_option_id }] }
    B->>DB: INSERT INTO quiz_attempts (quiz_id, user_id, started_at=NOW())
    B->>B: Evalúa cada respuesta contra quiz_options.is_correct
    loop Por cada respuesta
        B->>DB: INSERT INTO quiz_attempt_answers (attempt_id, question_id, selected_option_id, is_correct)
    end
    B->>B: Calcula score = (correctas / total) * 100
    B->>B: Determina is_passed = score >= quiz.passing_score
    B->>DB: UPDATE quiz_attempts SET score, is_passed, completed_at=NOW()

    alt Quiz aprobado
        B->>DB: Marca lección como completada en lesson_progress (si aplica)
        B-->>F: 200 { passed: true, score, correct_answers }
        F->>E: "¡Aprobado! Score: X%" + muestra respuestas correctas
    else Quiz no aprobado
        B->>DB: Verifica max_attempts
        alt Quedan intentos
            B-->>F: 200 { passed: false, score, attempts_remaining }
            F->>E: "No alcanzaste. Te quedan X intentos."
        else Sin intentos
            B-->>F: 200 { passed: false, score, attempts_remaining: 0 }
            F->>E: "No aprobaste. Consulta al instructor."
        end
    end
```

---

## 10. Pago de Curso con Stripe

**Descripción**: Un estudiante compra un curso de pago usando Stripe como gateway de pagos.

**Actores**: Estudiante, Sistema, Stripe

**Precondiciones**: El curso debe tener precio > 0. El estudiante no debe estar ya inscrito.

**Tablas involucradas**: `payments`, `enrollments`, `courses`

```mermaid
sequenceDiagram
    actor E as Estudiante
    participant F as Frontend
    participant B as Backend (API)
    participant DB as PostgreSQL
    participant S as Stripe

    E->>F: Click "Comprar Curso" — $XX.XX
    F->>B: POST /checkout/create-payment-intent { course_id }
    B->>DB: Verifica curso, precio, que no esté inscrito
    B->>S: Creates PaymentIntent (amount, currency, customer_id)
    S-->>B: { client_secret, payment_intent_id }
    B->>DB: INSERT INTO payments (user_id, course_id, stripe_payment_intent_id, amount, status='PENDING')
    B-->>F: { client_secret }

    F->>S: Confirma pago con Stripe Elements/Payment Element
    alt Pago exitoso
        S-->>F: payment_intent.succeeded
        S->>B: Webhook payment_intent.succeeded
        B->>DB: UPDATE payments SET status='COMPLETED', paid_at=NOW()
        B->>DB: INSERT INTO enrollments (user_id, course_id, payment_id, enrolled_at=NOW())
        B->>DB: UPDATE courses SET students_count = students_count + 1
        B-->>F: 200 (por polling o SignalR)
        F->>E: "¡Inscripción exitosa! Comienza el curso"
    else Pago fallido
        S-->>F: payment_intent.payment_failed
        S->>B: Webhook payment_intent.payment_failed
        B->>DB: UPDATE payments SET status='FAILED'
        B-->>F: Error message
        F->>E: "El pago falló. Intenta con otra tarjeta."
    end
```

---

## 11. Suscripción

**Descripción**: Un usuario se suscribe a un plan (mensual/anual/lifetime) para acceder a contenido premium.

**Actores**: Usuario, Sistema, Stripe

**Tablas involucradas**: `subscriptions`, `payments`

```mermaid
sequenceDiagram
    actor U as Usuario
    participant F as Frontend
    participant B as Backend (API)
    participant DB as PostgreSQL
    participant S as Stripe

    Note over U,B: Alta de Suscripción

    U->>F: Selecciona plan (Monthly / Annual / Lifetime)
    F->>B: POST /subscriptions/create { plan }
    B->>S: Creates Checkout Session (price_id)
    S-->>B: { session_url }
    B-->>F: { url }
    F->>U: Redirige a Stripe Checkout
    U->>S: Completa pago en Stripe
    S->>B: Webhook checkout.session.completed
    B->>DB: INSERT INTO subscriptions (user_id, stripe_subscription_id, plan, status='active', ...)
    B->>U: Notificación "Suscripción activada"

    Note over U,B: Cancelación

    U->>F: "Cancelar suscripción"
    F->>B: POST /subscriptions/cancel
    B->>DB: UPDATE subscriptions SET cancel_at_period_end = true
    B->>S: Cancela al final del período (opcional)
    B-->>F: "Suscripción cancelada. Expira el XX/XX"
```

---

## 12. Emisión de Certificado

**Descripción**: Cuando un estudiante completa todas las lecciones de un curso, el sistema genera automáticamente un certificado en PDF.

**Actores**: Sistema, Estudiante

**Precondiciones**: El enrollment debe tener `completed_at` con valor o `progress_percentage = 100`.

**Tablas involucradas**: `certificates`, `enrollments`, `courses`, `users`

```mermaid
sequenceDiagram
    participant P as Progress Tracker
    participant B as Backend (API)
    participant DB as PostgreSQL
    participant G as PDF Generator (QuestPDF)

    Note over P: Evento: curso completado
    P->>B: Dispara evento CourseCompleted (user_id, course_id, enrollment_id)
    B->>DB: Verifica que no exista certificado previo
    alt Certificado ya existe
        B-->>P: Skip
    else No existe
        B->>B: Genera certificate_number (formato: NXR-2025-XXXXX)
        B->>G: Genera PDF con datos del estudiante y curso
        G-->>B: PDF generado, subido a storage
        B->>DB: INSERT INTO certificates (user_id, course_id, enrollment_id, certificate_number, pdf_url, issued_at, verification_url)
        B->>DB: INSERT INTO notifications (user_id, type='certificate', ...)
    end

    Note over E: El estudiante recibe notificación

    actor E as Estudiante
    E->>F: Abre notificación de certificado
    F->>B: GET /certificates/:id
    B-->>F: Certificate data + pdf_url
    F->>E: Muestra certificado con opción de descargar

    Note over E,F: Verificar certificado

    V as Visitante
    V->>F: Ingresa a /certificados/verificar?code=NXR-2025-XXXXX
    F->>B: GET /certificates/verify?code=xxx
    B->>DB: Busca por certificate_number
    alt Válido
        B-->>F: { valid: true, user_name, course_title, issued_at }
        F->>V: Muestra certificado verificado
    else Inválido
        B-->>F: { valid: false }
        F->>V: "Certificado no encontrado"
    end
```

---

## 13. Reseñas y Calificaciones

**Descripción**: Un estudiante puede calificar y reseñar un curso en el que está inscrito.

**Actores**: Estudiante, Sistema

**Precondiciones**: El estudiante debe estar inscrito. Solo una reseña por curso.

**Tablas involucradas**: `reviews`, `courses`

```mermaid
sequenceDiagram
    actor E as Estudiante
    participant F as Frontend
    participant B as Backend (API)
    participant DB as PostgreSQL

    E->>F: Navega a página del curso completado
    E->>F: Selecciona rating (1-5) + escribe reseña
    F->>B: POST /courses/:slug/reviews { rating, title, body }
    B->>DB: Verifica que existe enrollment y no hay review previa
    alt Ya reseñó
        B-->>F: 409 "Ya calificaste este curso"
    else Es su primera reseña
        B->>DB: INSERT INTO reviews (user_id, course_id, rating, title, body)
        B->>DB: Recalcula average_rating y reviews_count en courses
        Note over B: UPDATE courses SET average_rating = (SELECT AVG(rating) FROM reviews WHERE course_id = ?), reviews_count = (SELECT COUNT(*) FROM reviews WHERE course_id = ?)
        B-->>F: 201 Review created
        F->>E: "Reseña publicada"
    end

    Note over E,F: Marcar reseña como útil

    Otro as OtroEstudiante
    Otro->>F: Click "Me sirvió" en una reseña
    F->>B: POST /reviews/:id/helpful
    B->>DB: UPDATE reviews SET helpful_count = helpful_count + 1
    B-->>F: 200
```

---

## 14. Comentarios en Lecciones

**Descripción**: Los estudiantes pueden comentar en las lecciones y responder a otros comentarios (hilos).

**Actores**: Estudiante, Instructor, Sistema

**Tablas involucradas**: `comments`, `notifications`

```mermaid
sequenceDiagram
    actor E as Estudiante
    participant F as Frontend
    participant B as Backend (API)
    participant DB as PostgreSQL

    E->>F: Abre lección → sección de comentarios
    F->>B: GET /lessons/:id/comments
    B->>DB: SELECT * FROM comments WHERE lesson_id = ? AND parent_id IS NULL
    B->>DB: SELECT * FROM comments WHERE parent_id IN (...) (respuestas anidadas)
    B-->>F: Thread de comentarios

    E->>F: Escribe comentario
    F->>B: POST /lessons/:id/comments { body }
    B->>DB: INSERT INTO comments (lesson_id, user_id, body)
    B->>DB: Crea notificación para el instructor del curso
    B-->>F: 201 Comment created
    F->>E: Muestra nuevo comentario

    Note over E,F: Responder comentario

    E->>F: Click "Responder" en un comentario
    F->>B: POST /lessons/:id/comments { body, parent_id }
    B->>DB: INSERT INTO comments (lesson_id, user_id, parent_id, body)
    B->>DB: Crea notificación para el autor original
    B-->>F: 201 Reply created
    F->>E: Muestra respuesta anidada

    Note over E,F: Like a comentario

    E->>F: Click "Like" en un comentario
    F->>B: POST /comments/:id/like
    B->>DB: UPDATE comments SET likes_count = likes_count + 1
    B-->>F: 200
```

---

## 15. Notificaciones

**Descripción**: El sistema envía notificaciones a los usuarios por distintos eventos (inscripción, certificado, comentarios, etc.).

**Actores**: Sistema, Usuario

**Tablas involucradas**: `notifications`

```mermaid
sequenceDiagram
    participant S as Sistema (Evento)
    participant B as Backend (API)
    participant DB as PostgreSQL
    participant R as SignalR Hub
    participant P as Push Service (opcional)

    Note over S: Evento: nuevo logro/comentario/curso

    S->>B: Dispara evento de notificación
    B->>DB: INSERT INTO notifications (user_id, type, title, body, action_url, image_url)
    B->>R: Envía notificación en tiempo real al usuario
    R->>U: SignalR event (nueva notificación)
    B->>P: Push notification (si el usuario tiene dispositivo registrado)

    actor U as Usuario

    U->>F: Abre panel de notificaciones
    F->>B: GET /notifications
    B->>DB: SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50
    B-->>F: Lista de notificaciones
    F->>U: Muestra notificaciones

    U->>F: Click en una notificación
    F->>B: PATCH /notifications/:id/read
    B->>DB: UPDATE notifications SET is_read = true WHERE id = ?
    B-->>F: 200
    F->>B: GET /notifications/unread-count
    B->>DB: SELECT COUNT(*) FROM notifications WHERE user_id = ? AND is_read = false
    B-->>F: { count: 3 }

    U->>F: Click "Marcar todas como leídas"
    F->>B: PATCH /notifications/read-all
    B->>DB: UPDATE notifications SET is_read = true WHERE user_id = ? AND is_read = false
    B-->>F: 200
```

---

## 16. Notas y Bookmarks

**Descripción**: Los estudiantes pueden tomar notas en las lecciones y guardar cursos como favoritos.

**Actores**: Estudiante, Sistema

**Tablas involucradas**: `lesson_notes`, `bookmarks`

```mermaid
sequenceDiagram
    actor E as Estudiante
    participant F as Frontend
    participant B as Backend (API)
    participant DB as PostgreSQL

    Note over E,F: Tomar nota en lección

    E->>F: Abre panel de notas en el player
    E->>F: Escribe nota (puede incluir timestamp de video)
    F->>B: POST /lessons/:id/notes { content, video_timestamp_seconds }
    B->>DB: INSERT INTO lesson_notes (user_id, lesson_id, content, video_timestamp_seconds)
    B-->>F: 201 Note created
    F->>E: Muestra nota guardada

    E->>F: Edita nota existente
    F->>B: PATCH /notes/:id { content }
    B->>DB: UPDATE lesson_notes SET content = ?
    B-->>F: 200

    Note over E,F: Bookmark curso

    E->>F: Click "Guardar curso" (icono bookmark)
    F->>B: POST /bookmarks { course_id }
    B->>DB: INSERT INTO bookmarks (user_id, course_id)
    B-->>F: 201
    F->>E: Muestra icono lleno

    E->>F: Click "Quitar bookmark"
    F->>B: DELETE /bookmarks?course_id=xxx
    B->>DB: DELETE FROM bookmarks WHERE user_id = ? AND course_id = ?
    B-->>F: 200
    F->>E: Muestra icono vacío
```

---

## 17. Búsqueda de Cursos

**Descripción**: Los usuarios buscan cursos utilizando full-text search sobre el título, descripción y objetivos.

**Actores**: Visitante/Usuario, Sistema

**Tablas involucradas**: `courses` (con índice GIN en `search_vector`)

```mermaid
sequenceDiagram
    actor V as Visitante
    participant F as Frontend
    participant B as Backend (API)
    participant DB as PostgreSQL

    V->>F: Escribe en barra de búsqueda: "react native"
    F->>B: GET /courses/search?q=react+native&level=BEGINNER&category=frontend&page=1
    B->>B: Procesa query → to_tsquery('spanish', 'react & native')
    B->>DB: SELECT *, ts_rank(search_vector, query) AS rank
    B->>DB: FROM courses
    B->>DB: WHERE search_vector @@ query AND is_published = true
    B->>DB: ORDER BY rank DESC
    B->>DB: LIMIT 20 OFFSET 0
    B-->>F: Resultados paginados con ranking
    F->>V: Muestra cards de cursos + total_results

    V->>F: Filtra por nivel "BEGINNER"
    F->>B: GET /courses/search?q=react+native&level=BEGINNER
    B->>DB: Misma query + AND level = 'BEGINNER'
    B-->>F: Resultados filtrados
    F->>V: Actualiza listado

    V->>F: Ordena por "Más populares"
    F->>B: GET /courses/search?q=react+native&sort=students_count&order=desc
    B->>DB: ORDER BY students_count DESC
    B-->>F: Resultados ordenados
```

---

## 18. Auditoría de Acciones

**Descripción**: El sistema registra automáticamente acciones importantes realizadas por los usuarios para cumplimiento y debugging.

**Actores**: Sistema (automático), Admin (consulta)

**Tablas involucradas**: `audit_logs`

```mermaid
sequenceDiagram
    participant U as Usuario (Admin/Instructor)
    participant B as Backend (API)
    participant DB as PostgreSQL
    participant A as Audit Logger
    participant S as Storage

    Note over U,A: Registro automático

    U->>B: Realiza acción sensible (delete course, change role, refund)
    B->>A: Emite evento AuditEntry { user_id, action, entity_type, entity_id, old_values, new_values, ip_address }
    A->>DB: INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values, ip_address)
    A-->>B: Log registrado
    B-->>U: Acción completada

    Note over A,S: Consulta de auditoría

    Admin as Administrador
    Admin->>F: Panel Admin → "Auditoría"
    F->>B: GET /admin/audit-logs?entity_type=courses&action=delete&from_date=2025-01-01
    B->>DB: SELECT * FROM audit_logs WHERE entity_type = 'courses' AND action = 'delete' AND created_at >= '2025-01-01' ORDER BY created_at DESC
    B-->>F: Lista paginada de logs
    F->>Admin: Muestra tabla con usuario, acción, fecha, cambios

    Admin->>F: Click en un log específico
    F->>B: GET /admin/audit-logs/:id
    B->>DB: SELECT * FROM audit_logs WHERE id = ?
    B-->>F: Detalle completo (old_values, new_values en JSON)
    F->>Admin: Muestra diff de cambios
```

---

## Resumen de Tablas por Caso de Uso

| Caso de Uso | Tablas Principales |
|-------------|-------------------|
| Registro | `users`, `account`, `session`, `verification`, `email_verification_logs` |
| Login | `users`, `account`, `session`, `user_two_factor`, `login_logs` |
| Recuperar Password | `verification`, `password_reset_logs`, `account` |
| Verificar Email | `verification`, `users`, `email_verification_logs` |
| 2FA | `user_two_factor` |
| Gestión de Cursos | `courses`, `modules`, `lessons`, `categories`, `course_tags`, `tags` |
| Inscripción | `enrollments`, `payments`, `courses` |
| Lecciones/Progreso | `lesson_progress`, `enrollments`, `lessons` |
| Quizzes | `quizzes`, `quiz_questions`, `quiz_options`, `quiz_attempts`, `quiz_attempt_answers` |
| Pagos | `payments`, `enrollments`, `courses` |
| Suscripciones | `subscriptions`, `payments` |
| Certificados | `certificates`, `enrollments`, `courses`, `users` |
| Reseñas | `reviews`, `courses` |
| Comentarios | `comments`, `notifications` |
| Notificaciones | `notifications` |
| Notas/Bookmarks | `lesson_notes`, `bookmarks` |
| Búsqueda | `courses` (GIN index en `search_vector`) |
| Auditoría | `audit_logs` |
