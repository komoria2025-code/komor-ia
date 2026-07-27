import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

// export async function GET(req) {
//   try {
//     const { searchParams } = new URL(req.url)
//     const status = searchParams.get('status')
//     const isPublic = searchParams.get('public')

//     const where = {}
//     if (status) where.status = status
//     if (isPublic === 'true') where.isPublic = true

//     const models = await prisma.modele.findMany({
//       where,
//       orderBy: { createdAt: 'desc' },
//     })

//     // ✅ PAS de JSON.parse - Prisma retourne déjà des objets
//     return NextResponse.json({
//       success: true,
//       models: models,
//       count: models.length,
//     })
//   } catch (error) {
//     console.error('Erreur GET /api/models:', error)
//     return NextResponse.json(
//       {
//         success: false,
//         message: 'Erreur serveur',
//         error:
//           process.env.NODE_ENV === 'development' ? error.message : undefined,
//       },
//       { status: 500 },
//     )
//   }
// }
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const status   = searchParams.get('status')
    const isPublic = searchParams.get('public')

    const where = {}

    // ✅ Supporter les valeurs multiples : "production,beta"
    if (status) {
      where.status = status.includes(',')
        ? { in: status.split(',') }
        : status
    }

    if (isPublic === 'true') where.isPublic = true

    const models = await prisma.modele.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      models,
      count: models.length,
    })
  } catch (error) {
    console.error('Erreur GET /api/models:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Erreur serveur',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Non authentifié' },
        { status: 401 },
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
    })

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Non autorisé' },
        { status: 403 },
      )
    }

    const body = await req.json()
    const { name, slug, description, domaine, version } = body

    if (!name || !slug || !description || !domaine || !version) {
      return NextResponse.json(
        { success: false, message: 'Champs requis manquants' },
        { status: 400 },
      )
    }

    const model = await prisma.modele.create({
      data: {
        name,
        slug,
        description,
        domaine,
        version,
        status: body.status || 'development',
        endpoint: body.endpoint || null,
        icon: body.icon || 'Brain',
        color: body.color || 'blue',
        isPublic: body.isPublic !== false,
        features: body.features || null,
        pricing: body.pricing || null,
      },
    })

    return NextResponse.json({ success: true, model }, { status: 201 })
  } catch (error) {
    console.error('Erreur POST /api/models:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur serveur', error: error.message },
      { status: 500 },
    )
  }
}
// export async function POST(req) {
//   try {
//     const body = await req.json()
//     const { name, slug, description, domaine, version } = body

//     if (!name || !slug || !description || !domaine || !version) {
//       return NextResponse.json(
//         { success: false, message: 'Champs requis manquants' },
//         { status: 400 },
//       )
//     }

//     const model = await prisma.modele.create({
//       data: {
//         name,
//         slug,
//         description,
//         domaine,
//         version,
//         status: body.status || 'development',
//         endpoint: body.endpoint || null,
//         icon: body.icon || 'Brain',
//         color: body.color || 'blue',
//         isPublic: body.isPublic !== false,
//         features: body.features || null, // ✅ Pas de JSON.stringify
//         pricing: body.pricing || null, // ✅ Pas de JSON.stringify
//       },
//     })

//     return NextResponse.json({ success: true, model }, { status: 201 })
//   } catch (error) {
//     console.error('Erreur POST /api/models:', error)
//     return NextResponse.json(
//       { success: false, message: 'Erreur serveur', error: error.message },
//       { status: 500 },
//     )
//   }
// }

// import prisma from '@/lib/prisma'
// import { NextResponse } from 'next/server'

// /**
//  * GET /api/models
//  * Récupère la liste des modèles disponibles
//  */
// export async function GET(req) {
//   try {
//     const { searchParams } = new URL(req.url)
//     const status = searchParams.get('status') // production, beta, development
//     const isPublic = searchParams.get('public') === 'true'

//     // Construction de la requête
//     const where = {}
//     if (status) where.status = status
//     if (isPublic !== undefined) where.isPublic = isPublic

//     const models = await prisma.modele.findMany({
//       where,
//       orderBy: {
//         createdAt: 'desc',
//       },
//       select: {
//         id: true,
//         name: true,
//         slug: true,
//         description: true,
//         domaine: true,
//         version: true,
//         status: true,
//         icon: true,
//         color: true,
//         isPublic: true,
//         features: true,
//         pricing: true,
//         createdAt: true,
//       },
//     })

//     // Parser les champs JSON
//     const modelsWithParsedJson = models.map((model) => ({
//       ...model,
//       features: model.features ? JSON.parse(model.features) : null,
//       pricing: model.pricing ? JSON.parse(model.pricing) : null,
//     }))

//     return NextResponse.json({
//       success: true,
//       models: modelsWithParsedJson,
//       count: modelsWithParsedJson.length,
//     })
//   } catch (error) {
//     console.error('Erreur lors de la récupération des modèles:', error)

//     return NextResponse.json(
//       {
//         success: false,
//         message: 'Erreur lors de la récupération des modèles.',
//         error:
//           process.env.NODE_ENV === 'development' ? error.message : undefined,
//       },
//       { status: 500 },
//     )
//   }
// }

// /**
//  * POST /api/models
//  * Crée un nouveau modèle (admin uniquement)
//  */
// export async function POST(req) {
//   try {
//     const body = await req.json()
//     const {
//       name,
//       slug,
//       description,
//       domaine,
//       version,
//       status = 'development',
//       endpoint,
//       icon,
//       color,
//       isPublic = false,
//       features,
//       pricing,
//     } = body

//     // Validation
//     if (!name || !slug || !description || !domaine || !version) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             'Les champs name, slug, description, domaine et version sont requis.',
//         },
//         { status: 400 },
//       )
//     }

//     // Vérifier que le slug est unique
//     const existingModel = await prisma.modele.findUnique({
//       where: { slug },
//     })

//     if (existingModel) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: 'Un modèle avec ce slug existe déjà.',
//         },
//         { status: 400 },
//       )
//     }

//     // Créer le modèle
//     const model = await prisma.modele.create({
//       data: {
//         name,
//         slug,
//         description,
//         domaine,
//         version,
//         status,
//         endpoint,
//         icon,
//         color,
//         isPublic,
//         features: features ? JSON.stringify(features) : null,
//         pricing: pricing ? JSON.stringify(pricing) : null,
//       },
//     })

//     return NextResponse.json(
//       {
//         success: true,
//         model: {
//           ...model,
//           features: model.features ? JSON.parse(model.features) : null,
//           pricing: model.pricing ? JSON.parse(model.pricing) : null,
//         },
//         message: 'Modèle créé avec succès.',
//       },
//       { status: 201 },
//     )
//   } catch (error) {
//     console.error('Erreur lors de la création du modèle:', error)

//     return NextResponse.json(
//       {
//         success: false,
//         message: 'Erreur lors de la création du modèle.',
//         error:
//           process.env.NODE_ENV === 'development' ? error.message : undefined,
//       },
//       { status: 500 },
//     )
//   }
// }
