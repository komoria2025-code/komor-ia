// // src/app/components/profil-page.js
// 'use client'

// import { useState, useEffect } from 'react'
// import { useSession } from 'next-auth/react'
// import { Flame, Star, Trophy, Zap, Clock, TrendingUp } from 'lucide-react'
// import { LEVELS } from '@/lib/gamification'

// const ACTION_LABELS = {
//   sentence: {
//     label: 'Phrase traduite',
//     icon: '📝',
//     color: 'text-blue-600',
//     bg: 'bg-blue-50',
//   },
//   paragraph: {
//     label: 'Paragraphe traduit',
//     icon: '📄',
//     color: 'text-indigo-600',
//     bg: 'bg-indigo-50',
//   },
//   article: {
//     label: 'Article traduit',
//     icon: '📰',
//     color: 'text-purple-600',
//     bg: 'bg-purple-50',
//   },
//   voice: {
//     label: 'Enregistrement validé',
//     icon: '🎙️',
//     color: 'text-green-600',
//     bg: 'bg-green-50',
//   },
//   streak_3: {
//     label: 'Bonus streak 3 jours',
//     icon: '🔥',
//     color: 'text-red-600',
//     bg: 'bg-red-50',
//   },
//   streak_7: {
//     label: 'Bonus streak 7 jours',
//     icon: '🔥',
//     color: 'text-red-600',
//     bg: 'bg-red-50',
//   },
//   streak_30: {
//     label: 'Bonus streak 30 jours',
//     icon: '🔥',
//     color: 'text-red-600',
//     bg: 'bg-red-50',
//   },
// }

// export default function ProfilPage() {
//   const { data: session } = useSession()
//   const [gamif, setGamif] = useState(null)
//   const [history, setHistory] = useState([])
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     Promise.all([
//       fetch('/api/gamification').then((r) => r.json()),
//       fetch('/api/gamification/history?limit=15').then((r) => r.json()),
//     ])
//       .then(([g, h]) => {
//         setGamif(g)
//         setHistory(h.transactions || [])
//       })
//       .finally(() => setLoading(false))
//   }, [])

//   if (loading) {
//     return (
//       <div className="flex justify-center py-20">
//         <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
//       </div>
//     )
//   }

//   if (!gamif) return null

//   const { points, totalPoints, level, streak, maxStreak, allBadges } = gamif
//   const earnedBadges = allBadges.filter((b) => b.earned)
//   const unearnedBadges = allBadges.filter((b) => !b.earned)

//   return (
//     <div className="max-w-3xl mx-auto space-y-6">
//       {/* En-tête profil */}
//       <div className="bg-white rounded-2xl border border-gray-200 p-6">
//         <div className="flex items-start space-x-4">
//           {/* Avatar */}
//           <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
//             {session?.user?.image ? (
//               <img
//                 src={session.user.image}
//                 alt=""
//                 className="w-16 h-16 rounded-2xl object-cover"
//               />
//             ) : (
//               <span className="text-2xl font-bold text-white">
//                 {session?.user?.name?.[0] || 'K'}
//               </span>
//             )}
//           </div>

//           <div className="flex-1 min-w-0">
//             <h1 className="text-xl font-bold text-gray-900">
//               {session?.user?.name || 'Contributeur'}
//             </h1>
//             <p className="text-sm text-gray-500">{session?.user?.email}</p>
//             <div className="flex items-center space-x-3 mt-2">
//               <span className="inline-flex items-center space-x-1 px-3 py-1 bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700 rounded-full text-xs font-semibold">
//                 <Star className="w-3 h-3" />
//                 <span>
//                   Niveau {level.level} — {level.name}
//                 </span>
//               </span>
//               {streak > 0 && (
//                 <span className="inline-flex items-center space-x-1 px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-semibold">
//                   <Flame className="w-3 h-3" />
//                   <span>{streak} jours</span>
//                 </span>
//               )}
//             </div>
//           </div>

//           {/* Points total */}
//           <div className="text-right flex-shrink-0">
//             <p className="text-3xl font-bold text-gray-900">{totalPoints}</p>
//             <p className="text-xs text-gray-500">points totaux</p>
//           </div>
//         </div>

//         {/* Barre de progression niveau */}
//         {level.next && (
//           <div className="mt-6">
//             <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
//               <span>{level.name}</span>
//               <span className="font-medium text-gray-700">
//                 {totalPoints} / {level.next.min} pts → {level.next.name}
//               </span>
//             </div>
//             <div className="w-full bg-gray-100 rounded-full h-3">
//               <div
//                 className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all relative"
//                 style={{ width: `${level.progressToNext}%` }}
//               >
//                 <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-orange-400 rounded-full shadow-sm" />
//               </div>
//             </div>
//             <p className="text-xs text-gray-400 mt-1.5 text-right">
//               Plus que {level.next.min - totalPoints} points pour atteindre{' '}
//               {level.next.name} !
//             </p>
//           </div>
//         )}
//         {!level.next && (
//           <div className="mt-4 p-3 bg-yellow-50 rounded-lg text-center">
//             <p className="text-sm font-semibold text-yellow-800">
//               👑 Niveau maximum atteint !
//             </p>
//           </div>
//         )}
//       </div>

//       {/* Stats rapides */}
//       <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
//         {[
//           {
//             label: 'Points actuels',
//             value: points,
//             icon: Zap,
//             color: 'text-blue-600',
//             bg: 'bg-blue-50',
//           },
//           {
//             label: 'Streak actuel',
//             value: `${streak}j`,
//             icon: Flame,
//             color: 'text-red-600',
//             bg: 'bg-red-50',
//           },
//           {
//             label: 'Meilleur streak',
//             value: `${maxStreak}j`,
//             icon: Trophy,
//             color: 'text-yellow-600',
//             bg: 'bg-yellow-50',
//           },
//           {
//             label: 'Badges obtenus',
//             value: earnedBadges.length,
//             icon: Star,
//             color: 'text-purple-600',
//             bg: 'bg-purple-50',
//           },
//         ].map((stat, i) => {
//           const Icon = stat.icon
//           return (
//             <div
//               key={i}
//               className="bg-white rounded-xl border border-gray-200 p-4 text-center"
//             >
//               <div
//                 className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center mx-auto mb-2`}
//               >
//                 <Icon className={`w-5 h-5 ${stat.color}`} />
//               </div>
//               <p className="text-xl font-bold text-gray-900">{stat.value}</p>
//               <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
//             </div>
//           )
//         })}
//       </div>

//       {/* Badges obtenus */}
//       {earnedBadges.length > 0 && (
//         <div className="bg-white rounded-2xl border border-gray-200 p-6">
//           <h2 className="font-semibold text-gray-900 mb-4">
//             Badges obtenus{' '}
//             <span className="text-gray-400 font-normal">
//               ({earnedBadges.length})
//             </span>
//           </h2>
//           <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
//             {earnedBadges.map((badge) => (
//               <div
//                 key={badge.id}
//                 className="flex flex-col items-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl text-center"
//               >
//                 <span className="text-3xl mb-2">{badge.icon}</span>
//                 <p className="text-xs font-semibold text-gray-900">
//                   {badge.label}
//                 </p>
//                 {badge.earnedAt && (
//                   <p className="text-xs text-gray-400 mt-1">
//                     {new Date(badge.earnedAt).toLocaleDateString('fr-FR')}
//                   </p>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Badges à débloquer */}
//       {unearnedBadges.length > 0 && (
//         <div className="bg-white rounded-2xl border border-gray-200 p-6">
//           <h2 className="font-semibold text-gray-900 mb-4">
//             Badges à débloquer{' '}
//             <span className="text-gray-400 font-normal">
//               ({unearnedBadges.length})
//             </span>
//           </h2>
//           <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
//             {unearnedBadges.map((badge) => (
//               <div
//                 key={badge.id}
//                 className="flex flex-col items-center p-4 bg-gray-50 border border-gray-200 rounded-xl text-center opacity-50 grayscale"
//               >
//                 <span className="text-3xl mb-2">{badge.icon}</span>
//                 <p className="text-xs font-semibold text-gray-600">
//                   {badge.label}
//                 </p>
//                 <p className="text-xs text-gray-400 mt-1">
//                   {badge.description}
//                 </p>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Historique des gains */}
//       {history.length > 0 && (
//         <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
//           <div className="px-6 py-4 border-b border-gray-100">
//             <h2 className="font-semibold text-gray-900">
//               Historique des contributions
//             </h2>
//           </div>
//           <div className="divide-y divide-gray-100">
//             {history.map((tx) => {
//               const action = ACTION_LABELS[tx.action] || {
//                 label: tx.action,
//                 icon: '⚡',
//                 color: 'text-gray-600',
//                 bg: 'bg-gray-50',
//               }
//               return (
//                 <div
//                   key={tx.id}
//                   className="flex items-center justify-between px-6 py-3"
//                 >
//                   <div className="flex items-center space-x-3">
//                     <div
//                       className={`w-8 h-8 ${action.bg} rounded-lg flex items-center justify-center text-sm`}
//                     >
//                       {action.icon}
//                     </div>
//                     <div>
//                       <p className={`text-sm font-medium ${action.color}`}>
//                         {action.label}
//                       </p>
//                       <p className="text-xs text-gray-400">
//                         {new Date(tx.createdAt).toLocaleDateString('fr-FR', {
//                           day: 'numeric',
//                           month: 'short',
//                           year: 'numeric',
//                           hour: '2-digit',
//                           minute: '2-digit',
//                         })}
//                       </p>
//                     </div>
//                   </div>
//                   <span className="text-sm font-bold text-green-600">
//                     +{tx.points} pts
//                   </span>
//                 </div>
//               )
//             })}
//           </div>
//         </div>
//       )}

//       {history.length === 0 && (
//         <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
//           <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
//           <p className="text-gray-500 font-medium">
//             Aucune contribution pour le moment
//           </p>
//           <p className="text-gray-400 text-sm mt-1">
//             Commencez à traduire ou à enregistrer des phrases pour gagner des
//             points !
//           </p>
//         </div>
//       )}
//     </div>
//   )
// }

'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Flame, Star, Trophy, Zap, TrendingUp } from 'lucide-react'

const ACTION_LABELS = {
  sentence: {
    label: 'Phrase traduite',
    icon: '📝',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  paragraph: {
    label: 'Paragraphe traduit',
    icon: '📄',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
  },
  article: {
    label: 'Article traduit',
    icon: '📰',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  voice: {
    label: 'Enregistrement validé',
    icon: '🎙️',
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  streak_3: {
    label: 'Bonus streak 3 jours',
    icon: '🔥',
    color: 'text-red-600',
    bg: 'bg-red-50',
  },
  streak_7: {
    label: 'Bonus streak 7 jours',
    icon: '🔥',
    color: 'text-red-600',
    bg: 'bg-red-50',
  },
  streak_30: {
    label: 'Bonus streak 30 jours',
    icon: '🔥',
    color: 'text-red-600',
    bg: 'bg-red-50',
  },
}

export default function ProfilPage() {
  const { data: session } = useSession()
  const [gamif, setGamif] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/gamification').then((r) => r.json()),
      fetch('/api/gamification/history?limit=15').then((r) => r.json()),
    ])
      .then(([g, h]) => {
        setGamif(g)
        setHistory(h.transactions || [])
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!gamif) return null

  const { points, totalPoints, level, streak, maxStreak, allBadges } = gamif
  const earnedBadges = allBadges.filter((b) => b.earned)
  const unearnedBadges = allBadges.filter((b) => !b.earned)

  return (
    <div className="max-w-3xl mx-auto space-y-4 px-0 sm:px-0">
      {/* ── En-tête profil ───────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6">
        {/* Ligne avatar + infos */}
        <div className="flex items-start space-x-3 sm:space-x-4">
          {/* Avatar */}
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden">
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xl sm:text-2xl font-bold text-white">
                {session?.user?.name?.[0] || 'K'}
              </span>
            )}
          </div>

          {/* Nom + email + badges */}
          <div className="flex-1 min-w-0">
            <h1 className="text-base sm:text-xl font-bold text-gray-900 truncate">
              {session?.user?.name || 'Contributeur'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 truncate">
              {session?.user?.email}
            </p>

            {/* Badges niveau + streak + points (mobile : tout inline) */}
            <div className="flex items-center flex-wrap gap-2 mt-2">
              <span className="inline-flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                <Star className="w-3 h-3 flex-shrink-0" />
                <span>
                  Niv. {level.level} — {level.name}
                </span>
              </span>
              {streak > 0 && (
                <span className="inline-flex items-center space-x-1 px-2 py-1 bg-red-50 text-red-600 rounded-full text-xs font-semibold">
                  <Flame className="w-3 h-3 flex-shrink-0" />
                  <span>{streak}j</span>
                </span>
              )}
              {/* Points affichés inline sur mobile */}
              <span className="inline-flex items-center space-x-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold sm:hidden">
                <Zap className="w-3 h-3 flex-shrink-0 text-blue-500" />
                <span>{totalPoints} pts</span>
              </span>
            </div>
          </div>

          {/* Points — cachés sur mobile, visibles sm+ */}
          <div className="hidden sm:block text-right flex-shrink-0">
            <p className="text-3xl font-bold text-gray-900">{totalPoints}</p>
            <p className="text-xs text-gray-500">points totaux</p>
          </div>
        </div>

        {/* Barre de progression */}
        {level.next ? (
          <div className="mt-4 sm:mt-6">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span className="font-medium">{level.name}</span>
              <span className="text-right">
                {totalPoints} / {level.next.min} pts → {level.next.name}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 sm:h-3">
              <div
                className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 sm:h-3 rounded-full transition-all relative"
                style={{ width: `${level.progressToNext}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 bg-white border-2 border-orange-400 rounded-full shadow-sm" />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-1.5 text-right">
              Plus que {level.next.min - totalPoints} pts pour atteindre{' '}
              {level.next.name} !
            </p>
          </div>
        ) : (
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg text-center">
            <p className="text-sm font-semibold text-yellow-800">
              👑 Niveau maximum atteint !
            </p>
          </div>
        )}
      </div>

      {/* ── Stats rapides ─────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[
          {
            label: 'Points actuels',
            value: points,
            icon: Zap,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
          },
          {
            label: 'Streak actuel',
            value: `${streak}j`,
            icon: Flame,
            color: 'text-red-600',
            bg: 'bg-red-50',
          },
          {
            label: 'Meilleur streak',
            value: `${maxStreak}j`,
            icon: Trophy,
            color: 'text-yellow-600',
            bg: 'bg-yellow-50',
          },
          {
            label: 'Badges obtenus',
            value: earnedBadges.length,
            icon: Star,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
          },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 text-center"
            >
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 ${stat.bg} rounded-lg flex items-center justify-center mx-auto mb-2`}
              >
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.color}`} />
              </div>
              <p className="text-lg sm:text-xl font-bold text-gray-900">
                {stat.value}
              </p>
              <p className="text-xs text-gray-500 mt-0.5 leading-tight">
                {stat.label}
              </p>
            </div>
          )
        })}
      </div>

      {/* ── Badges obtenus ────────────────────────────── */}
      {earnedBadges.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6">
          <h2 className="font-semibold text-gray-900 mb-4">
            Badges obtenus{' '}
            <span className="text-gray-400 font-normal">
              ({earnedBadges.length})
            </span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {earnedBadges.map((badge) => (
              <div
                key={badge.id}
                className="flex flex-col items-center p-3 sm:p-4 bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl text-center"
              >
                <span className="text-2xl sm:text-3xl mb-2">{badge.icon}</span>
                <p className="text-xs font-semibold text-gray-900">
                  {badge.label}
                </p>
                {badge.earnedAt && (
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(badge.earnedAt).toLocaleDateString('fr-FR')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Badges à débloquer ────────────────────────── */}
      {unearnedBadges.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6">
          <h2 className="font-semibold text-gray-900 mb-4">
            Badges à débloquer{' '}
            <span className="text-gray-400 font-normal">
              ({unearnedBadges.length})
            </span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {unearnedBadges.map((badge) => (
              <div
                key={badge.id}
                className="flex flex-col items-center p-3 sm:p-4 bg-gray-50 border border-gray-200 rounded-xl text-center opacity-50 grayscale"
              >
                <span className="text-2xl sm:text-3xl mb-2">{badge.icon}</span>
                <p className="text-xs font-semibold text-gray-600">
                  {badge.label}
                </p>
                <p className="text-xs text-gray-400 mt-1 leading-tight">
                  {badge.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Historique ────────────────────────────────── */}
      {history.length > 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">
              Historique des contributions
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {history.map((tx) => {
              const action = ACTION_LABELS[tx.action] || {
                label: tx.action,
                icon: '⚡',
                color: 'text-gray-600',
                bg: 'bg-gray-50',
              }
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between px-4 sm:px-6 py-3"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div
                      className={`w-8 h-8 ${action.bg} rounded-lg flex items-center justify-center text-sm flex-shrink-0`}
                    >
                      {action.icon}
                    </div>
                    <div className="min-w-0">
                      <p
                        className={`text-sm font-medium ${action.color} truncate`}
                      >
                        {action.label}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(tx.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-green-600 flex-shrink-0 ml-2">
                    +{tx.points} pts
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-12 text-center">
          <TrendingUp className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">
            Aucune contribution pour le moment
          </p>
          <p className="text-gray-400 text-sm mt-1">
            Commencez à traduire ou à enregistrer des phrases pour gagner des
            points !
          </p>
        </div>
      )}
    </div>
  )
}
