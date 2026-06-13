import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req, { params }) {
  try {
    // ✅ Await params en Next.js 15
    const { slug } = await params

    const blog = await prisma.blog.findUnique({
      where: { slug, status: 'published' },
      include: { author: { select: { name: true, image: true } } },
    })

    if (!blog) {
      return NextResponse.json({ message: 'Blog non trouvé' }, { status: 404 })
    }

    await prisma.blog.update({
      where: { id: blog.id },
      data: { views: { increment: 1 } },
    })

    return NextResponse.json({ blog })
  } catch (error) {
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}
