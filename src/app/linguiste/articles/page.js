'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  FileText,
  Search,
  CheckCircle,
  Clock,
  Eye,
  Languages,
  TrendingUp,
  Filter,
} from 'lucide-react'

export default function LinguisteArticles() {
  const router = useRouter()
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')

  useEffect(() => {
    fetchArticles()
  }, [filterStatus, filterCategory])

  const fetchArticles = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterStatus !== 'all') params.append('status', filterStatus)
      if (filterCategory !== 'all') params.append('category', filterCategory)
      params.append('limit', '100')

      const res = await fetch(`/api/articles?${params}`)
      const data = await res.json()
      setArticles(data.articles || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const filtered = articles.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase()),
  )

  const statusConfig = {
    pending: {
      label: 'En attente',
      color: 'bg-yellow-100 text-yellow-700',
      icon: Clock,
    },
    in_progress: {
      label: 'En cours',
      color: 'bg-blue-100 text-blue-700',
      icon: TrendingUp,
    },
    completed: {
      label: 'Terminé',
      color: 'bg-orange-100 text-orange-700',
      icon: CheckCircle,
    },
    verified: {
      label: 'Vérifié',
      color: 'bg-green-100 text-green-700',
      icon: CheckCircle,
    },
    draft: {
      label: 'Brouillon',
      color: 'bg-gray-100 text-gray-700',
      icon: FileText,
    },
  }

  const categories = [
    'all',
    'societe',
    'politique',
    'economie',
    'sport',
    'sante',
    'education',
    'science',
    'histoire',
    'culture',
    'religion',
    'actualites',
    'litterature',
    'autre',
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Articles</h1>
        <p className="text-gray-600 mt-2">
          {filtered.length} article(s) — consultez les traductions associées
        </p>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="in_progress">En cours</option>
          <option value="completed">Terminés</option>
          <option value="verified">Vérifiés</option>
        </select>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c === 'all' ? 'Toutes catégories' : c}
            </option>
          ))}
        </select>
      </div>

      {/* Tableau */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  'Titre',
                  'Catégorie',
                  'Statut',
                  'Mots',
                  'Traductions',
                  'Actions',
                ].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((article) => {
                const s = statusConfig[article.status] || statusConfig.pending
                const Icon = s.icon
                return (
                  <tr key={article.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 line-clamp-1">
                            {article.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {article.author || 'Sans auteur'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700 capitalize">
                        {article.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${s.color}`}
                      >
                        <Icon className="w-3 h-3" />
                        <span>{s.label}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {article.estimatedWords}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {article._count?.translations || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() =>
                          router.push(
                            `/dashboard/linguiste/translations?article=${article.id}`,
                          )
                        }
                        className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Voir traductions</span>
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Aucun article trouvé
            </div>
          )}
        </div>
      )}
    </div>
  )
}
