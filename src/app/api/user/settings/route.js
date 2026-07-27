import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

/**
 * GET /api/user/settings
 * Récupérer les paramètres de l'utilisateur
 */
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Non authentifié' }, { status: 401 })
    }

    const userId = parseInt(session.user.id)

    // Récupérer ou créer les settings
    let settings = await prisma.userSettings.findUnique({
      where: { userId },
    })

    // Si pas de settings, créer avec valeurs par défaut
    if (!settings) {
      settings = await prisma.userSettings.create({
        data: { userId },
      })
    }

    return NextResponse.json({ settings }, { status: 200 })
  } catch (error) {
    console.error('Erreur GET /api/user/settings:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}

/**
 * PUT /api/user/settings
 * Mettre à jour les paramètres
 */
export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Non authentifié' }, { status: 401 })
    }

    const userId = parseInt(session.user.id)
    const body = await req.json()

    // Champs autorisés à être mis à jour
    const allowedFields = [
      'theme',
      'language',
      'timezone',
      'emailNotifications',
      'usageAlerts',
      'monthlyReports',
      'securityAlerts',
      'dailyRequestLimit',
      'monthlyBudgetLimit',
      'quotaWarningThreshold',
      'defaultModel',
      'defaultMaxTokens',
    ]

    // Filtrer uniquement les champs autorisés
    const updateData = {}
    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    })

    // Mettre à jour ou créer
    const settings = await prisma.userSettings.upsert({
      where: { userId },
      update: updateData,
      create: {
        userId,
        ...updateData,
      },
    })

    return NextResponse.json({
      message: 'Paramètres enregistrés avec succès',
      settings,
    })
  } catch (error) {
    console.error('Erreur PUT /api/user/settings:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}
