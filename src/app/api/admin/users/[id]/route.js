import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET - Détails et utilisation d'un utilisateur
export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ message: 'Non authentifié' }, { status: 401 })

    const admin = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
      select: { role: true },
    })
    if (admin?.role !== 'admin') return NextResponse.json({ message: 'Non autorisé' }, { status: 403 })

    const { id } = await params
    const userId = parseInt(id)
    if (Number.isNaN(userId)) return NextResponse.json({ message: 'Identifiant invalide' }, { status: 400 })

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, name: true, email: true, image: true, role: true,
        emailVerified: true, createdAt: true, updatedAt: true,
        profil: { select: { bio: true, location: true, website: true, phone: true, status: true } },
        userGamification: { select: { totalPoints: true, level: true } },
        _count: { select: { apiKeys: true, translations: true, usageLogs: true } },
        usageLogs: {
          orderBy: { createdAt: 'desc' }, take: 100,
          select: {
            id: true, endpoint: true, method: true, statusCode: true,
            responseTime: true, tokens: true, cost: true, createdAt: true,
            metadata: true,
            modele: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    })
    if (!user) return NextResponse.json({ message: 'Utilisateur introuvable' }, { status: 404 })

    const usageTotals = await prisma.usageLog.aggregate({
      where: { userId },
      _count: { _all: true },
      _sum: { tokens: true, cost: true },
    })

    const usageByModelRows = await prisma.usageLog.groupBy({
      by: ['modeleId', 'endpoint'],
      where: { userId },
      _count: { _all: true },
      _sum: { tokens: true, cost: true },
    })
    const modelIds = usageByModelRows.map((row) => row.modeleId).filter(Boolean)
    const models = await prisma.modele.findMany({
      where: { id: { in: modelIds } },
      select: { id: true, name: true, slug: true },
    })
    const modelById = Object.fromEntries(models.map((model) => [model.id, model]))
    const getFallbackModelName = (endpoint) => endpoint?.startsWith('/api/v1/tts') ? 'TTS' : 'Modèle inconnu'
    const usageLogs = user.usageLogs.map((log) => ({
      ...log,
      displayModelName: log.modele?.name || getFallbackModelName(log.endpoint),
    }))

    return NextResponse.json({
      user: {
        ...user,
        usageLogs,
        usageSummary: {
          requests: usageTotals._count._all,
          tokens: usageTotals._sum.tokens || 0,
          cost: Number((usageTotals._sum.cost || 0).toFixed(6)),
          byModel: usageByModelRows.map((row) => ({
            name: modelById[row.modeleId]?.name || getFallbackModelName(row.endpoint),
            slug: modelById[row.modeleId]?.slug || row.endpoint,
            requests: row._count._all,
            tokens: row._sum.tokens || 0,
            cost: Number((row._sum.cost || 0).toFixed(6)),
          })),
        },
      },
    })
  } catch (error) {
    console.error('Erreur détails utilisateur:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}

// PATCH - Mettre à jour un utilisateur
export async function PATCH(req, { params }) {
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

    const { id } = await params
    const body = await req.json()
    const { role, name, email } = body

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        ...(role && { role }),
        ...(name && { name }),
        ...(email && { email }),
      },
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE - Supprimer un utilisateur
export async function DELETE(req, { params }) {
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

    const { id } = params

    // Empêcher de se supprimer soi-même
    if (parseInt(id) === user.id) {
      return NextResponse.json(
        { message: 'Vous ne pouvez pas vous supprimer vous-même' },
        { status: 400 },
      )
    }

    await prisma.user.delete({
      where: { id: parseInt(id) },
    })

    return NextResponse.json({ message: 'Utilisateur supprimé' })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}
