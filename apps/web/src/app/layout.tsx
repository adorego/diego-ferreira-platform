import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import TopBar from "@/components/nav/TopBar";
import type { Metadata } from "next";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Diego Ferreira | Psicólogo Deportivo & Alto Rendimiento Mental",
  description:
    "Ex atleta olímpico y psicólogo deportivo. En 6 semanas entrenamos tu mente para que rindas al nivel que ya tenés en el entrenamiento. Sesión inicial gratuita.",
  metadataBase: new URL("https://www.diegoferreira.com"),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "https://www.diegoferreira.com",
    siteName: "Diego Ferreira",
    title: "Diego Ferreira | Psicólogo Deportivo & Alto Rendimiento Mental",
    description:
      "Ex atleta olímpico. Entrenamiento mental para deportistas que quieren llegar lejos. Sesión inicial gratuita de 15-20 minutos.",
    locale: "es_AR",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Diego Ferreira — Psicólogo Deportivo & Alto Rendimiento Mental",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Diego Ferreira | Psicólogo Deportivo & Alto Rendimiento Mental",
    description:
      "Ex atleta olímpico. Entrenamiento mental para deportistas que quieren llegar lejos.",
    images: ["/og-image.jpg"],
  },
  keywords: [
    "psicólogo deportivo",
    "alto rendimiento mental",
    "entrenamiento mental",
    "psicología del deporte",
    "rendimiento deportivo",
    "atleta olímpico",
    "Diego Ferreira",
    "mentalidad ganadora",
    "coaching deportivo",
  ],
  authors: [{ name: "Diego Ferreira" }],
  creator: "Diego Ferreira",
  icons: {
    icon: [{ url: "/favicon.ico" }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={jakarta.className}>
        <TopBar />
        {children}
      </body>
    </html>
  );
}
