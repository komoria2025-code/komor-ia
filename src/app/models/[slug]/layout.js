// src/app/models/[slug]/layout.js
import prisma from '@/lib/prisma'

export async function generateMetadata({ params }) {
  const { slug } = await params

  try {
    // ✅ Prisma directement — pas de fetch interne
    const model = await prisma.modele.findUnique({
      where: { slug },
      select: {
        name:        true,
        description: true,
        domaine:     true,
        version:     true,
      },
    })

    if (!model) {
      return { title: 'Modèle non trouvé — Komor-IA' }
    }

    return {
      title:       `${model.name} — Komor-IA`,
      description: model.description?.slice(0, 160) || `Modèle ${model.domaine} développé par Komor-IA`,
      openGraph: {
        title:       `${model.name} | Komor-IA`,
        description: model.description?.slice(0, 160),
        url:         `https://www.komor-ia.com/models/${slug}`,
        type:        'website',
        images: [{
          url:    'https://www.komor-ia.com/og-image.png',
          width:  1200,
          height: 630,
          alt:    `${model.name} — Komor-IA`,
        }],
      },
      twitter: {
        card:        'summary_large_image',
        title:       `${model.name} | Komor-IA`,
        description: model.description?.slice(0, 160),
        images:      ['https://www.komor-ia.com/og-image.png'],
        creator:     '@komoria',
      },
      alternates: {
        canonical: `https://www.komor-ia.com/models/${slug}`,
      },
    }
  } catch (e) {
    console.error('generateMetadata error:', e)
    return { title: 'Modèle IA — Komor-IA' }
  }
}

export default function ModelLayout({ children }) {
  return children
}