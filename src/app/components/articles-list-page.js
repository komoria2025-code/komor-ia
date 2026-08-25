// 'use client'

// import { useState, useEffect } from 'react'
// import {
//   Languages,
//   Search,
//   BookOpen,
//   TrendingUp,
//   CheckCircle,
//   Clock,
//   AlertCircle,
//   RotateCcw,
// } from 'lucide-react'

// export default function ArticlesListPage({ onArticleClick }) {
//   const [articles, setArticles] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [loadingMore, setLoadingMore] = useState(false)
//   const [searchQuery, setSearchQuery] = useState('')
//   const [filterStatus, setFilterStatus] = useState('all')
//   const [filterCategory, setFilterCategory] = useState('all')
//   const [offset, setOffset] = useState(0)
//   const [hasMore, setHasMore] = useState(true)

//   const LIMIT = 50

//   useEffect(() => {
//     setOffset(0)
//     setArticles([])
//     fetchArticles(true)
//   }, [filterStatus, filterCategory])

//   const fetchArticles = async (reset = false) => {
//     try {
//       if (reset) setLoading(true)
//       else setLoadingMore(true)

//       const params = new URLSearchParams()
//       if (filterStatus !== 'all') params.append('status', filterStatus)
//       params.append('offset', reset ? 0 : offset)

//       const res = await fetch(`/api/articles?${params}`)
//       const data = await res.json()
//         setArticles((prev) => (reset ? newArticles : [...prev, ...newArticles]))
//         setHasMore(offset + LIMIT < data.total)
//         setOffset((prev) => prev + LIMIT)
//       }
//     } catch (error) {
//       console.error('Erreur:', error)
//     } finally {
//       setLoading(false)
//       setLoadingMore(false)
//     }
//   }

//   // ✅ Lire la traduction de l'utilisateur
//   const getUserTranslation = (article) => article.translations?.[0] || null

//   const getCategoryLabel = (category) => {
//     const labels = {
//       societe: 'Société',
//       politique: 'Politique',
//       economie: 'Économie',
//       sport: 'Sport',
//       sante: 'Santé',
//       education: 'Éducation',
//       science: 'Science',
//       histoire: 'Histoire',
//       culture: 'Culture',
//       religion: 'Religion',
//       actualites: 'Actualités',
//       litterature: 'Littérature',
//       autre: 'Autre',
//     }
//     return labels[category] || category
//   }

//   const getStatusBadge = (status) => {
//     const badges = {
//       pending: {
//         color: 'bg-yellow-100 text-yellow-700',
//         icon: Clock,
//         label: 'En attente',
//       },
//       in_progress: {
//         color: 'bg-blue-100 text-blue-700',
//         icon: TrendingUp,
//         label: 'En cours',
//       },
//       completed: {
//         color: 'bg-green-100 text-green-700',
//         icon: CheckCircle,
//         label: 'Terminé',
//       },
//       verified: {
//         color: 'bg-purple-100 text-purple-700',
//         icon: CheckCircle,
//         label: 'Vérifié',
//       },
//     }
//     const badge = badges[status] || badges.pending
//     const Icon = badge.icon
//     return (
//       <span
//         className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}
//       >
//         <Icon className="w-3 h-3" />
//         <span>{badge.label}</span>
//       </span>
//     )
//   }

//   // ✅ Badge progression utilisateur
//   const getUserBadge = (article) => {
//     const t = getUserTranslation(article)
//     if (!t) return null

//     if (t.status === 'in_progress')
//       return (
//         <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
//           <RotateCcw className="w-3 h-3" />
//           <span>Reprendrez — {t.progress}%</span>
//         </span>
//       )

//     if (t.status === 'completed')
//       return (
//         <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
//           <CheckCircle className="w-3 h-3" />
//           <span>Soumis</span>
//         </span>
//       )

//     return null
//   }

//   // ✅ Séparer les articles en cours des autres
//   const filtered = articles.filter((a) =>
//     a.title.toLowerCase().includes(searchQuery.toLowerCase()),
//   )

//   const inProgress = filtered.filter(
//     (a) => getUserTranslation(a)?.status === 'in_progress',
//   )
//   const others = filtered.filter(
//     (a) => getUserTranslation(a)?.status !== 'in_progress',
//   )

//   // ─── Carte article ────────────────────────────────
//   const ArticleCard = ({ article }) => {
//     const userBadge = getUserBadge(article)
//     const t = getUserTranslation(article)

//     return (
//       <div
//         className={`bg-white p-4 rounded-xl border transition-all hover:shadow-md ${
//           t?.status === 'in_progress'
//             ? 'border-orange-200 ring-1 ring-orange-100'
//             : 'border-gray-200'
//         }`}
//       >
//         {/* Badges */}
//         <div className="flex items-center justify-between mb-3">
//           <div className="flex items-center space-x-2 flex-wrap gap-1">
//             {getStatusBadge(article.status)}
//             {userBadge}
//           </div>
//           <span className="text-xs text-gray-500">
//             {getCategoryLabel(article.category)}
//           </span>
//         </div>

//         {/* Titre */}
//         <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
//           {article.title}
//         </h3>

//         {/* Source */}
//         <div className="text-xs text-gray-400 mb-2">
//           {article.source || 'Source inconnue'}
//           {article.author && ` • ${article.author}`}
//         </div>

//         {/* Extrait */}
//         <p className="text-sm text-gray-600 mb-3 line-clamp-2">
//           {article.originalText.substring(0, 120)}...
//         </p>

//         {/* Barre de progression si en cours */}
//         {t?.status === 'in_progress' && (
//           <div className="mb-3">
//             <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
//               <span>Progression</span>
//               <span className="font-medium text-orange-600">{t.progress}%</span>
//             </div>
//             <div className="w-full bg-gray-100 rounded-full h-1.5">
//               <div
//                 className="bg-orange-400 h-1.5 rounded-full transition-all"
//                 style={{ width: `${t.progress}%` }}
//               />
//             </div>
//           </div>
//         )}

//         {/* Bouton */}
//         <button
//           onClick={() => onArticleClick(article.slug)}
//           className={`w-full text-left p-3 border rounded-lg transition-colors ${
//             t?.status === 'in_progress'
//               ? 'border-orange-300 bg-orange-50 hover:bg-orange-100'
//               : 'border-gray-200 hover:bg-gray-50'
//           }`}
//         >
//           <div className="flex items-center justify-between">
//             <span
//               className={`font-medium text-sm ${
//                 t?.status === 'in_progress'
//                   ? 'text-orange-600'
//                   : 'text-blue-600'
//               }`}
//             >
//               {t?.status === 'in_progress' ? '↩ Reprendre →' : 'Lire →'}
//             </span>
//           </div>
//           <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
//             <span>Difficulté : {'⭐'.repeat(article.difficulty || 1)}</span>
//             {article._count?.translations > 0 && (
//               <span>{article._count.translations} traduction(s)</span>
//             )}
//           </div>
//         </button>
//       </div>
//     )
//   }

//   // ─── Rendu ────────────────────────────────────────
//   return (
//     <div className="min-h-screen bg-[#F5F3EF]">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-8">
//           <h1 className="text-3xl mb-4">Articles & Traduction</h1>
//         </div>

//         {/* Filtres */}
//         <div className="bg-white p-6 rounded-xl mb-6">
//           <div className="grid md:grid-cols-3 gap-4">
//             <input
//               type="text"
//               placeholder="Rechercher..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="border border-gray-300 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
//             />
//             <select
//               value={filterStatus}
//               onChange={(e) => setFilterStatus(e.target.value)}
//               className="border border-gray-300 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
//             >
//               <option value="all">Tous les statuts</option>
//               <option value="pending">En attente</option>
//               <option value="in_progress">En cours</option>
//               <option value="completed">Terminé</option>
//               <option value="verified">Vérifié</option>
//             </select>
//             <select
//               value={filterCategory}
//               onChange={(e) => setFilterCategory(e.target.value)}
//               className="border border-gray-300 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
//             >
//               <option value="all">Toutes les catégories</option>
//               <option value="societe">Société</option>
//               <option value="politique">Politique</option>
//               <option value="economie">Économie</option>
//               <option value="sport">Sport</option>
//               <option value="sante">Santé</option>
//               <option value="education">Éducation</option>
//               <option value="science">Science</option>
//               <option value="histoire">Histoire</option>
//               <option value="culture">Culture</option>
//               <option value="religion">Religion</option>
//               <option value="actualites">Actualités</option>
//               <option value="litterature">Littérature</option>
//               <option value="autre">Autre</option>
//             </select>
//           </div>
//         </div>

//         {loading ? (
//           <div className="flex justify-center py-12">
//             <div className="w-8 h-8 border-4 border-gray-900 border-t-transparent rounded-full animate-spin" />
//           </div>
//         ) : (
//           <>
//             {/* ✅ Section "Reprendre" */}
//             {inProgress.length > 0 && (
//               <div className="mb-10">
//                 <div className="flex items-center space-x-2 mb-4">
//                   <RotateCcw className="w-4 h-4 text-orange-500" />
//                   <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
//                     Reprendre où vous vous étiez arrêté
//                   </h2>
//                   <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
//                     {inProgress.length}
//                   </span>
//                 </div>
//                 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//                   {inProgress.map((a) => (
//                     <ArticleCard key={a.id} article={a} />
//                   ))}
//                 </div>
//                 <div className="mt-8 border-t border-gray-200" />
//               </div>
//             )}

//             {/* Tous les autres articles */}
//             {others.length > 0 && (
//               <div>
//                 {inProgress.length > 0 && (
//                   <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
//                     Tous les articles
//                   </h2>
//                 )}
//                 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//                   {others.map((a) => (
//                     <ArticleCard key={a.id} article={a} />
//                   ))}
//                 </div>
//               </div>
//             )}

//             {filtered.length === 0 && (
//               <div className="text-center py-16 text-gray-500">
//                 <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
//                 <p>Aucun article trouvé.</p>
//               </div>
//             )}

//             {/* Load more */}
//             {hasMore && (
//               <div className="text-center mt-8">
//                 <button
//                   onClick={() => fetchArticles()}
//                   disabled={loadingMore}
//                   className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
//                 >
//                   {loadingMore ? 'Chargement...' : 'Charger plus'}
//                 </button>
//               </div>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   )
// }

'use client'

import { useState, useEffect } from 'react'
import {
  Search,
  BookOpen,
  TrendingUp,
  CheckCircle,
  Clock,
  RotateCcw,
  Zap,
  AlignLeft,
  Newspaper,
} from 'lucide-react'

const TABS = [
  {
    id: 'sentence',
    label: 'Phrases',
    icon: Zap,
    points: '+5 pts',
    color: 'blue',
    description: 'Phrases courtes à traduire — rapide et motivant',
  },
  {
    id: 'paragraph',
    label: 'Paragraphes',
    icon: AlignLeft,
    points: '+15 pts',
    color: 'indigo',
    description: 'Contes, histoires courtes, petits paragraphes',
  },
  {
    id: 'article',
    label: 'Articles',
    icon: Newspaper,
    points: '+30 pts',
    color: 'purple',
    description: 'Articles de presse complets',
  },
]

const TAB_COLORS = {
  blue: {
    active: 'border-blue-600 text-blue-600',
    badge: 'bg-blue-100 text-blue-700',
    btn: 'border-blue-200 bg-blue-50 hover:bg-blue-100',
    btnText: 'text-blue-600',
    ring: 'border-blue-200 ring-blue-100',
    resumeBtn: 'border-orange-300 bg-orange-50 hover:bg-orange-100',
    resumeText: 'text-orange-600',
  },
  indigo: {
    active: 'border-indigo-600 text-indigo-600',
    badge: 'bg-indigo-100 text-indigo-700',
    btn: 'border-indigo-200 bg-indigo-50 hover:bg-indigo-100',
    btnText: 'text-indigo-600',
    ring: 'border-indigo-200 ring-indigo-100',
    resumeBtn: 'border-orange-300 bg-orange-50 hover:bg-orange-100',
    resumeText: 'text-orange-600',
  },
  purple: {
    active: 'border-purple-600 text-purple-600',
    badge: 'bg-purple-100 text-purple-700',
    btn: 'border-purple-200 bg-purple-50 hover:bg-purple-100',
    btnText: 'text-purple-600',
    ring: 'border-purple-200 ring-purple-100',
    resumeBtn: 'border-orange-300 bg-orange-50 hover:bg-orange-100',
    resumeText: 'text-orange-600',
  },
}

export default function ArticlesListPage({ onArticleClick }) {
  const [activeTab, setActiveTab] = useState('sentence')
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  const LIMIT = 50

  useEffect(() => {
    setOffset(0)
    setArticles([])
    fetchArticles(true)
  }, [activeTab, filterCategory])

  const fetchArticles = async (reset = false) => {
    if (!reset && loadingMore) return

    const requestOffset = reset ? 0 : offset

    try {
      if (reset) setLoading(true)
      else setLoadingMore(true)

      const params = new URLSearchParams()
      params.append('contentType', activeTab)
      if (filterCategory !== 'all') params.append('category', filterCategory)
      params.append('limit', LIMIT)
      params.append('offset', requestOffset)

      const res = await fetch(`/api/articles?${params}`)
      const data = await res.json()

      if (res.ok) {
        const newArticles = data.articles || []
        setArticles((prev) => {
          const merged = reset ? newArticles : [...prev, ...newArticles]
          return Array.from(
            new Map(merged.map((article) => [article.id, article])).values(),
          )
        })
        setHasMore(requestOffset + LIMIT < data.total)
        setOffset(requestOffset + LIMIT)
      }
    } catch (e) {
      console.error('Erreur:', e)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const getUserTranslation = (article) => article.translations?.[0] || null

  const getCategoryLabel = (category) => {
    const labels = {
      societe: 'Société',
      politique: 'Politique',
      economie: 'Économie',
      sport: 'Sport',
      sante: 'Santé',
      education: 'Éducation',
      science: 'Science',
      histoire: 'Histoire',
      culture: 'Culture',
      religion: 'Religion',
      actualites: 'Actualités',
      litterature: 'Littérature',
      autre: 'Autre',
    }
    return labels[category] || category
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: {
        color: 'bg-yellow-100 text-yellow-700',
        icon: Clock,
        label: 'En attente',
      },
      in_progress: {
        color: 'bg-blue-100 text-blue-700',
        icon: TrendingUp,
        label: 'En cours',
      },
      completed: {
        color: 'bg-green-100 text-green-700',
        icon: CheckCircle,
        label: 'Terminé',
      },
      verified: {
        color: 'bg-purple-100 text-purple-700',
        icon: CheckCircle,
        label: 'Vérifié',
      },
    }
    const badge = badges[status] || badges.pending
    const Icon = badge.icon
    return (
      <span
        className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}
      >
        <Icon className="w-3 h-3" />
        <span>{badge.label}</span>
      </span>
    )
  }

  const getUserBadge = (article) => {
    const t = getUserTranslation(article)
    if (!t) return null
    if (t.status === 'in_progress')
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
          <RotateCcw className="w-3 h-3" />
          <span>Reprendre — {t.progress}%</span>
        </span>
      )
    if (t.status === 'completed')
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
          <CheckCircle className="w-3 h-3" />
          <span>Soumis</span>
        </span>
      )
    return null
  }

  const filtered = articles.filter((a) =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )
  const inProgress = filtered.filter(
    (a) => getUserTranslation(a)?.status === 'in_progress',
  )
  const others = filtered.filter(
    (a) => getUserTranslation(a)?.status !== 'in_progress',
  )

  const currentTab = TABS.find((t) => t.id === activeTab)
  const colors = TAB_COLORS[currentTab.color]

  // ─── Carte article ────────────────────────────────
  const ArticleCard = ({ article }) => {
    const t = getUserTranslation(article)
    const userBadge = getUserBadge(article)
    const isProgress = t?.status === 'in_progress'

    return (
      <div
        className={`bg-white p-4 rounded-xl border transition-all hover:shadow-md ${
          isProgress ? `ring-1 ${colors.ring}` : 'border-gray-200'
        }`}
      >
        {/* Badges */}
        <div className="flex items-center justify-between mb-3 flex-wrap gap-1">
          <div className="flex items-center space-x-2 flex-wrap gap-1">
            {getStatusBadge(article.status)}
            {userBadge}
          </div>
          <span className="text-xs text-gray-400">
            {getCategoryLabel(article.category)}
          </span>
        </div>

        {/* Titre */}
        <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 text-sm">
          {article.title}
        </h3>

        {/* Source */}
        <div className="text-xs text-gray-400 mb-2">
          {article.source || 'Source inconnue'}
          {article.author && ` • ${article.author}`}
        </div>

        {/* Extrait */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {article.originalText.substring(
            0,
            activeTab === 'sentence' ? 80 : 120,
          )}
          ...
        </p>

        {/* Barre progression */}
        {isProgress && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Progression</span>
              <span className="font-medium text-orange-600">{t.progress}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className="bg-orange-400 h-1.5 rounded-full"
                style={{ width: `${t.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Bouton */}
        <button
          onClick={() => onArticleClick(article.slug)}
          className={`w-full text-left p-3 border rounded-lg transition-colors ${
            isProgress ? `${colors.resumeBtn}` : `${colors.btn}`
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`font-medium text-sm ${
                isProgress ? colors.resumeText : colors.btnText
              }`}
            >
              {isProgress ? '↩ Reprendre →' : 'Traduire →'}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-semibold ${colors.badge}`}
            >
              {currentTab.points}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
            <span>Difficulté : {'⭐'.repeat(article.difficulty || 1)}</span>
            {article._count?.translations > 0 && (
              <span>{article._count.translations} traduction(s)</span>
            )}
          </div>
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F3EF]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl mb-1">Articles & Traduction</h1>
          <p className="text-sm text-gray-500">
            Choisissez un type de contenu à traduire et gagnez des points
          </p>
        </div>

        {/* ✅ Onglets */}
        <div className="bg-white rounded-xl border border-gray-200 mb-6 overflow-hidden">
          <div className="flex border-b border-gray-200">
            {TABS.map((tab) => {
              const Icon = tab.icon
              const tcol = TAB_COLORS[tab.color]
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex flex-col sm:flex-row items-center justify-center sm:space-x-2 px-4 py-4 text-sm font-medium border-b-2 transition-all ${
                    isActive
                      ? `${tcol.active} bg-gray-50`
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4 mb-1 sm:mb-0" />
                  <span>{tab.label}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold mt-1 sm:mt-0 sm:ml-1 ${
                      isActive ? tcol.badge : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {tab.points}
                  </span>
                </button>
              )
            })}
          </div>
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
            <p className="text-xs text-gray-500">{currentTab.description}</p>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="border border-gray-300 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option value="all">Toutes les catégories</option>
              <option value="societe">Société</option>
              <option value="politique">Politique</option>
              <option value="economie">Économie</option>
              <option value="sport">Sport</option>
              <option value="sante">Santé</option>
              <option value="education">Éducation</option>
              <option value="science">Science</option>
              <option value="histoire">Histoire</option>
              <option value="culture">Culture</option>
              <option value="religion">Religion</option>
              <option value="actualites">Actualités</option>
              <option value="litterature">Littérature</option>
              <option value="autre">Autre</option>
            </select>
          </div>
        </div>

        {/* Contenu */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-gray-900 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Section Reprendre */}
            {inProgress.length > 0 && (
              <div className="mb-10">
                <div className="flex items-center space-x-2 mb-4">
                  <RotateCcw className="w-4 h-4 text-orange-500" />
                  <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Reprendre où vous vous étiez arrêté
                  </h2>
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                    {inProgress.length}
                  </span>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {inProgress.map((a) => (
                    <ArticleCard key={a.id} article={a} />
                  ))}
                </div>
                <div className="mt-8 border-t border-gray-200" />
              </div>
            )}

            {/* Autres */}
            {others.length > 0 ? (
              <div>
                {inProgress.length > 0 && (
                  <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
                    {activeTab === 'sentence'
                      ? 'Phrases disponibles'
                      : activeTab === 'paragraph'
                        ? 'Paragraphes disponibles'
                        : 'Articles disponibles'}
                  </h2>
                )}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {others.map((a) => (
                    <ArticleCard key={a.id} article={a} />
                  ))}
                </div>
              </div>
            ) : (
              filtered.length === 0 && (
                <div className="text-center py-16 text-gray-500 bg-white rounded-xl border border-gray-200">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">Aucun contenu disponible</p>
                  <p className="text-sm mt-1 text-gray-400">
                    {activeTab === 'sentence'
                      ? 'Aucune phrase à traduire pour le moment.'
                      : activeTab === 'paragraph'
                        ? 'Aucun paragraphe à traduire pour le moment.'
                        : 'Aucun article à traduire pour le moment.'}
                  </p>
                </div>
              )
            )}

            {hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={() => fetchArticles()}
                  disabled={loadingMore}
                  className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 text-sm"
                >
                  {loadingMore ? 'Chargement...' : 'Charger plus'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
