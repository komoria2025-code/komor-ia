import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

/**
 * POST /api/articles/[slug]/translate
 * Sauvegarder ou mettre à jour une traduction
 */
export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Non authentifié' }, { status: 401 })
    }

    const { slug } = await params
    const body = await req.json()
    const {
      translatedText,
      progress = 0,
      status = 'in_progress',
      notes = '',
      timeSpent = 0,
      dialecte = 'shingazidja',
    } = body

    // Récupérer l'article
    const article = await prisma.article.findUnique({
      where: { slug },
    })

    if (!article) {
      return NextResponse.json(
        { message: 'Article non trouvé' },
        { status: 404 },
      )
    }

    const userId = parseInt(session.user.id)

    // Chercher une traduction active existante
    const existingTranslation = await prisma.translation.findFirst({
      where: {
        articleId: article.id,
        userId,
        isActive: true,
      },
    })

    let translation

    if (existingTranslation) {
      // Mettre à jour la traduction existante
      translation = await prisma.translation.update({
        where: { id: existingTranslation.id },
        data: {
          translatedText,
          progress: Math.min(Math.max(progress, 0), 100),
          status: progress === 100 ? 'completed' : status,
          notes,
          timeSpent,
          dialecte,
        },
      })

      // Créer un historique de modification
      await prisma.translationEdit.create({
        data: {
          translationId: translation.id,
          articleId: article.id,
          userId,
          editedText: translatedText,
          progress,
          sessionStart: new Date(Date.now() - timeSpent * 1000),
          sessionEnd: new Date(),
        },
      })
    } else {
      // Créer une nouvelle traduction
      translation = await prisma.translation.create({
        data: {
          articleId: article.id,
          userId,
          translatedText,
          progress: Math.min(Math.max(progress, 0), 100),
          status: progress === 100 ? 'completed' : status,
          notes,
          timeSpent,
          isActive: true,
          dialecte,
        },
      })

      // Créer le premier edit
      await prisma.translationEdit.create({
        data: {
          translationId: translation.id,
          articleId: article.id,
          userId,
          editedText: translatedText,
          progress,
          sessionStart: new Date(Date.now() - timeSpent * 1000),
          sessionEnd: new Date(),
        },
      })
    }

    // Si la traduction est terminée, mettre à jour le statut de l'article
    if (progress === 100) {
      const completedTranslations = await prisma.translation.count({
        where: {
          articleId: article.id,
          status: 'completed',
        },
      })

      // Si c'est la première traduction complète
      if (completedTranslations === 1) {
        await prisma.article.update({
          where: { id: article.id },
          data: { status: 'completed' },
        })
      }
    }

    return NextResponse.json(
      {
        message: 'Traduction sauvegardée',
        translation,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}

/**
 * GET /api/articles/[slug]/translate
 * Récupérer l'historique des traductions d'un article
 */
export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    const { slug } = params
    const { searchParams } = new URL(req.url)
    const includeHistory = searchParams.get('history') === 'true'

    // Récupérer l'article
    const article = await prisma.article.findUnique({
      where: { slug },
    })

    if (!article) {
      return NextResponse.json(
        { message: 'Article non trouvé' },
        { status: 404 },
      )
    }

    // Récupérer toutes les traductions
    const translations = await prisma.translation.findMany({
      where: {
        articleId: article.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        edits: includeHistory,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    return NextResponse.json(
      {
        article,
        translations,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}
