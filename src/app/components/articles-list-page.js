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

      const response = await fetch(`/api/articles?${params}`)
      const data = await response.json()

      if (response.ok) {
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

  const filteredArticles = articles.filter((article) =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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
    // const labels = {
    //   actualites: 'Actualités',
    //   litterature: 'Littérature',
    //   education: 'Éducation',
    //   science: 'Science',
    //   culture: 'Culture',
    //   religion: 'Religion',
    //   histoire: 'Histoire',
    //   autre: 'Autre',
    //   economie: 'Économie',
    //   sport: 'Sport',
    //   sante: 'Santé',
    //   politique: 'Politique',
    //   societe: 'Société',
    // }
    return labels[category] || category
  }

  return (
    <div className="min-h-screen bg-[#F5F3EF]">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl mb-4">Articles & Traduction</h1>
        </div>

        {/* FILTRES */}
        <div className="bg-white p-6 rounded-xl mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Search */}
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border p-2 rounded"
            />

            {/* Status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Tous</option>
              <option value="pending">En attente</option>
              <option value="in_progress">En cours</option>
              <option value="completed">Terminé</option>
              <option value="verified">Vérifié</option>
            </select>

            {/* Category */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">Toutes</option>
              <option value="actualites">Actualités</option>
              <option value="litterature">Littérature</option>
              <option value="education">Éducation</option>
              <option value="science">Science</option>
              <option value="culture">Culture</option>
              <option value="religion">Religion</option>
              <option value="histoire">Histoire</option>
              <option value="economie">Économie</option>
              <option value="sport">Sport</option>
              <option value="sante">Santé</option>
              <option value="politique">Politique</option>
              <option value="societe">Société</option>
            </select>
          </div>
        </div>

        {/* LIST */}
        {loading ? (
          <p>Chargement...</p>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article) => (
                <div
                  key={article.id}
                  className="bg-white p-4 rounded-xl border"
                >
                  <div className="flex justify-between mb-2">
                    {getStatusBadge(article.status)}
                    <span className="text-xs">
                      {getCategoryLabel(article.category)}
                    </span>
                  </div>

                  <h3 className="font-medium mb-2">{article.title}</h3>

                  {/* SOURCE */}
                  <div className="text-xs text-gray-500 mb-2">
                    {article.source || 'Source inconnue'}{' '}
                    {article.author && `• ${article.author}`}
                  </div>

                  <p className="text-sm text-gray-600 mb-3">
                    {article.originalText.substring(0, 120)}...
                  </p>
                  <button
                    onClick={() => onArticleClick(article.slug)}
                    className="w-full text-left p-4 border rounded-lg hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-blue-600">Lire →</span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                      <span>
                        Difficulté: {'⭐'.repeat(article.difficulty || 1)}
                      </span>

                      {article._count?.translations > 0 && (
                        <span>{article._count.translations} traduction(s)</span>
                      )}
                    </div>
                  </button>
                </div>
              ))}
            </div>

            {/* LOAD MORE */}
            {hasMore && (
              <div className="text-center mt-6">
                <button
                  onClick={() => fetchArticles()}
                  disabled={loadingMore}
                  className="px-6 py-2 bg-black text-white rounded"
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
//   const [searchQuery, setSearchQuery] = useState('')
//   const [filterStatus, setFilterStatus] = useState('all')
//   const [filterCategory, setFilterCategory] = useState('all')

//   useEffect(() => {
//     fetchArticles()
//   }, [filterStatus, filterCategory])

//   const fetchArticles = async () => {
//     try {
//       const params = new URLSearchParams()
//       if (filterStatus !== 'all') params.append('status', filterStatus)
//       if (filterCategory !== 'all') params.append('category', filterCategory)

//       const response = await fetch(`/api/articles?${params}`)
//       if (response.ok) {
//         const data = await response.json()
//         setArticles(data.articles || [])
//       }
//     } catch (error) {
//       console.error('Erreur:', error)
//     } finally {
//       setLoading(false)
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
//       news: 'Actualités',
//       literature: 'Littérature',
//       education: 'Éducation',
//       science: 'Science',
//       culture: 'Culture',
//       religion: 'Religion',
//       history: 'Histoire',
//       other: 'Autre',
//     }
//     return labels[category] || category
//   }

//   return (
//     <div className="min-h-screen bg-[#F5F3EF]">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-8">
//           <div className="flex items-center space-x-3 mb-4">
//             <div className="w-12 h-12 bg-[#1A1A1A] rounded-xl flex items-center justify-center">
//               <Languages className="w-6 h-6 text-white" />
//             </div>
//             <div>
//               <h1 className="text-3xl font-normal text-[#1A1A1A]">
//                 Articles & Traduction
//               </h1>
//               <p className="text-[#6B6B6B] font-serif">
//                 Aidez-nous à créer un corpus de textes en comorien
//               </p>
//             </div>
//           </div>

//           {/* Info box */}
//           <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start space-x-3">
//             <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
//             <div className="text-sm text-blue-800">
//               <p className="font-medium mb-1">
//                 Contribuez à l'entraînement de nos modèles IA
//               </p>
//               <p>
//                 Nous avons besoin de textes en comorien pour améliorer nos
//                 modèles. Choisissez un article et aidez-nous à le traduire du
//                 français vers le comorien. Votre travail sera sauvegardé
//                 automatiquement.
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Filtres et recherche */}
//         <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
//           <div className="grid md:grid-cols-3 gap-4">
//             {/* Recherche */}
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//               <input
//                 type="text"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 placeholder="Rechercher un article..."
//                 className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A1A1A] focus:border-transparent"
//               />
//             </div>

//             {/* Filtre statut */}
//             <select
//               value={filterStatus}
//               onChange={(e) => setFilterStatus(e.target.value)}
//               className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A1A1A] focus:border-transparent"
//             >
//               <option value="all">Tous les statuts</option>
//               <option value="pending">En attente</option>
//               <option value="in_progress">En cours</option>
//               <option value="completed">Terminés</option>
//               <option value="verified">Vérifiés</option>
//             </select>

//             {/* Filtre catégorie */}
//             <select
//               value={filterCategory}
//               onChange={(e) => setFilterCategory(e.target.value)}
//               className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A1A1A] focus:border-transparent"
//             >
//               <option value="all">Toutes les catégories</option>
//               <option value="news">Actualités</option>
//               <option value="literature">Littérature</option>
//               <option value="education">Éducation</option>
//               <option value="science">Science</option>
//               <option value="culture">Culture</option>
//               <option value="religion">Religion</option>
//               <option value="history">Histoire</option>
//             </select>
//           </div>
//         </div>

//         {/* Liste des articles */}
//         {loading ? (
//           <div className="text-center py-12">
//             <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-[#1A1A1A] rounded-full animate-spin"></div>
//             <p className="mt-4 text-gray-600">Chargement des articles...</p>
//           </div>
//         ) : filteredArticles.length === 0 ? (
//           <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
//             <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
//             <h3 className="text-lg font-medium text-gray-900 mb-2">
//               Aucun article trouvé
//             </h3>
//             <p className="text-gray-600">
//               Essayez de modifier vos filtres ou votre recherche
//             </p>
//           </div>
//         ) : (
//           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {filteredArticles.map((article) => (
//               <button
//                 key={article.id}
//                 onClick={() => onArticleClick(article.slug)}
//                 className="group bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all p-6 text-left"
//               >
//                 {/* Header */}
//                 <div className="flex items-start justify-between mb-4">
//                   <div className="flex-1">{getStatusBadge(article.status)}</div>
//                   <div className="text-xs text-gray-500">
//                     {getCategoryLabel(article.category)}
//                   </div>
//                 </div>

//                 {/* Titre */}
//                 <h3 className="text-lg font-medium text-[#1A1A1A] mb-2 group-hover:text-gray-900 line-clamp-2">
//                   {article.title}
//                 </h3>

//                 {/* Métadonnées */}
//                 <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
//                   <div className="flex items-center space-x-1">
//                     <BookOpen className="w-4 h-4" />
//                     <span>{article.estimatedWords} mots</span>
//                   </div>
//                   <div className="flex items-center space-x-1">
//                     <Languages className="w-4 h-4" />
//                     <span>FR → Comorien</span>
//                   </div>
//                 </div>

//                 {/* Extrait */}
//                 <p className="text-sm text-gray-600 line-clamp-3 mb-4 font-serif">
//                   {article.originalText.substring(0, 150)}...
//                 </p>

//                 {/* Footer */}
//                 <div className="flex items-center justify-between text-xs text-gray-500">
//                   <span>
//                     Difficulté: {'⭐'.repeat(article.difficulty || 1)}
//                   </span>
//                   {article._count?.translations > 0 && (
//                     <span>{article._count.translations} traduction(s)</span>
//                   )}
//                 </div>
//               </button>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }
