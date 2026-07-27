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

    // Calculer la date de début selon la période
    const now = new Date()
    let startDate = new Date()

    switch (period) {
      case '7days':
        startDate.setDate(now.getDate() - 7)
        break
      case '30days':
        startDate.setDate(now.getDate() - 30)
        break
      case 'all':
        startDate = new Date(0) // Depuis le début
        break
      default:
        startDate.setDate(now.getDate() - 7)
    }

    const userId = parseInt(session.user.id)

    // Stats globales pour la période
    const logs = await prisma.usageLog.findMany({
      where: {
        userId,
        createdAt: { gte: startDate },
      },
    })

    const totalRequests = logs.length
    const totalTokens = logs.reduce((sum, log) => sum + log.tokens, 0)
    const totalCost = logs.reduce((sum, log) => sum + log.cost, 0)

    // Requêtes aujourd'hui
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const requestsToday = logs.filter(
      (log) => log.createdAt >= todayStart,
    ).length

    // Stats période précédente (pour calcul du changement)
    const prevStartDate = new Date(startDate)
    const periodDays = Math.ceil((now - startDate) / (1000 * 60 * 60 * 24))
    prevStartDate.setDate(prevStartDate.getDate() - periodDays)

    const prevLogs = await prisma.usageLog.findMany({
      where: {
        userId,
        createdAt: { gte: prevStartDate, lt: startDate },
      },
    })

    const prevTotalRequests = prevLogs.length
    const prevTotalTokens = prevLogs.reduce((sum, log) => sum + log.tokens, 0)
    const prevTotalCost = prevLogs.reduce((sum, log) => sum + log.cost, 0)

    // Calcul des changements en pourcentage
    const calculateChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0
      return parseFloat((((current - previous) / previous) * 100).toFixed(1))
    }

    return NextResponse.json({
      stats: {
        totalRequests,
        totalTokens,
        totalCost: parseFloat(totalCost.toFixed(2)),
        requestsToday,
        changes: {
          requests: calculateChange(totalRequests, prevTotalRequests),
          tokens: calculateChange(totalTokens, prevTotalTokens),
          cost: calculateChange(totalCost, prevTotalCost),
        },
      },
    })
  } catch (error) {
    console.error('Erreur API usage:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}
