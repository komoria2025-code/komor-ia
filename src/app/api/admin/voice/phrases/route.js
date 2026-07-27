import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

async function checkAdmin(session) {
  return session?.user?.role === 'admin'
}

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!(await checkAdmin(session))) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const dialecte = searchParams.get('dialecte')

    const where = {}
    if (status && status !== 'all') where.status = status
    if (dialecte && dialecte !== 'all') where.dialecte = dialecte

    const phrases = await prisma.voicePhrase.findMany({
      where,
      include: {
        creator: { select: { name: true } },
        _count: { select: { recordings: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ phrases })
  } catch (error) {
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!(await checkAdmin(session))) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 403 })
    }

    const body = await req.json()
    const { text, dialecte, translation, difficulty } = body

    if (!text) {
      return NextResponse.json({ message: 'Texte requis' }, { status: 400 })
    }

    const phrase = await prisma.voicePhrase.create({
      data: {
        text,
        dialecte: dialecte || 'shingazidja',
        translation: translation || null,
        difficulty: difficulty || 1,
        createdBy: parseInt(session.user.id),
      },
    })

    return NextResponse.json({ phrase }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}
