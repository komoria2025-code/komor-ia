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
//       if (filterCategory !== 'all') params.append('category', filterCategory)

//       params.append('limit', LIMIT)
//       params.append('offset', reset ? 0 : offset)

//       const response = await fetch(`/api/articles?${params}`)
//       const data = await response.json()

//       if (response.ok) {
//         const newArticles = data.articles || []

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

//   const filteredArticles = articles.filter((article) =>
//     article.title.toLowerCase().includes(searchQuery.toLowerCase()),
//   )

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
//     // const labels = {
//     //   actualites: 'Actualités',
//     //   litterature: 'Littérature',
//     //   education: 'Éducation',
//     //   science: 'Science',
//     //   culture: 'Culture',
//     //   religion: 'Religion',
//     //   histoire: 'Histoire',
//     //   autre: 'Autre',
//     //   economie: 'Économie',
//     //   sport: 'Sport',
//     //   sante: 'Santé',
//     //   politique: 'Politique',
//     //   societe: 'Société',
//     // }
//     return labels[category] || category
//   }

//   return (
//     <div className="min-h-screen bg-[#F5F3EF]">
//       <div className="max-w-7xl mx-auto">
//         {/* HEADER */}
//         <div className="mb-8">
//           <h1 className="text-3xl mb-4">Articles & Traduction</h1>
//         </div>

//         {/* FILTRES */}
//         <div className="bg-white p-6 rounded-xl mb-6">
//           <div className="grid md:grid-cols-3 gap-4">
//             {/* Search */}
//             <input
//               type="text"
//               placeholder="Rechercher..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="border p-2 rounded"
//             />

//             {/* Status */}
//             <select
//               value={filterStatus}
//               onChange={(e) => setFilterStatus(e.target.value)}
//             >
//               <option value="all">Tous</option>
//               <option value="pending">En attente</option>
//               <option value="in_progress">En cours</option>
//               <option value="completed">Terminé</option>
//               <option value="verified">Vérifié</option>
//             </select>

//             {/* Category */}
//             <select
//               value={filterCategory}
//               onChange={(e) => setFilterCategory(e.target.value)}
//             >
//               {/* <option value="all">Toutes</option>
//               <option value="actualites">Actualités</option>
//               <option value="litterature">Littérature</option>
//               <option value="education">Éducation</option>
//               <option value="science">Science</option>
//               <option value="culture">Culture</option>
//               <option value="religion">Religion</option>
//               <option value="histoire">Histoire</option>
//               <option value="economie">Économie</option>
//               <option value="sport">Sport</option>
//               <option value="sante">Santé</option>
//               <option value="politique">Politique</option>
//               <option value="societe">Société</option> */}
//               <option value="all">Toutes</option>
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

//         {/* LIST */}
//         {loading ? (
//           <p>Chargement...</p>
//         ) : (
//           <>
//             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {filteredArticles.map((article) => (
//                 <div
//                   key={article.id}
//                   className="bg-white p-4 rounded-xl border"
//                 >
//                   <div className="flex justify-between mb-2">
//                     {getStatusBadge(article.status)}
//                     <span className="text-xs">
//                       {getCategoryLabel(article.category)}
//                     </span>
//                   </div>

//                   <h3 className="font-medium mb-2">{article.title}</h3>

//                   {/* SOURCE */}
//                   <div className="text-xs text-gray-500 mb-2">
//                     {article.source || 'Source inconnue'}{' '}
//                     {article.author && `• ${article.author}`}
//                   </div>

//                   <p className="text-sm text-gray-600 mb-3">
//                     {article.originalText.substring(0, 120)}...
//                   </p>
//                   <button
//                     onClick={() => onArticleClick(article.slug)}
//                     className="w-full text-left p-4 border rounded-lg hover:bg-gray-50 transition"
//                   >
//                     <div className="flex items-center justify-between">
//                       <span className="font-medium text-blue-600">Lire →</span>
//                     </div>

//                     <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
//                       <span>
//                         Difficulté: {'⭐'.repeat(article.difficulty || 1)}
//                       </span>

//                       {article._count?.translations > 0 && (
//                         <span>{article._count.translations} traduction(s)</span>
//                       )}
//                     </div>
//                   </button>
//                 </div>
//               ))}
//             </div>

//             {/* LOAD MORE */}
//             {hasMore && (
//               <div className="text-center mt-6">
//                 <button
//                   onClick={() => fetchArticles()}
//                   disabled={loadingMore}
//                   className="px-6 py-2 bg-black text-white rounded"
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
  Languages,
  Search,
  BookOpen,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  RotateCcw,
} from 'lucide-react'

export default function ArticlesListPage({ onArticleClick }) {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  const LIMIT = 50

  useEffect(() => {
    setOffset(0)
    setArticles([])
    fetchArticles(true)
  }, [filterStatus, filterCategory])

  const fetchArticles = async (reset = false) => {
    try {
      if (reset) setLoading(true)
      else setLoadingMore(true)

      const params = new URLSearchParams()
      if (filterStatus !== 'all') params.append('status', filterStatus)
      if (filterCategory !== 'all') params.append('category', filterCategory)
      params.append('limit', LIMIT)
      params.append('offset', reset ? 0 : offset)

      const res = await fetch(`/api/articles?${params}`)
      const data = await res.json()

      if (res.ok) {
        const newArticles = data.articles || []
        setArticles((prev) => (reset ? newArticles : [...prev, ...newArticles]))
        setHasMore(offset + LIMIT < data.total)
        setOffset((prev) => prev + LIMIT)
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  // ✅ Lire la traduction de l'utilisateur
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

  // ✅ Badge progression utilisateur
  const getUserBadge = (article) => {
    const t = getUserTranslation(article)
    if (!t) return null

    if (t.status === 'in_progress')
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
          <RotateCcw className="w-3 h-3" />
          <span>Reprendrez — {t.progress}%</span>
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

  // ✅ Séparer les articles en cours des autres
  const filtered = articles.filter((a) =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const inProgress = filtered.filter(
    (a) => getUserTranslation(a)?.status === 'in_progress',
  )
  const others = filtered.filter(
    (a) => getUserTranslation(a)?.status !== 'in_progress',
  )

  // ─── Carte article ────────────────────────────────
  const ArticleCard = ({ article }) => {
    const userBadge = getUserBadge(article)
    const t = getUserTranslation(article)

    return (
      <div
        className={`bg-white p-4 rounded-xl border transition-all hover:shadow-md ${
          t?.status === 'in_progress'
            ? 'border-orange-200 ring-1 ring-orange-100'
            : 'border-gray-200'
        }`}
      >
        {/* Badges */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2 flex-wrap gap-1">
            {getStatusBadge(article.status)}
            {userBadge}
          </div>
          <span className="text-xs text-gray-500">
            {getCategoryLabel(article.category)}
          </span>
        </div>

        {/* Titre */}
        <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
          {article.title}
        </h3>

        {/* Source */}
        <div className="text-xs text-gray-400 mb-2">
          {article.source || 'Source inconnue'}
          {article.author && ` • ${article.author}`}
        </div>

        {/* Extrait */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {article.originalText.substring(0, 120)}...
        </p>

        {/* Barre de progression si en cours */}
        {t?.status === 'in_progress' && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Progression</span>
              <span className="font-medium text-orange-600">{t.progress}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className="bg-orange-400 h-1.5 rounded-full transition-all"
                style={{ width: `${t.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Bouton */}
        <button
          onClick={() => onArticleClick(article.slug)}
          className={`w-full text-left p-3 border rounded-lg transition-colors ${
            t?.status === 'in_progress'
              ? 'border-orange-300 bg-orange-50 hover:bg-orange-100'
              : 'border-gray-200 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`font-medium text-sm ${
                t?.status === 'in_progress'
                  ? 'text-orange-600'
                  : 'text-blue-600'
              }`}
            >
              {t?.status === 'in_progress' ? '↩ Reprendre →' : 'Lire →'}
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

  // ─── Rendu ────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F5F3EF]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl mb-4">Articles & Traduction</h1>
        </div>

        {/* Filtres */}
        <div className="bg-white p-6 rounded-xl mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-gray-300 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="in_progress">En cours</option>
              <option value="completed">Terminé</option>
              <option value="verified">Vérifié</option>
            </select>
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

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-gray-900 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* ✅ Section "Reprendre" */}
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
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {inProgress.map((a) => (
                    <ArticleCard key={a.id} article={a} />
                  ))}
                </div>
                <div className="mt-8 border-t border-gray-200" />
              </div>
            )}

            {/* Tous les autres articles */}
            {others.length > 0 && (
              <div>
                {inProgress.length > 0 && (
                  <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
                    Tous les articles
                  </h2>
                )}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {others.map((a) => (
                    <ArticleCard key={a.id} article={a} />
                  ))}
                </div>
              </div>
            )}

            {filtered.length === 0 && (
              <div className="text-center py-16 text-gray-500">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Aucun article trouvé.</p>
              </div>
            )}

            {/* Load more */}
            {hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={() => fetchArticles()}
                  disabled={loadingMore}
                  className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
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
