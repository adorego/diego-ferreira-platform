# Diego Ferreira Platform

Monorepo pnpm + Turborepo para la plataforma de coaching de Diego Ferreira.

## Apps

| App         | Puerto | Descripción                  |
|-------------|--------|------------------------------|
| `apps/api`  | 3000   | NestJS API REST + Prisma     |
| `apps/web`  | 3000   | Next.js (pacientes)          |
| `apps/admin`| 3001   | Next.js (panel admin)        |

## Desarrollo local

```bash
# Levantar servicios Docker
docker compose -f infra/docker-compose.yml up -d

# Instalar dependencias
pnpm install

# Migrar DB y correr seed
pnpm --filter @df/api db:migrate --name init
pnpm --filter @df/api db:seed

# Levantar todo en modo dev
pnpm dev
```

## Tests

```bash
# Todos los tests
pnpm turbo test

# Solo API
pnpm --filter @df/api test

# Solo Web
pnpm --filter @df/web test

# E2E (requiere app corriendo)
pnpm --filter @df/e2e test:e2e
```

## Deploy en Railway

### Servicios necesarios en Railway

| Servicio      | Directorio   | Descripción               |
|---------------|--------------|---------------------------|
| `df-api`      | `apps/api`   | NestJS API REST           |
| `df-web`      | `apps/web`   | Next.js (pacientes)       |
| `df-admin`    | `apps/admin` | Next.js (panel admin)     |
| `df-postgres` | —            | PostgreSQL 16 plugin      |
| `df-redis`    | —            | Redis 7 plugin            |

### Variables de entorno en Railway (df-api)

| Variable               | Obligatoria | Descripción                                      |
|------------------------|-------------|--------------------------------------------------|
| `DATABASE_URL`         | ✅ Sí       | URL de PostgreSQL (Railway lo auto-provee)       |
| `JWT_SECRET`           | ✅ Sí       | Secreto para firmar tokens JWT (mínimo 32 chars) |
| `RESEND_API_KEY`       | ✅ Sí       | API key de Resend para envío de emails           |
| `DIEGO_EMAIL`          | ✅ Sí       | Email de Diego para recibir notificaciones       |
| `GOOGLE_CLIENT_ID`     | ✅ Sí       | OAuth2 Google Calendar — Client ID               |
| `GOOGLE_CLIENT_SECRET` | ✅ Sí       | OAuth2 Google Calendar — Client Secret           |
| `GOOGLE_REFRESH_TOKEN` | ✅ Sí       | Token de refresco OAuth2 de Google               |
| `GOOGLE_CALENDAR_ID`   | ✅ Sí       | ID del calendario de Diego en Google             |
| `BANCARD_BASE_URL`     | ✅ Sí       | URL base de la API de Bancard                    |
| `BANCARD_PUBLIC_KEY`   | ✅ Sí       | Llave pública de Bancard                         |
| `BANCARD_PRIVATE_KEY`  | ✅ Sí       | Llave privada de Bancard (¡nunca compartir!)     |
| `FRONTEND_URL`         | ✅ Sí       | URL pública de apps/web (ej: https://web.up.railway.app) |
| `ADMIN_URL`            | ✅ Sí       | URL pública de apps/admin                        |
| `REDIS_URL`            | ✅ Sí       | URL de Redis (Railway lo auto-provee)            |
| `NODE_ENV`             | ⬜ No       | `production` (Railway lo setea automáticamente)  |

### Variables en Railway (df-web y df-admin)

| Variable     | Obligatoria | Descripción                    |
|--------------|-------------|--------------------------------|
| `JWT_SECRET` | ✅ Sí       | Mismo valor que en df-api      |
| `API_URL`    | ⬜ No       | URL de df-api si se necesita   |

### Pasos de primer deploy

1. Crear proyecto en Railway → **New Project** → **Deploy from GitHub repo**
2. Agregar los 5 servicios (3 apps + PostgreSQL plugin + Redis plugin)
3. Configurar variables de entorno en cada servicio según la tabla
4. En cada servicio de app, configurar el **Root Directory** correspondiente
5. Correr migraciones en Railway:
   ```bash
   railway run pnpm db:migrate --service df-api
   ```
6. Correr seed (usuario admin inicial):
   ```bash
   railway run pnpm db:seed --service df-api
   ```

### GitHub Actions Secrets requeridos

Configurar en **Settings → Secrets and variables → Actions**:

| Secret           | Descripción                                       |
|------------------|---------------------------------------------------|
| `RAILWAY_TOKEN`  | Token de Railway para deploy desde CI/CD          |
