// src/app/api/datasets/[slug]/download/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(req, { params }) {
  try {
    // ✅ Connexion requise pour télécharger
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Connexion requise pour télécharger' }, { status: 401 })
    }

    const { slug } = await params

    const dataset = await prisma.dataset.findUnique({
      where:  { slug },
      select: {
        id:          true,
        downloadType:true,
        downloadUrl: true,
        fileUrl:     true,
        status:      true,
      },
    })

    if (!dataset || dataset.status !== 'published') {
      return NextResponse.json({ message: 'Dataset non trouvé' }, { status: 404 })
    }

    // Incrémenter le compteur
    await prisma.dataset.update({
      where: { slug },
      data:  { numDownloads: { increment: 1 } },
    })

    // Retourner les URLs selon le type
    return NextResponse.json({
      downloadType: dataset.downloadType,
      downloadUrl:  dataset.downloadUrl || null,
      fileUrl:      dataset.fileUrl     || null,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}