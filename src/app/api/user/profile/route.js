import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

/**
 * GET /api/user/profile
 * Récupérer le profil de l'utilisateur
 */
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Non authentifié' }, { status: 401 })
    }

    const userId = parseInt(session.user.id)

    // Récupérer l'utilisateur avec son profil
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profil: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { message: 'Utilisateur non trouvé' },
        { status: 404 },
      )
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
      },
      profil: user.profil,
    })
  } catch (error) {
    console.error('Erreur GET /api/user/profile:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}

/**
 * PUT /api/user/profile
 * Mettre à jour le profil et les infos utilisateur
 */
export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Non authentifié' }, { status: 401 })
    }

    const userId = parseInt(session.user.id)
    const body = await req.json()

    const { name, bio, location, website, phone, status } = body

    // Mettre à jour le nom de l'utilisateur
    const updateUserData = {}
    if (name !== undefined) updateUserData.name = name

    if (Object.keys(updateUserData).length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: updateUserData,
      })
    }

    // Mettre à jour ou créer le profil
    const profilData = {}
    if (bio !== undefined) profilData.bio = bio
    if (location !== undefined) profilData.location = location
    if (website !== undefined) profilData.website = website
    if (phone !== undefined) profilData.phone = phone
    if (status !== undefined) profilData.status = status

    const profil = await prisma.profil.upsert({
      where: { userId },
      update: profilData,
      create: {
        userId,
        ...profilData,
      },
    })

    // Récupérer les données mises à jour
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { profil: true },
    })

    return NextResponse.json({
      message: 'Profil mis à jour avec succès',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        image: updatedUser.image,
      },
      profil: updatedUser.profil,
    })
  } catch (error) {
    console.error('Erreur PUT /api/user/profile:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}
