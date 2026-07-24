// src/app/api/auth/reset-password/route.js
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json({ message: 'Token et mot de passe requis' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ message: 'Le mot de passe doit contenir au moins 8 caractères' }, { status: 400 })
    }

    // Vérifier le token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where:   { token },
      include: { user: true },
    })

    if (!resetToken) {
      return NextResponse.json({ message: 'Lien invalide ou déjà utilisé' }, { status: 400 })
    }
    if (new Date() > resetToken.expiresAt) {
      await prisma.passwordResetToken.delete({ where: { token } })
      return NextResponse.json({ message: 'Lien expiré — veuillez refaire une demande' }, { status: 400 })
    }

    // Mettre à jour le mot de passe
    const hash = await bcrypt.hash(password, 12)
    await prisma.user.update({
      where: { id: resetToken.userId },
      data:  { hashPassword: hash },
    })

    // Supprimer le token utilisé
    await prisma.passwordResetToken.delete({ where: { token } })

    return NextResponse.json({ message: 'Mot de passe réinitialisé avec succès' })
  } catch (error) {
    console.error('Erreur reset-password:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}