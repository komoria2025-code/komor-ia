import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

/**
 * GET /api/models
 * Récupère la liste des modèles disponibles
 */
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Non authentifié' }, { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
      select: { role: true },
    })

    if (currentUser?.role !== 'admin') {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period') || '30days'
    const now = new Date()
    const days = period === '7days' ? 7 : period === '90days' ? 90 : 30
    const startDate = new Date(now)
    startDate.setDate(startDate.getDate() - days)
    startDate.setHours(0, 0, 0, 0)

    const previousStartDate = new Date(startDate)
    previousStartDate.setDate(previousStartDate.getDate() - days)

    const [
      totalUsers,
      totalModels,
      totalArticles,
      totalApiKeys,
      pendingTranslations,
      completedTranslations,
      logs,
      previousLogs,
      activeApiKeys,
      expiredApiKeys,
      revokedApiKeys,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.modele.count(),
      prisma.article.count(),
      prisma.apiKey.count(),
      prisma.translation.count({ where: { status: 'pending' } }),
      prisma.translation.count({ where: { status: 'completed' } }),
      prisma.usageLog.findMany({
        where: { createdAt: { gte: startDate } },
        include: {
          user: { select: { id: true, name: true, email: true } },
          modele: { select: { name: true } },
        },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.usageLog.findMany({
        where: { createdAt: { gte: previousStartDate, lt: startDate } },
        select: { userId: true, cost: true },
      }),
      prisma.apiKey.count({ where: { isActive: true } }),
      prisma.apiKey.count({
        where: { expiresAt: { not: null, lt: now } },
      }),
      prisma.apiKey.count({ where: { isActive: false } }),
    ])

    const sum = (items, field) =>
      items.reduce((total, item) => total + (item[field] || 0), 0)
    const uniqueUsers = (items) =>
      new Set(items.map((item) => item.userId).filter(Boolean)).size
    const percentageChange = (current, previous) =>
      previous === 0
        ? current > 0
          ? 100
          : 0
        : Number((((current - previous) / previous) * 100).toFixed(1))

    const dailyUsage = []
    for (let offset = days - 1; offset >= 0; offset -= 1) {
      const date = new Date(now)
      date.setDate(date.getDate() - offset)
      date.setHours(0, 0, 0, 0)
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)
      const dayLogs = logs.filter(
        (log) => log.createdAt >= date && log.createdAt < nextDate,
      )
      dailyUsage.push({
        date: date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
        requests: dayLogs.length,
        users: uniqueUsers(dayLogs),
        revenue: sum(dayLogs, 'cost'),
      })
    }

    const modelStats = {}
    logs.forEach((log) => {
      const name = log.modele?.name || 'Modèle inconnu'
      modelStats[name] = (modelStats[name] || 0) + 1
    })
    const totalRequests = logs.length
    const modelUsage = Object.entries(modelStats).map(([name, requests]) => ({
      name,
      requests,
      percentage: totalRequests ? Math.round((requests / totalRequests) * 100) : 0,
    }))

    const userStats = {}
    logs.forEach((log) => {
      if (!log.user) return
      if (!userStats[log.user.id]) {
        userStats[log.user.id] = { ...log.user, requests: 0, spent: 0 }
      }
      userStats[log.user.id].requests += 1
      userStats[log.user.id].spent += log.cost || 0
    })
    const topUsers = Object.values(userStats)
      .sort((a, b) => b.requests - a.requests)
      .slice(0, 5)

    const previousRequests = previousLogs.length
    const activeUsers = uniqueUsers(logs)
    return NextResponse.json({
      totalUsers,
      totalModels,
      totalArticles,
      totalApiKeys,
      pendingTranslations,
      completedTranslations,
      totalRequests,
      activeUsers,
      overview: {
        totalUsers,
        totalRequests,
        totalRevenue: sum(logs, 'cost'),
        activeUsers,
        changes: {
          users: 0,
          requests: percentageChange(totalRequests, previousRequests),
          revenue: percentageChange(sum(logs, 'cost'), sum(previousLogs, 'cost')),
          activeUsers: percentageChange(activeUsers, uniqueUsers(previousLogs)),
        },
      },
      dailyUsage,
      modelUsage,
      topUsers,
      apiKeyStats: {
        total: totalApiKeys,
        active: activeApiKeys,
        expired: expiredApiKeys,
        revoked: revokedApiKeys,
      },
    })
  } catch (error) {
    console.error('Erreur statistiques admin:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}

/**
 * POST /api/models
 * Crée un nouveau modèle (admin uniquement)
 */
export async function POST(req) {
  try {
    const body = await req.json()
    const {
      name,
      slug,
      description,
      domaine,
      version,
      status = 'development',
      endpoint,
      icon,
      color,
      isPublic = false,
      features,
      pricing,
    } = body

    // Validation
    if (!name || !slug || !description || !domaine || !version) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Les champs name, slug, description, domaine et version sont requis.',
        },
        { status: 400 },
      )
    }

    // Vérifier que le slug est unique
    const existingModel = await prisma.modele.findUnique({
      where: { slug },
    })

    if (existingModel) {
      return NextResponse.json(
        {
          success: false,
          message: 'Un modèle avec ce slug existe déjà.',
        },
        { status: 400 },
      )
    }

    // Créer le modèle
    const model = await prisma.modele.create({
      data: {
        name,
        slug,
        description,
        domaine,
        version,
        status,
        endpoint: endpoint || null,
        icon: icon || 'Brain',
        color: color || 'blue',
        isPublic,
        features: features || null, // Directement en JSON
        pricing: pricing || null, // Directement en JSON
      },
    })

    return NextResponse.json(
      {
        success: true,
        model: model,
        message: 'Modèle créé avec succès.',
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Erreur lors de la création du modèle:', error)

    return NextResponse.json(
      {
        success: false,
        message: 'Erreur lors de la création du modèle.',
        error:
          process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}
