// import { NextResponse } from 'next/server'
// import { getServerSession } from 'next-auth'
// import { authOptions } from '@/lib/auth'
// import prisma from '@/lib/prisma'

// export async function POST(req, { params }) {
//   try {
//     const session = await getServerSession(authOptions)

//     if (!session?.user?.id) {
//       return NextResponse.json({ message: 'Non authentifié' }, { status: 401 })
//     }

//     const user = await prisma.user.findUnique({
//       where: { id: parseInt(session.user.id) },
//     })

//     if (user.role !== 'admin') {
//       return NextResponse.json({ message: 'Non autorisé' }, { status: 403 })
//     }

//     const { id } = params
//     const { quality, notes } = await req.json()

//     const translation = await prisma.translation.update({
//       where: { id: parseInt(id) },
//       data: {
//         status: 'verified',
//         quality: quality || 5,
//         verifiedBy: user.id,
//         verifiedAt: new Date(),
//         ...(notes && { notes }),
//       },
//     })

//     return NextResponse.json({ translation })
//   } catch (error) {
//     console.error('Erreur:', error)
//     return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
//   }
// }

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { awardPoints } from '@/lib/gamification' // ✅

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Non authentifié' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
    })

    if (user.role !== 'admin') {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 403 })
    }

    const { id } = params
    const { quality, notes } = await req.json()

    const translation = await prisma.translation.update({
      where: { id: parseInt(id) },
      data: {
        status: 'verified',
        quality: quality || 5,
        verifiedBy: user.id,
        verifiedAt: new Date(),
        ...(notes && { notes }),
      },
      include: {
        article: { select: { contentType: true } }, // ✅ Pour déterminer l'action
      },
    })

    // ✅ Attribuer les points au traducteur (pas à l'admin)
    let gamificationResult = null
    try {
      const action =
        translation.article.contentType === 'sentence'
          ? 'sentence'
          : translation.article.contentType === 'paragraph'
            ? 'paragraph'
            : 'article'

      gamificationResult = await awardPoints(
        translation.userId,
        action,
        translation.id,
      )
    } catch (e) {
      console.error('Erreur gamification:', e)
      // Ne pas bloquer la validation si la gamification échoue
    }

    return NextResponse.json({ translation, gamification: gamificationResult })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}
