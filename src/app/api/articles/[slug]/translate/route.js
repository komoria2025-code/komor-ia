import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

/**
 * POST /api/articles/[slug]/translate
 *
 * Trois modes contrôlés par le champ `mode` du body :
 *
 *  "autosave"  → upsert Translation uniquement (aucun TranslationEdit créé)
 *  "manual"    → upsert Translation + crée un TranslationEdit (bouton "Enregistrer")
 *  "submit"    → upsert Translation (progress=100, status=completed) + TranslationEdit final
 *
 * La route accepte aussi les requêtes sendBeacon (Content-Type: application/json
 * envoyé comme Blob — le body reste lisible de la même façon).
 */
export async function POST(req, { params }) {
  try {
    // ── Authentification ────────────────────────────────────────────────────
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Non authentifié' }, { status: 401 })
    }

    // ── Paramètres ──────────────────────────────────────────────────────────
    const { slug } = await params
    const body = await req.json()

    const {
      mode = 'autosave', // 'autosave' | 'manual' | 'submit'
      translatedText,
      progress = 0,
      status = 'in_progress',
      notes = '',
      timeSpent = 0,
      dialecte = 'shingazidja',
    } = body

    // Validation du mode
    if (!['autosave', 'manual', 'submit'].includes(mode)) {
      return NextResponse.json({ message: 'Mode invalide' }, { status: 400 })
    }

    // ── Récupération de l'article ───────────────────────────────────────────
    const article = await prisma.article.findUnique({ where: { slug } })
    if (!article) {
      return NextResponse.json(
        { message: 'Article non trouvé' },
        { status: 404 },
      )
    }

    const userId = parseInt(session.user.id)

    // ── Calcul des champs selon le mode ────────────────────────────────────
    /**
     * En mode submit, on force progress=100 et status=completed
     * quoi qu'il en soit (le frontend peut envoyer n'importe quelle valeur).
     */
    const finalProgress =
      mode === 'submit' ? 100 : Math.min(Math.max(Number(progress), 0), 100)

    const finalStatus =
      mode === 'submit'
        ? 'completed'
        : finalProgress === 100
          ? 'completed'
          : status

    // ── Upsert de la Translation ────────────────────────────────────────────
    /**
     * On cherche la traduction active de cet utilisateur pour cet article.
     * Si elle n'existe pas, on la crée. Sinon on la met à jour.
     * Un seul upsert Prisma suffirait si on avait une contrainte unique composite,
     * mais on garde la structure existante (findFirst + create/update) pour ne
     * pas casser le schéma.
     */
    const existingTranslation = await prisma.translation.findFirst({
      where: { articleId: article.id, userId, isActive: true },
    })

    let translation

    const translationData = {
      translatedText,
      progress: finalProgress,
      status: finalStatus,
      notes,
      timeSpent,
      dialecte,
    }

    if (existingTranslation) {
      translation = await prisma.translation.update({
        where: { id: existingTranslation.id },
        data: translationData,
      })
    } else {
      translation = await prisma.translation.create({
        data: {
          articleId: article.id,
          userId,
          isActive: true,
          ...translationData,
        },
      })
    }

    // ── Création d'un TranslationEdit (uniquement pour manual et submit) ────
    /**
     * L'autosave ne crée JAMAIS de TranslationEdit.
     * Seule une action volontaire (Enregistrer ou Soumettre) génère une version.
     *
     * Note : si l'on souhaite ajouter ultérieurement une sauvegarde périodique
     * toutes les 5 minutes, il suffira d'ajouter mode === 'periodic' ici.
     */
    if (mode === 'manual' || mode === 'submit') {
      await prisma.translationEdit.create({
        data: {
          translationId: translation.id,
          articleId: article.id,
          userId,
          editedText: translatedText,
          progress: finalProgress,
          // sessionStart estimé à partir du temps passé
          sessionStart: new Date(Date.now() - timeSpent * 1000),
          sessionEnd: new Date(),
        },
      })
    }

    // ── Mise à jour de l'article si la traduction est terminée ─────────────
    if (finalStatus === 'completed') {
      const completedCount = await prisma.translation.count({
        where: { articleId: article.id, status: 'completed' },
      })
      // On met l'article en "completed" dès la première traduction terminée
      if (completedCount === 1) {
        await prisma.article.update({
          where: { id: article.id },
          data: { status: 'completed' },
        })
      }
    }

    // ── Réponse ─────────────────────────────────────────────────────────────
    return NextResponse.json(
      { message: 'Traduction sauvegardée', translation },
      { status: 200 },
    )
  } catch (error) {
    console.error('Erreur lors de la sauvegarde :', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}

/**
 * GET /api/articles/[slug]/translate
 * Récupérer l'historique des traductions d'un article.
 * Inchangé par rapport à la version précédente.
 */
export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    const { slug } = await params
    const { searchParams } = new URL(req.url)
    const includeHistory = searchParams.get('history') === 'true'

    const article = await prisma.article.findUnique({ where: { slug } })
    if (!article) {
      return NextResponse.json(
        { message: 'Article non trouvé' },
        { status: 404 },
      )
    }

    const translations = await prisma.translation.findMany({
      where: { articleId: article.id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        edits: includeHistory,
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json({ article, translations }, { status: 200 })
  } catch (error) {
    console.error('Erreur GET traductions :', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}

// import { NextResponse } from 'next/server'
// import { getServerSession } from 'next-auth'
// import { authOptions } from '@/lib/auth'
// import prisma from '@/lib/prisma'
// import { awardPoints } from '@/lib/gamification' // ✅ AJOUT

// export async function POST(req, { params }) {
//   try {
//     const session = await getServerSession(authOptions)
//     if (!session?.user?.id) {
//       return NextResponse.json({ message: 'Non authentifié' }, { status: 401 })
//     }

//     const { slug } = await params
//     const body = await req.json()

//     const {
//       mode = 'autosave',
//       translatedText,
//       progress = 0,
//       status = 'in_progress',
//       notes = '',
//       timeSpent = 0,
//       dialecte = 'shingazidja',
//     } = body

//     if (!['autosave', 'manual', 'submit'].includes(mode)) {
//       return NextResponse.json({ message: 'Mode invalide' }, { status: 400 })
//     }

//     const article = await prisma.article.findUnique({ where: { slug } })
//     if (!article) {
//       return NextResponse.json(
//         { message: 'Article non trouvé' },
//         { status: 404 },
//       )
//     }

//     const userId = parseInt(session.user.id)

//     const finalProgress =
//       mode === 'submit' ? 100 : Math.min(Math.max(Number(progress), 0), 100)

//     const finalStatus =
//       mode === 'submit'
//         ? 'completed'
//         : finalProgress === 100
//           ? 'completed'
//           : status

//     // Upsert Translation
//     const existingTranslation = await prisma.translation.findFirst({
//       where: { articleId: article.id, userId, isActive: true },
//     })

//     let translation
//     const translationData = {
//       translatedText,
//       progress: finalProgress,
//       status: finalStatus,
//       notes,
//       timeSpent,
//       dialecte,
//     }

//     if (existingTranslation) {
//       translation = await prisma.translation.update({
//         where: { id: existingTranslation.id },
//         data: translationData,
//       })
//     } else {
//       translation = await prisma.translation.create({
//         data: {
//           articleId: article.id,
//           userId,
//           isActive: true,
//           ...translationData,
//         },
//       })
//     }

//     // TranslationEdit pour manual et submit
//     if (mode === 'manual' || mode === 'submit') {
//       await prisma.translationEdit.create({
//         data: {
//           translationId: translation.id,
//           articleId: article.id,
//           userId,
//           editedText: translatedText,
//           progress: finalProgress,
//           sessionStart: new Date(Date.now() - timeSpent * 1000),
//           sessionEnd: new Date(),
//         },
//       })
//     }

//     // Mise à jour statut article
//     if (finalStatus === 'completed') {
//       const completedCount = await prisma.translation.count({
//         where: { articleId: article.id, status: 'completed' },
//       })
//       if (completedCount === 1) {
//         await prisma.article.update({
//           where: { id: article.id },
//           data: { status: 'completed' },
//         })
//       }
//     }

//     // ✅ AJOUT — Attribuer les points uniquement au submit
//     let gamificationResult = null
//     if (mode === 'submit') {
//       const action =
//         article.contentType === 'sentence'
//           ? 'sentence'
//           : article.contentType === 'paragraph'
//             ? 'paragraph'
//             : 'article'

//       try {
//         gamificationResult = await awardPoints(userId, action, translation.id)
//       } catch (e) {
//         // Ne pas bloquer la soumission si la gamification échoue
//         console.error('Erreur gamification:', e)
//       }
//     }

//     return NextResponse.json(
//       {
//         message: 'Traduction sauvegardée',
//         translation,
//         gamification: gamificationResult, // ✅ null si autosave/manual, objet si submit
//       },
//       { status: 200 },
//     )
//   } catch (error) {
//     console.error('Erreur lors de la sauvegarde :', error)
//     return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
//   }
// }

// export async function GET(req, { params }) {
//   try {
//     const session = await getServerSession(authOptions)
//     const { slug } = await params
//     const { searchParams } = new URL(req.url)
//     const includeHistory = searchParams.get('history') === 'true'

//     const article = await prisma.article.findUnique({ where: { slug } })
//     if (!article) {
//       return NextResponse.json(
//         { message: 'Article non trouvé' },
//         { status: 404 },
//       )
//     }

//     const translations = await prisma.translation.findMany({
//       where: { articleId: article.id },
//       include: {
//         user: { select: { id: true, name: true, email: true } },
//         edits: includeHistory,
//       },
//       orderBy: { updatedAt: 'desc' },
//     })

//     return NextResponse.json({ article, translations }, { status: 200 })
//   } catch (error) {
//     console.error('Erreur GET traductions :', error)
//     return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
//   }
// }
