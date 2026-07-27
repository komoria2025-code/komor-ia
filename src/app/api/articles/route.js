import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id ? parseInt(session.user.id) : null

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const contentType = searchParams.get('contentType') || 'article' // ✅ NOUVEAU
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    const where = {
      isPublic: true,
      contentType, // ✅ NOUVEAU
      ...(status && status !== 'all' && { status }),
      ...(category && category !== 'all' && { category }),
    }

    // Requête 1 : articles que l'user a commencé (in_progress ou completed)
    const inProgressArticles = userId
      ? await prisma.article.findMany({
          where: {
            ...where,
            translations: {
              some: {
                userId,
                status: { in: ['in_progress', 'completed'] },
              },
            },
          },
          include: {
            _count: { select: { translations: true } },
            translations: {
              where: { userId, status: { in: ['in_progress', 'completed'] } },
              select: {
                id: true,
                progress: true,
                status: true,
                updatedAt: true,
                dialecte: true,
              },
            },
          },
          orderBy: { translations: { _count: 'desc' } },
        })
      : []

    // Trier par updatedAt décroissant
    inProgressArticles.sort((a, b) => {
      const dateA = new Date(a.translations?.[0]?.updatedAt || 0)
      const dateB = new Date(b.translations?.[0]?.updatedAt || 0)
      return dateB - dateA
    })

    const inProgressIds = inProgressArticles.map((a) => a.id)

    // Requête 2 : tous les autres articles
    const [otherArticles, total] = await Promise.all([
      prisma.article.findMany({
        where: {
          ...where,
          id: inProgressIds.length > 0 ? { notIn: inProgressIds } : undefined,
        },
        include: {
          _count: { select: { translations: true } },
          ...(userId && {
            translations: {
              where: { userId },
              select: {
                id: true,
                progress: true,
                status: true,
                updatedAt: true,
                dialecte: true,
              },
            },
          }),
        },
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
        take: limit,
        skip: offset,
      }),
      prisma.article.count({ where }),
    ])

    const articles = [...inProgressArticles, ...otherArticles]

    return NextResponse.json({
      articles,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
      inProgressCount: inProgressArticles.length,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}

/**
 * POST /api/articles — Créer un article (admin uniquement)
 */
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Non authentifié' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
    })
    if (user.role !== 'admin') {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 403 })
    }

    const body = await req.json()
    const {
      title,
      originalText,
      originalLang = 'fr',
      targetLang = 'zdj',
      category = 'autre',
      difficulty = 1,
      contentType = 'article', // ✅ NOUVEAU
      source,
      author,
      tags,
      priority = 0,
    } = body

    if (!title || !originalText) {
      return NextResponse.json(
        { message: 'Titre et texte requis' },
        { status: 400 },
      )
    }

    // Slug avec suffixe aléatoire pour éviter les doublons
    const base = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60)
    const slug = `${base}-${Math.random().toString(36).slice(2, 6)}`

    const existing = await prisma.article.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json(
        { message: 'Un article avec ce titre existe déjà' },
        { status: 400 },
      )
    }

    const words = originalText.trim().split(/\s+/).length
    const article = await prisma.article.create({
      data: {
        title,
        slug,
        originalText,
        originalLang,
        targetLang,
        category,
        contentType, // ✅ NOUVEAU
        status: 'pending',
        difficulty: Math.min(Math.max(difficulty, 1), 5),
        estimatedWords: words,
        source,
        author,
        tags: tags ? JSON.stringify(tags) : null,
        priority: Math.min(Math.max(priority, 0), 10),
        isPublic: true,
      },
    })

    return NextResponse.json(
      { message: 'Article créé avec succès', article },
      { status: 201 },
    )
  } catch (error) {
    console.error("Erreur lors de la création de l'article:", error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}
// import { NextResponse } from 'next/server'
// import { getServerSession } from 'next-auth'
// import { authOptions } from '@/lib/auth'
// import prisma from '@/lib/prisma'

// // export async function GET(req) {
// //   try {
// //     const { searchParams } = new URL(req.url)

// //     const status = searchParams.get('status')
// //     const category = searchParams.get('category')

// //     const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
// //     const offset = parseInt(searchParams.get('offset') || '0')

// //     const where = {
// //       isPublic: true,
// //       ...(status && status !== 'all' && { status }),
// //       ...(category && category !== 'all' && { category }),
// //     }

// //     const [articles, total] = await Promise.all([
// //       prisma.article.findMany({
// //         where,
// //         include: {
// //           _count: {
// //             select: { translations: true },
// //           },
// //         },
// //         orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
// //         take: limit,
// //         skip: offset,
// //       }),
// //       prisma.article.count({ where }),
// //     ])

// //     return NextResponse.json({
// //       articles,
// //       total,
// //       limit,
// //       offset,
// //       hasMore: offset + limit < total,
// //     })
// //   } catch (error) {
// //     console.error(error)
// //     return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
// //   }
// // }
// export async function GET(req) {
//   try {
//     const session = await getServerSession(authOptions)
//     const userId = session?.user?.id ? parseInt(session.user.id) : null

//     const { searchParams } = new URL(req.url)
//     const status = searchParams.get('status')
//     const category = searchParams.get('category')
//     const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
//     const offset = parseInt(searchParams.get('offset') || '0')

//     const where = {
//       isPublic: true,
//       ...(status && status !== 'all' && { status }),
//       ...(category && category !== 'all' && { category }),
//     }

//     // ✅ Requête 1 : articles que l'user a commencé (in_progress)
//     // triés par updatedAt de la traduction — le plus récent en premier
//     const inProgressArticles = userId
//       ? await prisma.article.findMany({
//           where: {
//             ...where,
//             translations: {
//               some: {
//                 userId,
//                 // status: 'in_progress',
//                 status: { in: ['in_progress', 'completed'] },
//               },
//             },
//           },
//           include: {
//             _count: { select: { translations: true } },
//             translations: {
//               where: { userId, status: 'in_progress' },
//               select: {
//                 id: true,
//                 progress: true,
//                 status: true,
//                 updatedAt: true,
//                 dialecte: true,
//               },
//             },
//           },
//           // ✅ Tri par updatedAt de la traduction directement
//           orderBy: { translations: { _count: 'desc' } }, // trick pour avoir les résultats
//         })
//       : []

//     // ✅ Trier les in_progress par updatedAt de la traduction (le plus récent en premier)
//     inProgressArticles.sort((a, b) => {
//       const dateA = new Date(a.translations?.[0]?.updatedAt || 0)
//       const dateB = new Date(b.translations?.[0]?.updatedAt || 0)
//       return dateB - dateA // décroissant
//     })

//     // IDs déjà dans inProgress pour les exclure de la requête principale
//     const inProgressIds = inProgressArticles.map((a) => a.id)

//     // ✅ Requête 2 : tous les autres articles (hors in_progress)
//     const [otherArticles, total] = await Promise.all([
//       prisma.article.findMany({
//         where: {
//           ...where,
//           // Exclure les articles déjà en cours
//           id: inProgressIds.length > 0 ? { notIn: inProgressIds } : undefined,
//         },
//         include: {
//           _count: { select: { translations: true } },
//           ...(userId && {
//             translations: {
//               where: { userId },
//               select: {
//                 id: true,
//                 progress: true,
//                 status: true,
//                 updatedAt: true,
//                 dialecte: true,
//               },
//             },
//           }),
//         },
//         orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
//         take: limit,
//         skip: offset,
//       }),
//       prisma.article.count({ where }),
//     ])

//     // ✅ Combiner : in_progress en premier, puis les autres
//     const articles = [...inProgressArticles, ...otherArticles]

//     return NextResponse.json({
//       articles,
//       total,
//       limit,
//       offset,
//       hasMore: offset + limit < total,
//       inProgressCount: inProgressArticles.length, // bonus pour le front
//     })
//   } catch (error) {
//     console.error(error)
//     return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
//   }
// }
// /**
//  * POST /api/articles
//  * Créer un nouvel article (admin uniquement)
//  */
// export async function POST(req) {
//   try {
//     const session = await getServerSession(authOptions)

//     if (!session?.user?.id) {
//       return NextResponse.json({ message: 'Non authentifié' }, { status: 401 })
//     }

//     // Vérifier que l'utilisateur est admin
//     const user = await prisma.user.findUnique({
//       where: { id: parseInt(session.user.id) },
//     })

//     if (user.role !== 'admin') {
//       return NextResponse.json({ message: 'Non autorisé' }, { status: 403 })
//     }

//     const body = await req.json()
//     const {
//       title,
//       originalText,
//       originalLang = 'fr',
//       targetLang = 'zdj',
//       category = 'other',
//       difficulty = 1,
//       source,
//       author,
//       tags,
//       priority = 0,
//     } = body

//     // Validation
//     if (!title || !originalText) {
//       return NextResponse.json(
//         { message: 'Titre et texte requis' },
//         { status: 400 },
//       )
//     }

//     // Générer le slug
//     const slug = title
//       .toLowerCase()
//       .normalize('NFD')
//       .replace(/[\u0300-\u036f]/g, '')
//       .replace(/[^a-z0-9]+/g, '-')
//       .replace(/^-|-$/g, '')

//     // Vérifier l'unicité du slug
//     const existing = await prisma.article.findUnique({
//       where: { slug },
//     })

//     if (existing) {
//       return NextResponse.json(
//         { message: 'Un article avec ce titre existe déjà' },
//         { status: 400 },
//       )
//     }

//     // Compter les mots
//     const words = originalText.trim().split(/\s+/).length

//     // Créer l'article
//     const article = await prisma.article.create({
//       data: {
//         title,
//         slug,
//         originalText,
//         originalLang,
//         targetLang,
//         category,
//         status: 'pending',
//         difficulty: Math.min(Math.max(difficulty, 1), 5),
//         estimatedWords: words,
//         source,
//         author,
//         tags: tags ? JSON.stringify(tags) : null,
//         priority: Math.min(Math.max(priority, 0), 10),
//         isPublic: true,
//       },
//     })

//     return NextResponse.json(
//       {
//         message: 'Article créé avec succès',
//         article,
//       },
//       { status: 201 },
//     )
//   } catch (error) {
//     console.error("Erreur lors de la création de l'article:", error)
//     return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
//   }
// }
