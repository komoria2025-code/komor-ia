import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

async function checkLinguisteOrAdmin(session) {
  return session?.user?.role === 'admin' || session?.user?.role === 'linguiste'
}

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!(await checkLinguisteOrAdmin(session))) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || 'pending'

    const where = {}
    if (status !== 'all') where.status = status

    const [recordings, aggregate, contributors, phrases, breakdowns] =
      await Promise.all([
        prisma.voiceRecording.findMany({
          where,
          include: {
            user: { select: { id: true, name: true, email: true } },
            phrase: { select: { id: true, text: true, dialecte: true } },
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.voiceRecording.aggregate({
          where,
          _count: { _all: true },
          _sum: { duration: true },
        }),
        prisma.voiceRecording.groupBy({ by: ['userId'], where }),
        prisma.voiceRecording.groupBy({ by: ['phraseId'], where }),
        Promise.all([
          prisma.voiceRecording.groupBy({ by: ['genre'], where, _count: { _all: true } }),
          prisma.voiceRecording.groupBy({ by: ['trancheAge'], where, _count: { _all: true } }),
          prisma.voiceRecording.groupBy({ by: ['ile'], where, _count: { _all: true } }),
          prisma.voiceRecording.groupBy({ by: ['zone'], where, _count: { _all: true } }),
          prisma.voiceRecording.groupBy({ by: ['dialecte'], where, _count: { _all: true } }),
        ]),
      ])

    const total = aggregate._count._all
    const countFilled = (field) =>
      recordings.reduce((count, recording) => count + (recording[field] ? 1 : 0), 0)

    const toBreakdown = (rows, field) =>
      rows.map((row) => ({ value: row[field] || 'non_renseigne', count: row._count._all }))

    return NextResponse.json({
      recordings,
      stats: {
        total,
        duration: aggregate._sum.duration || 0,
        contributors: contributors.length,
        phrases: phrases.length,
        completion: {
          genre: countFilled('genre'),
          trancheAge: countFilled('trancheAge'),
          ile: countFilled('ile'),
          zone: countFilled('zone'),
        },
        nativeSpeakers: recordings.filter((recording) => recording.nativeSpeaker).length,
        breakdowns: {
          genre: toBreakdown(breakdowns[0], 'genre'),
          trancheAge: toBreakdown(breakdowns[1], 'trancheAge'),
          ile: toBreakdown(breakdowns[2], 'ile'),
          zone: toBreakdown(breakdowns[3], 'zone'),
          dialecte: toBreakdown(breakdowns[4], 'dialecte'),
        },
      },
    })
  } catch (error) {
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}
