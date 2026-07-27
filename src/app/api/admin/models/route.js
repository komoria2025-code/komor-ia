import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET - Liste des modèles
export async function GET(req) {
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

    const models = await prisma.modele.findMany({
      include: {
        _count: {
          select: {
            apiKeys: true,
            usageLogs: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ models })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}

// POST - Créer un modèle
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
      name,
      slug,
      description,
      domaine,
      version,
      status,
      endpoint,
      icon,
      color,
      isPublic,
    } = body

    // Vérifier l'unicité du slug
    const existing = await prisma.modele.findUnique({
      where: { slug },
    })

    if (existing) {
      return NextResponse.json(
        { message: 'Ce slug existe déjà' },
        { status: 400 },
      )
    }

    const model = await prisma.modele.create({
      data: {
        name,
        slug,
        description,
        domaine,
        version: version || '1.0.0',
        status: status || 'development',
        endpoint,
        icon: icon || 'Brain',
        color: color || 'blue',
        isPublic: isPublic !== false,
      },
    })

    return NextResponse.json({ model }, { status: 201 })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}
