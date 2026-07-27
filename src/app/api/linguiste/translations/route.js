import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

async function checkLinguiste(session) {
  if (!session?.user?.id) return false
  const user = await prisma.user.findUnique({
    where: { id: parseInt(session.user.id) },
  })
  return user?.role === 'linguiste' || user?.role === 'admin'
}

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!(await checkLinguiste(session))) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const articleId = searchParams.get('articleId')

    const where = { isActive: true }
    if (status && status !== 'all') where.status = status
    if (articleId) where.articleId = parseInt(articleId)

    const translations = await prisma.translation.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        article: {
          select: { id: true, title: true, originalText: true, category: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json({ translations })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}
