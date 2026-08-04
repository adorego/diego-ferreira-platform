# Reporte de Staging — Diego Ferreira Coaching Platform

**Fecha:** 2026-08-03
**Entorno:** Railway staging
**API:** https://dfapi-staging-fa68.up.railway.app
**Web:** https://www.diegoferreira.coach

## Resumen ejecutivo

De los 5 bugs reportados, 4 (BUG 1, 3, 4 y 5) ya estaban corregidos y desplegados en `main` (commit `833c969` y anteriores). El único cambio nuevo de esta sesión es **BUG 2** (moneda del libro hardcodeada en USD/12.99, que Bancard staging rechaza por no tener esa moneda habilitada) — corregido en `apps/api/src/payments/payments.service.ts`, con su test actualizado y `.env.example` documentado. **No se hizo commit ni push**: los cambios quedan en el working tree para revisión manual. Las pruebas de esta sección se corrieron contra el staging actual (pre-deploy del fix de BUG 2).

## 1. Bugs corregidos

| # | Bug | Archivo | Estado | Detalle |
|---|-----|---------|--------|---------|
| 1 | Redirect URL de Bancard (404) | `apps/web/src/components/libro/LibroCompra.tsx` | ✅ Ya corregido (commit `833c969`, en `origin/main`) | Usa `${bancardBase}/vpos/single_buy?process_id=${processId}` con `NEXT_PUBLIC_BANCARD_BASE_URL` configurable |
| 2 | Moneda hardcodeada USD/12.99 (Bancard staging solo tiene PYG) | `apps/api/src/payments/payments.service.ts` | ✅ Corregido esta sesión (sin commit, en working tree) | `this.cfg.get('BOOK_AMOUNT') ?? '95000'` / `this.cfg.get('BOOK_CURRENCY') ?? 'PYG'` |
| 3 | CORS no incluía todos los orígenes de producción | `apps/api/src/main.ts` | ✅ Ya corregido (commit `833c969` y `b6c4150`) | Incluye `FRONTEND_URL`, `WEB_URL`, `ADMIN_URL` + `diegoferreira.coach` / `www.diegoferreira.coach` hardcodeados, `.filter(Boolean)` |
| 4 | Panel admin sin protección de rutas | `apps/admin/src/middleware.ts` | ✅ Ya corregido (commit `833c969`) | Protege todo excepto `/login`, valida JWT con `jose` + `JWT_SECRET` compartido |
| 5 | Sesión expirada (401) no manejada en panel admin | `apps/admin/src/components/DashboardPacientes.tsx` | ✅ Ya corregido (commit `833c969`) | Redirige a `/login` en 401 vía `useRouter`; loguea otros errores sin crashear |

## 2. Tests ejecutados contra staging actual

| Test | Resultado | Detalle |
|------|-----------|---------|
| Health check (`GET /health`) | ✅ OK | `{"status":"ok","database":"connected","redis":"connected"}` |
| CORS preflight (`OPTIONS /payments/libro/initiate`, Origin `www.diegoferreira.coach`) | ✅ OK | `204`, headers `access-control-allow-origin/-credentials/-headers/-methods` correctos |
| Create-link sesión (`POST /payments/create-link`) | ⚠️ Falla esperada | `{"message":"Token requerido","error":"Unauthorized","statusCode":401}`. El script de prueba envía `{email, amount, currency, description}`, pero el endpoint real exige `{token}` (JWT firmado con `patientId`/`amount`/`currency`, verificado con `jwt.verify`). No es un bug de la app — es un mismatch entre el script de test y el contrato real del endpoint. |
| Create-link libro (`POST /payments/libro/initiate`) | ✅ OK | Devuelve `processId`/`shopProcessId` real de Bancard (ej. `717858115723112`) |
| Webhook sesión (`POST /payments/webhook`) | ⚠️ Sin cobertura real | Como el paso anterior falla con 401, no existe ningún `Payment` real que confirmar. Se probó igual con `shop_process_id` vacío → `{"status":"success"}`, lo cual solo ejercita la rama de guarda "webhook sin `shop_process_id`" (`payments.service.ts:143-146`), no el flujo de confirmación real. |
| Webhook libro (`POST /payments/webhook`) | ⚠️ Respuesta success, pero no verificable end-to-end | Se generó un `shopProcessId` real vía `libro/initiate` y se envió el webhook con ese ID → `{"status":"success"}`. Sin embargo, como `BANCARD_PRIVATE_KEY` está configurada en Railway staging (confirmado indirectamente porque Bancard acepta los `process_id` generados), el webhook manual no incluía un `token` MD5 válido — la verificación de firma (`payments.service.ts:150-170`) probablemente falla primero y devuelve `success` sin llegar a actualizar el `BookPurchase` a `CONFIRMED`. No tengo acceso a la base de datos de staging para confirmar si el registro quedó actualizado; **no se puede afirmar que el flujo completo de confirmación se ejecutó**, solo que el endpoint no crashea con datos válidos de forma. |

## 3. Estado de funcionalidades

| Funcionalidad | URL | Estado |
|---|---|---|
| Landing principal | `/` → redirige 307 a `/main` (200) | ✅ OK |
| Landing libro | `/avanza` | ✅ OK (200) |
| Formulario de agendamiento | `/agendar` | ⚠️ Responde 200, pero sin `GOOGLE_REFRESH_TOKEN`/`GOOGLE_CALENDAR_ID` configuradas la integración con Google Calendar no puede completarse |
| Pago sesión | `/pago` | ✅ Responde 200 (flujo de pago requiere JWT `token`, ver tests) |
| Pago libro | `/avanza` (sección de compra) | ✅ Funciona, pero en **PYG** en staging (Bancard staging no tiene USD habilitado) |
| Panel admin — login | `/login` | ⚠️ No verificado en vivo — no se proveyó URL de staging del panel admin en esta sesión |
| Panel admin — dashboard | `/dashboard` | ⚠️ No verificado en vivo — mismo motivo |
| Webhook Bancard | `POST /payments/webhook` | ✅ Responde sin errores (ver limitaciones de cobertura arriba) |

## 4. Variables de Railway pendientes de configurar

| Variable | Valor sugerido | Servicio | Motivo |
|---|---|---|---|
| `BOOK_AMOUNT` | `95000` | `@df/api` | Bugfix de esta sesión (BUG 2) — sin esta variable usa el fallback `95000` |
| `BOOK_CURRENCY` | `PYG` | `@df/api` | Bugfix de esta sesión (BUG 2) — Bancard staging solo tiene PYG habilitado |
| `NEXT_PUBLIC_BANCARD_BASE_URL` | `https://vpos.infonet.com.py` | `@df/web` | Requerido por el fix de BUG 1 (redirect URL) |
| `GOOGLE_REFRESH_TOKEN` | (obtener vía OAuth) | `@df/api` | Sin esto, `/agendar` no puede crear eventos en Google Calendar |
| `GOOGLE_CALENDAR_ID` | (ID del calendario de Diego) | `@df/api` | Idem — requerido junto con `GOOGLE_REFRESH_TOKEN` |

*(Documentación solamente — no se ejecutó ningún cambio en Railway.)*

## 5. Pendientes para producción

1. **Google Calendar**: completar la integración OAuth (`GOOGLE_REFRESH_TOKEN`/`GOOGLE_CALENDAR_ID`) para que `/agendar` cree eventos reales.
2. **USD en Bancard**: habilitar USD en la cuenta de producción de Bancard y cambiar `BOOK_CURRENCY` de vuelta a `USD` cuando corresponda.
3. **PDF del libro**: subir el archivo real (`downloadBook()` actualmente devuelve una URL fija `/libro-completo.pdf` sin verificar que exista).
4. **Diálogo "Admitir paciente"**: el componente `DashboardPacientes.tsx` abre `admitOpen`/`admitSession` pero el `AdmitDialog` en sí no está implementado (comentario `{/* AdmitDialog va acá */}`).
5. **Testimonios**: sección pendiente de contenido/implementación (no verificado en detalle en esta sesión — según indicación del usuario).
6. **Rotar credenciales de Google expuestas**: según indicación del usuario: hay credenciales de Google que quedaron expuestas y deben rotarse antes de producción. **No verificado independientemente en esta sesión** — se incluye porque el usuario lo señaló como pendiente conocido.

## 6. Próximos pasos recomendados (prioridad)

1. Revisar y pushear manualmente el fix de BUG 2 (`payments.service.ts`, `payments.service.spec.ts`, `.env.example`).
2. Configurar `BOOK_AMOUNT`/`BOOK_CURRENCY`/`NEXT_PUBLIC_BANCARD_BASE_URL` en Railway antes o junto con el deploy.
3. Verificar en la base de datos de staging (no accesible desde esta sesión) si el `BookPurchase` de la prueba de webhook quedó `CONFIRMED`, para confirmar que la verificación de firma MD5 funciona con la `BANCARD_PRIVATE_KEY` real.
4. Proveer URL de staging del panel admin para poder verificar `/login` y `/dashboard` en vivo.
5. Completar integración de Google Calendar.
6. Implementar el diálogo "Admitir paciente" pendiente.

## 7. Archivos modificados

- `apps/api/src/payments/payments.service.ts` — fix BUG 2 (moneda configurable vía `BOOK_AMOUNT`/`BOOK_CURRENCY`)
- `apps/api/src/payments/payments.service.spec.ts` — tests actualizados para el fix de BUG 2 (caso fallback + caso configurado)
- `.env.example` — documentadas las nuevas variables `BOOK_AMOUNT`/`BOOK_CURRENCY` (solo placeholders, sin valores reales)
- `STAGING-REPORT.md` — este reporte (nuevo)

**Sin commit ni push** — todo queda en el working tree para revisión manual del developer.
