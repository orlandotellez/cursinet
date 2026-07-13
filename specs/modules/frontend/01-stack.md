# Frontend Stack

Stack tecnológico del frontend de CURSINET.

> Basado en la arquitectura Feature-First + Container-Presentational. Ver [`frontend-structure/`](../../frontend-structure/) para el manual completo.

---

## Core Technologies

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Next.js** | 16+ | Framework fullstack (App Router, Server Components) |
| **React** | 19+ | UI Library |
| **TypeScript** | 5+ | Tipado estricto (`strict: true`, sin `any`) |
| **CSS Modules** | Built-in | Scoped styles para componentes complejos |
| **pnpm** | latest | Package manager (workspace-ready) |

## State Management

| Capa | Herramienta | Para qué |
|------|-------------|----------|
| **Estado local** | `useState` / `useReducer` | Estado de un componente específico |
| **Estado de feature** | `Context` + `useReducer` | Estado compartido dentro de una feature (ej: carrito) |
| **Estado global** | **Zustand** 5+ | Estado compartido entre features (sidebar, player, UI) |

> **No se usa React Query** — los hooks manejan el estado de fetching manualmente con `useState` + `useEffect`.

## Data Fetching

| Aspecto | Decisión |
|---------|----------|
| **HTTP client** | `fetch` nativo — sin axios, sin React Query |
| **API layer** | Funciones independientes en `shared/api/` — 1 archivo por recurso |
| **Mappers** | Funciones puras en `shared/lib/mappers.ts` para transformar API → UI |

## UI & Components

| Librería | Propósito |
|----------|-----------|
| **lucide-react** | Iconos SVG (tree-shakeable) |
| **recharts** | Gráficos y charts para dashboards |
| **CSS Modules** | Estilos scoped para componentes complejos |

> **No se usa shadcn/ui, ni Framer Motion, ni React Hook Form.** Los formularios se manejan con `useState` + validación manual o con `useReducer` si son complejos.

## Optional Dependencies

Agregar según necesidad del proyecto:

```json
{
  "@stripe/stripe-js": "^8.11.0",
  "jspdf": "^4.2.1",
  "jspdf-autotable": "^5.0.7",
  "xlsx": "^0.18.5"
}
```

## Dev Dependencies

```json
{
  "typescript": "^5",
  "eslint": "^9",
  "eslint-config-next": "^16"
}
```

## Monorepo Structure

```
nexora/
├── apps/web/          # Next.js frontend ← ESTAMOS ACÁ
├── apps/api/          # ASP.NET Core backend
└── packages/shared/   # Shared types, utils
```

## Stack Decisiones Técnicas

| Decisión | Elegido | Por qué |
|----------|---------|---------|
| Framework | Next.js 16 | SSR, SEO, App Router, Server Components |
| Routing | App Router | Layouts anidados, Route Groups |
| Estado global | Zustand | ~1KB, sin boilerplate, persist middleware |
| Estado feature | Context + useReducer | Scope limitado, sin dependencias extra |
| CSS | CSS Modules | Estilos scoped para componentes |
| Iconos | lucide-react | Tree-shakeable, buenos defaults |
| API calls | fetch nativo | 0KB, suficiente para el 95% de casos |
| Charts | recharts | Declarativo, React-friendly |
| Package manager | pnpm | Rápido, workspace-ready |
| Type safety | TypeScript strict | No negociable |

## Dependencies Full

```json
{
  "dependencies": {
    "next": "^16.2.0",
    "react": "^19.2.3",
    "react-dom": "^19.2.3",
    "zustand": "^5.0.12",
    "lucide-react": "^0.577.0",
    "recharts": "^3.8.1"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "^16.1.7",
    "typescript": "^5"
  }
}
```
