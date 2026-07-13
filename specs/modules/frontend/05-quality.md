# Quality Criteria

Criterios de calidad obligatorios para el frontend de NEXORA.

---

## Code Quality
- **Zero mocks** in production — all data from PostgreSQL
- **TypeScript strict**: no `any`, no `@ts-ignore`
- **CSS Modules**: estilos scoped, sin fugas de CSS
- **Co-location**: estilos y componentes viven juntos

## UX States
Toda pantalla que carga datos debe manejar estos 4 estados:

| Estado | Componente | Acción |
|--------|-----------|--------|
| **Loading** | `LoadingState` (spinner) | — |
| **Error** | `ErrorState` (mensaje + retry) | `fetch()` callback |
| **Empty** | Mensaje contextual | CTA para crear/explorar |
| **Success** | Datos renderizados | — |

## Responsiveness
- Mobile-first, works on 320px+
- CSS Modules media queries para layouts responsives

## Accessibility
- ARIA labels en inputs y botones
- Keyboard navigation (tabindex, role)
- Focus management en modales
- Contraste suficiente (dark theme con texto claro)

## Performance
- Lighthouse score >90 on public pages
- Server Components para páginas SEO-critical
- ISR para detalle de cursos (revalidate: 3600)
- Debounce en búsquedas (300ms)

## SEO
- Meta tags dinámicos por página
- OG images para compartir en redes
- Structured data (JSON-LD) en páginas de curso
- Slugs descriptivos en URLs

## Error Handling
- Error boundaries en todos los route groups
- Manejo de errores en hooks: `try/catch` + `setError`
- Mensajes de error claros y en español

## Optimistic UI
Aplicar en operaciones de baja probabilidad de fallo:
- Likes en comentarios
- Bookmarks
- Marcar lección como completada
- Actualización de progreso
