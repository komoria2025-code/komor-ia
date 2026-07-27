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

    const [total, active, revoked, totalRequests] = await Promise.all([
      prisma.apiKey.count(),
      prisma.apiKey.count({ where: { isRevoked: false } }),
      prisma.apiKey.count({ where: { isRevoked: true } }),
      prisma.usageLog.count(),
    ])

    return NextResponse.json({
      total,
      active,
      revoked,
      totalRequests,
    })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}
