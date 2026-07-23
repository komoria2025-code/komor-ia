// src/app/api/datasets/[slug]/route.js
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req, { params }) {
  try {
    const { slug } = await params

    const dataset = await prisma.dataset.findUnique({
      where:  { slug },
      include: { author: { select: { name: true, image: true } } },
    })

    if (!dataset || dataset.status !== 'published') {
      return NextResponse.json({ message: 'Dataset non trouvé' }, { status: 404 })
    }

    // Incrémenter les vues (non bloquant)
    prisma.dataset.update({
      where: { slug },
      data:  { numDownloads: { increment: 0 } }, // juste pour les vues — on incrémente downloads au clic
    }).catch(() => {})

    return NextResponse.json({ dataset })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}