import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import crypto from 'crypto'

/**
 * GET /api/user/api-keys
 * Récupérer UNIQUEMENT les clés API de l'utilisateur connecté
 */
export async function GET(req) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Non authentifié' }, { status: 401 })
    }

    // Récupérer UNIQUEMENT les clés de cet utilisateur
    const apiKeys = await prisma.apiKey.findMany({
      where: {
        userId: parseInt(session.user.id), // ✅ FILTRE PAR USER
      },
      include: {
        modele: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
            color: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ apiKeys }, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la récupération des clés API:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}

/**
 * POST /api/user/api-keys
 * Créer une nouvelle clé API pour l'utilisateur connecté
 */
export async function POST(req) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Non authentifié' }, { status: 401 })
    }

    const body = await req.json()
    const { name, modeleId } = body

    // Validation
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { message: 'Le nom est requis' },
        { status: 400 },
      )
    }

    // Vérifier que le modèle existe (si spécifié)
    if (modeleId) {
      const modele = await prisma.modele.findUnique({
        where: { id: parseInt(modeleId) },
      })

      if (!modele) {
        return NextResponse.json(
          { message: 'Modèle invalide' },
          { status: 400 },
        )
      }
    }

    // Vérifier le nombre de clés existantes pour cet utilisateur
    const existingKeysCount = await prisma.apiKey.count({
      where: {
        userId: parseInt(session.user.id),
        isActive: true,
      },
    })

    // Limite : 10 clés par utilisateur (ajustable)
    if (existingKeysCount >= 10) {
      return NextResponse.json(
        {
          message:
            'Limite de 10 clés API atteinte. Supprimez une clé existante.',
        },
        { status: 400 },
      )
    }

    // Générer une clé unique
    let apiKey
    let isUnique = false
    let attempts = 0

    while (!isUnique && attempts < 5) {
      apiKey = `kmia_${crypto.randomBytes(24).toString('hex')}`

      const existing = await prisma.apiKey.findUnique({
        where: { key: apiKey },
      })

      if (!existing) {
        isUnique = true
      }
      attempts++
    }

    if (!isUnique) {
      return NextResponse.json(
        { message: 'Impossible de générer une clé unique. Réessayez.' },
        { status: 500 },
      )
    }

    // Créer la clé API pour CET utilisateur
    const newApiKey = await prisma.apiKey.create({
      data: {
        key: apiKey,
        name: name.trim(),
        userId: parseInt(session.user.id), // ✅ LIÉE À L'USER
        modeleId: modeleId ? parseInt(modeleId) : null,
        isActive: true,
        rateLimit: 1000, // 1000 requêtes par défaut
      },
      include: {
        modele: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
            color: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        message: 'Clé API créée avec succès',
        apiKey: newApiKey,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Erreur lors de la création de la clé API:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}

/**
 * DELETE /api/user/api-keys
 * Supprimer une clé API (seulement si elle appartient à l'utilisateur)
 */
export async function DELETE(req) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Non authentifié' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const keyId = searchParams.get('id')

    if (!keyId) {
      return NextResponse.json({ message: 'ID de clé requis' }, { status: 400 })
    }

    // Vérifier que la clé appartient bien à l'utilisateur
    const apiKey = await prisma.apiKey.findUnique({
      where: { id: parseInt(keyId) },
    })

    if (!apiKey) {
      return NextResponse.json(
        { message: 'Clé API non trouvée' },
        { status: 404 },
      )
    }

    // ✅ VÉRIFICATION DE PROPRIÉTÉ
    if (apiKey.userId !== parseInt(session.user.id)) {
      return NextResponse.json(
        { message: 'Vous ne pouvez supprimer que vos propres clés' },
        { status: 403 },
      )
    }

    // Supprimer la clé
    await prisma.apiKey.delete({
      where: { id: parseInt(keyId) },
    })

    return NextResponse.json(
      { message: 'Clé API supprimée avec succès' },
      { status: 200 },
    )
  } catch (error) {
    console.error('Erreur lors de la suppression de la clé API:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}
// import { NextResponse } from 'next/server'
// import crypto from 'crypto'
// import prisma from '@/lib/prisma'

// /**
//  * Génère une clé API unique et sécurisée
//  */
// function generateApiKey() {
//   const prefix = 'kmia_' // Komor-IA prefix
//   const randomBytes = crypto.randomBytes(24).toString('hex')
//   return `${prefix}${randomBytes}`
// }

// /**
//  * GET /api/user/api-keys
//  * Récupère les clés API de l'utilisateur connecté
//  */
// export async function GET(req) {
//   try {
//     // TODO: Récupérer l'ID de l'utilisateur depuis la session
//     // Pour l'instant, on utilise un userId fixe pour les tests
//     const userId = 1

//     const apiKeys = await prisma.apiKey.findMany({
//       where: {
//         userId,
//       },
//       include: {
//         modele: {
//           select: {
//             id: true,
//             name: true,
//             slug: true,
//           },
//         },
//       },
//       orderBy: {
//         createdAt: 'desc',
//       },
//     })

//     return NextResponse.json({
//       success: true,
//       keys: apiKeys,
//     })
//   } catch (error) {
//     console.error('Erreur lors de la récupération des clés API:', error)

//     return NextResponse.json(
//       {
//         success: false,
//         message: 'Erreur lors de la récupération des clés API.',
//         error:
//           process.env.NODE_ENV === 'development' ? error.message : undefined,
//       },
//       { status: 500 },
//     )
//   }
// }

// /**
//  * POST /api/user/api-keys
//  * Crée une nouvelle clé API pour l'utilisateur
//  */
// export async function POST(req) {
//   try {
//     const body = await req.json()
//     const { name, modeleId, rateLimit = 1000 } = body

//     // TODO: Récupérer l'ID de l'utilisateur depuis la session
//     const userId = 1

//     // Validation
//     if (!name || !name.trim()) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: 'Le nom de la clé est requis.',
//         },
//         { status: 400 },
//       )
//     }

//     // Générer une clé unique
//     let apiKey
//     let isUnique = false
//     let attempts = 0
//     const maxAttempts = 10

//     while (!isUnique && attempts < maxAttempts) {
//       apiKey = generateApiKey()
//       const existing = await prisma.apiKey.findUnique({
//         where: { key: apiKey },
//       })
//       if (!existing) {
//         isUnique = true
//       }
//       attempts++
//     }

//     if (!isUnique) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: 'Impossible de générer une clé unique. Veuillez réessayer.',
//         },
//         { status: 500 },
//       )
//     }

//     // Créer la clé API
//     const newApiKey = await prisma.apiKey.create({
//       data: {
//         key: apiKey,
//         name: name.trim(),
//         userId,
//         modeleId: modeleId || null,
//         rateLimit,
//       },
//       include: {
//         modele: {
//           select: {
//             id: true,
//             name: true,
//             slug: true,
//           },
//         },
//       },
//     })

//     return NextResponse.json(
//       {
//         success: true,
//         key: apiKey, // On renvoie la clé en clair UNE SEULE FOIS
//         apiKey: newApiKey, // Les détails de la clé
//         message: 'Clé API créée avec succès.',
//       },
//       { status: 201 },
//     )
//   } catch (error) {
//     console.error('Erreur lors de la création de la clé API:', error)

//     return NextResponse.json(
//       {
//         success: false,
//         message: 'Erreur lors de la création de la clé API.',
//         error:
//           process.env.NODE_ENV === 'development' ? error.message : undefined,
//       },
//       { status: 500 },
//     )
//   }
// }

// /**
//  * DELETE /api/user/api-keys/[id]
//  * Supprime une clé API
//  */
// export async function DELETE(req, { params }) {
//   try {
//     const { id } = params
//     const userId = 1 // TODO: Récupérer depuis la session

//     // Vérifier que la clé appartient à l'utilisateur
//     const apiKey = await prisma.apiKey.findFirst({
//       where: {
//         id: parseInt(id),
//         userId,
//       },
//     })

//     if (!apiKey) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: 'Clé API non trouvée.',
//         },
//         { status: 404 },
//       )
//     }

//     // Supprimer la clé
//     await prisma.apiKey.delete({
//       where: {
//         id: parseInt(id),
//       },
//     })

//     return NextResponse.json({
//       success: true,
//       message: 'Clé API supprimée avec succès.',
//     })
//   } catch (error) {
//     console.error('Erreur lors de la suppression de la clé API:', error)

//     return NextResponse.json(
//       {
//         success: false,
//         message: 'Erreur lors de la suppression de la clé API.',
//         error:
//           process.env.NODE_ENV === 'development' ? error.message : undefined,
//       },
//       { status: 500 },
//     )
//   }
// }
