// import { NextResponse } from 'next/server'
// import { getServerSession } from 'next-auth'
// import { authOptions } from '@/app/api/auth/[...nextauth]/route'
// import prisma from '@/lib/prisma'

// export async function PATCH(req, { params }) {
//   try {
//     const session = await getServerSession(authOptions)
//     if (
//       session?.user?.role !== 'admin' &&
//       session?.user?.role !== 'linguiste'
//     ) {
//       return NextResponse.json({ message: 'Non autorisé' }, { status: 403 })
//     }

//     const { id } = await params
//     const { action, rejectReason } = await req.json()
//     const validatorId = parseInt(session.user.id)

//     if (action === 'validate') {
//       const recording = await prisma.voiceRecording.update({
//         where: { id: parseInt(id) },
//         data: {
//           status: 'validated',
//           validatedBy: validatorId,
//           validatedAt: new Date(),
//         },
//       })

//       // Incrémenter le compteur de la phrase
//       await prisma.voicePhrase.update({
//         where: { id: recording.phraseId },
//         data: {
//           recordingCount: { increment: 1 },
//           // Si 3 enregistrements validés → completed
//           status: recording.recordingCount + 1 >= 3 ? 'completed' : 'active',
//         },
//       })

//       return NextResponse.json({ recording })
//     }

//     if (action === 'reject') {
//       const recording = await prisma.voiceRecording.update({
//         where: { id: parseInt(id) },
//         data: {
//           status: 'rejected',
//           rejectReason: rejectReason || 'Qualité insuffisante',
//           validatedBy: validatorId,
//           validatedAt: new Date(),
//         },
//       })
//       return NextResponse.json({ recording })
//     }

//     return NextResponse.json({ message: 'Action invalide' }, { status: 400 })
//   } catch (error) {
//     return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
//   }
// }

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'
import { awardPoints } from '@/lib/gamification' // ✅ Ajouter cet import

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (
      session?.user?.role !== 'admin' &&
      session?.user?.role !== 'linguiste'
    ) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 403 })
    }

    const { id } = await params
    const { action, rejectReason } = await req.json()
    const validatorId = parseInt(session.user.id)

    if (action === 'validate') {
      const recording = await prisma.voiceRecording.update({
        where: { id: parseInt(id) },
        data: {
          status: 'validated',
          validatedBy: validatorId,
          validatedAt: new Date(),
        },
      })

      await prisma.voicePhrase.update({
        where: { id: recording.phraseId },
        data: {
          recordingCount: { increment: 1 },
          status: recording.recordingCount + 1 >= 3 ? 'completed' : 'active',
        },
      })

      // ✅ Attribuer les points à l'auteur de l'enregistrement
      await awardPoints(recording.userId, 'voice', recording.id)

      return NextResponse.json({ recording })
    }

    if (action === 'reject') {
      const recording = await prisma.voiceRecording.update({
        where: { id: parseInt(id) },
        data: {
          status: 'rejected',
          rejectReason: rejectReason || 'Qualité insuffisante',
          validatedBy: validatorId,
          validatedAt: new Date(),
        },
      })
      return NextResponse.json({ recording })
    }

    return NextResponse.json({ message: 'Action invalide' }, { status: 400 })
  } catch (error) {
    console.error(error) // ✅ Logger l'erreur pour déboguer
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}
