/**
 * Import direct en base via Prisma (sans auth)
 * Usage : node seed-phrases.js
 */

const XLSX = require('xlsx')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const EXCEL_FILE = './Traduction-phase.xlsx'
const ADMIN_ID = 17 // ← mets ton vrai user ID admin
const DIALECTE = 'shingazidja'
const DIFFICULTY = 1
const ROW_START = 5 // ligne Excel de départ
const ROW_END = 104 // ligne Excel de fin

async function main() {
  // 1. Lecture Excel
  const wb = XLSX.readFile(EXCEL_FILE)
  const sheet = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 })

  const toImport = rows.slice(ROW_START - 1, ROW_END)
  console.log(`📋  ${toImport.length} phrases à importer...`)

  let success = 0
  let errors = 0

  for (let i = 0; i < toImport.length; i++) {
    const row = toImport[i]
    const id = row[0]
    const phraseFr = (row[2] || '').toString().trim()
    const traduction = (row[3] || '').toString().trim()

    if (!phraseFr) {
      console.warn(`⚠️   Ligne ${ROW_START + i} ignorée (vide)`)
      continue
    }

    try {
      await prisma.voicePhrase.create({
        data: {
          //   text: phraseFr,
          // APRÈS
          text: traduction, // colonne D = Shikomori = le texte à prononcer
          translation: phraseFr || null, // colonne C = Français = la traduction
          dialecte: DIALECTE,
          //   translation: traduction || null,
          difficulty: DIFFICULTY,
          createdBy: ADMIN_ID,
        },
      })
      success++
      console.log(
        `✅  [${String(i + 1).padStart(3, '0')}/${toImport.length}] ID ${id} — "${phraseFr.substring(0, 60)}"`,
      )
    } catch (err) {
      errors++
      console.error(
        `❌  [${String(i + 1).padStart(3, '0')}/${toImport.length}] ID ${id} — ${err.message}`,
      )
    }
  }

  console.log('\n─────────────────────────────────')
  console.log(`✅  Succès  : ${success}`)
  console.log(`❌  Erreurs : ${errors}`)
  console.log(`📦  Total   : ${success + errors}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
