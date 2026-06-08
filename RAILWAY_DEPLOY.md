# Deploy en Railway — Diego Ferreira Platform

## Paso 1 — Crear el proyecto en Railway

1. Ir a https://railway.app → New Project
2. "Deploy from GitHub repo" → elegir diego-ferreira-platform
3. Railway detecta el monorepo automáticamente

## Paso 2 — Crear los servicios

En el proyecto Railway, crear estos 5 servicios:

| Servicio    | Tipo              | Root Directory |
|-------------|-------------------|----------------|
| df-postgres | PostgreSQL plugin | —              |
| df-redis    | Redis plugin      | —              |
| df-api      | GitHub deploy     | apps/api       |
| df-web      | GitHub deploy     | apps/web       |
| df-admin    | GitHub deploy     | apps/admin     |

Para agregar un plugin:
  + New → Database → PostgreSQL
  + New → Database → Redis

## Paso 3 — Variables de entorno en df-api

En Railway → df-api → Variables, agregar:

### Automáticas (Railway las completa del plugin):
DATABASE_URL     → copiar de df-postgres → Connect → Connection URL
REDIS_URL        → copiar de df-redis → Connect → Connection URL

### Manuales (completar antes del deploy):
JWT_SECRET               = (openssl rand -hex 32)
NODE_ENV                 = production
PORT                     = 4000
FRONTEND_URL             = https://diegoferreira.coach
ADMIN_URL                = https://admin.diegoferreira.coach
DIEGO_EMAIL              = diego@diegoferreira.coach
DIEGO_INITIAL_PASSWORD   = (password segura para Diego)
RESEND_API_KEY           = re_xxxxxxxxxxxx
GOOGLE_CLIENT_ID         = xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET     = GOCSPX-xxxx
GOOGLE_REFRESH_TOKEN     = 1//xxxx
GOOGLE_CALENDAR_ID       = diego@diegoferreira.coach
BANCARD_BASE_URL         = https://vpos.infonet.com.py:8888  (staging)
BANCARD_PUBLIC_KEY       = (credencial de Bancard)
BANCARD_PRIVATE_KEY      = (credencial de Bancard)

### Para producción Bancard (cambiar cuando Bancard apruebe):
BANCARD_BASE_URL         = https://vpos.infonet.com.py

## Paso 4 — Variables de entorno en df-web

NEXT_PUBLIC_API_URL      = https://api.diegoferreira.coach
JWT_SECRET               = (mismo que df-api)
NODE_ENV                 = production

## Paso 5 — Variables de entorno en df-admin

NEXT_PUBLIC_API_URL      = https://api.diegoferreira.coach
JWT_SECRET               = (mismo que df-api)
NODE_ENV                 = production

## Paso 6 — Configurar dominios custom

En cada servicio → Settings → Networking → Custom Domain:

| Servicio  | Dominio                          |
|-----------|----------------------------------|
| df-web    | diegoferreira.coach              |
| df-api    | api.diegoferreira.coach          |
| df-admin  | admin.diegoferreira.coach        |

Railway muestra los registros DNS a configurar en tu registrador.
Copiar exactamente los valores que Railway muestra (CNAME o A record).

## Paso 7 — Primer deploy

1. En df-api → Deploy → Trigger deploy
2. Ver los logs en tiempo real
3. Esperar que el healthcheck /health responda 200

Si el build falla, revisar los logs. Los errores más comunes:
- "Cannot find module prisma" → DATABASE_URL no configurada
- "Port already in use" → no aplica en Railway (cada servicio tiene su puerto)
- "prisma generate failed" → correr manualmente desde Railway CLI

## Paso 8 — Correr migraciones (primera vez)

Instalar Railway CLI:
  npm install -g @railway/cli
  railway login

Correr migraciones:
  railway run --service df-api --project TU_PROJECT_ID \
    npx prisma migrate deploy

Correr seed:
  railway run --service df-api --project TU_PROJECT_ID \
    npx ts-node apps/api/prisma/seed.ts

## Paso 9 — Configurar Bancard portal

1. Ir a https://comercios.bancard.com.py
2. Perfil de aplicación → URL de confirmación:
   https://api.diegoferreira.coach/payments/confirm
3. Logo del comercio: subir logo de Diego (173x55px recomendado)
4. Guardar

## Paso 10 — Checklist de pruebas en staging Bancard

Bancard requiere completar una lista de test antes de habilitar
producción. Para completarla:

ITEM 1 — "Recibir creación de pago":
  Hacer un single_buy exitoso con las credenciales de staging.
  Ir a /pago con un token válido y completar el formulario de
  Bancard con la tarjeta de test:
    Número: 4111 1111 1111 1111
    Expira: 12/26
    CVV:    123
  El item se marca verde automáticamente en el portal.

ITEM 2 — "Confirmamos correctamente al comercio":
  Bancard llama a /payments/confirm y verifica que responde 200.
  Se completa automáticamente al completar el ITEM 1.

ITEM 3 — "Recibir rollback":
  Hacer una compra y luego hacer rollback manual desde el portal.
  Verificar que el endpoint maneja el caso.

ITEM 4 — "Recibimos pedido de confirmación del comercio":
  Llamar GET /single_buy/confirmations desde la API.
  (Opcional para este caso de uso).

Una vez todos los ítems en verde → "Solicitar certificación".
Bancard hace pruebas en el sitio y habilita producción en 1-3 días.

## Paso 11 — Cambiar a producción Bancard

Cuando Bancard aprueba, actualizar en Railway df-api:
  BANCARD_BASE_URL = https://vpos.infonet.com.py
  BANCARD_PUBLIC_KEY = (clave de producción del portal)
  BANCARD_PRIVATE_KEY = (clave de producción del portal)

Railway redeploya automáticamente al guardar las variables.
