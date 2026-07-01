'use client'

import { useState, useEffect } from 'react'
import {
  Plus,
  Edit,
  Trash2,
  Search,
  FileText,
  Languages,
  CheckCircle,
  Clock,
  AlertCircle,
  Zap,
  AlignLeft,
  Newspaper,
} from 'lucide-react'

const CONTENT_TYPES = [
  {
    value: 'sentence',
    label: 'Phrase',
    icon: '⚡',
    points: '+5 pts',
    desc: 'Phrase unique courte',
  },
  {
    value: 'paragraph',
    label: 'Paragraphe',
    icon: '📄',
    points: '+15 pts',
    desc: 'Conte, histoire courte',
  },
  {
    value: 'article',
    label: 'Article',
    icon: '📰',
    points: '+30 pts',
    desc: 'Article de presse complet',
  },
]

export default function ArticlesManagement() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterType, setFilterType] = useState('all') // ✅ NOUVEAU
  const [showModal, setShowModal] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState(null)

  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(null)
  const LIMIT = 50

  const [formData, setFormData] = useState({
    title: '',
    originalText: '',
    originalLang: 'fr',
    targetLang: 'zdj',
    category: 'autre',
    difficulty: 1,
    contentType: 'article', // ✅ NOUVEAU
    source: '',
    author: '',
    tags: '',
    priority: 5,
  })

  useEffect(() => {
    fetchArticles()
  }, [filterStatus, filterCategory, filterType])

  // const fetchArticles = async () => {
  //   try {
  //     const params = new URLSearchParams()
  //     if (filterStatus !== 'all') params.append('status', filterStatus)
  //     if (filterCategory !== 'all') params.append('category', filterCategory)
  //     if (filterType !== 'all') params.append('contentType', filterType) // ✅ NOUVEAU

  //     const res = await fetch(`/api/admin/articles?${params}`)
  //     if (res.ok) {
  //       const data = await res.json()
  //       setArticles(data.articles || [])
  //     }
  //   } catch (e) {
  //     console.error('Erreur:', e)
  //   } finally {
  //     setLoading(false)
  //   }
  // }
  const fetchArticles = async () => {
    try {
      const params = new URLSearchParams()
      if (filterStatus !== 'all') params.append('status', filterStatus)
      if (filterCategory !== 'all') params.append('category', filterCategory)
      if (filterType !== 'all') params.append('contentType', filterType)
      params.append('page', page)
      params.append('limit', LIMIT)

      const res = await fetch(`/api/admin/articles?${params}`)
      if (res.ok) {
        const data = await res.json()
        setArticles(data.articles || [])
        setPagination(data.pagination)
      }
    } catch (e) {
      console.error('Erreur:', e)
    } finally {
      setLoading(false)
    }
  }

  // Reset page quand les filtres changent
  useEffect(() => {
    setPage(1)
  }, [filterStatus, filterCategory, filterType])

  useEffect(() => {
    fetchArticles()
  }, [filterStatus, filterCategory, filterType, page])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const url = selectedArticle
        ? `/api/admin/articles/${selectedArticle.id}`
        : '/api/articles'
      const method = selectedArticle ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags
            ? formData.tags.split(',').map((t) => t.trim())
            : [],
        }),
      })

      if (res.ok) {
        alert(selectedArticle ? 'Article mis à jour !' : 'Article créé !')
        setShowModal(false)
        setSelectedArticle(null)
        resetForm()
        fetchArticles()
      } else {
        const err = await res.json()
        alert(err.message || 'Erreur lors de la sauvegarde')
      }
    } catch (e) {
      console.error(e)
      alert('Erreur lors de la sauvegarde')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cet article ?')) return
    try {
      const res = await fetch(`/api/admin/articles/${id}`, { method: 'DELETE' })
      if (res.ok) setArticles(articles.filter((a) => a.id !== id))
    } catch (e) {
      console.error(e)
    }
  }

  const handleEdit = (article) => {
    setSelectedArticle(article)
    setFormData({
      title: article.title,
      originalText: article.originalText,
      originalLang: article.originalLang,
      targetLang: article.targetLang,
      category: article.category,
      difficulty: article.difficulty,
      contentType: article.contentType || 'article', // ✅ NOUVEAU
      source: article.source || '',
      author: article.author || '',
      tags: article.tags ? JSON.parse(article.tags).join(', ') : '',
      priority: article.priority,
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      originalText: '',
      originalLang: 'fr',
      targetLang: 'zdj',
      category: 'autre',
      difficulty: 1,
      contentType: 'article',
      source: '',
      author: '',
      tags: '',
      priority: 5,
    })
  }

  const getStatusBadge = (status) => {
    const badges = {
      draft: {
        color: 'bg-gray-100 text-gray-700',
        icon: AlertCircle,
        label: 'Brouillon',
      },
      pending: {
        color: 'bg-yellow-100 text-yellow-700',
        icon: Clock,
        label: 'En attente',
      },
      in_progress: {
        color: 'bg-blue-100 text-blue-700',
        icon: Languages,
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
    return badges[status] || badges.draft
  }

  const getContentTypeBadge = (ct) => {
    const types = {
      sentence: {
        label: 'Phrase',
        color: 'bg-blue-50 text-blue-600',
        icon: '⚡',
      },
      paragraph: {
        label: 'Paragraphe',
        color: 'bg-indigo-50 text-indigo-600',
        icon: '📄',
      },
      article: {
        label: 'Article',
        color: 'bg-purple-50 text-purple-600',
        icon: '📰',
      },
    }
    return types[ct] || types.article
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
    return labels[category] || category
  }

  const filtered = articles.filter((a) =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gestion des contenus
          </h1>
          <p className="text-gray-600 mt-1">{filtered.length} article(s)</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setSelectedArticle(null)
            setShowModal(true)
          }}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Ajouter</span>
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="grid md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher..."
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* ✅ Filtre type de contenu */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous les types</option>
            <option value="sentence">⚡ Phrases</option>
            <option value="paragraph">📄 Paragraphes</option>
            <option value="article">📰 Articles</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="draft">Brouillon</option>
            <option value="pending">En attente</option>
            <option value="in_progress">En cours</option>
            <option value="completed">Terminés</option>
            <option value="verified">Vérifiés</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Toutes catégories</option>
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

      {/* Tableau */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  'Titre',
                  'Type',
                  'Catégorie',
                  'Statut',
                  'Mots',
                  'Traductions',
                  'Actions',
                ].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((article) => {
                const statusBadge = getStatusBadge(article.status)
                const StatusIcon = statusBadge.icon
                const ctBadge = getContentTypeBadge(article.contentType)

                return (
                  <tr key={article.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 line-clamp-1">
                            {article.title}
                          </p>
                          <p className="text-xs text-gray-400">
                            {article.author || 'Sans auteur'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* ✅ Colonne type */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${ctBadge.color}`}
                      >
                        <span>{ctBadge.icon}</span>
                        <span>{ctBadge.label}</span>
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {getCategoryLabel(article.category)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        <span>{statusBadge.label}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {article.estimatedWords}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {article._count?.translations || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(article)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(article.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Aucun contenu trouvé
            </div>
          )}
        </div>
      )}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            {pagination.total} articles · page {pagination.page} /{' '}
            {pagination.totalPages}
          </p>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
            >
              ← Précédent
            </button>
            <button
              onClick={() =>
                setPage((p) => Math.min(pagination.totalPages, p + 1))
              }
              disabled={page === pagination.totalPages}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
            >
              Suivant →
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-4xl my-8 shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header fixe */}
            <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedArticle ? 'Modifier le contenu' : 'Nouveau contenu'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false)
                  setSelectedArticle(null)
                  resetForm()
                }}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
              >
                ✕
              </button>
            </div>

            {/* Contenu scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* ✅ Sélecteur type de contenu */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Type de contenu *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {CONTENT_TYPES.map((ct) => (
                      <button
                        key={ct.value}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, contentType: ct.value })
                        }
                        className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                          formData.contentType === ct.value
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-2xl mb-1">{ct.icon}</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {ct.label}
                        </span>
                        <span className="text-xs text-green-600 font-medium">
                          {ct.points}
                        </span>
                        <span className="text-xs text-gray-400 mt-0.5 text-center">
                          {ct.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Titre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {formData.contentType === 'sentence'
                      ? 'Phrase *'
                      : formData.contentType === 'paragraph'
                        ? 'Titre du paragraphe *'
                        : 'Titre *'}
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    required
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder={
                      formData.contentType === 'sentence'
                        ? 'Entrez la phrase à traduire...'
                        : formData.contentType === 'paragraph'
                          ? 'Titre du conte ou paragraphe...'
                          : "Titre de l'article..."
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Texte original */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Texte original (français) *
                  </label>
                  <textarea
                    value={formData.originalText}
                    required
                    onChange={(e) =>
                      setFormData({ ...formData, originalText: e.target.value })
                    }
                    rows={
                      formData.contentType === 'sentence'
                        ? 3
                        : formData.contentType === 'paragraph'
                          ? 8
                          : 12
                    }
                    placeholder={
                      formData.contentType === 'sentence'
                        ? 'La phrase à lire/traduire...'
                        : formData.contentType === 'paragraph'
                          ? "Le conte, l'histoire ou le paragraphe..."
                          : "Le contenu de l'article..."
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-serif resize-none"
                  />
                </div>

                {/* Métadonnées */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Catégorie
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulté (1-5)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={formData.difficulty}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          // difficulty: parseInt(e.target.value),
                          difficulty: parseInt(e.target.value) || 1,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priorité (0-10)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={formData.priority}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          // priority: parseInt(e.target.value),
                          priority: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Source
                    </label>
                    <input
                      type="text"
                      value={formData.source}
                      onChange={(e) =>
                        setFormData({ ...formData, source: e.target.value })
                      }
                      placeholder="Journal, site web..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Auteur
                    </label>
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) =>
                        setFormData({ ...formData, author: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (séparés par des virgules)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) =>
                      setFormData({ ...formData, tags: e.target.value })
                    }
                    placeholder="histoire, comores, culture"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Boutons */}
                <div className="flex space-x-4 pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    {selectedArticle ? 'Mettre à jour' : 'Créer'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setSelectedArticle(null)
                      resetForm()
                    }}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// 'use client'

// import { useState, useEffect } from 'react'
// import {
//   Plus,
//   Edit,
//   Trash2,
//   Eye,
//   Search,
//   FileText,
//   Languages,
//   CheckCircle,
//   Clock,
//   AlertCircle,
// } from 'lucide-react'

// export default function ArticlesManagement() {
//   const [articles, setArticles] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [searchQuery, setSearchQuery] = useState('')
//   const [filterStatus, setFilterStatus] = useState('all')
//   const [filterCategory, setFilterCategory] = useState('all')
//   const [showModal, setShowModal] = useState(false)
//   const [selectedArticle, setSelectedArticle] = useState(null)
//   const [formData, setFormData] = useState({
//     title: '',
//     originalText: '',
//     originalLang: 'fr',
//     targetLang: 'zdj',
//     category: 'other',
//     difficulty: 1,
//     source: '',
//     author: '',
//     tags: '',
//     priority: 5,
//   })

//   useEffect(() => {
//     fetchArticles()
//   }, [filterStatus, filterCategory])

//   const fetchArticles = async () => {
//     try {
//       const params = new URLSearchParams()
//       if (filterStatus !== 'all') params.append('status', filterStatus)
//       if (filterCategory !== 'all') params.append('category', filterCategory)

//       const response = await fetch(`/api/admin/articles?${params}`)
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

//   const handleSubmit = async (e) => {
//     e.preventDefault()

//     try {
//       const url = selectedArticle
//         ? `/api/admin/articles/${selectedArticle.id}`
//         : '/api/articles'

//       const response = await fetch(url, {
//         method: selectedArticle ? 'PATCH' : 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           ...formData,
//           tags: formData.tags
//             ? formData.tags.split(',').map((t) => t.trim())
//             : [],
//         }),
//       })

//       if (response.ok) {
//         alert(
//           selectedArticle
//             ? 'Article mis à jour avec succès'
//             : 'Article créé avec succès',
//         )
//         setShowModal(false)
//         setSelectedArticle(null)
//         resetForm()
//         fetchArticles()
//       } else {
//         const error = await response.json()
//         alert(error.message || 'Erreur lors de la sauvegarde')
//       }
//     } catch (error) {
//       console.error('Erreur:', error)
//       alert('Erreur lors de la sauvegarde')
//     }
//   }

//   const handleDelete = async (id) => {
//     if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) return

//     try {
//       const response = await fetch(`/api/admin/articles/${id}`, {
//         method: 'DELETE',
//       })

//       if (response.ok) {
//         setArticles(articles.filter((a) => a.id !== id))
//         alert('Article supprimé avec succès')
//       }
//     } catch (error) {
//       console.error('Erreur:', error)
//       alert('Erreur lors de la suppression')
//     }
//   }

//   const handleEdit = (article) => {
//     setSelectedArticle(article)
//     setFormData({
//       title: article.title,
//       originalText: article.originalText,
//       originalLang: article.originalLang,
//       targetLang: article.targetLang,
//       category: article.category,
//       difficulty: article.difficulty,
//       source: article.source || '',
//       author: article.author || '',
//       tags: article.tags ? JSON.parse(article.tags).join(', ') : '',
//       priority: article.priority,
//     })
//     setShowModal(true)
//   }

//   const resetForm = () => {
//     setFormData({
//       title: '',
//       originalText: '',
//       originalLang: 'fr',
//       targetLang: 'zdj',
//       category: 'other',
//       difficulty: 1,
//       source: '',
//       author: '',
//       tags: '',
//       priority: 5,
//     })
//   }

//   const filteredArticles = articles.filter((article) =>
//     article.title.toLowerCase().includes(searchQuery.toLowerCase()),
//   )

//   const getStatusBadge = (status) => {
//     const badges = {
//       draft: { color: 'bg-gray-100 text-gray-700', icon: AlertCircle },
//       pending: { color: 'bg-yellow-100 text-yellow-700', icon: Clock },
//       in_progress: { color: 'bg-blue-100 text-blue-700', icon: Languages },
//       completed: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
//       verified: { color: 'bg-purple-100 text-purple-700', icon: CheckCircle },
//     }
//     return badges[status] || badges.draft
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
//     <div>
//       {/* Header */}
//       <div className="flex items-center justify-between mb-8">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">
//             Gestion des articles
//           </h1>
//           <p className="text-gray-600 mt-2">
//             {filteredArticles.length} article(s)
//           </p>
//         </div>
//         <button
//           onClick={() => {
//             resetForm()
//             setShowModal(true)
//           }}
//           className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
//         >
//           <Plus className="w-5 h-5" />
//           <span>Créer un article</span>
//         </button>
//       </div>

//       {/* Filtres */}
//       <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
//         <div className="grid md:grid-cols-3 gap-4">
//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//             <input
//               type="text"
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               placeholder="Rechercher..."
//               className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>

//           <select
//             value={filterStatus}
//             onChange={(e) => setFilterStatus(e.target.value)}
//             className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//           >
//             <option value="all">Tous les statuts</option>
//             <option value="draft">Brouillon</option>
//             <option value="pending">En attente</option>
//             <option value="in_progress">En cours</option>
//             <option value="completed">Terminés</option>
//             <option value="verified">Vérifiés</option>
//           </select>

//           <select
//             value={filterCategory}
//             onChange={(e) => setFilterCategory(e.target.value)}
//             className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//           >
//             <option value="all">Toutes catégories</option>
//             <option value="news">Actualités</option>
//             <option value="literature">Littérature</option>
//             <option value="education">Éducation</option>
//             <option value="science">Science</option>
//             <option value="culture">Culture</option>
//             <option value="religion">Religion</option>
//             <option value="history">Histoire</option>
//           </select>
//         </div>
//       </div>

//       {/* Tableau */}
//       {loading ? (
//         <div className="text-center py-12">
//           <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
//         </div>
//       ) : (
//         <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                     Titre
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                     Catégorie
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                     Statut
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                     Mots
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                     Traductions
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {filteredArticles.map((article) => {
//                   const statusBadge = getStatusBadge(article.status)
//                   const StatusIcon = statusBadge.icon

//                   return (
//                     <tr key={article.id} className="hover:bg-gray-50">
//                       <td className="px-6 py-4">
//                         <div className="flex items-center">
//                           <FileText className="w-5 h-5 text-gray-400 mr-3" />
//                           <div>
//                             <div className="text-sm font-medium text-gray-900 line-clamp-1">
//                               {article.title}
//                             </div>
//                             <div className="text-xs text-gray-500">
//                               {article.author || 'Sans auteur'}
//                             </div>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <span className="text-sm text-gray-900">
//                           {getCategoryLabel(article.category)}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <span
//                           className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}
//                         >
//                           <StatusIcon className="w-3 h-3" />
//                           <span>{article.status}</span>
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                         {article.estimatedWords}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                         {article._count?.translations || 0}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="flex items-center space-x-2">
//                           <button
//                             onClick={() => handleEdit(article)}
//                             className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg"
//                             title="Modifier"
//                           >
//                             <Edit className="w-4 h-4" />
//                           </button>
//                           <button
//                             onClick={() => handleDelete(article.id)}
//                             className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg"
//                             title="Supprimer"
//                           >
//                             <Trash2 className="w-4 h-4" />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   )
//                 })}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}

//       {/* Modal */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
//           <div className="bg-white rounded-xl max-w-4xl w-full my-8 p-6">
//             <h2 className="text-2xl font-bold text-gray-900 mb-6">
//               {selectedArticle ? "Modifier l'article" : 'Créer un article'}
//             </h2>

//             <form onSubmit={handleSubmit} className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Titre *
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.title}
//                   onChange={(e) =>
//                     setFormData({ ...formData, title: e.target.value })
//                   }
//                   required
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Texte original *
//                 </label>
//                 <textarea
//                   value={formData.originalText}
//                   onChange={(e) =>
//                     setFormData({ ...formData, originalText: e.target.value })
//                   }
//                   required
//                   rows={10}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-serif"
//                 />
//               </div>

//               <div className="grid md:grid-cols-3 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Catégorie
//                   </label>
//                   <select
//                     value={formData.category}
//                     onChange={(e) =>
//                       setFormData({ ...formData, category: e.target.value })
//                     }
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   >
//                     <option value="news">Actualités</option>
//                     <option value="literature">Littérature</option>
//                     <option value="education">Éducation</option>
//                     <option value="science">Science</option>
//                     <option value="culture">Culture</option>
//                     <option value="religion">Religion</option>
//                     <option value="history">Histoire</option>
//                     <option value="other">Autre</option>
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Difficulté (1-5)
//                   </label>
//                   <input
//                     type="number"
//                     min="1"
//                     max="5"
//                     value={formData.difficulty}
//                     onChange={(e) =>
//                       setFormData({
//                         ...formData,
//                         difficulty: parseInt(e.target.value),
//                       })
//                     }
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Priorité (0-10)
//                   </label>
//                   <input
//                     type="number"
//                     min="0"
//                     max="10"
//                     value={formData.priority}
//                     onChange={(e) =>
//                       setFormData({
//                         ...formData,
//                         priority: parseInt(e.target.value),
//                       })
//                     }
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>
//               </div>

//               <div className="grid md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Source
//                   </label>
//                   <input
//                     type="text"
//                     value={formData.source}
//                     onChange={(e) =>
//                       setFormData({ ...formData, source: e.target.value })
//                     }
//                     placeholder="Ex: Journal, Site web..."
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Auteur
//                   </label>
//                   <input
//                     type="text"
//                     value={formData.author}
//                     onChange={(e) =>
//                       setFormData({ ...formData, author: e.target.value })
//                     }
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Tags (séparés par des virgules)
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.tags}
//                   onChange={(e) =>
//                     setFormData({ ...formData, tags: e.target.value })
//                   }
//                   placeholder="histoire, comores, culture"
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>

//               <div className="flex items-center space-x-4 pt-4">
//                 <button
//                   type="submit"
//                   className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
//                 >
//                   {selectedArticle ? 'Mettre à jour' : 'Créer'}
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setShowModal(false)
//                     setSelectedArticle(null)
//                     resetForm()
//                   }}
//                   className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
//                 >
//                   Annuler
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }
