# Frontend Module

Frontend de CURSINET — Next.js 16.

> Basado en la arquitectura Feature-First + Container-Presentational del [`frontend-structure/`](../../frontend-structure/).

## Contents

| Archivo | Descripción |
|---------|-------------|
| [01-stack.md](./01-stack.md) | Stack tecnológico, dependencias y decisiones técnicas |
| [02-design.md](./02-design.md) | Identidad visual: colores, tipografía, UI rules |
| [03-architecture.md](./03-architecture.md) | Arquitectura: estructura de carpetas, patrones, flujo de datos |
| [04-pages.md](./04-pages.md) | Detalle de todas las páginas y sus componentes |
| [05-quality.md](./05-quality.md) | Criterios de calidad obligatorios |
| [06-realtime.md](./06-realtime.md) | Notificaciones en tiempo real con SignalR |

## Stack

| Componente | Tecnología |
|------------|------------|
| Framework | Next.js 16 (App Router) |
| UI Library | React 19 + TypeScript 5 strict |
| CSS | CSS Modules |
| Estado global | Zustand 5 |
| Estado feature | Context + useReducer |
| API calls | fetch nativo (sin axios, sin React Query) |
| Iconos | lucide-react |
| Charts | recharts |
| Package manager | pnpm |

## Referencia

El manual completo de arquitectura y convenciones está en [`frontend-structure/`](../../frontend-structure/).
