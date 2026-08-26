import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { calculateLevel } from '@/lib/gamification'

function slugify(name, id) {
  const base = String(name || 'maitre-du-shikomori')
    .toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return `${base || 'maitre-du-shikomori'}-${id}`
}

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: {
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
            badges: { where: { badge: 'maitre' }, select: { earnedAt: true } },
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    const masters = await Promise.all(
      users.map(async (user) => {
        const [translations, voiceRecordings, externalPoints] = await Promise.all([
          prisma.translation.count({
            where: {
              userId: user.id,
              status: { in: ['completed', 'verified'] },
            },
          }),
          prisma.voiceRecording.count({
            where: { userId: user.id, status: 'validated' },
          }),
          prisma.pointTransaction.aggregate({
            where: { userId: user.id, source: 'externe' },
            _sum: { points: true },
          }),
        ])

        return {
          id: user.id,
          name: user.name || 'Maître du shikomori',
          slug: user.profil.publicSlug || slugify(user.name, user.id),
          image: user.image,
          profil: user.profil,
          totalPoints: user.userGamification.totalPoints,
          level: calculateLevel(user.userGamification.totalPoints),
          translations,
          voiceRecordings,
          externalPoints: externalPoints._sum.points || 0,
          badgeEarnedAt: user.userGamification.badges[0]?.earnedAt || null,
        }
      }),
    )

    return NextResponse.json({ masters })
  } catch (error) {
    console.error('Erreur liste des maîtres:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}