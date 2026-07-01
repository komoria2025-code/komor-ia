// /**
//  * seed-sentence.js
//  * Import de phrases (colonne "Phrase (Français)") depuis un fichier Excel
//  * vers la table Article (contentType = 'sentence')
//  *
//  * Usage : node seed-sentence.js
//  */

// const XLSX = require('xlsx')
// const { PrismaClient } = require('@prisma/client')

// const prisma = new PrismaClient()

// // ─── Config ─────────────────────────────────────────
// const EXCEL_FILE = './Traduction-phrase.xlsx'
// const ORIGINAL_LANG = 'fr'
// const TARGET_LANG = 'zdj' // adapte si besoin (shindzuani, shimwali, shimaore -> pas de colonne "target" direct dans Article, zdj = "Comorien" générique)
// const CATEGORY = 'autre'
// const CONTENT_TYPE = 'sentence'
// const DIFFICULTY = 1
// const ROW_START = 376 // ligne Excel de départ (1-indexé, incluant l'en-tête)
// const ROW_END = 1572 // ligne Excel de fin
// const COL_PHRASE_FR = 2 // colonne C = "Phrase (Français)"
// // ────────────────────────────────────────────────────

// function makeSlug(text) {
//   const base = text
//     .toLowerCase()
//     .normalize('NFD')
//     .replace(/[\u0300-\u036f]/g, '')
//     .replace(/[^a-z0-9]+/g, '-')
//     .replace(/^-|-$/g, '')
//     .slice(0, 60)
//   return `${base}-${Math.random().toString(36).slice(2, 6)}`
// }

// function makeTitle(text) {
//   const t = text.trim()
//   return t.length > 80 ? t.slice(0, 77) + '...' : t
// }

// async function createUniqueSlug(text) {
//   let slug = makeSlug(text)
//   let existing = await prisma.article.findUnique({ where: { slug } })
//   let attempts = 0
//   while (existing && attempts < 5) {
//     slug = makeSlug(text)
//     existing = await prisma.article.findUnique({ where: { slug } })
//     attempts++
//   }
//   return slug
// }

// async function main() {
//   // 1. Lecture Excel
//   const wb = XLSX.readFile(EXCEL_FILE)
//   const sheet = wb.Sheets[wb.SheetNames[0]]
//   const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 })

//   const toImport = rows.slice(ROW_START - 1, ROW_END)
//   console.log(
//     `📋  ${toImport.length} lignes à traiter (lignes ${ROW_START} à ${ROW_END})...`,
//   )

//   let success = 0
//   let skipped = 0
//   let errors = 0

//   for (let i = 0; i < toImport.length; i++) {
//     const row = toImport[i]
//     const excelLine = ROW_START + i
//     const id = row[0]
//     const phraseFr = (row[COL_PHRASE_FR] || '').toString().trim()

//     if (!phraseFr) {
//       console.warn(`⚠️   Ligne ${excelLine} ignorée (phrase vide)`)
//       skipped++
//       continue
//     }

//     try {
//       const slug = await createUniqueSlug(phraseFr)
//       const words = phraseFr.split(/\s+/).filter(Boolean).length

//       await prisma.article.create({
//         data: {
//           title: makeTitle(phraseFr),
//           slug,
//           originalText: phraseFr,
//           originalLang: ORIGINAL_LANG,
//           targetLang: TARGET_LANG,
//           category: CATEGORY,
//           contentType: CONTENT_TYPE,
//           status: 'pending',
//           difficulty: DIFFICULTY,
//           estimatedWords: words,
//           isPublic: true,
//         },
//       })

//       success++
//       console.log(
//         `✅  [${String(i + 1).padStart(4, '0')}/${toImport.length}] Ligne ${excelLine} (ID ${id}) — "${phraseFr.substring(0, 60)}"`,
//       )
//     } catch (err) {
//       errors++
//       console.error(
//         `❌  [${String(i + 1).padStart(4, '0')}/${toImport.length}] Ligne ${excelLine} (ID ${id}) — ${err.message}`,
//       )
//     }
//   }

//   console.log('\n─────────────────────────────────')
//   console.log(`✅  Succès  : ${success}`)
//   console.log(`⚠️   Ignorés : ${skipped}`)
//   console.log(`❌  Erreurs : ${errors}`)
//   console.log(`📦  Total   : ${toImport.length}`)
// }

// main()
//   .catch(console.error)
//   .finally(() => prisma.$disconnect())

/**
 * seed-sentence.js
 * Import de phrases (colonne "Phrase (Français)") depuis un fichier Excel
 * vers la table Article (contentType = 'sentence')
 * → Insertion en ordre aléatoire + priority aléatoire (pour affichage non trié)
 *
 * Usage : node seed-sentence.js
 */

const XLSX = require('xlsx')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// ─── Config ─────────────────────────────────────────
const EXCEL_FILE = './Traduction-phrase.xlsx'
const ORIGINAL_LANG = 'fr'
const TARGET_LANG = 'zdj'
const CATEGORY = 'autre'
const CONTENT_TYPE = 'sentence'
const DIFFICULTY = 1
const ROW_START = 376
const ROW_END = 1572
const COL_PHRASE_FR = 2
// ────────────────────────────────────────────────────

function makeSlug(text) {
  const base = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
  return `${base}-${Math.random().toString(36).slice(2, 6)}`
}

function makeTitle(text) {
  const t = text.trim()
  return t.length > 80 ? t.slice(0, 77) + '...' : t
}

async function createUniqueSlug(text) {
  let slug = makeSlug(text)
  let existing = await prisma.article.findUnique({ where: { slug } })
  let attempts = 0
  while (existing && attempts < 5) {
    slug = makeSlug(text)
    existing = await prisma.article.findUnique({ where: { slug } })
    attempts++
  }
  return slug
}

// ✅ Fisher-Yates shuffle
function shuffleArray(array) {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

async function main() {
  // 1. Lecture Excel
  const wb = XLSX.readFile(EXCEL_FILE)
  const sheet = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 })

  let toImport = rows.slice(ROW_START - 1, ROW_END)

  // Garder une trace de la ligne Excel d'origine AVANT le mélange (pour les logs)
  toImport = toImport.map((row, idx) => ({ row, excelLine: ROW_START + idx }))

  // ✅ Mélange l'ordre d'insertion
  toImport = shuffleArray(toImport)

  console.log(
    `📋  ${toImport.length} lignes à traiter (lignes ${ROW_START} à ${ROW_END}, ordre mélangé)...`,
  )

  let success = 0
  let skipped = 0
  let errors = 0

  for (let i = 0; i < toImport.length; i++) {
    const { row, excelLine } = toImport[i]
    const id = row[0]
    const phraseFr = (row[COL_PHRASE_FR] || '').toString().trim()

    if (!phraseFr) {
      console.warn(`⚠️   Ligne ${excelLine} ignorée (phrase vide)`)
      skipped++
      continue
    }

    try {
      const slug = await createUniqueSlug(phraseFr)
      const words = phraseFr.split(/\s+/).filter(Boolean).length

      await prisma.article.create({
        data: {
          title: makeTitle(phraseFr),
          slug,
          originalText: phraseFr,
          originalLang: ORIGINAL_LANG,
          targetLang: TARGET_LANG,
          category: CATEGORY,
          contentType: CONTENT_TYPE,
          status: 'pending',
          difficulty: DIFFICULTY,
          estimatedWords: words,
          isPublic: true,
          priority: Math.floor(Math.random() * 11), // ✅ 0-10 aléatoire
        },
      })

      success++
      console.log(
        `✅  [${String(i + 1).padStart(4, '0')}/${toImport.length}] Ligne ${excelLine} (ID ${id}) — "${phraseFr.substring(0, 60)}"`,
      )
    } catch (err) {
      errors++
      console.error(
        `❌  [${String(i + 1).padStart(4, '0')}/${toImport.length}] Ligne ${excelLine} (ID ${id}) — ${err.message}`,
      )
    }
  }

  console.log('\n─────────────────────────────────')
  console.log(`✅  Succès  : ${success}`)
  console.log(`⚠️   Ignorés : ${skipped}`)
  console.log(`❌  Erreurs : ${errors}`)
  console.log(`📦  Total   : ${toImport.length}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
