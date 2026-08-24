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

    if (user.role !== 'admin') {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    const where = {}
    if (status === 'active') {
      where.isActive = true
    } else if (status === 'revoked') {
      where.isActive = false
    }

    const apiKeys = await prisma.apiKey.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        modele: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            usageLogs: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ apiKeys })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}
