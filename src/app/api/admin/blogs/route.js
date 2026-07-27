import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

function generateSlug(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    const where = {}
    if (status && status !== 'all') where.status = status

    const blogs = await prisma.blog.findMany({
      where,
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ blogs })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 403 })
    }

    const body = await req.json()
    const {
      title,
      excerpt,
      content,
      category,
      tags,
      status,
      coverImage,
      readTime,
    } = body

    if (!title || !content) {
      return NextResponse.json(
        { message: 'Titre et contenu requis' },
        { status: 400 },
      )
    }

    const slug = generateSlug(title) + '-' + Date.now()

    const blog = await prisma.blog.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        category: category || 'actualites',
        tags: tags || [],
        status: status || 'draft',
        coverImage,
        readTime: readTime || 5,
        authorId: parseInt(session.user.id),
        publishedAt: status === 'published' ? new Date() : null,
      },
      include: {
        author: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ blog }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}
