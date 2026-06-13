import prisma from '@/lib/prisma'

export default async function sitemap() {
  const baseUrl = 'https://www.komor-ia.com'

  // Pages statiques
  const staticPages = [
    { url: baseUrl, lastModified: new Date(), priority: 1.0 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), priority: 0.9 },
    { url: `${baseUrl}/about`, lastModified: new Date(), priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), priority: 0.7 },
    { url: `${baseUrl}/docs`, lastModified: new Date(), priority: 0.8 },
    { url: `${baseUrl}/pricing`, lastModified: new Date(), priority: 0.8 },
    { url: `${baseUrl}/contribution`, lastModified: new Date(), priority: 0.9 },
    { url: `${baseUrl}/models`, lastModified: new Date(), priority: 0.8 },
  ]

  // Pages dynamiques (blogs publiés)
  try {
    const blogs = await prisma.blog.findMany({
      where: { status: 'published' },
      select: { slug: true, updatedAt: true },
      orderBy: { publishedAt: 'desc' },
    })

    const blogPages = blogs.map((blog) => ({
      url: `${baseUrl}/blog/${blog.slug}`,
      lastModified: blog.updatedAt,
      priority: 0.8,
    }))

    return [...staticPages, ...blogPages]
  } catch {
    return staticPages
  }
}
