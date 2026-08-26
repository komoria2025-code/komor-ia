import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { awardExternalPoints, removeExternalPoints } from '@/lib/gamification'

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Non authentifié' }, { status: 401 })
    }

    const admin = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
      select: { role: true },
    })
    if (admin?.role !== 'admin') {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 403 })
    }

    const userId = parseInt((await params).id)
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    })
    if (!targetUser) {
      return NextResponse.json({ message: 'Utilisateur non trouvé' }, { status: 404 })
    }

    const body = await req.json()
    const points = Number(body.points)
    const operation = body.operation === 'remove' ? 'remove' : 'add'
    const description = String(body.description || '').trim()
    const adminNote = String(body.adminNote || '').trim()

    if (!Number.isInteger(points) || points <= 0 || points > 100000) {
      return NextResponse.json(
        { message: 'Les points doivent être un entier entre 1 et 100 000' },
        { status: 400 },
      )
    }
    if (!description) {
      return NextResponse.json(
        { message: 'La description de la contribution est obligatoire' },
        { status: 400 },
      )
    }

    const result = operation === 'remove'
      ? await removeExternalPoints(userId, points, description, parseInt(session.user.id), adminNote)
      : await awardExternalPoints(userId, points, description, parseInt(session.user.id), adminNote)

    return NextResponse.json({ message: 'Points externes ajoutés', result })
  } catch (error) {
    console.error('Erreur ajout points externes:', error)
    const isBusinessError = error.message?.startsWith('Impossible') ||
      error.message?.startsWith('Le nombre de points')
    return NextResponse.json(
      { message: isBusinessError ? error.message : 'Erreur serveur' },
      { status: isBusinessError ? 400 : 500 },
    )
  }
}