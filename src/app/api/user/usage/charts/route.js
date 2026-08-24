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

    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period') || '7days'

    const now = new Date()
    let startDate = new Date()
    let days = 7

    switch (period) {
      case '7days':
        startDate.setDate(now.getDate() - 7)
        days = 7
        break
      case '30days':
        startDate.setDate(now.getDate() - 30)
        days = 30
        break
      default:
        startDate.setDate(now.getDate() - 7)
        days = 7
    }

    const userId = parseInt(session.user.id)

    // Récupérer tous les logs de la période
    const logs = await prisma.usageLog.findMany({
      where: {
        userId,
        createdAt: { gte: startDate },
      },
      include: {
        modele: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    // 1. Données pour graphique par jour
    const dailyData = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)

      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const dayLogs = logs.filter(
        (log) => log.createdAt >= date && log.createdAt < nextDate,
      )

      dailyData.push({
        date: date.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: 'short',
        }),
        requests: dayLogs.length,
        tokens: dayLogs.reduce((sum, log) => sum + log.tokens, 0),
      })
    }

    // 2. Données par modèle
    const modelStats = {}
    logs.forEach((log) => {
      const modelName = log.modele?.name || 'Modèle inconnu'
      if (!modelStats[modelName]) {
        modelStats[modelName] = { tokens: 0, requests: 0 }
      }
      modelStats[modelName].tokens += log.tokens
      modelStats[modelName].requests += 1
    })

    const modelData = Object.entries(modelStats).map(([name, stats]) => ({
      name,
      tokens: stats.tokens,
      requests: stats.requests,
    }))

    // 3. Top endpoints
    const endpointStats = {}
    logs.forEach((log) => {
      if (!endpointStats[log.endpoint]) {
        endpointStats[log.endpoint] = 0
      }
      endpointStats[log.endpoint] += 1
    })

    const endpointData = Object.entries(endpointStats)
      .map(([endpoint, count]) => ({ endpoint, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return NextResponse.json({
      dailyData,
      modelData,
      endpointData,
    })
  } catch (error) {
    console.error('Erreur API charts:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}
