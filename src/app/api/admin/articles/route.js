import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Non authentifié' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
    })
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const contentType = searchParams.get('contentType')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '50'))
    const skip = (page - 1) * limit

    const where = {}
    if (status && status !== 'all') where.status = status
    if (category && category !== 'all') where.category = category
    if (contentType && contentType !== 'all') where.contentType = contentType

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        include: { _count: { select: { translations: true } } },
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
        take: limit,
        skip,
      }),
      prisma.article.count({ where }),
    ])

    return NextResponse.json({
      articles,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Erreur GET /api/admin/articles:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}

// import { NextResponse } from 'next/server'
// import { getServerSession } from 'next-auth'
// import { authOptions } from '@/lib/auth'
// import prisma from '@/lib/prisma'

// export async function GET(req) {
//   try {
//     const session = await getServerSession(authOptions)
//     if (!session?.user?.id) {
//       return NextResponse.json({ message: 'Non authentifié' }, { status: 401 })
//     }

//     const user = await prisma.user.findUnique({
//       where: { id: parseInt(session.user.id) },
//     })

//     if (!user || user.role !== 'admin') {
//       return NextResponse.json({ message: 'Non autorisé' }, { status: 403 })
//     }

//     const { searchParams } = new URL(req.url)
//     const status = searchParams.get('status')
//     const category = searchParams.get('category')
//     const contentType = searchParams.get('contentType')

//     const where = {}
//     if (status && status !== 'all') where.status = status
//     if (category && category !== 'all') where.category = category
//     if (contentType && contentType !== 'all') where.contentType = contentType

//     const articles = await prisma.article.findMany({
//       where,
//       include: {
//         _count: { select: { translations: true } },
//       },
//       orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
//       take: 100,
//     })

//     return NextResponse.json({ articles })
//   } catch (error) {
//     console.error('Erreur GET /api/admin/articles:', error)
//     return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
//   }
// }
