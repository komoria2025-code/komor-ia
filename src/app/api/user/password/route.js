// src/app/api/user/password/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Non authentifié' }, { status: 401 })
    }

    const { currentPassword, newPassword } = await req.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ message: 'Tous les champs sont requis' }, { status: 400 })
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ message: 'Le nouveau mot de passe doit contenir au moins 8 caractères' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
    })

    if (!user?.hashPassword) {
      return NextResponse.json({ message: 'Compte sans mot de passe (connexion Google)' }, { status: 400 })
    }

    const isValid = await bcrypt.compare(currentPassword, user.hashPassword)
    if (!isValid) {
      return NextResponse.json({ message: 'Mot de passe actuel incorrect' }, { status: 400 })
    }

    const hash = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({
      where: { id: user.id },
      data:  { hashPassword: hash },
    })

    return NextResponse.json({ message: 'Mot de passe modifié avec succès' })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}