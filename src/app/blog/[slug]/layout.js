import prisma from '@/lib/prisma'

export async function generateMetadata({ params }) {
  const { slug } = await params

  try {
    const blog = await prisma.blog.findUnique({
      where: { slug, status: 'published' },
      select: {
        title: true,
        excerpt: true,
        coverImage: true,
        category: true,
        publishedAt: true,
        author: { select: { name: true } },
      },
    })

    if (!blog) {
      return {
        title: 'Article introuvable — Komor-IA',
      }
    }

    const description = blog.excerpt || `${blog.title} — Komor-IA`
    const image = blog.coverImage || '/og-image.png'
    const url = `https://www.komor-ia.com/blog/${slug}`

    return {
      title: `${blog.title} — Komor-IA`,
      description,
      authors: [{ name: blog.author?.name || 'Komor-IA' }],
      keywords: ['Komor-IA', 'IA', 'Comores', 'Afrique', blog.category],

      openGraph: {
        title: blog.title,
        description,
        url,
        siteName: 'Komor-IA',
        images: [
          {
            url: image,
            width: 1200,
            height: 630,
            alt: blog.title,
          },
        ],
        locale: 'fr_FR',
        type: 'article',
        publishedTime: blog.publishedAt?.toISOString(),
        authors: [blog.author?.name || 'Komor-IA'],
        section: blog.category,
      },

      twitter: {
        card: 'summary_large_image',
        title: blog.title,
        description,
        images: [image],
        creator: '@komoria',
      },

      alternates: {
        canonical: url,
      },
    }
  } catch {
    return {
      title: 'Blog — Komor-IA',
    }
  }
}

export default function BlogPostLayout({ children }) {
  return <>{children}</>
}
