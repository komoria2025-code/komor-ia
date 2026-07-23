// src/app/api/admin/datasets/[id]/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

async function checkAdmin(session) {
  if (!session?.user?.id) return false
  const user = await prisma.user.findUnique({ where: { id: parseInt(session.user.id) } })
  return user?.role === 'admin'
}

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!await checkAdmin(session)) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 403 })
    }

    const { id } = await params
    const body   = await req.json()

    // Si on publie → enregistrer la date
    if (body.status === 'published') {
      body.publishedAt = new Date()
    }

    // Sérialiser les JSON si présents
    if (body.tags        && Array.isArray(body.tags))        body.tags        = JSON.stringify(body.tags)
    if (body.previewData && Array.isArray(body.previewData)) body.previewData = JSON.stringify(body.previewData)

    const dataset = await prisma.dataset.update({
      where: { id: parseInt(id) },
      data:  body,
    })

    return NextResponse.json({ dataset })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!await checkAdmin(session)) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 403 })
    }

    const { id } = await params
    await prisma.dataset.delete({ where: { id: parseInt(id) } })

    return NextResponse.json({ message: 'Dataset supprimé' })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}