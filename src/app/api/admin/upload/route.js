// import { NextResponse } from 'next/server'
// import { getServerSession } from 'next-auth'
// import { authOptions } from '@/lib/auth'
// import { v2 as cloudinary } from 'cloudinary'

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// })

// export async function POST(req) {
//   try {
//     const session = await getServerSession(authOptions)
//     if (session?.user?.role !== 'admin') {
//       return NextResponse.json({ message: 'Non autorisé' }, { status: 403 })
//     }

//     const formData = await req.formData()
//     const file = formData.get('file')

//     if (!file) {
//       return NextResponse.json({ message: 'Aucun fichier' }, { status: 400 })
//     }

//     // Convertir en buffer
//     const bytes = await file.arrayBuffer()
//     const buffer = Buffer.from(bytes)

//     // Upload vers Cloudinary
//     const result = await new Promise((resolve, reject) => {
//       cloudinary.uploader
//         .upload_stream(
//           {
//             folder: 'komor-ia/blogs',
//             resource_type: 'image',
//             transformation: [
//               { width: 1200, height: 630, crop: 'fill', quality: 'auto' },
//             ],
//           },
//           (error, result) => {
//             if (error) reject(error)
//             else resolve(result)
//           },
//         )
//         .end(buffer)
//     })

//     return NextResponse.json({
//       url: result.secure_url,
//       publicId: result.public_id,
//     })
//   } catch (error) {
//     console.error('Upload error:', error)
//     return NextResponse.json({ message: 'Erreur upload' }, { status: 500 })
//   }
// }

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 403 })
    }

    const formData = await req.formData()
    const file = formData.get('file')

    if (!file) {
      return NextResponse.json({ message: 'Aucun fichier' }, { status: 400 })
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { message: 'Le fichier doit être une image' },
        { status: 400 },
      )
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { message: 'Image trop lourde (max 5MB)' },
        { status: 400 },
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'komor-ia/blogs',
          resource_type: 'image',
          // ✅ Transformations séparées comme dans votre ancien projet
          transformation: [
            { width: 1200, height: 630, crop: 'limit' },
            { quality: 'auto:good' },
            { fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        },
      )
      uploadStream.end(buffer)
    })

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { message: "Erreur lors de l'upload", error: error.message },
      { status: 500 },
    )
  }
}

export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const publicId = searchParams.get('publicId')

    if (!publicId) {
      return NextResponse.json({ message: 'publicId requis' }, { status: 400 })
    }

    await cloudinary.uploader.destroy(publicId)

    return NextResponse.json({ success: true, message: 'Image supprimée' })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ message: 'Erreur suppression' }, { status: 500 })
  }
}
