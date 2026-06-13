import { Inter } from 'next/font/google'
import './globals.css'
import Providers from './provider'
import PublicNavbar from './components/public-navbar'
import Footer from './components/footer'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata = {
  title: {
    default: 'Komor-IA | Intelligence Artificielle Made in Comores',
    template: '%s | Komor-IA',
  },
  description:
    "Startup d'intelligence artificielle basée aux Comores. Nous développons des modèles d'IA de pointe adaptés au contexte africain : Press-AI, Wazir et bien d'autres.",
  keywords: [
    'Intelligence Artificielle',
    'IA',
    'Comores',
    'Afrique',
    'Machine Learning',
    'NLP',
    'Chatbot',
    'Press-AI',
    'Wazir',
    'Komor-IA',
    'AI startup',
    'African AI',
  ],
  authors: [{ name: 'Komor-IA Team' }],
  creator: 'Komor-IA',
  publisher: 'Komor-IA',

  // metadataBase: new URL(
  //   process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  // ),
  metadataBase: new URL(
    process.env.NODE_ENV === 'production'
      ? 'https://www.komor-ia.com'
      : 'http://localhost:3000',
  ),

  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://www.komor-ia.com',
    title: 'Komor-IA | Intelligence Artificielle Made in Comores',
    description:
      "Startup d'IA basée aux Comores, développant des solutions innovantes pour l'Afrique.",
    siteName: 'Komor-IA',
    images: [
      {
        // ✅ URL absolue
        url: 'https://www.komor-ia.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Komor-IA - Intelligence Artificielle Made in Comores',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Komor-IA | Intelligence Artificielle Made in Comores',
    description: "Des modèles d'IA adaptés au contexte africain",
    // ✅ URL absolue
    images: ['https://www.komor-ia.com/og-image.png'],
    creator: '@komoria',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Komor-IA | Intelligence Artificielle Made in Comores',
    description: "Des modèles d'IA adaptés au contexte africain",
    images: ['/og-image.png'],
    creator: '@komoria',
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  icons: {
    icon: '/logo3.svg',
    shortcut: '/logo3.svg',
    apple: '/apple-touch-icon.png',
  },

  manifest: '/site.webmanifest',

  verification: {
    google: 'google-site-verification-code',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${inter.className} antialiased bg-gray-50`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
// import { Inter } from 'next/font/google'
// import './globals.css'
// import Providers from './provider'

// const inter = Inter({
//   subsets: ['latin'],
//   display: 'swap',
//   variable: '--font-inter',
// })

// export const metadata = {
//   title: {
//     default: 'Komor-IA | Intelligence Artificielle Made in Comores',
//     template: '%s | Komor-IA',
//   },
//   description:
//     "Startup d'intelligence artificielle basée aux Comores. Nous développons des modèles d'IA de pointe adaptés au contexte africain : Press-AI, Wazir et bien d'autres.",
//   keywords: [
//     'Intelligence Artificielle',
//     'IA',
//     'Comores',
//     'Afrique',
//     'Machine Learning',
//     'NLP',
//     'Chatbot',
//     'Press-AI',
//     'Wazir',
//     'Komor-IA',
//     'AI startup',
//     'African AI',
//   ],
//   authors: [{ name: 'Komor-IA Team' }],
//   creator: 'Komor-IA',
//   publisher: 'Komor-IA',

//   metadataBase: new URL(
//     process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
//   ),

//   openGraph: {
//     type: 'website',
//     locale: 'fr_FR',
//     url: '/',
//     title: 'Komor-IA | Intelligence Artificielle Made in Comores',
//     description:
//       "Startup d'IA basée aux Comores, développant des solutions innovantes pour l'Afrique.",
//     siteName: 'Komor-IA',
//     images: [
//       {
//         url: '/og-image.png',
//         width: 1200,
//         height: 630,
//         alt: 'Komor-IA - Intelligence Artificielle Made in Comores',
//       },
//     ],
//   },

//   twitter: {
//     card: 'summary_large_image',
//     title: 'Komor-IA | Intelligence Artificielle Made in Comores',
//     description: "Des modèles d'IA adaptés au contexte africain",
//     images: ['/og-image.png'],
//     creator: '@komoria',
//   },

//   robots: {
//     index: true,
//     follow: true,
//     googleBot: {
//       index: true,
//       follow: true,
//       'max-video-preview': -1,
//       'max-image-preview': 'large',
//       'max-snippet': -1,
//     },
//   },

//   icons: {
//     icon: '/logo3.svg',
//     shortcut: '/logo3.svg',
//     apple: '/apple-touch-icon.png',
//   },

//   manifest: '/site.webmanifest',

//   verification: {
//     google: 'google-site-verification-code', // À remplacer
//   },
// }

// export default function RootLayout({ children }) {
//   return (
//     <html lang="fr" className={inter.variable}>
//       <head>
//         <link rel="preconnect" href="https://fonts.googleapis.com" />
//         <link
//           rel="preconnect"
//           href="https://fonts.gstatic.com"
//           crossOrigin="anonymous"
//         />
//       </head>
//       <body className={`${inter.className} antialiased bg-gray-50`}>
//         <Providers>{children}</Providers>
//       </body>
//     </html>
//   )
// }
