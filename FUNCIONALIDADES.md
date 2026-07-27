# Reporte de Funcionalidades — diego-ferreira-platform

Fecha de análisis: 2026-07-24
Analizado por: Claude Code

Plataforma para el consultorio de un profesional (psicólogo/coach, "Diego Ferreira"): sitio público de venta de sesiones, agendamiento con Google Calendar, cobro con Bancard, panel de administración interno, y backend NestJS con Postgres/Prisma.

---

## Estructura del Monorepo

pnpm workspaces (`pnpm-workspace.yaml`): `apps/*`, `packages/*`, `apps/e2e`. Orquestado con Turborepo (`turbo.json`: build/dev/lint/typecheck/test).

| Workspace | Nombre pkg | Propósito |
|---|---|---|
| `apps/web` | `@df/web` | Sitio público (Next.js 15): landing, agendamiento, pago, noticias/artículos |
| `apps/admin` | `@df/admin` | Panel interno (Next.js 15) para que Diego gestione pacientes/turnos |
| `apps/api` | `@df/api` | Backend NestJS 11: auth, pacientes, calendario, pagos, emails, recordatorios, CMS |
| `apps/e2e` | — | Tests end-to-end con Playwright, apuntan a `apps/web` |
| `packages/types` | `@df/types` | Modelos de dominio compartidos (Patient, Session, Payment, Plan, enums) |
| `packages/emails` | `@df/emails` | Templates de email con React Email (no usados actualmente por la API) |
| `packages/ui` | `@df/ui` | Placeholder vacío (`export {}`), sin componentes |

Infra: `infra/docker-compose.yml` (Postgres + Redis local), deploy en Railway (`railway.json`/`nixpacks.toml` por app).

---

# apps/web

**Stack:** Next.js 15, React 19, TypeScript 5.9 (`strict: false`), MUI 6 + Emotion, Tailwind 4, Vitest 4 + Testing Library, axios, jose, react-datepicker.
**Estado del build/typecheck:** ✅ Compila sin errores (`tsc --noEmit` exit 0, verificado directamente).
**Estado de tests:** ✅ 2 test files, 6/6 tests pasan (`vitest run`, verificado directamente: `middleware.test.ts`, `lib/auth_server.test.ts`).

#### Páginas y Rutas

| Ruta | Archivo | Estado | Descripción |
|---|---|---|---|
| `/` | `src/app/page.tsx` | ✅ | Redirect inmediato a `/main` |
| `/main` | `src/app/main/page.tsx` | ✅ | Landing: Hero + 7 secciones de venta + Footer |
| `/agendar` | `src/app/agendar/page.tsx` | ✅ | Lee `?plan=`, renderiza formulario de booking (client) |
| `/pago` | `src/app/pago/page.tsx` + `PagoClient.tsx` | ✅ | Consume `?token=`, integra widget JS de Bancard |
| `/pago/confirmacion` | `src/app/pago/confirmacion/page.tsx` | ✅ | Mensaje de éxito estático |
| `/pago/cancelado` | `src/app/pago/cancelado/page.tsx` | ✅ | Reintento de pago vía `sessionStorage` |
| `/noticias/[slug]` | `src/app/noticias/[slug]/page.tsx` | ✅ | ISR (60s), `generateMetadata`, `notFound()` |
| `/articulos/[slug]` | `src/app/articulos/[slug]/page.tsx` | ✅ | Igual patrón que noticias |
| `/privacidad`, `/terminos` | respectivos `page.tsx` | ✅ | Contenido legal estático |
| `/api/auth/login` (route handler) | `src/app/api/auth/login/route.ts` | ✅ | Proxy a la API, propaga cookie `set-cookie` |
| `/login`, `/dashboard`, `/registrados`, `/admin` | no existen | ❌ | Protegidas por `middleware.ts` pero **sin página implementada** → 404 |

#### Componentes principales
- `TopBar.tsx`, `HeroSplit.tsx`, `Footer.tsx` — layout/nav de la landing, en uso.
- `IdentificacionSection`, `AutoridadSection`, `PromesaSection`, `CambiosSection`, `MetodoSection`, `ParaQuienSection`, `CierreSection`, `PreciosSection` — secciones de venta de `/main`, ancladas correctamente a `TopBar`/`Footer`.
- `src/app/components/agendar.tsx` (`AgendarSesion`) — formulario de booking: disponibilidad real, validación de email duplicado, crea evento.
- `src/lib/auth_server.ts` — decodifica JWT server-side desde cookie.
- **Componentes muertos** (declarados, no importados desde ninguna página): `app/components/{nav-bar,footer,hero,quien-soy,articulos,eventos,podcasts,videos,noticias}.tsx`, `components/hero/hero.tsx`, `components/SectionFullBleed.tsx` — restos de una versión anterior del sitio, hacen fetch a CMS pero no se renderizan.

#### Llamadas a la API backend detectadas
`/auth/login`, `/calendar/sesiones-exterior`, `/calendar/create-event`, `/patients/exists`, `/payments/create-link`, `/cms/noticias(+slug)`, `/cms/articulos(+slug)`. Además `/sessions/:id/date` (ruta **incorrecta**, ver bugs).

#### Integraciones externas
Ninguna directa — todo pasa por `apps/api`. Widget externo de Bancard cargado vía `<Script>` en `/pago`.

#### Variables de entorno requeridas
`NEXT_PUBLIC_API_URL` (✅ documentada), `JWT_SECRET` (✅ documentada, usada en middleware para verificar el JWT client-side de Next).

#### Funcionalidades confirmadas ✅
- Landing completa, navegación por anclas consistente.
- Flujo de booking end-to-end (disponibilidad → validación de email → creación de evento).
- Flujo de pago con Bancard (creación de link, confirmación, cancelación).
- Páginas CMS dinámicas con ISR.
- Proxy de login que reenvía la cookie httpOnly correctamente.

#### Funcionalidades con dudas ⚠️
- Dependencias declaradas sin uso real en código: `@daily-co/daily-js`, `@tldraw/tldraw`, `remove-markdown`, `@df/types`, `@df/ui`.
- `next-sitemap` en dependencias sin config activa; `sitemap.xml`/`sitemap-0.xml` parecen generados manualmente y podrían desactualizarse.
- Inconsistencia de dominio: `robots.txt`/`sitemap.xml` usan `diegoferreira.org`, pero `layout.tsx` (metadata/OG) usa `diegoferreira.com`.
- WhatsApp placeholder (`wa.me/595000000000`) y redes sociales genéricas en `Footer.tsx` sin handle real.

#### Funcionalidades rotas o incompletas ❌
- `src/app/helpers/sessions-utils.ts` (`editSessionDate`) llama a `/sessions/:id/date`, pero el backend expone `/patients/sessions/:id/date` → 404 si se invocara. Mitigado: no se llama desde ninguna página actual (código muerto con bug latente).
- `middleware.ts` protege `/login`, `/dashboard`, `/registrados`, `/admin` — ninguna existe como página en `apps/web` → acceso termina en 404.
- `og-image.jpg` referenciado en `layout.tsx` para Open Graph/Twitter card **no existe** en `public/` → imagen rota al compartir el link.

---

# apps/admin

**Stack:** Next.js 15, React 19, TypeScript 5.4 (`strict: false`), Vitest 4. MUI/Emotion/Tailwind/`@df/ui`/`jose` están en dependencias pero **no se usan** en ningún archivo (dead deps).
**Estado del build/typecheck:** ✅ Compila sin errores (`tsc --noEmit` exit 0).
**Estado de tests:** ❌ Sin ningún archivo de test — `vitest run` termina con "No test files found" (exit 1). Infra de testing lista (vitest.config/setup) pero sin specs escritos.

#### Páginas y Rutas

| Ruta | Archivo | Estado | Descripción |
|---|---|---|---|
| `/` | `src/app/page.tsx` | ✅ | Redirect a `/dashboard` |
| `/login` | `src/app/login/page.tsx` | ⚠️ | Form email/password → `POST /auth/login`; sin loading state ni deshabilitar submit |
| `/dashboard` | `src/app/dashboard/page.tsx` | ⚠️ | Renderiza `DashboardPacientes`; **no requiere sesión a nivel de página** |

#### Componentes principales
- `DashboardPacientes.tsx` — lista sesiones/pacientes (`GET /patients/sessions`) y expone botón "Admitir paciente" que arma el payload para `POST /patients/admitPatient`, pero **el diálogo de confirmación nunca fue implementado** (el comentario del propio código dice "AdmitDialog va acá"), así que la acción nunca se dispara desde la UI real.

#### Llamadas a la API backend detectadas
`POST /auth/login`, `GET /patients/sessions`, `POST /patients/admitPatient` (nunca invocada realmente, ver arriba). No hay logout ni `GET /auth/me` implementados en el front.

#### Autenticación / protección de rutas
El backend setea cookie httpOnly JWT en login. **`apps/admin` no tiene `middleware.ts`** (a diferencia de `apps/web`) — no hay protección de rutas a nivel de Next; `/dashboard` es accesible sin sesión, el contenido solo queda vacío si la API rechaza el fetch (y ese 401 tampoco se maneja: no hay redirect a `/login`).

#### Variables de entorno requeridas
`NEXT_PUBLIC_API_URL` (documentada para `apps/web`, reutilizada implícitamente por admin sin sección propia en `.env.example`).

#### Funcionalidades confirmadas ✅
- Login funcional contra la API con cookie httpOnly + CORS correctamente configurado (`ADMIN_URL` en backend).
- Listado de pacientes/sesiones en el dashboard.

#### Funcionalidades con dudas ⚠️
- Sin manejo de sesión expirada (fetch sin verificar `res.ok`).
- Dependencias de UI (MUI, Tailwind, `@df/ui`) declaradas pero no usadas — código actual es solo `style={{}}` inline.

#### Funcionalidades rotas o incompletas ❌
- Botón "Admitir paciente" sin diálogo de confirmación → funcionalidad de aprobación de pacientes **inaccesible desde la UI** pese a que la lógica del backend y el handler `admitPatient()` están completos.
- Sin `middleware.ts` → `/dashboard` no está protegido a nivel de ruta.
- Sin logout en el frontend (el backend sí expone `POST /auth/logout`).
- 0 tests.

---

# apps/api

**Stack:** NestJS 11, Prisma 7.8 (driver adapter `pg`), Postgres, `@nestjs/jwt`+`passport-jwt`, `@nestjs/schedule` (cron), `bcrypt`, `googleapis`, `resend`, Jest 30.
**Estado del build/typecheck:** ✅ Compila sin errores (`tsc --noEmit` exit 0).
**Estado de tests:** ✅ 7/7 test suites, 25/25 tests pasan (auth, calendar, email, patients, payments, reminders). ⚠️ `test/app.e2e-spec.ts` es el boilerplate default de Nest (espera `GET / → "Hello World!"`) y fallaría si se ejecutara — no hay controller raíz en `AppModule`.

#### Rutas API

| Endpoint | Método | Auth | Estado | Descripción |
|---|---|---|---|---|
| `/auth/login` | POST | Pública | ✅ | bcrypt + JWT, cookie httpOnly 7d |
| `/auth/logout` | POST | Pública | ✅ | Limpia cookie |
| `/auth/me` | GET | JwtGuard | ✅ | Payload del token |
| `/calendar/sesiones-exterior` | GET | Pública | ✅ | Disponibilidad desde Google Calendar (30 días) |
| `/calendar/create-event` | POST | **Sin guard** | ❌ | Crea evento + Meet; **accesible sin autenticación** |
| `/cms/{noticias,articulos,eventos,videos,podcasts}` | GET | Pública | ⚠️ | Lee JSON estáticos, todos vacíos (`[]`) |
| `/health` | GET | Pública | ⚠️ | Postgres: ping real. Redis: solo valida formato de URL, no conecta |
| `/patients/sessions` | GET | JwtGuard | ✅ | Todas las sesiones + paciente + resumen |
| `/patients/exists` | GET | Pública | ✅ | Valida email en tiempo real (registro) |
| `/patients/:email` | GET | JwtGuard | ✅ | Paciente + sesiones + pagos |
| `/patients/admitPatient` | POST | JwtGuard | ✅ | Aprueba paciente, token de pago 48h, email |
| `/patients/sessions/:id/date` | PATCH | JwtGuard | ✅ | Reprograma sesión |
| `/payments/create-link` | POST | Verificación manual de JWT en body | ⚠️ | Genera hash MD5 y llama a Bancard `single_buy` |
| `/payments/webhook` | POST | **Sin verificación de firma** | ❌ | Marca pago `CONFIRMED` solo con `response==='S'` en el body |
| `/payments/confirm` | POST | **Sin verificación de firma** | ❌ | Duplicado de `/webhook`, mismo riesgo |

Recordatorios: sin endpoint REST, `@Cron` interno (ventanas de 24h/1h).

#### Integraciones externas
- **Google Calendar** ⚠️ — `getAvailability()` tiene fallback si faltan envs; `createEvent()` no, y con `GOOGLE_REFRESH_TOKEN`/`GOOGLE_CALENDAR_ID` vacíos en el `.env` actual, **no operativa hoy**.
- **Resend (email)** ✅ — implementada con HTML armado a mano; credenciales reales configuradas.
- **Bancard (pagos)** ⚠️ — implementada, pero `BANCARD_PUBLIC_KEY`/`BANCARD_PRIVATE_KEY` vacíos → no operativa hoy. Webhook sin validar autenticidad (❌ riesgo de seguridad).
- **OpenAI** ❌ — dependencia + env var declaradas, **cero código**. El campo `SessionSummary` en Prisma nunca se puebla ("resumen IA" anunciado, no implementado).
- **Daily.co** ❌ — solo variables de entorno, sin dependencia ni código. El video real usa Google Meet vía Calendar, no Daily.
- **Redis/Bull** ❌ — dependencias en `package.json` sin ningún uso (`BullModule`, `@InjectQueue` inexistentes); recordatorios usan cron in-process, no colas.
- **`@df/emails`** ⚠️ — paquete compartido con templates React Email completo, pero `EmailService` de la API lo ignora y reimplementa el HTML a mano (duplicación; el spec de tests tiene mocks vestigiales de `@df/emails` que nunca se usan en el servicio real).

#### Variables de entorno requeridas
Todas las de `.env.example` están en uso, más `PORT`, `NODE_ENV`, `ADMIN_PASSWORD` (usadas en código pero **no documentadas** en `.env.example`). `DAILY_API_KEY`, `DAILY_DOMAIN`, `OPENAI_API_KEY` están documentadas pero **sin ningún uso** en código. Existe `.env` real con credenciales configuradas (no incluidas en este reporte); `GOOGLE_REFRESH_TOKEN`, `GOOGLE_CALENDAR_ID`, `BANCARD_PUBLIC_KEY`, `BANCARD_PRIVATE_KEY` están vacíos ahí.

#### Funcionalidades confirmadas ✅
- Auth JWT (cookie + Bearer), guard reutilizable.
- CRUD de pacientes, aprobación con email + token de pago de un solo uso.
- Recordatorios automáticos por cron con flag anti-duplicado.
- 4 emails transaccionales vía Resend.
- Disponibilidad/creación de eventos de Google Calendar con Meet.
- Generación de link de pago Bancard + webhook que activa al usuario.
- Schema Prisma coherente (User, Session, SessionSummary, Payment).
- Suite de tests unitarios completa y verde.

#### Funcionalidades con dudas ⚠️
- CMS con endpoints funcionales pero contenido vacío, sin forma de poblarlo (no hay endpoints de escritura ni CMS externo conectado).
- Sin `ValidationPipe` global ni `class-validator` en DTOs — los tipos TS no se aplican en runtime.
- Inconsistencia de despliegue: `Procfile` apunta a `node dist/main`, pero `package.json`/`railway.json` usan `node dist/src/main`.

#### Funcionalidades rotas o incompletas ❌
- `POST /calendar/create-event` sin guard de autenticación — cualquiera puede crear eventos reales y enviar invitaciones.
- `POST /payments/webhook` y `/payments/confirm` sin validación de firma — se puede forjar la confirmación de un pago.
- `createEvent()` sin manejo de credenciales faltantes (a diferencia de `getAvailability()`) — fallaría con 500 no controlado en el estado actual del `.env`.
- Integraciones OpenAI y Daily.co: solo variables de entorno, cero implementación.
- `test/app.e2e-spec.ts` desactualizado (fallaría si se ejecutara `test:e2e`).

---

# apps/e2e

**Stack:** `@playwright/test` (declarado `^1.44.0`, instalado 1.60.0), 1 proyecto Chromium, `webServer` auto-arranca `apps/web` en :3000.
**Estado:** ✅ Verificado con `playwright test --list` — **4 tests en 3 archivos, listan correctamente** (sintaxis válida).

#### Tests

| Archivo | Flujo testeado | Estado | Descripción |
|---|---|---|---|
| `auth.spec.ts` | Login paciente / guard de rutas | ✅ | 2 tests: login con credenciales hardcodeadas (`diego@diegoferreira.com`/`Admin.123`, dependen del seed) y redirect a `/login` sin sesión |
| `booking.spec.ts` | Agendar sesión | ⚠️ | 1 test muy laxo: llena el form solo si el input existe, única aserción real es que el `body` sea visible — no valida el flujo de negocio |
| `payment-flow.spec.ts` | Pago | ⚠️ | 1 test: solo verifica que un token inválido NO muestre el iframe de Bancard; no cubre el camino exitoso de pago |

#### Funcionalidades confirmadas / con dudas / rotas
✅ Config y estructura de proyecto válidas. ⚠️ Cobertura funcional débil (2 de 3 specs son casi smoke tests). ❌ Ninguno detectado a nivel de sintaxis/config.

---

# packages/emails

**Exporta** (`src/index.ts`): `SessionBookedEmail`, `ApprovalEmail`, `ReminderEmail`, `WelcomeAfterPaymentEmail`.

| Template | Evento que dispara el email |
|---|---|
| `ApprovalEmail` | Admin aprueba solicitud → link de pago (JWT de un uso, 48h) |
| `WelcomeAfterPaymentEmail` | Pago confirmado → bienvenida + link de agenda |
| `SessionBookedEmail` | Notifica al admin cuando un paciente agenda |
| `ReminderEmail` | Recordatorio 24h/1h antes con link de Meet |

**Estado build/typecheck:** ✅ Compila sin errores (verificado).
**Estado tests:** ✅ 1 test file, 3/3 tests pasan (verificado).

#### Funcionalidades confirmadas ✅
4 templates completos y consistentes con `@df/types`.

#### Con dudas ⚠️
No están conectados al `EmailService` real de `apps/api` (que reimplementa el HTML a mano) — paquete completo pero no integrado en producción.

---

# packages/types

Define enums (`Role`, `UserStatus`, `SessionType`, `AppStatus`, `PayStatus`) e interfaces (`Patient`, `Session`, `Payment`, `Plan`, `AvailabilitySlot`, `SessionSummary`) — modelo de dominio compartido entre `apps/api`, `apps/web` y `apps/admin`.

**Estado build/typecheck:** ❌ El script `"typecheck": "tsc --noEmit"` **falla** (exit 1) — no existe `tsconfig.json` en `packages/types/`, por lo que `tsc` no encuentra proyecto ni archivos de entrada y solo imprime la ayuda (verificado directamente).

---

# packages/ui

`src/index.ts` contiene únicamente `export {}` — **paquete vacío, sin componentes**, es un placeholder/scaffold.

**Estado build/typecheck:** ❌ No existe `tsconfig.json` ni script `typecheck` en `package.json` (verificado directamente) — no hay nada que compilar ni verificar.

---

## Resumen ejecutivo

El monorepo implementa un producto funcional de punta a punta para agendar y cobrar sesiones: el sitio público (`apps/web`) permite ver la oferta, agendar contra disponibilidad real de Google Calendar y pagar vía Bancard; el backend (`apps/api`) tiene autenticación, gestión de pacientes, recordatorios automáticos y emails transaccionales, todo con una suite de tests unitarios completa y en verde (25/25 en la API, 6/6 en web, 3/3 en emails) y typecheck limpio en los 4 workspaces con código real (web, admin, api, emails). Sin embargo, hay brechas importantes antes de producción: dos endpoints de pago (`webhook`/`confirm`) y uno de calendario (`create-event`) están sin protección/verificación adecuada, dos integraciones anunciadas en `.env.example` (OpenAI, Daily.co) no tienen ni una línea de código, el panel `apps/admin` no protege sus rutas ni tiene tests, y una funcionalidad clave del admin (aprobar pacientes) es inalcanzable desde la UI por un diálogo nunca implementado. El paquete `@df/ui` está vacío y `@df/types` no puede tipecheckear por falta de `tsconfig.json`, aunque ninguno de los dos afecta el funcionamiento actual de las apps que sí lo usan.

## Próximos pasos sugeridos

1. **Seguridad de pagos (prioridad alta):** agregar verificación de firma/autenticidad a `POST /payments/webhook` y `/payments/confirm`, y un `JwtGuard` a `POST /calendar/create-event` en `apps/api`.
2. **Completar el panel admin:** implementar el `AdmitDialog` faltante en `DashboardPacientes.tsx` (hoy el botón "Admitir paciente" no hace nada) y agregar `middleware.ts` para proteger `/dashboard` como ya existe en `apps/web`.
3. **Decidir el destino de las integraciones fantasma:** implementar o eliminar de `.env.example`/`package.json` las referencias a OpenAI (resumen IA) y Daily.co (videollamada), ya que hoy son solo variables sin código.
4. **Resolver la duplicación de emails:** conectar `apps/api`'s `EmailService` al paquete `@df/emails` (React Email) en vez de mantener HTML duplicado a mano, y limpiar los mocks vestigiales en `email.service.spec.ts`.
5. **Limpieza técnica:** agregar `tsconfig.json` a `packages/types` y `packages/ui` (o quitar sus scripts `typecheck` rotos), eliminar dependencias muertas (`@daily-co/daily-js`, `@tldraw/tldraw`, `@df/ui` en web/admin, `bull`/`@nestjs/bull` en api) y los componentes legacy no usados en `apps/web/src/app/components`, y corregir la inconsistencia de dominio `diegoferreira.org` vs `.com`.

---

*Archivos revisados: ~130 (código fuente, configuración y tests) a través de los 7 workspaces. Análisis realizado con verificación directa de `tsc --noEmit`, `vitest`/`jest` y `playwright test --list` en cada workspace (no solo lectura estática). No se modificó ningún archivo del proyecto durante el análisis.*
