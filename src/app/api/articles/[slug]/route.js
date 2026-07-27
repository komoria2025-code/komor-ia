import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

/**
 * GET /api/articles/[slug]
 * Récupérer un article et sa traduction (si elle existe pour l'utilisateur)
 */
export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    const { slug } = await params

    // Récupérer l'article
    const article = await prisma.article.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            translations: true,
          },
        },
      },
    })

    if (!article) {
      return NextResponse.json(
        { message: 'Article non trouvé' },
        { status: 404 },
      )
    }

    // Si l'utilisateur est connecté, chercher sa traduction active
    let translation = null
    if (session?.user?.id) {
      translation = await prisma.translation.findFirst({
        where: {
          articleId: article.id,
          userId: parseInt(session.user.id),
          isActive: true,
        },
      })
    }

    return NextResponse.json(
      {
        article,
        translation,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}
