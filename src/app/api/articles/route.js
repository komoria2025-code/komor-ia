import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

// export async function GET(req) {
//   try {
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

//     const [articles, total] = await Promise.all([
//       prisma.article.findMany({
//         where,
//         include: {
//           _count: {
//             select: { translations: true },
//           },
//         },
//         orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
//         take: limit,
//         skip: offset,
//       }),
//       prisma.article.count({ where }),
//     ])

//     return NextResponse.json({
//       articles,
//       total,
//       limit,
//       offset,
//       hasMore: offset + limit < total,
//     })
//   } catch (error) {
//     console.error(error)
//     return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
//   }
// }
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id ? parseInt(session.user.id) : null

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    const where = {
      isPublic: true,
      ...(status && status !== 'all' && { status }),
      ...(category && category !== 'all' && { category }),
    }

    // ✅ Requête 1 : articles que l'user a commencé (in_progress)
    // triés par updatedAt de la traduction — le plus récent en premier
    const inProgressArticles = userId
      ? await prisma.article.findMany({
          where: {
            ...where,
            translations: {
              some: {
                userId,
                // status: 'in_progress',
                status: { in: ['in_progress', 'completed'] },
              },
            },
          },
          include: {
            _count: { select: { translations: true } },
            translations: {
              where: { userId, status: 'in_progress' },
              select: {
                id: true,
                progress: true,
                status: true,
                updatedAt: true,
                dialecte: true,
              },
            },
          },
          // ✅ Tri par updatedAt de la traduction directement
          orderBy: { translations: { _count: 'desc' } }, // trick pour avoir les résultats
        })
      : []

    // ✅ Trier les in_progress par updatedAt de la traduction (le plus récent en premier)
    inProgressArticles.sort((a, b) => {
      const dateA = new Date(a.translations?.[0]?.updatedAt || 0)
      const dateB = new Date(b.translations?.[0]?.updatedAt || 0)
      return dateB - dateA // décroissant
    })

    // IDs déjà dans inProgress pour les exclure de la requête principale
    const inProgressIds = inProgressArticles.map((a) => a.id)

    // ✅ Requête 2 : tous les autres articles (hors in_progress)
    const [otherArticles, total] = await Promise.all([
      prisma.article.findMany({
        where: {
          ...where,
          // Exclure les articles déjà en cours
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

    // ✅ Combiner : in_progress en premier, puis les autres
    const articles = [...inProgressArticles, ...otherArticles]

    return NextResponse.json({
      articles,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
      inProgressCount: inProgressArticles.length, // bonus pour le front
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}
/**
 * POST /api/articles
 * Créer un nouvel article (admin uniquement)
 */
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Non authentifié' }, { status: 401 })
    }

    // Vérifier que l'utilisateur est admin
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
      category = 'other',
      difficulty = 1,
      source,
      author,
      tags,
      priority = 0,
    } = body

    // Validation
    if (!title || !originalText) {
      return NextResponse.json(
        { message: 'Titre et texte requis' },
        { status: 400 },
      )
    }

    // Générer le slug
    const slug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    // Vérifier l'unicité du slug
    const existing = await prisma.article.findUnique({
      where: { slug },
    })

    if (existing) {
      return NextResponse.json(
        { message: 'Un article avec ce titre existe déjà' },
        { status: 400 },
      )
    }

    // Compter les mots
    const words = originalText.trim().split(/\s+/).length

    // Créer l'article
    const article = await prisma.article.create({
      data: {
        title,
        slug,
        originalText,
        originalLang,
        targetLang,
        category,
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
      {
        message: 'Article créé avec succès',
        article,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Erreur lors de la création de l'article:", error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}

/**
 * GET /api/articles
 * Récupérer la liste des articles
 */
// export async function GET(req) {
//   try {
//     const { searchParams } = new URL(req.url)
//     const status = searchParams.get('status')
//     const category = searchParams.get('category')
//     const limit = parseInt(searchParams.get('limit') || '50')
//     const offset = parseInt(searchParams.get('offset') || '0')

//     // Construire le filtre
//     const where = {}
//     if (status && status !== 'all') {
//       where.status = status
//     }
//     if (category && category !== 'all') {
//       where.category = category
//     }
//     where.isPublic = true // Seulement les articles publics

//     // Récupérer les articles
//     const articles = await prisma.article.findMany({
//       where,
//       include: {
//         _count: {
//           select: {
//             translations: true,
//           },
//         },
//       },
//       orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
//       take: limit,
//       skip: offset,
//     })

//     // Total pour la pagination
//     const total = await prisma.article.count({ where })

//     return NextResponse.json(
//       {
//         articles,
//         total,
//         limit,
//         offset,
//       },
//       { status: 200 },
//     )
//   } catch (error) {
//     console.error('Erreur lors de la récupération des articles:', error)
//     return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
//   }
// }
