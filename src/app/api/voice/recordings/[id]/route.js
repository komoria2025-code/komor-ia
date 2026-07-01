// src/app/api/admin/voice/recordings/[id]/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'
import { v2 as cloudinary } from 'cloudinary'
import { awardPoints } from '@/lib/gamification'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    const role = session?.user?.role
    if (role !== 'admin' && role !== 'linguiste') {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 403 })
    }

    const { id } = await params
    const { action, rejectReason } = await req.json()

    if (!['validate', 'reject'].includes(action)) {
      return NextResponse.json({ message: 'Action invalide' }, { status: 400 })
    }

    const recording = await prisma.voiceRecording.findUnique({
      where: { id: parseInt(id) },
    })

    if (!recording) {
      return NextResponse.json(
        { message: 'Enregistrement non trouvé' },
        { status: 404 },
      )
    }

    const updatedRecording = await prisma.voiceRecording.update({
      where: { id: parseInt(id) },
      data: {
        status: action === 'validate' ? 'validated' : 'rejected',
        validatedBy: parseInt(session.user.id),
        validatedAt: new Date(),
        rejectReason: action === 'reject' ? rejectReason : null,
      },
    })

    // ✅ Attribuer les points au contributeur si validé
    let gamificationResult = null
    if (action === 'validate') {
      // Incrémenter le compteur de la phrase
      const phrase = await prisma.voicePhrase.update({
        where: { id: recording.phraseId },
        data: { recordingCount: { increment: 1 } },
      })

      // Marquer la phrase comme complète si quota atteint
      if (phrase.recordingCount >= phrase.maxRecordings) {
        await prisma.voicePhrase.update({
          where: { id: recording.phraseId },
          data: { status: 'completed' },
        })
      }

      // ✅ Points pour le contributeur (pas le validateur)
      gamificationResult = await awardPoints(
        recording.userId,
        'voice',
        recording.id,
      )
    }

    // Si rejeté, supprimer de Cloudinary
    if (action === 'reject' && recording.publicId) {
      try {
        await cloudinary.uploader.destroy(recording.publicId, {
          resource_type: 'video',
        })
      } catch (e) {
        console.error('Erreur suppression Cloudinary:', e)
      }
    }

    return NextResponse.json({
      recording: updatedRecording,
      gamification: gamificationResult,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}
