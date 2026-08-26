import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { calculateLevel } from '@/lib/gamification'

export async function GET(req, { params }) {
  try {
    const slugOrId = (await params).id
    const numericId = /^\d+$/.test(slugOrId)
      ? Number(slugOrId)
      : Number(slugOrId.match(/-(\d+)$/)?.[1])
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          ...(Number.isNaN(numericId) ? [] : [{ id: numericId }]),
          { profil: { publicSlug: slugOrId } },
        ],
        profil: { status: 'public' },
        userGamification: { badges: { some: { badge: 'maitre' } } },
      },
      select: {
        id: true,
        name: true,
        image: true,
        profil: { select: { bio: true, location: true, website: true, publicSlug: true } },
        userGamification: {
          select: {
            totalPoints: true,
            maxStreak: true,
            badges: { orderBy: { earnedAt: 'asc' } },
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ message: 'Maître non trouvé' }, { status: 404 })
    }

    const [translations, sentenceTranslations, paragraphTranslations, articleTranslations, voiceRecordings, externalPoints] = await Promise.all([
      prisma.translation.count({ where: { userId: user.id, status: { in: ['completed', 'verified'] } } }),
      prisma.translation.count({ where: { userId: user.id, status: { in: ['completed', 'verified'] }, article: { contentType: 'sentence' } } }),
      prisma.translation.count({ where: { userId: user.id, status: { in: ['completed', 'verified'] }, article: { contentType: 'paragraph' } } }),
      prisma.translation.count({ where: { userId: user.id, status: { in: ['completed', 'verified'] }, article: { contentType: 'article' } } }),
      prisma.voiceRecording.count({ where: { userId: user.id, status: 'validated' } }),
      prisma.pointTransaction.aggregate({ where: { userId: user.id, source: 'externe' }, _sum: { points: true } }),
    ])

    return NextResponse.json({
      master: {
        id: user.id,
        name: user.name || 'Maître du shikomori',
        slug: user.profil.publicSlug || `${String(user.name || 'maitre-du-shikomori').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'maitre-du-shikomori'}-${user.id}`,
        image: user.image,
        profil: user.profil,
        totalPoints: user.userGamification.totalPoints,
        level: calculateLevel(user.userGamification.totalPoints),
        maxStreak: user.userGamification.maxStreak,
        badges: user.userGamification.badges,
        translations,
        sentenceTranslations,
        paragraphTranslations,
        articleTranslations,
        voiceRecordings,
        externalPoints: externalPoints._sum.points || 0,
        badgeEarnedAt: user.userGamification.badges.find((badge) => badge.badge === 'maitre')?.earnedAt || null,
      },
    })
  } catch (error) {
    console.error('Erreur profil maître:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}