// src/app/api/auth/forgot-password/route.js
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/email'
import crypto from 'crypto'

export async function POST(req) {
  try {
    const { email } = await req.json()
    if (!email) {
      return NextResponse.json({ message: 'Email requis' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })

    // ✅ Toujours retourner 200 même si l'email n'existe pas (sécurité)
    // if (!user || !user.hashPassword) {
    //   return NextResponse.json({
    //     message: 'Si cet email existe, un lien de réinitialisation a été envoyé.'
    //   })
    // }
     if (!user) {
  return NextResponse.json({ message: 'Si cet email existe, un lien a été envoyé.' })
}

    // Supprimer les anciens tokens de cet utilisateur
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } })

    // Créer un nouveau token
    const token     = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 3600 * 1000) // 1h

    await prisma.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt },
    })

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`

    await sendPasswordResetEmail({
      to:       user.email,
      name:     user.name,
      resetUrl,
    })

    return NextResponse.json({
      message: 'Si cet email existe, un lien de réinitialisation a été envoyé.'
    })
  } catch (error) {
    console.error('Erreur forgot-password:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}
// export async function POST(req) {
//   try {
//     const { email } = await req.json()
//     console.log('1️⃣ Email reçu:', email)

//     const user = await prisma.user.findUnique({ where: { email } })
//     console.log('2️⃣ User trouvé:', user ? 'OUI' : 'NON', '| hashPassword:', !!user?.hashPassword)

//     // if (!user || !user.hashPassword) {
//     //   console.log('3️⃣ User non trouvé ou sans password → retour 200 silencieux')
//     //   return NextResponse.json({ message: 'Si cet email existe, un lien a été envoyé.' })
//     // }
//     if (!user) {
//   return NextResponse.json({ message: 'Si cet email existe, un lien a été envoyé.' })
// }

//     console.log('4️⃣ Suppression anciens tokens...')
//     await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } })

//     console.log('5️⃣ Création token...')
//     const token     = crypto.randomBytes(32).toString('hex')
//     const expiresAt = new Date(Date.now() + 3600 * 1000)
//     await prisma.passwordResetToken.create({ data: { userId: user.id, token, expiresAt } })

//     console.log('6️⃣ Envoi email vers:', user.email)
//     await sendPasswordResetEmail({ to: user.email, name: user.name, resetUrl: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}` })

//     console.log('7️⃣ Email envoyé avec succès !')
//     return NextResponse.json({ message: 'Si cet email existe, un lien a été envoyé.' })
//   } catch (error) {
//     console.error('❌ ERREUR:', error)
//     return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
//   }
// }