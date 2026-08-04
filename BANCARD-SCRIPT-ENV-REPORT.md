# Reporte — Script de Bancard cargando el ambiente equivocado

**Fecha:** 2026-08-04

## Resumen ejecutivo

El diagnóstico del brief ("hardcodeado a producción") no es literalmente exacto — el código ya condicionaba la URL con `process.env.NODE_ENV === 'production'` — pero el síntoma reportado es real por un motivo más sutil: `next build` siempre corre en modo `production` (Next.js no distingue "staging" de "producción" a ese nivel), así que ese `if` era efectivamente `true` en **todos** los ambientes deployados, staging incluido. Además encontré que el problema afecta a **dos** componentes, no uno — el brief solo mencionaba `pago/page.tsx`, pero `BookPurchase.tsx` tenía el mismo patrón (aunque ese componente está confirmado sin uso). Reemplacé el `NODE_ENV` por la variable de entorno ya existente `NEXT_PUBLIC_BANCARD_BASE_URL` en vez de introducir una nueva `NEXT_PUBLIC_BANCARD_CHECKOUT_URL`, para no duplicar variables. **El fix de código no alcanza por sí solo** — Railway no tiene esa variable configurada para `@df/web`, así que falta un paso manual (ver abajo).

## Paso 1 — Dónde se carga el script (auditoría)

| Archivo | Línea | URL/lógica que usaba | ¿En uso? |
|---|---|---|---|
| `apps/web/src/app/pago/PagoClient.tsx` | 13-16 | `NODE_ENV === 'production' ? portless : :8888` | ✅ Sí — `/pago`, flujo de pago de sesión |
| `apps/web/src/components/BookPurchase.tsx` | 21-24 | Mismo patrón `NODE_ENV` | ❌ No — el propio archivo dice en su header: *"Este componente ya no se usa en /main... Se mantiene como referencia histórica"*, confirmado con `grep -r "BookPurchase"` (cero imports en todo `apps/web/src`) |
| `apps/web/src/components/libro/LibroCompra.tsx` | 25 | Ya usaba `process.env.NEXT_PUBLIC_BANCARD_BASE_URL ?? 'https://vpos.infonet.com.py'` | ✅ Sí — `/avanza`, ya estaba correcto (fix de una sesión anterior) |

Ninguno de los dos archivos afectados tenía la URL completa del script literalmente hardcodeada como string fijo — el problema era la lógica de selección de ambiente (`NODE_ENV`), no un string suelto.

## Paso 2 — Corrección aplicada

En vez de crear `NEXT_PUBLIC_BANCARD_CHECKOUT_URL` (nueva variable), reutilicé `NEXT_PUBLIC_BANCARD_BASE_URL`, que ya existe y ya la usa `LibroCompra.tsx` para el mismo propósito (distinguir ambiente de Bancard). Mismo patrón en los tres componentes ahora:

```ts
const bancardBase = process.env.NEXT_PUBLIC_BANCARD_BASE_URL ?? 'https://vpos.infonet.com.py'
```

- `apps/web/src/app/pago/PagoClient.tsx:13-16` → reemplazado el bloque `isProduction`/ternario por la línea de arriba, con comentario explicando por qué `NODE_ENV` no sirve para esto.
- `apps/web/src/components/BookPurchase.tsx:21-24` → mismo cambio, por consistencia (aunque sin impacto en producción/staging porque el componente no se renderiza en ningún lado).

**Antes** (`PagoClient.tsx:13-16`):
```ts
const isProduction = process.env.NODE_ENV === 'production'
const bancardBase  = isProduction
  ? 'https://vpos.infonet.com.py'
  : 'https://vpos.infonet.com.py:8888'
```

**Después:**
```ts
const bancardBase = process.env.NEXT_PUBLIC_BANCARD_BASE_URL ?? 'https://vpos.infonet.com.py'
```

No creé `apps/web/.env.production` ni edité `.env.local` con los valores de staging: Railway **no lee esos archivos** para sus deploys (son convenciones de Next.js para builds/dev locales) — inyecta sus propias variables por servicio y por ambiente vía su propio dashboard/CLI. Agregar esos archivos con el valor de staging habría sido cosmético y potencialmente confuso (sugiere que alcanza con tocar código, cuando el paso real es en Railway).

## Paso 3 — Verificación de consistencia (backend)

Consulté directamente Railway (`railway variables --service "@df/api" --environment staging`):

```
BANCARD_BASE_URL=https://vpos.infonet.com.py:8888
```

✅ El backend en staging **ya apunta correctamente a `:8888`** — no hay bug de backend apuntando a producción con credenciales de staging, como planteaba la hipótesis del brief. Ese punto se puede descartar.

También consulté `@df/web` en Railway (`railway variables --service "@df/web" --environment staging`) y **`NEXT_PUBLIC_BANCARD_BASE_URL` no está configurada en absoluto** — confirma la causa raíz: sin esa variable, el fallback (`?? 'https://vpos.infonet.com.py'`) usa la URL de producción incluso en staging.

### Nota sobre `LibroCompra.tsx` (no modificado, pero con la misma exposición)

`LibroCompra.tsx` ya usaba `NEXT_PUBLIC_BANCARD_BASE_URL` correctamente en el código, pero como esa variable **tampoco está seteada en Railway para `@df/web`**, hoy también está cayendo al fallback portless para el link de redirect a Bancard (no para el script JS, sino para la URL de `/vpos/single_buy?process_id=...`). En una sesión anterior confirmé que el flujo de `/avanza` devuelve 200 y que Bancard acepta la creación del `process_id`, pero no verifiqué específicamente si la página de pago hospedada por Bancard se sirve igual en el dominio portless que en `:8888` durante staging. Recomiendo re-verificar el redirect completo (no solo el status 200 de `/avanza`) una vez que la variable esté seteada en Railway, para confirmar que no había el mismo problema ahí de otra forma.

## Paso 4 — Resultado de tsc y build

| Chequeo | Resultado |
|---|---|
| `tsc --noEmit` (apps/web) | ✅ Sin errores |
| `next build` (apps/web) | ✅ Compila y genera las 17 rutas correctamente, incluyendo `/pago` y `/avanza` |
| `vitest run PagoClient.test.tsx` | ✅ 3/3 tests pasan (no dependían de `NODE_ENV`, mockean `next/script` directamente) |

## Variables de entorno a agregar manualmente en Railway

**Servicio `@df/web`, ambiente staging** (falta por completo — es el fix real, el código por sí solo no alcanza):
```
NEXT_PUBLIC_BANCARD_BASE_URL=https://vpos.infonet.com.py:8888
```

**Servicio `@df/web`, ambiente producción** (cuando se certifique):
```
NEXT_PUBLIC_BANCARD_BASE_URL=https://vpos.infonet.com.py
```

⚠️ Como `NEXT_PUBLIC_*` se inlinea en build time, agregar la variable no alcanza con un simple restart — hace falta un **rebuild** del servicio `@df/web` después de configurarla para que tome efecto.

## Archivos modificados

- `apps/web/src/app/pago/PagoClient.tsx` — reemplazado el heurístico `NODE_ENV` por `NEXT_PUBLIC_BANCARD_BASE_URL` (impacto real, componente en uso)
- `apps/web/src/components/BookPurchase.tsx` — mismo cambio por consistencia (componente confirmado sin uso, cero impacto real)
- `BANCARD-SCRIPT-ENV-REPORT.md` — este reporte (nuevo)

No se tocó `apps/api` ni `LibroCompra.tsx`. Sin commits.
