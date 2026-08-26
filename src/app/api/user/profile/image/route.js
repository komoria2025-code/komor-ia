import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { v2 as cloudinary } from 'cloudinary'
import prisma from '@/lib/prisma'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ message: 'Non authentifié' }, { status: 401 })

    const formData = await req.formData()
    const file = formData.get('file')
    if (!file || !file.type?.startsWith('image/')) {
      return NextResponse.json({ message: 'Veuillez sélectionner une image' }, { status: 400 })
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ message: 'Image trop lourde (maximum 5 Mo)' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'komor-ia/profiles', resource_type: 'image', transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }, { quality: 'auto:good', fetch_format: 'auto' }] },
        (error, uploadResult) => error ? reject(error) : resolve(uploadResult),
      )
      stream.end(buffer)
    })

    await prisma.user.update({ where: { id: parseInt(session.user.id) }, data: { image: result.secure_url } })
    return NextResponse.json({ image: result.secure_url })
  } catch (error) {
    console.error('Erreur upload photo profil:', error)
    return NextResponse.json({ message: "Erreur lors de l'upload" }, { status: 500 })
  }
}