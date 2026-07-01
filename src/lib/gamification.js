// // src/lib/gamification.js
// import prisma from '@/lib/prisma'

// // ─── Configuration des points ─────────────────────────────
// export const POINTS_CONFIG = {
//   sentence: 5,
//   paragraph: 15,
//   article: 30,
//   voice: 10,
//   streak_3: 10,
//   streak_7: 25,
//   streak_30: 100,
// }

// // ─── Niveaux ──────────────────────────────────────────────
// export const LEVELS = [
//   { level: 1, name: 'Débutant', min: 0 },
//   { level: 2, name: 'Apprenti', min: 100 },
//   { level: 3, name: 'Contributeur', min: 300 },
//   { level: 4, name: 'Contributeur actif', min: 700 },
//   { level: 5, name: 'Expert shikomori', min: 1500 },
//   { level: 6, name: 'Maître', min: 3000 },
// ]

// // ─── Badges ───────────────────────────────────────────────
// export const BADGES_CONFIG = [
//   // Premières contributions
//   {
//     id: 'first_contribution',
//     label: 'Première contribution',
//     icon: '🌱',
//     description: 'Vous avez fait votre première contribution !',
//     check: ({ totalPoints }) => totalPoints >= 1,
//   },
//   // Points cumulés
//   {
//     id: 'debutant',
//     label: 'Débutant',
//     icon: '⭐',
//     description: '100 points cumulés',
//     check: ({ totalPoints }) => totalPoints >= 100,
//   },
//   {
//     id: 'actif',
//     label: 'Contributeur actif',
//     icon: '🔥',
//     description: '500 points cumulés',
//     check: ({ totalPoints }) => totalPoints >= 500,
//   },
//   {
//     id: 'expert',
//     label: 'Expert shikomori',
//     icon: '🏆',
//     description: '1500 points cumulés',
//     check: ({ totalPoints }) => totalPoints >= 1500,
//   },
//   {
//     id: 'maitre',
//     label: 'Maître',
//     icon: '👑',
//     description: '3000 points cumulés',
//     check: ({ totalPoints }) => totalPoints >= 3000,
//   },
//   // Streaks
//   {
//     id: 'streak_3',
//     label: '3 jours consécutifs',
//     icon: '🔥',
//     description: 'Connecté 3 jours de suite',
//     check: ({ maxStreak }) => maxStreak >= 3,
//   },
//   {
//     id: 'streak_7',
//     label: 'Une semaine',
//     icon: '📅',
//     description: 'Connecté 7 jours de suite',
//     check: ({ maxStreak }) => maxStreak >= 7,
//   },
//   {
//     id: 'streak_30',
//     label: 'Un mois',
//     icon: '🗓️',
//     description: 'Connecté 30 jours de suite',
//     check: ({ maxStreak }) => maxStreak >= 30,
//   },
// ]

// // ─── Calculer le niveau selon les points ──────────────────
// export function calculateLevel(totalPoints) {
//   let current = LEVELS[0]
//   for (const lvl of LEVELS) {
//     if (totalPoints >= lvl.min) current = lvl
//     else break
//   }
//   const nextLevelIndex = LEVELS.findIndex((l) => l.level === current.level) + 1
//   const next = LEVELS[nextLevelIndex] || null
//   return {
//     ...current,
//     next,
//     progressToNext: next
//       ? Math.round(
//           ((totalPoints - current.min) / (next.min - current.min)) * 100,
//         )
//       : 100,
//   }
// }

// // ─── Mettre à jour le streak ──────────────────────────────
// async function updateStreak(gamification) {
//   const now = new Date()
//   const last = gamification.lastActiveAt

//   let newStreak = gamification.streak
//   let streakBonusAction = null

//   if (!last) {
//     // Première activité
//     newStreak = 1
//   } else {
//     const diffMs = now - new Date(last)
//     const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

//     if (diffDays === 0) {
//       // Même jour — streak inchangé
//     } else if (diffDays === 1) {
//       // Jour suivant — streak continue
//       newStreak = gamification.streak + 1
//     } else {
//       // Plus d'un jour — streak réinitialisé
//       newStreak = 1
//     }
//   }

//   // Bonus de streak ?
//   if (newStreak === 3 && gamification.streak < 3) streakBonusAction = 'streak_3'
//   if (newStreak === 7 && gamification.streak < 7) streakBonusAction = 'streak_7'
//   if (newStreak === 30 && gamification.streak < 30)
//     streakBonusAction = 'streak_30'

//   const newMaxStreak = Math.max(gamification.maxStreak, newStreak)

//   return { newStreak, newMaxStreak, streakBonusAction, lastActiveAt: now }
// }

// // ─── Vérifier et attribuer les badges ─────────────────────
// async function checkAndAwardBadges(gamification, existingBadges) {
//   const existingIds = new Set(existingBadges.map((b) => b.badge))
//   const newBadges = []

//   for (const badge of BADGES_CONFIG) {
//     if (existingIds.has(badge.id)) continue // Déjà obtenu

//     if (
//       badge.check({
//         totalPoints: gamification.totalPoints,
//         maxStreak: gamification.maxStreak,
//       })
//     ) {
//       newBadges.push(badge.id)
//     }
//   }

//   return newBadges
// }

// // ─── Fonction principale : attribuer des points ────────────
// /**
//  * @param {number} userId
//  * @param {'sentence'|'paragraph'|'article'|'voice'} action
//  * @param {number|null} refId  — ID de la traduction ou recording
//  * @returns {object} — gamification mise à jour + nouveaux badges
//  */
// export async function awardPoints(userId, action, refId = null) {
//   const basePoints = POINTS_CONFIG[action]
//   if (!basePoints) return null

//   // 1. Récupérer ou créer la gamification de l'utilisateur
//   let gamification = await prisma.userGamification.findUnique({
//     where: { userId },
//     include: { badges: true },
//   })

//   if (!gamification) {
//     gamification = await prisma.userGamification.create({
//       data: {
//         userId,
//         points: 0,
//         totalPoints: 0,
//         level: 1,
//         streak: 0,
//         maxStreak: 0,
//       },
//       include: { badges: true },
//     })
//   }

//   // 2. Calculer le streak
//   const { newStreak, newMaxStreak, streakBonusAction, lastActiveAt } =
//     await updateStreak(gamification)

//   // 3. Calculer les points totaux
//   let pointsEarned = basePoints
//   let bonusDescription = null

//   if (streakBonusAction) {
//     const bonusPoints = POINTS_CONFIG[streakBonusAction]
//     pointsEarned += bonusPoints
//     bonusDescription = `+${bonusPoints} bonus streak ${newStreak} jours`
//   }

//   const newTotalPoints = gamification.totalPoints + pointsEarned
//   const newPoints = gamification.points + pointsEarned
//   const newLevel = calculateLevel(newTotalPoints).level

//   // 4. Mettre à jour la gamification + créer la transaction
//   const [updatedGamification] = await prisma.$transaction([
//     prisma.userGamification.update({
//       where: { userId },
//       data: {
//         points: newPoints,
//         totalPoints: newTotalPoints,
//         level: newLevel,
//         streak: newStreak,
//         maxStreak: newMaxStreak,
//         lastActiveAt,
//       },
//       include: { badges: true },
//     }),
//     prisma.pointTransaction.create({
//       data: {
//         userId,
//         gamificationId: gamification.id,
//         action,
//         points: basePoints,
//         description: getActionDescription(action, refId),
//         refId,
//       },
//     }),
//     // Transaction bonus streak si applicable
//     ...(streakBonusAction
//       ? [
//           prisma.pointTransaction.create({
//             data: {
//               userId,
//               gamificationId: gamification.id,
//               action: streakBonusAction,
//               points: POINTS_CONFIG[streakBonusAction],
//               description: `Bonus streak ${newStreak} jours consécutifs`,
//               refId: null,
//             },
//           }),
//         ]
//       : []),
//   ])

//   // 5. Vérifier les nouveaux badges
//   const newBadgeIds = await checkAndAwardBadges(
//     { totalPoints: newTotalPoints, maxStreak: newMaxStreak },
//     updatedGamification.badges,
//   )

//   if (newBadgeIds.length > 0) {
//     await prisma.userBadge.createMany({
//       data: newBadgeIds.map((badge) => ({
//         userId,
//         gamificationId: gamification.id,
//         badge,
//       })),
//       skipDuplicates: true,
//     })
//   }

//   const newBadges = BADGES_CONFIG.filter((b) => newBadgeIds.includes(b.id))

//   return {
//     pointsEarned,
//     bonusDescription,
//     totalPoints: newTotalPoints,
//     level: calculateLevel(newTotalPoints),
//     streak: newStreak,
//     newBadges, // Badges fraîchement débloqués
//   }
// }

// // ─── Helper : description de l'action ─────────────────────
// function getActionDescription(action, refId) {
//   const descriptions = {
//     sentence: "Traduction d'une phrase",
//     paragraph: "Traduction d'un paragraphe",
//     article: "Traduction d'un article",
//     voice: 'Enregistrement vocal validé',
//   }
//   return descriptions[action] || action
// }

// // ─── Récupérer la gamification d'un utilisateur ───────────
// export async function getUserGamification(userId) {
//   let gamification = await prisma.userGamification.findUnique({
//     where: { userId },
//     include: {
//       badges: { orderBy: { earnedAt: 'asc' } },
//       transactions: { orderBy: { createdAt: 'desc' }, take: 10 },
//     },
//   })

//   if (!gamification) {
//     // Retourner une gamification vide sans créer en DB
//     return {
//       points: 0,
//       totalPoints: 0,
//       level: calculateLevel(0),
//       streak: 0,
//       maxStreak: 0,
//       badges: [],
//       transactions: [],
//       allBadges: BADGES_CONFIG.map((b) => ({ ...b, earned: false })),
//     }
//   }

//   const levelInfo = calculateLevel(gamification.totalPoints)

//   // Enrichir les badges avec la config complète
//   const earnedBadgeIds = new Set(gamification.badges.map((b) => b.badge))
//   const allBadges = BADGES_CONFIG.map((b) => ({
//     ...b,
//     earned: earnedBadgeIds.has(b.id),
//     earnedAt:
//       gamification.badges.find((ub) => ub.badge === b.id)?.earnedAt || null,
//   }))

//   return {
//     points: gamification.points,
//     totalPoints: gamification.totalPoints,
//     level: levelInfo,
//     streak: gamification.streak,
//     maxStreak: gamification.maxStreak,
//     lastActiveAt: gamification.lastActiveAt,
//     badges: gamification.badges,
//     transactions: gamification.transactions,
//     allBadges,
//   }
// }

// src/lib/gamification.js
import prisma from '@/lib/prisma'

export const POINTS_CONFIG = {
  sentence: 5,
  paragraph: 15,
  article: 30,
  voice: 10,
  streak_3: 10,
  streak_7: 25,
  streak_30: 100,
}

export const LEVELS = [
  { level: 1, name: 'Débutant', min: 0 },
  { level: 2, name: 'Apprenti', min: 100 },
  { level: 3, name: 'Contributeur', min: 300 },
  { level: 4, name: 'Contributeur actif', min: 700 },
  { level: 5, name: 'Expert shikomori', min: 1500 },
  { level: 6, name: 'Maître', min: 3000 },
]

export const BADGES_CONFIG = [
  {
    id: 'first_contribution',
    label: 'Première contribution',
    icon: '🌱',
    description: 'Vous avez fait votre première contribution !',
    check: ({ totalPoints }) => totalPoints >= 1,
  },
  {
    id: 'debutant',
    label: 'Débutant',
    icon: '⭐',
    description: '100 points cumulés',
    check: ({ totalPoints }) => totalPoints >= 100,
  },
  {
    id: 'actif',
    label: 'Contributeur actif',
    icon: '🔥',
    description: '500 points cumulés',
    check: ({ totalPoints }) => totalPoints >= 500,
  },
  {
    id: 'expert',
    label: 'Expert shikomori',
    icon: '🏆',
    description: '1500 points cumulés',
    check: ({ totalPoints }) => totalPoints >= 1500,
  },
  {
    id: 'maitre',
    label: 'Maître',
    icon: '👑',
    description: '3000 points cumulés',
    check: ({ totalPoints }) => totalPoints >= 3000,
  },
  {
    id: 'streak_3',
    label: '3 jours consécutifs',
    icon: '🔥',
    description: 'Connecté 3 jours de suite',
    check: ({ maxStreak }) => maxStreak >= 3,
  },
  {
    id: 'streak_7',
    label: 'Une semaine',
    icon: '📅',
    description: 'Connecté 7 jours de suite',
    check: ({ maxStreak }) => maxStreak >= 7,
  },
  {
    id: 'streak_30',
    label: 'Un mois',
    icon: '🗓️',
    description: 'Connecté 30 jours de suite',
    check: ({ maxStreak }) => maxStreak >= 30,
  },
]

export function calculateLevel(totalPoints) {
  let current = LEVELS[0]
  for (const lvl of LEVELS) {
    if (totalPoints >= lvl.min) current = lvl
    else break
  }
  const nextLevelIndex = LEVELS.findIndex((l) => l.level === current.level) + 1
  const next = LEVELS[nextLevelIndex] || null
  return {
    ...current,
    next,
    progressToNext: next
      ? Math.round(
          ((totalPoints - current.min) / (next.min - current.min)) * 100,
        )
      : 100,
  }
}

function updateStreak(gamification) {
  const now = new Date()
  const last = gamification.lastActiveAt

  let newStreak = gamification.streak
  let streakBonusAction = null

  if (!last) {
    newStreak = 1
  } else {
    const diffMs = now - new Date(last)
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      // même jour — inchangé
    } else if (diffDays === 1) {
      newStreak = gamification.streak + 1
    } else {
      newStreak = 1
    }
  }

  if (newStreak === 3 && gamification.streak < 3) streakBonusAction = 'streak_3'
  if (newStreak === 7 && gamification.streak < 7) streakBonusAction = 'streak_7'
  if (newStreak === 30 && gamification.streak < 30)
    streakBonusAction = 'streak_30'

  const newMaxStreak = Math.max(gamification.maxStreak, newStreak)
  return { newStreak, newMaxStreak, streakBonusAction, lastActiveAt: now }
}

async function checkAndAwardBadges(gamification, existingBadges) {
  const existingIds = new Set(existingBadges.map((b) => b.badge))
  const newBadges = []

  for (const badge of BADGES_CONFIG) {
    if (existingIds.has(badge.id)) continue
    if (
      badge.check({
        totalPoints: gamification.totalPoints,
        maxStreak: gamification.maxStreak,
      })
    ) {
      newBadges.push(badge.id)
    }
  }
  return newBadges
}

function getActionDescription(action) {
  const descriptions = {
    sentence: "Traduction d'une phrase",
    paragraph: "Traduction d'un paragraphe",
    article: "Traduction d'un article",
    voice: 'Enregistrement vocal validé',
  }
  return descriptions[action] || action
}

// ─── Fonction principale ───────────────────────────────────
export async function awardPoints(userId, action, refId = null) {
  const basePoints = POINTS_CONFIG[action]
  if (!basePoints) return null

  // 1. Récupérer ou créer la gamification
  let gamification = await prisma.userGamification.findUnique({
    where: { userId },
    include: { badges: true },
  })

  if (!gamification) {
    gamification = await prisma.userGamification.create({
      data: {
        userId,
        points: 0,
        totalPoints: 0,
        level: 1,
        streak: 0,
        maxStreak: 0,
      },
      include: { badges: true },
    })
  }

  // 2. Streak
  const { newStreak, newMaxStreak, streakBonusAction, lastActiveAt } =
    updateStreak(gamification)

  // 3. Points
  const bonusPoints = streakBonusAction ? POINTS_CONFIG[streakBonusAction] : 0
  const pointsEarned = basePoints + bonusPoints
  const newTotalPoints = gamification.totalPoints + pointsEarned
  const newPoints = gamification.points + pointsEarned
  const newLevel = calculateLevel(newTotalPoints).level

  // ✅ 4. Update gamification — SÉQUENTIEL, pas de $transaction
  const updatedGamification = await prisma.userGamification.update({
    where: { userId },
    data: {
      points: newPoints,
      totalPoints: newTotalPoints,
      level: newLevel,
      streak: newStreak,
      maxStreak: newMaxStreak,
      lastActiveAt,
    },
    include: { badges: true },
  })

  // ✅ 5. Créer transaction principale — avec l'ID garanti
  await prisma.pointTransaction.create({
    data: {
      userId,
      gamificationId: updatedGamification.id,
      action,
      points: basePoints,
      description: getActionDescription(action),
      refId: refId ?? null,
    },
  })

  // ✅ 6. Créer transaction bonus streak si applicable
  if (streakBonusAction) {
    await prisma.pointTransaction.create({
      data: {
        userId,
        gamificationId: updatedGamification.id,
        action: streakBonusAction,
        points: bonusPoints,
        description: `Bonus streak ${newStreak} jours consécutifs`,
        refId: null,
      },
    })
  }

  // ✅ 7. Badges
  const newBadgeIds = await checkAndAwardBadges(
    { totalPoints: newTotalPoints, maxStreak: newMaxStreak },
    updatedGamification.badges,
  )

  if (newBadgeIds.length > 0) {
    await prisma.userBadge.createMany({
      data: newBadgeIds.map((badge) => ({
        userId,
        gamificationId: updatedGamification.id,
        badge,
      })),
      skipDuplicates: true,
    })
  }

  const newBadges = BADGES_CONFIG.filter((b) => newBadgeIds.includes(b.id))

  return {
    pointsEarned,
    bonusDescription: streakBonusAction
      ? `+${bonusPoints} bonus streak ${newStreak} jours`
      : null,
    totalPoints: newTotalPoints,
    level: calculateLevel(newTotalPoints),
    streak: newStreak,
    newBadges,
  }
}

// ─── Récupérer la gamification d'un utilisateur ───────────
export async function getUserGamification(userId) {
  const gamification = await prisma.userGamification.findUnique({
    where: { userId },
    include: {
      badges: { orderBy: { earnedAt: 'asc' } },
      transactions: { orderBy: { createdAt: 'desc' }, take: 10 },
    },
  })

  if (!gamification) {
    return {
      points: 0,
      totalPoints: 0,
      level: calculateLevel(0),
      streak: 0,
      maxStreak: 0,
      badges: [],
      transactions: [],
      allBadges: BADGES_CONFIG.map((b) => ({
        ...b,
        earned: false,
        earnedAt: null,
      })),
    }
  }

  const levelInfo = calculateLevel(gamification.totalPoints)
  const earnedBadgeIds = new Set(gamification.badges.map((b) => b.badge))

  const allBadges = BADGES_CONFIG.map((b) => ({
    ...b,
    earned: earnedBadgeIds.has(b.id),
    earnedAt:
      gamification.badges.find((ub) => ub.badge === b.id)?.earnedAt || null,
  }))

  return {
    points: gamification.points,
    totalPoints: gamification.totalPoints,
    level: levelInfo,
    streak: gamification.streak,
    maxStreak: gamification.maxStreak,
    lastActiveAt: gamification.lastActiveAt,
    badges: gamification.badges,
    transactions: gamification.transactions,
    allBadges,
  }
}
