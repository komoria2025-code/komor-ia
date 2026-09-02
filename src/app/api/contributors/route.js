import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const [translations, recordings] = await Promise.all([
      prisma.translation.findMany({
        where: {
          isActive: true,
          user: { role: { not: 'admin' } },
        },
        select: { user: { select: { id: true, name: true } } },
      }),
      prisma.voiceRecording.findMany({
        where: {
          status: { not: 'rejected' },
          user: { role: { not: 'admin' } },
        },
        select: { user: { select: { id: true, name: true } } },
      }),
    ])

    const contributors = new Map()
    for (const contribution of translations) {
      const user = contribution.user
      if (!user) continue

      const name = user.name?.trim() || 'Contributeur anonyme'
      const current = contributors.get(user.id) || {
        id: user.id,
        name,
        translations: 0,
        recordings: 0,
      }

      current.translations += 1
      contributors.set(user.id, current)
    }

    for (const contribution of recordings) {
      const user = contribution.user
      if (!user) continue

      const name = user.name?.trim() || 'Contributeur anonyme'
      const current = contributors.get(user.id) || {
        id: user.id,
        name,
        translations: 0,
        recordings: 0,
      }

      current.recordings += 1
      contributors.set(user.id, current)
    }

    const sortedContributors = [...contributors.values()].sort((a, b) =>
      a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }),
    )

    return NextResponse.json({
      contributors: sortedContributors,
      total: sortedContributors.length,
      totals: {
        translations: translations.length,
        recordings: recordings.length,
      },
    })
  } catch (error) {
    console.error('Erreur GET /api/contributors:', error)
    return NextResponse.json(
      { message: 'Impossible de charger les contributeurs' },
      { status: 500 },
    )
  }
}
