/**
 * seed-paragraphs.js
 * Import de paragraphes (colonne "Paragraphe (Français)")
 * depuis CorpusParagraphes_Shikomori.xlsx vers la table Article (contentType = 'paragraph')
 * Catégorie fixée à "autre" pour tous.
 *
 * Usage : node seed-paragraphs.js
 */

const XLSX = require('xlsx')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// ─── Config ─────────────────────────────────────────
const EXCEL_FILE = './CorpusParagraphes_Shikomori.xlsx'
const ORIGINAL_LANG = 'fr'
const TARGET_LANG = 'zdj'
const CATEGORY = 'autre'
const CONTENT_TYPE = 'paragraph'
const DIFFICULTY = 2 // paragraphes = un peu plus difficile qu'une phrase
const SOURCE = 'Komor-IA'
const ROW_START = 4 // 1ère ligne de données (après les 3 lignes d'en-tête)
const ROW_END = 410 // 407 entrées (4 à 410 inclus)
const COL_ID = 0 // colonne A
const COL_PARAGRAPHE_FR = 2 // colonne C
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

// ✅ Fisher-Yates shuffle — insertion en ordre aléatoire
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
  toImport = toImport.map((row, idx) => ({ row, excelLine: ROW_START + idx }))
  toImport = shuffleArray(toImport)

  console.log(
    `📋  ${toImport.length} lignes à traiter (lignes ${ROW_START} à ${ROW_END}, ordre mélangé)...`,
  )

  let success = 0
  let skipped = 0
  let errors = 0

  for (let i = 0; i < toImport.length; i++) {
    const { row, excelLine } = toImport[i]
    const id = row[COL_ID]
    const paragrapheFr = (row[COL_PARAGRAPHE_FR] || '').toString().trim()

    if (!paragrapheFr) {
      console.warn(`⚠️   Ligne ${excelLine} ignorée (paragraphe vide)`)
      skipped++
      continue
    }

    try {
      const slug = await createUniqueSlug(paragrapheFr)
      const words = paragrapheFr.split(/\s+/).filter(Boolean).length

      await prisma.article.create({
        data: {
          title: makeTitle(paragrapheFr),
          slug,
          originalText: paragrapheFr,
          originalLang: ORIGINAL_LANG,
          targetLang: TARGET_LANG,
          category: CATEGORY,
          contentType: CONTENT_TYPE,
          status: 'pending',
          difficulty: DIFFICULTY,
          estimatedWords: words,
          source: SOURCE,
          isPublic: true,
          priority: Math.floor(Math.random() * 11),
        },
      })

      success++
      console.log(
        `✅  [${String(i + 1).padStart(4, '0')}/${toImport.length}] Ligne ${excelLine} (ID ${id}) — "${paragrapheFr.substring(0, 50)}..."`,
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
