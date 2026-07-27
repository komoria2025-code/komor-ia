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

    const recordings = await prisma.voiceRecording.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        phrase: { select: { id: true, text: true, dialecte: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ recordings })
  } catch (error) {
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}
