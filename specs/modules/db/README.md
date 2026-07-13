# Database Module

Esquema y configuración de la base de datos PostgreSQL de CURSINET.

## Contenido

| Archivo | Descripción |
|---------|-------------|
| [diagram.dbml](./diagram.dbml) | Diagrama DBML completo — fuente de verdad de relaciones |
| [01-schema.md](./01-schema.md) | Documentación completa del schema: tablas, columnas, enums, índices y relaciones |
| [02-setup.md](./02-setup.md) | Guía de setup local: Docker, migraciones, variables de entorno |
| [03-use-cases.md](./03-use-cases.md) | Casos de uso con diagramas Mermaid de flujos funcionales |

## Stack

| Componente | Tecnología |
|------------|------------|
| Motor | PostgreSQL 16 |
| ORM | Entity Framework Core 9 |
| Extensiones | `uuid-ossp` (UUIDs), full-text search (GIN + tsvector) |
| Migraciones | EF Core migrations |
| Infraestructura | Docker + Docker Compose |
