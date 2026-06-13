import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 403 })
    }

    const blog = await prisma.blog.findUnique({
      where: { id: parseInt(params.id) },
      include: { author: { select: { id: true, name: true } } },
    })

    if (!blog) {
      return NextResponse.json({ message: 'Blog non trouvé' }, { status: 404 })
    }

    return NextResponse.json({ blog })
  } catch (error) {
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PATCH(req, { params }) {
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

    const existing = await prisma.blog.findUnique({
      where: { id: parseInt(params.id) },
    })

    if (!existing) {
      return NextResponse.json({ message: 'Blog non trouvé' }, { status: 404 })
    }

    const blog = await prisma.blog.update({
      where: { id: parseInt(params.id) },
      data: {
        ...(title && { title }),
        ...(excerpt !== undefined && { excerpt }),
        ...(content && { content }),
        ...(category && { category }),
        ...(tags !== undefined && { tags }),
        ...(coverImage !== undefined && { coverImage }),
        ...(readTime && { readTime }),
        ...(status && {
          status,
          publishedAt:
            status === 'published' && !existing.publishedAt
              ? new Date()
              : existing.publishedAt,
        }),
      },
    })

    return NextResponse.json({ blog })
  } catch (error) {
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 403 })
    }

    await prisma.blog.delete({ where: { id: parseInt(params.id) } })
    return NextResponse.json({ message: 'Blog supprimé' })
  } catch (error) {
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}
