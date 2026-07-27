// src/app/api/admin/datasets/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

async function checkAdmin(session) {
  if (!session?.user?.id) return false
  const user = await prisma.user.findUnique({ where: { id: parseInt(session.user.id) } })
  return user?.role === 'admin'
}

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!await checkAdmin(session)) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    const datasets = await prisma.dataset.findMany({
      where:   { ...(status && status !== 'all' && { status }) },
      include: { author: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ datasets })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!await checkAdmin(session)) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 403 })
    }

    const body = await req.json()
    const {
      title, description, excerpt, coverImage,
      tags, language = 'shi', domain, license = 'cc_by',
      numExamples = 0, sizeInMb = 0, downloadType = 'external',
      downloadUrl, fileUrl, filePublicId, format, version = '1.0.0',
      previewData, bibtex,
    } = body

    if (!title || !description) {
      return NextResponse.json({ message: 'Titre et description requis' }, { status: 400 })
    }

    // Générer le slug
    const base = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 80)
    const slug = `${base}-${Math.random().toString(36).slice(2, 6)}`

    const dataset = await prisma.dataset.create({
      data: {
        title, slug, description, excerpt, coverImage,
        tags:        tags        ? JSON.stringify(tags) : null,
        language,    domain,     license,
        numExamples, sizeInMb,   downloadType,
        downloadUrl, fileUrl,    filePublicId,
        format,      version,
        previewData: previewData ? JSON.stringify(previewData) : null,
        bibtex,
        authorId: parseInt(session.user.id),
        status:   'draft',
      },
    })

    return NextResponse.json({ dataset }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}