// const fs = require('fs')
// const csv = require('csv-parser')
// const { PrismaClient } = require('@prisma/client')
// const crypto = require('crypto')

// const prisma = new PrismaClient()

// // -------------------------
// // CONFIG
// // -------------------------
// const FILES = [
//   { path: 'articles_societe.csv', category: 'societe' },
//   { path: 'articles_sante.csv', category: 'sante' },
//   { path: 'articles_politique.csv', category: 'politique' },
//   { path: 'articles_culture.csv', category: 'culture' },
//   { path: 'articles_economie.csv', category: 'economie' },
//   { path: 'articles_sports.csv', category: 'sport' },
// ]

// // -------------------------
// // UTILS
// // -------------------------

// function generateSlug(title) {
//   const base = title
//     .toLowerCase()
//     .normalize('NFD')
//     .replace(/[\u0300-\u036f]/g, '')
//     .replace(/[^a-z0-9]+/g, '-')
//     .replace(/^-|-$/g, '')
//     .substring(0, 100) // limite à 100 caractères

//   // ajouter un hash pour garantir l'unicité
//   const hash = crypto.createHash('md5').update(title).digest('hex').slice(0, 6)

//   return `${base}-${hash}`
// }

// function countWords(text) {
//   return text.trim().split(/\s+/).length
// }

// function parseDate(dateStr) {
//   const d = new Date(dateStr)
//   return isNaN(d.getTime()) ? null : d
// }

// // -------------------------
// // READ CSV
// // -------------------------

// function readCSV(path) {
//   return new Promise((resolve, reject) => {
//     const results = []

//     fs.createReadStream(path)
//       .pipe(csv())
//       .on('data', (data) => results.push(data))
//       .on('end', () => {
//         console.log(`📄 ${path} → ${results.length} lignes`)
//         resolve(results)
//       })
//       .on('error', reject)
//   })
// }

// // -------------------------
// // IMPORT
// // -------------------------

// async function importAll() {
//   let total = 0

//   for (const file of FILES) {
//     const rows = await readCSV(file.path)

//     for (const row of rows) {
//       try {
//         if (!row.titre || !row.contenu) continue

//         let uniqueSlug = generateSlug(row.titre)

//         // ⚠️ éviter collision slug (rare avec hash, mais safe)
//         let counter = 1
//         while (
//           await prisma.article.findUnique({ where: { slug: uniqueSlug } })
//         ) {
//           uniqueSlug = `${uniqueSlug}-${counter}`
//           counter++
//         }

//         const words = countWords(row.contenu)

//         await prisma.article.create({
//           data: {
//             title: row.titre,
//             slug: uniqueSlug,
//             originalText: row.contenu,
//             originalLang: 'fr',
//             targetLang: 'zdj',
//             category: file.category, // ✅ valide maintenant
//             status: 'pending',
//             difficulty: 1,
//             estimatedWords: words,
//             source: 'Al-watwan',
//             author: 'Al-watwan',
//             publishedDate: parseDate(row.date),
//             priority: 0,
//             isPublic: true,
//           },
//         })

//         total++
//       } catch (err) {
//         console.error(`❌ Erreur : ${row.titre}`, err.message)
//       }
//     }
//   }

//   console.log(`\n✅ IMPORT TERMINÉ : ${total} articles`)
// }

// // -------------------------
// // RUN
// // -------------------------

// importAll()
//   .catch(console.error)
//   .finally(() => prisma.$disconnect())

// const fs = require('fs')
// const csv = require('csv-parser')
// const { PrismaClient } = require('@prisma/client')

// const prisma = new PrismaClient()

// // -------------------------
// // CONFIG
// // -------------------------
// const FILES = [
//   { path: 'articles_societe.csv', category: 'actualites' },
//   { path: 'articles_sante.csv', category: 'sante' },
//   { path: 'articles_politique.csv', category: 'politique' },
//   { path: 'articles_culture.csv', category: 'culture' },
//   { path: 'articles_economie.csv', category: 'economie' },
//   { path: 'articles_sports.csv', category: 'sport' },
// ]

// // -------------------------
// // UTILS
// // -------------------------

// function generateSlug(title) {
//   return title
//     .toLowerCase()
//     .normalize('NFD')
//     .replace(/[\u0300-\u036f]/g, '')
//     .replace(/[^a-z0-9]+/g, '-')
//     .replace(/^-|-$/g, '')
// }

// function countWords(text) {
//   return text.trim().split(/\s+/).length
// }

// function parseDate(dateStr) {
//   const d = new Date(dateStr)
//   return isNaN(d.getTime()) ? null : d
// }

// // -------------------------
// // READ CSV
// // -------------------------

// function readCSV(path) {
//   return new Promise((resolve, reject) => {
//     const results = []

//     fs.createReadStream(path)
//       .pipe(csv())
//       .on('data', (data) => results.push(data))
//       .on('end', () => {
//         console.log(`📄 ${path} → ${results.length} lignes`)
//         resolve(results)
//       })
//       .on('error', reject)
//   })
// }

// // -------------------------
// // IMPORT
// // -------------------------

// async function importAll() {
//   let total = 0

//   for (const file of FILES) {
//     const rows = await readCSV(file.path)

//     for (const row of rows) {
//       try {
//         if (!row.titre || !row.contenu) continue

//         let slug = generateSlug(row.titre)

//         // ⚠️ éviter collision slug
//         let uniqueSlug = slug
//         let counter = 1

//         while (
//           await prisma.article.findUnique({ where: { slug: uniqueSlug } })
//         ) {
//           uniqueSlug = `${slug}-${counter}`
//           counter++
//         }

//         const words = countWords(row.contenu)

//         await prisma.article.create({
//           data: {
//             title: row.titre,
//             slug: uniqueSlug,
//             originalText: row.contenu,
//             originalLang: 'fr',
//             targetLang: 'zdj',
//             category: file.category,
//             status: 'pending',
//             difficulty: 1,
//             estimatedWords: words,
//             source: 'Al-watwan',
//             author: 'Al-watwan',
//             publishedDate: parseDate(row.date),
//             priority: 0,
//             isPublic: true,
//           },
//         })

//         total++
//       } catch (err) {
//         console.error(`❌ Erreur : ${row.titre}`, err.message)
//       }
//     }
//   }

//   console.log(`\n✅ IMPORT TERMINÉ : ${total} articles`)
// }

// // -------------------------
// // RUN
// // -------------------------

// importAll()
//   .catch(console.error)
//   .finally(() => prisma.$disconnect())

import fs from 'fs'
import csv from 'csv-parser'
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

// -------------------------
// CONFIG
// -------------------------
const FILES = [{ path: 'articles_clean.csv' }]

// -------------------------
// MAPPING CATEGORIES
// -------------------------
const CATEGORY_MAP = {
  'sciences & recherches': 'science',
  sciences: 'science',
  science: 'science',
  culture: 'culture',
  sante: 'sante',
  santé: 'sante',
  politique: 'politique',
  economie: 'economie',
  économie: 'economie',
  sport: 'sport',
  sports: 'sport',
  societe: 'societe',
  société: 'societe',
  education: 'education',
  éducation: 'education',
  histoire: 'histoire',
  religion: 'religion',
  litterature: 'litterature',
  littérature: 'litterature',
  actualites: 'actualites',
  actualités: 'actualites',
}

function normalizeCategory(category) {
  const normalized = category
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  return (
    CATEGORY_MAP[category.toLowerCase().trim()] ||
    CATEGORY_MAP[normalized] ||
    'autre'
  ) // fallback si aucun match
}

// -------------------------
// UTILS
// -------------------------

function generateSlug(title) {
  const base = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100)

  const hash = crypto.createHash('md5').update(title).digest('hex').slice(0, 6)
  return `${base}-${hash}`
}

function countWords(text) {
  return text.trim().split(/\s+/).length
}

function parseDate(dateStr) {
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? null : d
}

// -------------------------
// READ CSV
// -------------------------

function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = []

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        const cleanRow = {}
        for (const key of Object.keys(data)) {
          cleanRow[key.trim().replace(/^\uFEFF/, '')] = data[key]
        }
        results.push(cleanRow)
      })
      .on('end', () => {
        console.log(`📄 ${filePath} → ${results.length} lignes`)
        resolve(results)
      })
      .on('error', reject)
  })
}

// -------------------------
// IMPORT
// -------------------------

async function importAll() {
  let total = 0

  for (const file of FILES) {
    const rows = await readCSV(file.path)

    console.log('Colonnes détectées :', Object.keys(rows[0]))

    for (const row of rows) {
      try {
        if (!row.titre || !row.contenu) continue

        let uniqueSlug = generateSlug(row.titre)

        let counter = 1
        while (
          await prisma.article.findUnique({ where: { slug: uniqueSlug } })
        ) {
          uniqueSlug = `${uniqueSlug}-${counter}`
          counter++
        }

        const words = countWords(row.contenu)
        const category = normalizeCategory(row.category)

        await prisma.article.create({
          data: {
            title: row.titre,
            slug: uniqueSlug,
            originalText: row.contenu,
            originalLang: 'fr',
            targetLang: 'zdj',
            category,
            status: 'pending',
            difficulty: 1,
            estimatedWords: words,
            source: 'Km-News',
            author: 'Km-News',
            publishedDate: parseDate(row.date),
            priority: 0,
            isPublic: true,
          },
        })

        total++
      } catch (err) {
        console.error(`❌ Erreur : ${row.titre}`)
        console.error(err)
      }
    }
  }

  console.log(`\n✅ IMPORT TERMINÉ : ${total} articles`)
}

// -------------------------
// RUN
// -------------------------

importAll()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
