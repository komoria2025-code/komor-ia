import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

// PATCH - Mettre à jour un utilisateur
export async function PATCH(req, { params }) {
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

    const { id } = await params
    const body = await req.json()
    const { role, name, email } = body

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        ...(role && { role }),
        ...(name && { name }),
        ...(email && { email }),
      },
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE - Supprimer un utilisateur
export async function DELETE(req, { params }) {
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

    // Empêcher de se supprimer soi-même
    if (parseInt(id) === user.id) {
      return NextResponse.json(
        { message: 'Vous ne pouvez pas vous supprimer vous-même' },
        { status: 400 },
      )
    }

    await prisma.user.delete({
      where: { id: parseInt(id) },
    })

    return NextResponse.json({ message: 'Utilisateur supprimé' })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}
