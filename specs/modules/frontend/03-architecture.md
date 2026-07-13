# Frontend Architecture

Estructura, patrones y flujo de datos del frontend de CURSINET.

> Basado en el manual de arquitectura [`frontend-structure/`](../../frontend-structure/). Feature-First + Container-Presentational + Co-location.

---

## Arquitectura General

```
┌──────────────────────────────────────────────────────┐
│                      app/                             │
│           Next.js App Router (rutas + layouts)        │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐       │
│  │ (public) │  │  (auth)  │  │ (dashboard)  │       │
│  └────┬─────┘  └────┬─────┘  └──────┬───────┘       │
│       │              │               │               │
│  ┌────┴──────────────┴───────────────┴───────┐       │
│  │            src/features/                   │       │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐   │       │
│  │  │ courses  │ │  player  │ │  quiz    │   │       │
│  │  │ instruc. │ │  admin   │ │  ...     │   │       │
│  │  └──────────┘ └──────────┘ └──────────┘   │       │
│  └──────────────────────┬─────────────────────┘       │
│                         │                             │
│  ┌──────────────────────┴─────────────────────┐       │
│  │             src/shared/                     │       │
│  │  api/  hooks/  components/  lib/  store/   │       │
│  │  types/  utils/                            │       │
│  └────────────────────────────────────────────┘       │
└──────────────────────────────────────────────────────┘
```

**Flujo de datos**:
```
pages/app → hooks (container/lógica) → api (HTTP) → Backend
         ↘ components (UI/view) ↗
```

---

## Folder Structure

```
apps/web/
├── app/                                    # Next.js App Router
│   ├── globals.css                         # Custom properties (variables de diseño)
│   ├── layout.tsx                          # Root layout (providers globales)
│   │
│   ├── (public)/                           # Route Group — páginas públicas
│   │   ├── layout.tsx                      # Navbar + Footer
│   │   ├── page.tsx                        # Landing page
│   │   ├── cursos/                         # Catálogo de cursos
│   │   │   ├── page.tsx
│   │   │   └── [slug]/
│   │   │       └── page.tsx                # Detalle de curso
│   │   ├── categorias/[slug]/page.tsx
│   │   ├── instructores/[username]/page.tsx
│   │   ├── buscar/page.tsx
│   │   └── verificar/[code]/page.tsx
│   │
│   ├── (auth)/                             # Route Group — autenticación
│   │   ├── layout.tsx                      # Layout minimalista
│   │   ├── iniciar-sesion/page.tsx
│   │   ├── registrarse/page.tsx
│   │   ├── verificar-email/page.tsx
│   │   ├── olvido-contrasena/page.tsx
│   │   └── restablecer/page.tsx
│   │
│   ├── (dashboard)/                        # Route Group — estudiante
│   │   ├── layout.tsx                      # DashboardLayout con sidebar
│   │   ├── layout.module.css
│   │   ├── dashboard/page.tsx
│   │   ├── mis-cursos/page.tsx
│   │   ├── certificados/page.tsx
│   │   ├── favoritos/page.tsx
│   │   ├── notificaciones/page.tsx
│   │   ├── configuracion/page.tsx
│   │   └── aprender/[courseId]/
│   │       ├── layout.tsx                  # VideoPlayerLayout
│   │       └── [lessonId]/page.tsx
│   │
│   ├── (instructor)/                       # Route Group — instructor
│   │   ├── layout.tsx                      # Sidebar + auth check
│   │   ├── layout.module.css
│   │   ├── instructor/dashboard/page.tsx
│   │   ├── instructor/cursos/page.tsx
│   │   ├── instructor/cursos/nuevo/page.tsx
│   │   └── instructor/cursos/[id]/editar/page.tsx
│   │
│   └── (admin)/                            # Route Group — admin
│       ├── layout.tsx                      # Sidebar + auth check
│       ├── layout.module.css
│       ├── admin/dashboard/page.tsx
│       ├── admin/usuarios/page.tsx
│       ├── admin/cursos/page.tsx
│       └── admin/analiticas/page.tsx
│
├── src/
│   ├── features/                           # Features de negocio
│   │   ├── courses/                        # Feature: Cursos
│   │   │   ├── components/
│   │   │   │   ├── CourseCard.tsx
│   │   │   │   ├── CourseCard.module.css
│   │   │   │   ├── CourseHero.tsx
│   │   │   │   ├── CourseHero.module.css
│   │   │   │   ├── CurriculumAccordion.tsx
│   │   │   │   ├── CurriculumAccordion.module.css
│   │   │   │   ├── InstructorBio.tsx
│   │   │   │   ├── InstructorBio.module.css
│   │   │   │   └── ReviewSection.tsx
│   │   │   │   └── ReviewSection.module.css
│   │   │   └── data/                       # Datos mock/seed (si aplica)
│   │   │       └── index.ts
│   │   │
│   │   ├── player/                         # Feature: Video Player
│   │   │   ├── components/
│   │   │   │   ├── VideoPlayer.tsx
│   │   │   │   ├── VideoPlayer.module.css
│   │   │   │   ├── LessonSidebar.tsx
│   │   │   │   ├── LessonSidebar.module.css
│   │   │   │   ├── CommentsSection.tsx
│   │   │   │   ├── CommentsSection.module.css
│   │   │   │   ├── LessonNotes.tsx
│   │   │   │   └── LessonNotes.module.css
│   │   │   └── hooks/                      # Hooks específicos del player
│   │   │       ├── useLessonProgress.ts
│   │   │       └── useVideoControls.ts
│   │   │
│   │   ├── quiz/                           # Feature: Quizzes
│   │   │   ├── components/
│   │   │   │   ├── QuizPlayer.tsx
│   │   │   │   ├── QuizPlayer.module.css
│   │   │   │   ├── QuizQuestion.tsx
│   │   │   │   ├── QuizQuestion.module.css
│   │   │   │   ├── QuizResults.tsx
│   │   │   │   └── QuizResults.module.css
│   │   │   └── hooks/
│   │   │       └── useQuiz.ts
│   │   │
│   │   ├── instructor/                     # Feature: Panel Instructor
│   │   │   ├── components/
│   │   │   │   ├── KpiCards.tsx
│   │   │   │   ├── KpiCards.module.css
│   │   │   │   ├── RevenueChart.tsx
│   │   │   │   ├── RevenueChart.module.css
│   │   │   │   └── course-builder/         # Sub-feature: Course Builder
│   │   │   │       ├── CourseBasicInfo.tsx
│   │   │   │       ├── CurriculumEditor.tsx
│   │   │   │       ├── CurriculumEditor.module.css
│   │   │   │       └── PublishChecklist.tsx
│   │   │   └── hooks/
│   │   │       ├── useInstructorStats.ts
│   │   │       └── useCourseBuilder.ts
│   │   │
│   │   ├── admin/                          # Feature: Admin Panel
│   │   │   ├── components/
│   │   │   │   ├── UsersTable.tsx
│   │   │   │   ├── UsersTable.module.css
│   │   │   │   ├── CoursesTable.tsx
│   │   │   │   ├── CoursesTable.module.css
│   │   │   │   ├── Filters.tsx
│   │   │   │   ├── Filters.module.css
│   │   │   │   ├── Pagination.tsx
│   │   │   │   ├── Pagination.module.css
│   │   │   │   └── modals/
│   │   │   │       ├── EditUserModal.tsx
│   │   │   │       └── EditUserModal.module.css
│   │   │   └── hooks/
│   │   │       ├── useUsers.ts
│   │   │       └── useAdminCourses.ts
│   │   │
│   │   ├── cart/                           # Feature: Carrito (si aplica)
│   │   │   ├── components/
│   │   │   │   ├── CartItems.tsx
│   │   │   │   ├── CartItems.module.css
│   │   │   │   └── CartSummary.tsx
│   │   │   └── context/
│   │   │       └── CartContext.tsx          # Context + useReducer
│   │   │
│   │   └── notifications/                  # Feature: Notificaciones
│   │       ├── components/
│   │       │   ├── NotificationBell.tsx
│   │       │   ├── NotificationBell.module.css
│   │       │   ├── NotificationPanel.tsx
│   │       │   └── NotificationPanel.module.css
│   │       └── hooks/
│   │           └── useNotifications.ts
│   │
│   └── shared/                             # Columna vertebral (backbone)
│       ├── api/                            # Capa HTTP — solo fetch, sin JSX
│       │   ├── auth.ts
│       │   ├── courses.ts
│       │   ├── lessons.ts
│       │   ├── enrollments.ts
│       │   ├── quizzes.ts
│       │   ├── payments.ts
│       │   ├── reviews.ts
│       │   ├── comments.ts
│       │   ├── certificates.ts
│       │   └── notifications.ts
│       │
│       ├── components/                     # Componentes compartidos (sin lógica de negocio)
│       │   ├── Navbar.tsx
│       │   ├── Navbar.module.css
│       │   ├── Footer.tsx
│       │   ├── Footer.module.css
│       │   ├── Sidebar.tsx
│       │   ├── Sidebar.module.css
│       │   ├── ErrorState.tsx
│       │   ├── ErrorState.module.css
│       │   ├── LoadingState.tsx
│       │   └── LoadingState.module.css
│       │
│       ├── hooks/                          # Hooks compartidos (containers)
│       │   ├── useAuth.ts
│       │   ├── useCourses.ts
│       │   ├── useCourseDetail.ts
│       │   ├── useEnrollments.ts
│       │   ├── useLessonProgress.ts
│       │   ├── useReviews.ts
│       │   └── useNotifications.ts
│       │
│       ├── lib/                            # Configuración y utilidades
│       │   ├── constants.ts                # API_URL, ITEMS_PER_PAGE, etc.
│       │   └── mappers.ts                  # Mappers API → UI
│       │
│       ├── store/                          # Estado global (Zustand)
│       │   ├── useAuthStore.ts             # Auth state + persist
│       │   ├── usePlayerStore.ts           # Video player state
│       │   └── useUiStore.ts               # Sidebar, modals, toasts
│       │
│       ├── types/                          # Tipos compartidos
│       │   └── index.ts                    # interfaces globales
│       │
│       └── utils/                          # Funciones puras helper
│           ├── auth.ts                     # getAuthHeaders
│           └── format.ts                   # formatDate, getInitials, generateSlug
│
├── public/                                 # Assets estáticos
├── .env.example
├── next.config.ts
├── package.json
├── postcss.config.mjs
└── tsconfig.json
```

---

## Patrón: Container-Presentational

Los **hooks** son los containers (tienen la lógica, el estado, las funciones).
Los **componentes** son presentacionales (reciben props, renderizan UI).

```
┌──────────────────┐      props       ┌──────────────────┐
│   Hook (Container) │ ──────────────> │ Component (View) │
│   - useState       │                 │   - Renderiza    │
│   - useEffect      │  callbacks      │   - Estilos      │
│   - fetch          │ <────────────── │   - Eventos      │
│   - handlers       │                 │                  │
└──────────────────┘                   └──────────────────┘
```

**EJEMPLO — Página de detalle de curso:**

```typescript
// shared/hooks/useCourseDetail.ts — CONTAINER
export function useCourseDetail(slug: string) {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourse = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCourseBySlug(slug);
      setCourse(mapCourseDetail(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el curso');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { fetchCourse(); }, [fetchCourse]);

  return { course, loading, error, fetchCourse };
}

// app/(public)/cursos/[slug]/page.tsx — PAGE (usa el hook)
export default function CourseDetailPage({ params }: { params: { slug: string } }) {
  const { course, loading, error, fetchCourse } = useCourseDetail(params.slug);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} fetch={fetchCourse} />;
  if (!course) return <p>Curso no encontrado</p>;

  return (
    <div>
      <CourseHero course={course} />
      <CurriculumAccordion modules={course.modules} />
      <InstructorBio instructor={course.instructor} />
      <ReviewSection reviews={course.reviews} courseId={course.id} />
    </div>
  );
}
```

---

## Route Groups

| Group | Layout | `'use client'`? | Propósito |
|-------|--------|----------------|-----------|
| `(public)` | Navbar + Footer | ❌ No | Landing, catálogo, detalle de curso |
| `(auth)` | Centrado minimalista | ❌ No | Login, registro, recuperación |
| `(dashboard)` | Sidebar estudiante | ✅ Sí | Dashboard, player, progreso |
| `(instructor)` | Sidebar instructor | ✅ Sí | Creación de cursos, analytics |
| `(admin)` | Sidebar admin | ✅ Sí | Gestión de usuarios, cursos |

**Los layouts de dashboard/instructor/admin son `'use client'`** porque verifican auth, leen localStorage y manejan estado del sidebar.

---

## Patrón: Co-location de CSS Modules

Cada componente tiene su archivo `.module.css` al lado:

```
CourseHero.tsx             ← Componente
CourseHero.module.css      ← Estilos exclusivos
```

```typescript
// CourseHero.tsx
import styles from './CourseHero.module.css';

export function CourseHero({ course }: { course: Course }) {
  return (
    <section className={styles.hero}>
      <h1 className={styles.title}>{course.title}</h1>
      <p className={styles.description}>{course.shortDescription}</p>
    </section>
  );
}
```

```css
/* CourseHero.module.css */
.hero {
  padding: 64px 0;
  background: var(--bg-surface);
}

.title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.description {
  color: var(--text-secondary);
  margin-top: 16px;
}
```

---

## Patrón: API Layer (Fetch Nativo)

Sin axios, sin React Query. Funciones independientes en `shared/api/`:

```typescript
// shared/api/courses.ts
import { API_URL } from "../lib/constants";
import { getAuthHeaders } from "../utils/auth";

export async function listCourses(params?: {
  category?: string;
  level?: string;
  search?: string;
  page?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.category) searchParams.set('category', params.category);
  if (params?.level) searchParams.set('level', params.level);
  if (params?.search) searchParams.set('search', params.search);
  if (params?.page) searchParams.set('page', String(params.page));

  const query = searchParams.toString();
  const url = `${API_URL}/courses${query ? `?${query}` : ''}`;

  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch courses');
  return res.json();
}

export async function getCourseBySlug(slug: string) {
  const res = await fetch(`${API_URL}/courses/${slug}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch course');
  return res.json();
}
```

---

## Patrón: Hook CRUD Completo

```typescript
// shared/hooks/useCourses.ts (admin)
const ITEMS_PER_PAGE = 10;

export function useCourses() {
  const [items, setItems] = useState<AdminCourse[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listCourses({ page: currentPage, limit: ITEMS_PER_PAGE, search: debouncedSearch, status: statusFilter });
      setItems(data.items ?? []);
      setTotal(data.total ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, statusFilter]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  // Reset page al cambiar filtros
  useEffect(() => { setCurrentPage(1); }, [debouncedSearch, statusFilter]);

  // Handlers CRUD
  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar curso?")) return;
    await deleteCourse(id);
    await fetchItems();
  };

  return {
    items, loading, error, total,
    currentPage, setCurrentPage,
    searchTerm, setSearchTerm,
    statusFilter, setStatusFilter,
    fetchItems, handleDelete,
  };
}
```

---

## Server vs Client Components

| Tipo | `'use client'`? | Cuándo |
|------|----------------|--------|
| Layout root | ❌ No | Metadata, providers globales |
| Layout público | ❌ No | Solo HTML + slots |
| Layout auth | ❌ No | HTML minimalista |
| Layout dashboard | ✅ Sí | Auth check, sidebar state, localStorage |
| Layout instructor | ✅ Sí | Auth check, sidebar |
| Layout admin | ✅ Sí | Auth check, sidebar |
| Landing page | ❌ No | SEO-critical, estática |
| Catálogo cursos | ❌ No (SSR) | SEO + Server Component |
| Detalle curso | ❌ No (SSR+ISR) | SEO, revalidate 3600 |
| Video player | ✅ Sí | Estado complejo, interacción |
| Quiz | ✅ Sí | Tiempo real, interacción |
| Dashboard widgets | ✅ Sí | Fetch + estado |
| Formularios | ✅ Sí | useState, onSubmit |
| Componentes UI | ✅ Sí | onClick, animaciones |

**Regla práctica:** ¿Necesita `useState`, `useEffect`, `onClick`, `localStorage`? → `'use client'`. Caso contrario → Server Component.

---

## Manejo de Estados UI

Todo componente que carga datos maneja 4 estados:

```typescript
function CourseList() {
  const { items, loading, error, fetchItems } = useCourses();

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={fetchItems} />;
  if (items.length === 0) return <p>No hay cursos disponibles</p>;

  return <div>{items.map(course => <CourseCard key={course.id} course={course} />)}</div>;
}
```

---

## Protección de Rutas

Los layouts protegidos verifican auth al montarse:

```typescript
// app/(dashboard)/layout.tsx
'use client';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) { router.push('/iniciar-sesion'); return; }
    setIsLoading(false);
  }, [router]);

  if (isLoading) return <LoadingState />;

  return (
    <div className={styles.container}>
      <Sidebar />
      <main className={styles.content}>{children}</main>
    </div>
  );
}
```
