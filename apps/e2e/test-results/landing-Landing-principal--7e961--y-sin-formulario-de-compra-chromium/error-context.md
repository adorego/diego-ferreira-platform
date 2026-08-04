# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: landing.spec.ts >> Landing principal (/main) >> sección del libro tiene los botones correctos y sin formulario de compra
- Location: tests/landing.spec.ts:43:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('link', { name: 'Comprar el libro →' })
Expected: visible
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 30000ms
  - waiting for getByRole('link', { name: 'Comprar el libro →' })

```

```yaml
- banner:
  - link "Diego Ferreira":
    - /url: /main
    - img "Diego Ferreira"
  - link "Cómo funciona":
    - /url: /main#identificacion
  - link "El Método":
    - /url: /main#metodo
  - link "Para quién es":
    - /url: /main#para-quien
  - link "Libro":
    - /url: /main#libro
  - link "Precios":
    - /url: /main#precios
  - link "Agendá tu lugar hoy":
    - /url: /agendar
- text: Psicología Deportiva · Alto Rendimiento Mental
- heading "Querés lograr tus sueños deportivos o los sueños deportivos de tu hijo/a" [level=1]
- paragraph:
  - text: Soy Diego Ferreira — ex atleta olímpico y psicólogo deportivo. En
  - strong: 6 semanas
  - text: entrenamos tu mente para que rindas al nivel que ya tenés en el entrenamiento.
- link "Agendá tu sesión gratuita (15/20 min)":
  - /url: /agendar
- link "Comenzá hoy":
  - /url: /agendar
- button "Activar sonido"
- slider "Volumen": "0"
- text: ¿Te identificás?
- heading "Si sos deportista, tenés talento y no estás logrando tus objetivos:" [level=2]
- paragraph: "01"
- paragraph: Entrenás duro pero cuando llega la competencia te bloqueás o rendís por debajo de tu nivel.
- paragraph: "02"
- paragraph: Tenés el físico y la técnica, pero te falta algo que no podés identificar.
- paragraph: "03"
- paragraph: La presión, el miedo a fallar o las expectativas te paralizan en los momentos clave.
- paragraph: "04"
- paragraph: Después de un error o una derrota tardás demasiado en recuperarte.
- paragraph: "05"
- paragraph: Sentís que tu rendimiento en competencia no refleja lo que realmente podés hacer.
- emphasis: Es mental. Y se entrena.
- link "Quiero hablar esto con Diego":
  - /url: /agendar
- img "Diego Ferreira — Psicólogo Deportivo"
- text: 🏅 EX ATLETA OLÍMPICO Quién es Diego
- heading "Un deportista que entendió lo que nadie le enseñó" [level=2]
- paragraph: "Compití al más alto nivel. Sé lo que es entrenar años para llegar a un momento clave y que la mente falle. Por eso estudié psicología deportiva: para entender y resolver lo que el entrenamiento físico no puede."
- paragraph: "Hoy trabajo con deportistas que tienen el talento y la dedicación, pero necesitan la herramienta que les falta: entrenar la mente con la misma seriedad que el cuerpo."
- emphasis: "\"El rendimiento no es solo físico. El 80% de lo que te separa del resultado que querés está en cómo entrenás y gestionás tu mente.\""
- text: Ex Atleta Olímpico Psicólogo Clínico y Deportivo Formado en Argentina y el exterior +10 años de experiencia Trabajo con deportistas de elite Metodología de alto rendimiento
- link "Agendar videollamada 1:1":
  - /url: /agendar
- text: La promesa
- heading "En 6 semanas entrenamos tu mente para que rindas al nivel que ya tenés en el entrenamiento" [level=2]
- paragraph: No vas a "aprender a pensar positivo". Vas a desarrollar habilidades mentales concretas que se reflejan directamente en tu rendimiento deportivo.
- paragraph: ❌
- paragraph: No es motivación que dura 2 días
- paragraph: ❌
- paragraph: No es terapia ni psicoanálisis
- paragraph: ✅
- paragraph: Es entrenamiento mental de alto rendimiento, medible y orientado a resultados deportivos
- link "Reservar mi lugar en el calendario":
  - /url: /agendar
- text: Resultados
- heading "Qué cambia cuando entrenás tu mente" [level=2]
- paragraph: 🎯
- paragraph: Confianza real
- paragraph: No depende del resultado del día anterior. Construís una confianza basada en preparación y procesos.
- paragraph: 🧘
- paragraph: Estabilidad emocional
- paragraph: Gestionás la presión, el miedo y la ansiedad sin que afecten tu rendimiento en competencia.
- paragraph: 🔍
- paragraph: Foco absoluto
- paragraph: Aprendés a concentrarte en lo que controlás y a soltar lo que no. Presencia plena en el momento.
- paragraph: 💪
- paragraph: Disciplina sostenida
- paragraph: Desarrollás la fortaleza mental para mantener el esfuerzo incluso cuando no tenés motivación.
- paragraph: ⚡
- paragraph: Claridad de decisión
- paragraph: En los momentos más exigentes, tu mente piensa con claridad en lugar de bloquearse.
- link "Quiero este resultado →":
  - /url: /agendar
- text: El programa
- heading "El método en 5 pilares" [level=2]
- paragraph: Un programa estructurado de 6 semanas, diseñado con la misma rigurosidad que un plan de entrenamiento físico de elite.
- paragraph: "01"
- paragraph: Diagnóstico mental
- paragraph: Identificamos exactamente qué patrones mentales están afectando tu rendimiento. Sin suposiciones, con datos y herramientas específicas.
- paragraph: "02"
- paragraph: Entrenamiento de habilidades
- paragraph: "Desarrollamos las habilidades mentales que necesitás: foco, confianza, gestión de presión, resiliencia. Técnicas probadas en el deporte de alto rendimiento."
- paragraph: "03"
- paragraph: Integración en el entrenamiento
- paragraph: Las herramientas mentales se integran directamente en tu práctica diaria. No es teoría separada del deporte, es parte del mismo proceso.
- paragraph: "04"
- paragraph: Preparación competitiva
- paragraph: "Trabajamos específicamente para los momentos de competencia: rutinas pre-competitivas, gestión de nervios, recuperación ante errores."
- paragraph: "05"
- paragraph: Seguimiento y ajuste
- paragraph: Evaluamos el progreso semana a semana y ajustamos el programa según tu evolución y los desafíos que van apareciendo.
- link "Hablar con Diego sobre el programa":
  - /url: /agendar
- text: Para quién es
- heading "Este programa es para:" [level=2]
- paragraph: 🏃
- paragraph: Deportistas
- paragraph: Que tienen el talento y la dedicación pero su mente no acompaña en la competencia.
- paragraph: 🎓
- paragraph: Atletas que buscan becas
- paragraph: Que necesitan rendir al máximo en pruebas de selección o torneos clave.
- paragraph: 📉
- paragraph: Deportistas estancados
- paragraph: Que llevan tiempo sin mejorar y sienten que el problema no es físico.
- paragraph: 👨‍👩‍👧
- paragraph: Padres de atletas
- paragraph: Que quieren darle a su hijo/a la herramienta mental que marca la diferencia.
- link "Agendar entrevista privada":
  - /url: /agendar
- heading "Tu hijo no necesita entrenar más. Necesita pensar mejor cuando compite." [level=2]
- paragraph: El esfuerzo ya está. La disciplina ya está. Lo que le falta es aprender a gestionar la presión, la confianza y el foco en el momento que más importa.
- link "Hablar con Diego →":
  - /url: /agendar
- paragraph: "\"El talento te lleva hasta cierto punto.\""
- paragraph: "\"La mente es lo que te permite llegar lejos.\""
- paragraph: "\"Y eso, se entrena.\""
- heading "¿Listo para entrenar lo que realmente importa?" [level=2]
- link "Agendar entrevista 1:1 con Diego Ferreira":
  - /url: /agendar
- paragraph: Entrevista privada · 15/20 minutos · Sin compromiso
- img "Tapa del libro — Despertá y avanzá, ¡Carajo!"
- text: El libro
- heading "Despertá y avanzá, ¡Carajo!" [level=2]
- paragraph: Por Diego Ferreira
- paragraph: "Este no es un libro escrito desde la teoría ni desde frases motivacionales recicladas. Es la historia real, cruda y comprobable de Diego Ferreira: un chico que creció sintiéndose inútil, encontró en el deporte una forma de reconstruirse, llegó a los Juegos Olímpicos, cayó, se reinventó, enfrentó depresión, ataques de pánico, quiebra, miedo escénico y volvió a levantarse. Un relato directo, sin maquillaje y sin anestesia, sobre identidad, disciplina, dolor, negocios, familia, salud mental y alto rendimiento aplicado a la vida real."
- paragraph: Capítulos
- list:
  - listitem: No nací fuerte
  - listitem: El chico que se sentía inútil
  - listitem: Tres palabras que destruyeron mi futuro
  - listitem: Salí último. Y ese fue el mejor día de mi vida
  - listitem: La frase que repetí miles de veces hasta hacerla realidad
  - listitem: Entrenamientos, hielo, vómitos y sacrificios
  - listitem: El hombre que vio algo en mí cuando nadie más lo veía
  - listitem: El día que demostré que no estaba loco
  - listitem: Los sueños grandes cobran caro
  - listitem: Lo mejor estaba por venir
  - listitem: El atleta que también quería hacer negocios
  - listitem: Cuando la mente se me fue a la mierda
  - listitem: El día que tuve que decirle a mi hija que no podía volver
  - listitem: Me daba pánico hablar. Ahora quiero llenar auditorios
  - listitem: Despertá. Avanzá. Carajo.
- link "Leer los primeros capítulos gratis":
  - /url: /preview_libro_diego.pdf
- paragraph: Capítulos 1 al 3 — Sin registro requerido
- link "Quiero mi copia":
  - /url: "#libro-comprar"
- paragraph: Edición digital
- paragraph: Gs. 150.000
- paragraph: PYG
- textbox "Tu email"
- button "Comprar ahora"
- text: Inversión
- heading "Elegí el plan que se adapta a tu situación" [level=2]
- paragraph: Todos los planes incluyen una sesión de diagnóstico inicial gratuita.
- paragraph: Básico
- paragraph: $1,600
- paragraph: USD
- img
- paragraph: 4 sesiones vía Google Meet (50-60 min)
- img
- paragraph: Una sesión por semana
- img
- paragraph: Tareas escritas diseñadas personalmente
- img
- paragraph: Tareas de acción en la vida real
- img
- paragraph: Visualización y mindfulness
- img
- paragraph: Seguimiento de objetivo estructurado
- img
- paragraph: Trabajo sobre carácter y fortaleza mental
- img
- paragraph: Mensajes diarios de seguimiento
- img
- paragraph: Videos personalizados
- img
- paragraph: Disponibilidad 24hs
- img
- paragraph: Seguimiento post-programa
- link "Elegir este plan →":
  - /url: /agendar?plan=basico
- text: ⭐ Más elegido
- paragraph: Estándar
- paragraph: $1,800
- paragraph: USD
- img
- paragraph: Todo lo del plan Básico
- img
- paragraph: Mensajes diarios de seguimiento y motivación
- img
- paragraph: Videos personalizados 2-3 veces por semana
- img
- paragraph: Elaboración y análisis de agenda diaria
- img
- paragraph: Disponibilidad 24hs para preguntas
- img
- paragraph: Trabajo profundo sobre carácter y fortaleza
- img
- paragraph: Interferencias, obstáculos y competencia
- img
- paragraph: Sesión con padres
- img
- paragraph: Seguimiento post-programa
- img
- paragraph: Videos diarios
- img
- paragraph: WhatsApp ilimitado
- link "Quiero este plan →":
  - /url: /agendar?plan=estandar
- paragraph: Premium
- paragraph: $2,000
- paragraph: USD
- img
- paragraph: Todo lo del plan Básico + Estándar
- img
- paragraph: 5 sesiones + 1 sesión con padres
- img
- paragraph: Seguimiento 3 meses post-programa
- img
- paragraph: Videos diarios de deportistas exitosos
- img
- paragraph: Películas y libros con análisis
- img
- paragraph: WhatsApp ilimitado cliente y padres
- img
- paragraph: Ajuste continuo del programa
- img
- paragraph: Disponibilidad 24hs
- img
- paragraph: Agenda diaria + análisis semanal
- img
- paragraph: Mensajes y videos de motivación diarios
- img
- paragraph: Sesión de cierre + plan de continuidad
- link "Elegir este plan →":
  - /url: /agendar?plan=premium
- paragraph:
  - text: ¿No sabés cuál elegir?
  - link "Agendá una entrevista gratuita":
    - /url: /agendar
  - text: y lo resolvemos juntos.
- contentinfo:
  - paragraph: DIEGO FERREIRA
  - paragraph: Psicólogo Clínico & Deportivo
  - paragraph: Ex atleta olímpico. Entrenamiento mental para deportistas que quieren rendir al máximo nivel cuando más importa.
  - link "Instagram":
    - /url: https://instagram.com
    - img
  - link "LinkedIn":
    - /url: https://linkedin.com
    - img
  - link "YouTube":
    - /url: https://youtube.com
    - img
  - paragraph: Navegación
  - link "Cómo funciona":
    - /url: /main#identificacion
  - link "El método":
    - /url: /main#metodo
  - link "Para quién es":
    - /url: /main#para-quien
  - link "Resultados":
    - /url: /main#cambios
  - link "El libro":
    - /url: /main#libro
  - link "Agendar":
    - /url: /agendar
  - paragraph: ¿Listo para empezar?
  - paragraph: Agendá una entrevista gratuita de 15-20 minutos y evaluamos juntos si el programa es para vos.
  - link "Agendar ahora →":
    - /url: /agendar
  - paragraph: © 2025 Diego Ferreira. Todos los derechos reservados.
  - link "Política de privacidad":
    - /url: /privacidad
  - link "Términos y condiciones":
    - /url: /terminos
- alert
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | test.describe('Landing principal (/main)', () => {
  4  |   test('landing /main carga correctamente', async ({ page }) => {
  5  |     await page.goto('/main')
  6  | 
  7  |     // Hero
  8  |     await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  9  | 
  10 |     // TopBar: 5 links de navegación (Cómo funciona, El Método, Para quién es, Libro, Precios)
  11 |     const nav = page.locator('header')
  12 |     await expect(nav.getByRole('link', { name: 'Cómo funciona' })).toBeVisible()
  13 |     await expect(nav.getByRole('link', { name: 'El Método' })).toBeVisible()
  14 |     await expect(nav.getByRole('link', { name: 'Para quién es' })).toBeVisible()
  15 |     await expect(nav.getByRole('link', { name: 'Libro' })).toBeVisible()
  16 |     await expect(nav.getByRole('link', { name: 'Precios' })).toBeVisible()
  17 | 
  18 |     // CTA
  19 |     await expect(nav.getByRole('link', { name: 'Agendá tu lugar hoy' })).toBeVisible()
  20 |   })
  21 | 
  22 |   test('navegación por anchors funciona', async ({ page }) => {
  23 |     await page.goto('/main')
  24 |     const nav = page.locator('header')
  25 | 
  26 |     await nav.getByRole('link', { name: 'Cómo funciona' }).click()
  27 |     await expect(page).toHaveURL(/#identificacion/)
  28 |     await expect(page.locator('#identificacion')).toBeInViewport()
  29 | 
  30 |     await nav.getByRole('link', { name: 'El Método' }).click()
  31 |     await expect(page).toHaveURL(/#metodo/)
  32 |     await expect(page.locator('#metodo')).toBeInViewport()
  33 | 
  34 |     await nav.getByRole('link', { name: 'Precios' }).click()
  35 |     await expect(page).toHaveURL(/#precios/)
  36 |     await expect(page.locator('#precios')).toBeInViewport()
  37 | 
  38 |     await nav.getByRole('link', { name: 'Libro' }).click()
  39 |     await expect(page).toHaveURL(/#libro/)
  40 |     await expect(page.locator('#libro')).toBeInViewport()
  41 |   })
  42 | 
  43 |   test('sección del libro tiene los botones correctos y sin formulario de compra', async ({ page }) => {
  44 |     await page.goto('/main#libro')
  45 | 
  46 |     const comprarBtn = page.getByRole('link', { name: 'Comprar el libro →' })
> 47 |     await expect(comprarBtn).toBeVisible()
     |                              ^ Error: expect(locator).toBeVisible() failed
  48 |     await expect(comprarBtn).toHaveAttribute('href', '/avanza#comprar')
  49 | 
  50 |     const verBtn = page.getByRole('link', { name: 'Ver el libro' })
  51 |     await expect(verBtn).toBeVisible()
  52 |     await expect(verBtn).toHaveAttribute('href', '/avanza')
  53 | 
  54 |     // Sin formulario de compra directa en /main (se movió a /avanza)
  55 |     await expect(page.locator('#libro input[type="email"]')).toHaveCount(0)
  56 |     await expect(page.getByRole('button', { name: /comprar ahora/i })).toHaveCount(0)
  57 |   })
  58 | 
  59 |   test('página /avanza carga correctamente', async ({ page }) => {
  60 |     await page.goto('/avanza')
  61 | 
  62 |     await expect(page.getByText('USD 12.99').first()).toBeVisible()
  63 |     await expect(page.locator('#comprar')).toBeVisible()
  64 |     await expect(page.locator('#comprar input[type="email"]')).toBeVisible()
  65 |     await expect(page.locator('#comprar').getByPlaceholder('Nombre completo')).toBeVisible()
  66 |   })
  67 | })
  68 | 
```