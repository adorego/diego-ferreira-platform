// Contenido y configuración del libro — centralizado para facilitar cambios futuros.

export const BOOK_TITLE = 'Despertá y avanzá, ¡Carajo!'
export const BOOK_AUTHOR = 'Diego Ferreira'

export const BOOK_DESCRIPTION =
  'Este no es un libro escrito desde la teoría ni desde frases motivacionales ' +
  'recicladas. Es la historia real, cruda y comprobable de Diego Ferreira: un chico ' +
  'que creció sintiéndose inútil, encontró en el deporte una forma de reconstruirse, ' +
  'llegó a los Juegos Olímpicos, cayó, se reinventó, enfrentó depresión, ataques de ' +
  'pánico, quiebra, miedo escénico y volvió a levantarse. Un relato directo, sin ' +
  'maquillaje y sin anestesia, sobre identidad, disciplina, dolor, negocios, familia, ' +
  'salud mental y alto rendimiento aplicado a la vida real.'

export const BOOK_CHAPTERS: string[] = [
  'No nací fuerte',
  'El chico que se sentía inútil',
  'Tres palabras que destruyeron mi futuro',
  'Salí último. Y ese fue el mejor día de mi vida',
  'La frase que repetí miles de veces hasta hacerla realidad',
  'Entrenamientos, hielo, vómitos y sacrificios',
  'El hombre que vio algo en mí cuando nadie más lo veía',
  'El día que demostré que no estaba loco',
  'Los sueños grandes cobran caro',
  'Lo mejor estaba por venir',
  'El atleta que también quería hacer negocios',
  'Cuando la mente se me fue a la mierda',
  'El día que tuve que decirle a mi hija que no podía volver',
  'Me daba pánico hablar. Ahora quiero llenar auditorios',
  'Despertá. Avanzá. Carajo.',
]

export const BOOK_COVER_IMAGE = '/images/tapa.jpeg'

// TODO(Diego): confirmar precio final de venta. Placeholder mientras tanto.
export const BOOK_PRICE = {
  amount: 150000,
  currency: 'PYG',
  display: 'Gs. 150.000',
}

// TODO(Diego): subir el PDF real con los capítulos 1 al 3 a esta ruta
// (apps/web/public/preview_libro_diego.pdf) antes de publicar la sección.
export const BOOK_PREVIEW_PDF_URL = '/preview_libro_diego.pdf'
