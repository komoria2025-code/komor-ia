/**
 * Script de nettoyage des articles Km-News
 * Supprime les caractères Markdown : #, **, *, _, __, etc.
 *
 * Usage :
 *   1. npm install @prisma/client
 *   2. node clean-kmnews-articles.js
 *   3. node clean-kmnews-articles.js --dry-run   (pour tester sans modifier)
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const DRY_RUN = process.argv.includes('--dry-run')

// ============================================
// Fonction de nettoyage
// ============================================
function cleanMarkdown(text) {
  if (!text) return text

  return (
    text
      // Titres Markdown : # ## ### etc.
      .replace(/^#{1,6}\s+/gm, '')

      // Gras + italique : ***texte*** ou ___texte___
      .replace(/\*{3}(.+?)\*{3}/g, '$1')
      .replace(/_{3}(.+?)_{3}/g, '$1')

      // Gras : **texte** ou __texte__
      .replace(/\*{2}(.+?)\*{2}/g, '$1')
      .replace(/_{2}(.+?)_{2}/g, '$1')

      // Italique : *texte* ou _texte_
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/_(.+?)_/g, '$1')

      // Code inline : `texte`
      .replace(/`(.+?)`/g, '$1')

      // Liens Markdown : [texte](url)
      .replace(/\[(.+?)\]\(.+?\)/g, '$1')

      // Images Markdown : ![alt](url)
      .replace(/!\[.*?\]\(.+?\)/g, '')

      // Blockquotes : > texte
      .replace(/^>\s+/gm, '')

      // Listes non ordonnées : - item ou * item
      .replace(/^[\*\-\+]\s+/gm, '')

      // Listes ordonnées : 1. item
      .replace(/^\d+\.\s+/gm, '')

      // Lignes horizontales : --- ou *** ou ___
      .replace(/^[-\*_]{3,}\s*$/gm, '')

      // Blocs de code : ```...```
      .replace(/```[\s\S]*?```/g, '')

      // Espaces multiples → un seul
      .replace(/  +/g, ' ')

      // Lignes vides multiples → max 2
      .replace(/\n{3,}/g, '\n\n')

      .trim()
  )
}

// ============================================
// Main
// ============================================
async function main() {
  console.log(
    `\n🚀 Démarrage du nettoyage${DRY_RUN ? ' (DRY RUN - aucune modification)' : ''}...\n`,
  )

  // Récupérer uniquement les articles venant de Km-News
  const articles = await prisma.article.findMany({
    where: {
      source: {
        contains: 'Km-News',
      },
    },
    select: {
      id: true,
      title: true,
      originalText: true,
      author: true,
      source: true,
    },
  })

  console.log(`📦 ${articles.length} articles trouvés avec source "Km-News"\n`)

  if (articles.length === 0) {
    console.log('✅ Rien à nettoyer.')
    return
  }

  let modifiedCount = 0

  for (const article of articles) {
    const cleanedTitle = cleanMarkdown(article.title)
    const cleanedText = cleanMarkdown(article.originalText)
    const cleanedAuthor = cleanMarkdown(article.author)

    const hasChanges =
      cleanedTitle !== article.title ||
      cleanedText !== article.originalText ||
      cleanedAuthor !== article.author

    if (!hasChanges) continue

    modifiedCount++

    if (DRY_RUN) {
      console.log(
        `[DRY RUN] Article ID ${article.id} - "${article.title?.slice(0, 60)}..."`,
      )
      if (cleanedTitle !== article.title) {
        console.log(`  title     : "${article.title?.slice(0, 80)}"`)
        console.log(`         → : "${cleanedTitle?.slice(0, 80)}"`)
      }
      if (cleanedText !== article.originalText) {
        console.log(
          `  originalText modifié (${article.originalText?.length} → ${cleanedText?.length} chars)`,
        )
      }
      if (cleanedAuthor !== article.author) {
        console.log(`  author    : "${article.author}" → "${cleanedAuthor}"`)
      }
      console.log()
    } else {
      await prisma.article.update({
        where: { id: article.id },
        data: {
          title: cleanedTitle,
          originalText: cleanedText,
          author: cleanedAuthor,
        },
      })
      console.log(`✅ Article ID ${article.id} nettoyé`)
    }
  }

  console.log(
    `\n📊 Résultat : ${modifiedCount} / ${articles.length} articles modifiés`,
  )
  if (DRY_RUN) {
    console.log('ℹ️  Relance sans --dry-run pour appliquer les changements.\n')
  } else {
    console.log('🎉 Nettoyage terminé !\n')
  }
}

main()
  .catch((e) => {
    console.error('❌ Erreur :', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
