// src/app/api/datasets/route.js
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const search   = searchParams.get('search')
    const domain   = searchParams.get('domain')
    const language = searchParams.get('language')
    const limit    = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
    const offset   = parseInt(searchParams.get('offset') || '0')

    const where = {
      status: 'published',
      ...(domain   && domain   !== 'all' && { domain }),
      ...(language && language !== 'all' && { language }),
      ...(search && {
        OR: [
          { title:   { contains: search } },
          { excerpt: { contains: search } },
        ],
      }),
    }

    const [datasets, total] = await Promise.all([
      prisma.dataset.findMany({
        where,
        select: {
          id:          true,
          title:       true,
          slug:        true,
          excerpt:     true,
          coverImage:  true,
          tags:        true,
          language:    true,
          domain:      true,
          license:     true,
          format:      true,
          version:     true,
          numExamples: true,
          sizeInMb:    true,
          numDownloads:true,
          downloadType:true,
          publishedAt: true,
          author: { select: { name: true } },
        },
        orderBy: { publishedAt: 'desc' },
        take:   limit,
        skip:   offset,
      }),
      prisma.dataset.count({ where }),
    ])

    return NextResponse.json({ datasets, total, limit, offset, hasMore: offset + limit < total })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}