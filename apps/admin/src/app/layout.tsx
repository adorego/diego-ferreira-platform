import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Diego Ferreira — Admin',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
