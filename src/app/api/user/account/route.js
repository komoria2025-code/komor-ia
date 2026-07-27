// src/app/api/user/account/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Non authentifié' }, { status: 401 })
    }

    const { password } = await req.json()
    const userId = parseInt(session.user.id)

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ message: 'Utilisateur non trouvé' }, { status: 404 })
    }

    // Si compte avec mot de passe → vérifier
    if (user.hashPassword) {
      if (!password) {
        return NextResponse.json({ message: 'Mot de passe requis pour supprimer le compte' }, { status: 400 })
      }
      const isValid = await bcrypt.compare(password, user.hashPassword)
      if (!isValid) {
        return NextResponse.json({ message: 'Mot de passe incorrect' }, { status: 400 })
      }
    }

    // Supprimer l'utilisateur (cascade supprime tout le reste)
    await prisma.user.delete({ where: { id: userId } })

    return NextResponse.json({ message: 'Compte supprimé avec succès' })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}
