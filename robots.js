export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/api/', '/linguiste/'],
      },
    ],
    sitemap: 'https://www.komor-ia.com/sitemap.xml',
  }
}
