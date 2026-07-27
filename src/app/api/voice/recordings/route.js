import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Non authentifié' }, { status: 401 })
    }

    const userId = parseInt(session.user.id)
    const body = await req.json()
    const {
      phraseId,
      audioUrl,
      publicId,
      duration,
      dialecte,
      genre,
      trancheAge,
      zone,
      ile,
      nativeSpeaker,
    } = body

    if (!phraseId || !audioUrl || !publicId) {
      return NextResponse.json(
        { message: 'Données manquantes' },
        { status: 400 },
      )
    }

    // Vérifier que la phrase existe et est disponible
    const phrase = await prisma.voicePhrase.findUnique({
      where: { id: parseInt(phraseId) },
    })

    if (!phrase || phrase.status !== 'active' || phrase.recordingCount >= 3) {
      return NextResponse.json(
        { message: 'Phrase non disponible' },
        { status: 400 },
      )
    }

    // Vérifier que l'utilisateur n'a pas déjà enregistré cette phrase
    const existing = await prisma.voiceRecording.findUnique({
      where: { phraseId_userId: { phraseId: parseInt(phraseId), userId } },
    })

    if (existing) {
      return NextResponse.json(
        { message: 'Vous avez déjà enregistré cette phrase' },
        { status: 400 },
      )
    }

    // Créer l'enregistrement
    const recording = await prisma.voiceRecording.create({
      data: {
        phraseId: parseInt(phraseId),
        userId,
        audioUrl,
        publicId,
        duration: duration || 0,
        dialecte: dialecte || 'shingazidja',
        genre: genre || null,
        trancheAge: trancheAge || null,
        zone: zone || null,
        ile: ile || null,
        nativeSpeaker: nativeSpeaker !== false,
        status: 'pending',
      },
    })

    return NextResponse.json({ recording }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Non authentifié' }, { status: 401 })
    }

    const recordings = await prisma.voiceRecording.findMany({
      where: { userId: parseInt(session.user.id) },
      include: { phrase: { select: { text: true, dialecte: true } } },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ recordings })
  } catch (error) {
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Non authentifié' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const recordingId = parseInt(searchParams.get('id'))
    const userId = parseInt(session.user.id)

    // Vérifier que l'enregistrement appartient à cet user ET est rejeté
    const recording = await prisma.voiceRecording.findUnique({
      where: { id: recordingId },
    })

    if (!recording || recording.userId !== userId) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 403 })
    }

    if (recording.status !== 'rejected') {
      return NextResponse.json(
        { message: 'Seuls les enregistrements rejetés peuvent être supprimés' },
        { status: 400 },
      )
    }

    // Supprimer de Cloudinary
    if (recording.publicId) {
      try {
        const { v2: cloudinary } = await import('cloudinary')
        cloudinary.config({
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET,
        })
        await cloudinary.uploader.destroy(recording.publicId, {
          resource_type: 'video',
        })
      } catch (e) {
        console.error('Erreur suppression Cloudinary:', e)
      }
    }

    // Supprimer de la DB
    await prisma.voiceRecording.delete({ where: { id: recordingId } })

    return NextResponse.json({ message: 'Enregistrement supprimé' })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}
