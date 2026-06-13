export const metadata = {
  title: 'Blog — Komor-IA',
  description:
    "Actualités, guides et insights sur l'intelligence artificielle pour l'Afrique et les langues comoriennes.",
  openGraph: {
    title: 'Blog — Komor-IA',
    description: "Actualités, guides et insights sur l'IA pour l'Afrique.",
    url: 'https://www.komor-ia.com/blog',
    siteName: 'Komor-IA',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog — Komor-IA',
    description: "Actualités sur l'IA pour l'Afrique.",
    images: ['/og-image.png'],
  },
}

export default function BlogLayout({ children }) {
  return <>{children}</>
}
