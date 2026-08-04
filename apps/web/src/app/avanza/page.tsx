import LibroHero from '@/components/libro/LibroHero'
import LibroDescripcion from '@/components/libro/LibroDescripcion'
import LibroCapitulos from '@/components/libro/LibroCapitulos'
// LibroTestimonios removido temporalmente — agregar cuando haya testimonios reales
// import LibroTestimonios from "@/components/libro/LibroTestimonios";
import LibroCompra from '@/components/libro/LibroCompra'

export default function AvanzaPage() {
  return (
    <>
      <LibroHero />
      <LibroDescripcion />
      <LibroCapitulos />
      <LibroCompra />
    </>
  )
}
