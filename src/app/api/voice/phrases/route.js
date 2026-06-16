import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Non authentifié' }, { status: 401 })
    }

    const userId = parseInt(session.user.id)
    const { searchParams } = new URL(req.url)
    const dialecte = searchParams.get('dialecte') || 'shingazidja'

    // ✅ Exclure seulement les phrases avec enregistrement pending ou validated
    // Les rejected sont ignorés → la phrase redevient disponible
    const alreadyRecorded = await prisma.voiceRecording.findMany({
      where: {
        userId,
        status: { in: ['pending', 'validated'] }, // ← CHANGEMENT CLÉ
      },
      select: { phraseId: true },
    })
    const recordedIds = alreadyRecorded.map((r) => r.phraseId)

    const phrases = await prisma.voicePhrase.findMany({
      where: {
        status: 'active',
        dialecte,
        id: { notIn: recordedIds.length > 0 ? recordedIds : [-1] },
        recordingCount: { lt: 3 },
      },
      select: {
        id: true,
        text: true,
        translation: true,
        dialecte: true,
        difficulty: true,
        recordingCount: true,
        maxRecordings: true,
      },
    })

    if (phrases.length === 0) {
      return NextResponse.json({
        phrase: null,
        message: 'Aucune phrase disponible',
      })
    }

    const phrase = phrases[Math.floor(Math.random() * phrases.length)]
    return NextResponse.json({ phrase })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}
// import { NextResponse } from 'next/server'
// import { getServerSession } from 'next-auth'
// import { authOptions } from '@/app/api/auth/[...nextauth]/route'
// import prisma from '@/lib/prisma'

// export async function GET(req) {
//   try {
//     const session = await getServerSession(authOptions)
//     if (!session?.user?.id) {
//       return NextResponse.json({ message: 'Non authentifié' }, { status: 401 })
//     }

//     const userId = parseInt(session.user.id)
//     const { searchParams } = new URL(req.url)
//     const dialecte = searchParams.get('dialecte') || 'shingazidja'

//     // Phrases déjà enregistrées par cet utilisateur
//     const alreadyRecorded = await prisma.voiceRecording.findMany({
//       where: { userId },
//       select: { phraseId: true },
//     })
//     const recordedIds = alreadyRecorded.map((r) => r.phraseId)

//     // Phrase aléatoire disponible
//     const phrases = await prisma.voicePhrase.findMany({
//       where: {
//         status: 'active',
//         dialecte,
//         id: { notIn: recordedIds.length > 0 ? recordedIds : [-1] },
//         recordingCount: { lt: 3 },
//       },
//       select: {
//         id: true,
//         text: true,
//         translation: true,
//         dialecte: true,
//         difficulty: true,
//         recordingCount: true,
//         maxRecordings: true,
//       },
//     })

//     if (phrases.length === 0) {
//       return NextResponse.json({
//         phrase: null,
//         message: 'Aucune phrase disponible',
//       })
//     }

//     // Choisir une phrase aléatoire
//     const phrase = phrases[Math.floor(Math.random() * phrases.length)]
//     return NextResponse.json({ phrase })
//   } catch (error) {
//     console.error(error)
//     return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
//   }
// }
