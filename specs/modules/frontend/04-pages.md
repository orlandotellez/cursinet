# Pages Detail

Detalle de todas las páginas de NEXORA con su implementación según la arquitectura Feature-First + Container-Presentational.

> **Patrón general**: Cada página usa un hook (container) para lógica + datos, y componentes presentacionales para UI.
> Ver [`03-architecture.md`](./03-architecture.md) para los patrones completos.

---

## Landing Page (/)

**Ruta**: `app/(public)/page.tsx`
**Tipo**: Server Component (SEO critical)

### Layout (app/(public)/layout.tsx)
- Navbar + Footer componen el layout del grupo público
- Navbar: fixed, `background: var(--bg-base)/80` + backdrop-blur-md on scroll
- Logo: "N" icon + "NEXORA"
- Nav: Explorar · Cursos · Instructores · Precios

### Hero Section
Two-column (desktop). Left: text. Right: mockup.

- **Badge**: "Plataforma de aprendizaje técnico" — pill con borde azul
- **Headline**: "Aprende tecnología construyendo sistemas **reales.**"
- **Subhead**: "Cursos de backend, frontend, arquitectura y cloud..."
- **CTAs**: "Explorar cursos" (primary) + "Ver demo gratis →" (ghost)
- **Social proof**: Avatars + "Más de 12,000 estudiantes activos"

### Sections
- **Stats Bar**: 4 stats (12K+ Estudiantes · 320+ Cursos · 4.9 ★ · 95% Completitud)
- **Featured Courses**: Grid de `CourseCard` con thumbnail, badges, instructor, precio
- **Categories Grid**: 8 categorías con icono + nombre
- **Pricing**: Gratuito / Pro Mensual ($19/mes) / Pro Anual ($149/año) / Lifetime ($399)
- **Footer**: 3-column: Logo + social | Nav | Newsletter

---

## Course Catalog (/cursos)

**Ruta**: `app/(public)/cursos/page.tsx`
**Tipo**: Server Component (SSR) + `useCourses` hook para filtros del lado cliente

```typescript
// La página server wrapper pasa props iniciales
// El componente cliente (CourseCatalogClient) usa useCourses()
export default function CatalogPage() {
  return <CourseCatalogClient />;
}

// features/courses/components/CourseCatalogClient.tsx
'use client';
export function CourseCatalogClient() {
  const { courses, loading, error, filters, setFilters } = useCourseCatalog();
  // ... loading/error/empty/success states
}
```

---

## Course Detail (/cursos/[slug])

**Ruta**: `app/(public)/cursos/[slug]/page.tsx`
**Tipo**: Server Component + ISR (revalidate: 3600)

### Hook: `useCourseDetail(slug)`
Obtiene el curso, módulos, instructor y reseñas. Container que provee datos a los presentacionales.

### UI Sections
- **Hero**: breadcrumb, title, description, rating, instructor info, precio + CTA
- **Lo que aprenderás**: checklist 2-columnas
- **Contenido**: `CurriculumAccordion` — módulos expandibles con lecciones
- **Instructor**: `InstructorBio` — avatar, name, stats, bio
- **Reviews**: `ReviewSection` — rating breakdown, lista paginada, formulario

---

## Video Player (/aprender/[courseId]/[lessonId])

**Ruta**: `app/(dashboard)/aprender/[courseId]/[lessonId]/page.tsx`
**Tipo**: Client Component

### Layout
Full-height dividido en Sidebar (320px) + Main content.

### Sidebar (LessonSidebar)
- Course title + progress bar
- Accordion curriculum: módulos colapsables
- Cada lección: checkbox de completado, tipo, duración

### Main Content
**Video Player** (features/player/components/VideoPlayer.tsx):
- Custom controls: play/pause, scrubber, time, volume, speed, quality, fullscreen
- Save progress cada 10s vía `useLessonProgress` hook
- Auto-complete at 90% watched
- Resume from last position

**Tabs below video**:
- **Descripción**: markdown + navigation buttons + "Completar" button
- **Comentarios**: `CommentsSection` con hilos anidados
- **Recursos**: lista de descargas
- **Notas**: `LessonNotes` — editor con timestamp bookmark

**Lesson Types**:
- TEXT: markdown render
- CODE: code block with syntax highlighting
- QUIZ: QuizPlayer (ver abajo)
- RESOURCE: preview + download

### Hook: `useLessonProgress`
```typescript
// features/player/hooks/useLessonProgress.ts
export function useLessonProgress(lessonId: string, courseId: string) {
  // Trackea watched_seconds, last_position, is_completed
  // Envía updates cada 30s (video) o al navegar (texto)
  // Calcula progreso total del curso
  // Dispara completed_at cuando llega a 100%
}
```

---

## Quiz Player

**Ruta**: Integrado dentro de `/aprender/[courseId]/[lessonId]` cuando `lesson.type === 'QUIZ'`
**Tipo**: Client Component

### Hook: `useQuiz(lessonId)`
```typescript
// features/quiz/hooks/useQuiz.ts
export function useQuiz(lessonId: string) {
  // Obtiene quiz + preguntas + opciones
  // Maneja estado del intento actual
  // Envía respuestas, calcula score, determina pass/fail
}
```

### UI
- Progress: "Pregunta 3 de 10"
- Timer (si tiene time limit)
- Clickable answer cards
- Results: score %, pass/fail, correct count, retry button

---

## Student Dashboard (/dashboard)

**Ruta**: `app/(dashboard)/dashboard/page.tsx`
**Tipo**: Client Component

### Hook: `useStudentDashboard()`
Obtiene: cursos en progreso, estadísticas, certificados recientes.

### Widgets
- **Welcome**: "Buenos días, {firstName}"
- **Continue Learning**: 3 cursos con thumbnail, title, progress bar, "Continuar"
- **Stats Row**: completados · lecciones · horas · racha
- **Learning Streak**: GitHub-style heatmap 52×7
- **Recent Certificates**: last 2 with download button
- **Upcoming**: bookmarked lessons

---

## Instructor Panel (/instructor/*)

**Ruta Group**: `(instructor)/instructor/*`
**Tipo**: Client Component (todas las páginas del panel)

### Dashboard (page.tsx)
**Hook**: `useInstructorStats()` — KPIs, revenue chart, recent enrollments.

- KPIs: students, revenue, courses, rating
- Revenue chart (12 months) con recharts
- Recent enrollments table

### Course Builder (/instructor/cursos/[id]/editar)
**Hook**: `useCourseBuilder(courseId)` — maneja el estado del formulario multi-paso.

Pasos:
1. **Basic info**: title, slug, description, category, level, price, thumbnail, preview video, requirements, objectives
2. **Curriculum**: drag-drop modules/lessons, lesson editor type-specific
3. **Pricing**: free/price/subscription
4. **Publish**: checklist, preview, publish

---

## Admin Panel (/admin/*)

**Ruta Group**: `(admin)/admin/*`
**Tipo**: Client Component

### Dashboard (page.tsx)
**Hook**: `useAdminDashboard()`
- KPIs: users, MRR, courses, sales
- Revenue chart
- Pending approvals

### User Management (/admin/usuarios)
**Hook**: `useUsers()` — CRUD completo con filtros y paginación.
- Searchable table: avatar+name, email, role, status, courses, joined, actions
- Modals: EditUserModal (change role, suspend, delete)

### Course Management (/admin/cursos)
**Hook**: `useAdminCourses()` — con tabs de estado.
- Tabs: All · Published · Pending · Rejected · Deleted
- Approve/Reject/Feature actions

### Analytics (/admin/analiticas)
**Hook**: `useAdminAnalytics()`
- Revenue: MRR, ARR, growth
- Users: registrations, retention, active
- Courses: categories, completion rates
