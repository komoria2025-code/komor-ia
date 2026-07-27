import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

async function checkLinguiste(session) {
  if (!session?.user?.id) return false
  const user = await prisma.user.findUnique({
    where: { id: parseInt(session.user.id) },
  })
  return user?.role === 'linguiste' || user?.role === 'admin'
}

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!(await checkLinguiste(session))) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 403 })
    }

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [
      pending,
      completed,
      verifiedThisMonth,
      totalArticles,
      avgQualityResult,
    ] = await Promise.all([
      prisma.translation.count({
        where: { status: 'completed', isActive: true },
      }),
      prisma.translation.count({
        where: { status: 'verified', isActive: true },
      }),
      prisma.translation.count({
        where: {
          status: 'verified',
          verifiedAt: { gte: startOfMonth },
        },
      }),
      prisma.article.count(),
      prisma.translation.aggregate({
        _avg: { quality: true },
        where: { quality: { not: null } },
      }),
    ])

    return NextResponse.json({
      pending,
      completed,
      verifiedThisMonth,
      rejectedThisMonth: 0,
      totalArticles,
      avgQuality: avgQualityResult._avg.quality
        ? Math.round(avgQualityResult._avg.quality * 10) / 10
        : null,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}
