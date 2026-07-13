# Local Setup

Guía de configuración local para la base de datos PostgreSQL de CURSINET.

> **Stack**: PostgreSQL 16 + EF Core 9 + Docker

---

## Prerrequisitos

| Herramienta | Versión | Propósito |
|-------------|---------|-----------|
| Docker | 24+ | Contenedor PostgreSQL |
| Docker Compose | v2+ | Orquestación de servicios |
| PostgreSQL CLI (`psql`) | 16+ | Consultas manuales (opcional) |
| .NET SDK | 9 | Migraciones con EF Core |
| pgAdmin / DBeaver | — | GUI para base de datos (opcional) |

---

## 1. Levantar PostgreSQL con Docker

```bash
# Desde la raíz del monorepo
docker compose up postgres -d

# Verificar que el contenedor esté corriendo
docker compose ps

# Ver logs
docker compose logs postgres
```

El `docker-compose.yml` expone PostgreSQL en:

| Variable | Valor |
|----------|-------|
| Host | `localhost` |
| Puerto | `5432` |
| Base de datos | `nexora_dev` |
| Usuario | `nexora` |
| Contraseña | (definida en `.env`) |

> Si no existe `docker-compose.yml`, crear uno mínimo:
>
> ```yaml
> version: '3.8'
> services:
>   postgres:
>     image: postgres:16-alpine
>     environment:
>       POSTGRES_DB: cursinet_dev
>       POSTGRES_USER: cursinet
>       POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
>     ports:
>       - "5432:5432"
>     volumes:
>       - pgdata:/var/lib/postgresql/data
>     healthcheck:
>       test: ["CMD-SHELL", "pg_isready -U nexora"]
>       interval: 5s
>       timeout: 5s
>       retries: 5
>
> volumes:
>   pgdata:
> ```

---

## 2. Configurar Variables de Entorno

```bash
# En la raíz del proyecto
cp .env.example .env
```

Editar `.env` con los valores correspondientes:

```env
# PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=nexora_dev
POSTGRES_USER=cursinet
POSTGRES_PASSWORD=tu_contraseña_segura

# Connection String (EF Core)
DATABASE_CONNECTION_STRING=Host=localhost;Port=5432;Database=cursinet;Username=nexora;Password=tu_contraseña_segura
```

---

## 3. Ejecutar Migraciones

```bash
# Aplicar migraciones desde el backend
cd apps/api
dotnet ef database update

# Verificar migraciones aplicadas
dotnet ef migrations list
```

Si no existe la carpeta `Migrations`, crearla:

```bash
dotnet ef migrations add InitialCreate
dotnet ef database update
```

---

## 4. Seed Data (Opcional)

El proyecto incluye un seeder para datos de desarrollo:

```bash
# Desde apps/api
dotnet run -- --seed

# O usando la herramienta específica si existe
dotnet run --project tools/Cursinet.Seeder
```

Esto crea:
- Roles: admin, instructor, moderator con datos de prueba
- Categorías: Frontend, Backend, DevOps, Mobile, etc.
- Cursos de ejemplo con módulos y lecciones
- Un usuario admin por defecto

---

## 5. Verificar la Conexión

```bash
# Con psql
psql -h localhost -U cursinet -d cursinet_dev

# Ver tablas
\dt

# Ver enums
\dt

# Verificar que uuid-ossp está habilitado
SELECT * FROM pg_extension WHERE extname = 'uuid-ossp';
```

> **Nota**: La extensión `uuid-ossp` es necesaria para `uuid_generate_v4()`. Si no está instalada:
> ```sql
> CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
> ```

---

## 6. Comandos Útiles

```bash
# Resetear base de datos (cuidado: borra todo)
dotnet ef database drop
dotnet ef database update

# Crear una migración nueva
dotnet ef migrations add NombreDeLaMigracion

# Generar script SQL de migración
dotnet ef migrations script -o upgrade.sql

# Ver SQL que generará una migración
dotnet ef migrations script --idempotent
```

---

## Troubleshooting

### `uuid_generate_v4()` no existe
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Puerto 5432 ocupado
Cambiar el puerto en `docker-compose.yml` y en `.env`.

### Conexión rechazada
```bash
# Verificar que el contenedor está corriendo
docker ps | grep postgres

# Ver logs
docker compose logs postgres
```
