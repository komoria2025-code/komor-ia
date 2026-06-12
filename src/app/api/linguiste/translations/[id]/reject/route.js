import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Non authentifié' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
    })

    if (user.role !== 'linguiste' && user.role !== 'admin') {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 403 })
    }

    const { id } = params
    const { reason } = await req.json()

    // Repasser en in_progress avec la raison comme note
    const translation = await prisma.translation.update({
      where: { id: parseInt(id) },
      data: {
        status: 'in_progress',
        notes: `[REJETÉ] ${reason}`,
      },
    })

    // Remettre l'article en in_progress
    await prisma.article.update({
      where: { id: translation.articleId },
      data: { status: 'in_progress' },
    })

    return NextResponse.json({ translation })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}
