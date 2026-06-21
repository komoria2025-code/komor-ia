'use client'

import { useState, useEffect } from 'react'
import {
  Brain,
  ArrowRight,
  Filter,
  Search,
  CheckCircle,
  TrendingUp,
} from 'lucide-react'
import Link from 'next/link'
// import HorizontalNavbar from '../components/horizontal-navbar'
import Footer from '../components/footer'

export default function ModelsPage() {
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterDomain, setFilterDomain] = useState('all')

  useEffect(() => {
    fetchModels()
  }, [filterStatus])

  const fetchModels = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filterStatus !== 'all') params.append('status', filterStatus)
      params.append('public', 'true')

      const response = await fetch(`/api/models?${params}`)
      const data = await response.json()

      if (data.success) {
        setModels(data.models)
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const getModelEmoji = (icon) => {
    const emojis = {
      Brain: '🧠',
      Bot: '🤖',
      MessageSquare: '💬',
      FileText: '📰',
      Languages: '🌐',
      Zap: '⚡',
    }
    return emojis[icon] || '🤖'
  }

  const filteredModels = models.filter((model) => {
    const matchesSearch =
      model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesDomain =
      filterDomain === 'all' || model.domaine === filterDomain

    return matchesSearch && matchesDomain
  })

  // Extraire les domaines uniques
  const uniqueDomains = [...new Set(models.map((m) => m.domaine))]

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      {/* <HorizontalNavbar /> */}

      {/* Hero */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-white to-[#FAFAF9]">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <div className="max-w-3xl">
            <h1 className="text-5xl sm:text-6xl font-light text-gray-900 mb-6 leading-tight">
              Nos modèles d'IA
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed font-light">
              Découvrez notre catalogue de modèles d'intelligence artificielle
              conçus pour l'Afrique.
            </p>
          </div>
        </div>
      </section>

      {/* Filtres */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Recherche */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un modèle..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            {/* Filtre Statut */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option value="all">Tous les statuts</option>
              <option value="production">Production</option>
              <option value="beta">Beta</option>
              <option value="development">Développement</option>
            </select>

            {/* Filtre Domaine */}
            <select
              value={filterDomain}
              onChange={(e) => setFilterDomain(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option value="all">Tous les domaines</option>
              {uniqueDomains.map((domain) => (
                <option key={domain} value={domain}>
                  {domain}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Liste modèles */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Chargement des modèles...</p>
            </div>
          ) : filteredModels.length === 0 ? (
            <div className="text-center py-20">
              <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Aucun modèle trouvé
              </h3>
              <p className="text-gray-600">
                Essayez de modifier vos filtres de recherche
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredModels.map((model) => (
                <Link
                  key={model.id}
                  href={`/models/${model.slug}`}
                  className="group bg-white border border-gray-200 rounded-xl p-8 hover:shadow-lg transition-all duration-300"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="text-4xl">{getModelEmoji(model.icon)}</div>
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        model.status === 'production'
                          ? 'bg-green-50 text-green-700'
                          : model.status === 'beta'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-yellow-50 text-yellow-700'
                      }`}
                    >
                      {model.status}
                    </span>
                  </div>

                  {/* Titre */}
                  <h3 className="text-2xl font-medium text-gray-900 mb-2 group-hover:text-gray-700">
                    {model.name}
                  </h3>

                  {/* Domaine */}
                  <div className="text-sm text-gray-500 mb-4">
                    {model.domaine}
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 mb-6 leading-relaxed font-light line-clamp-3">
                    {model.description}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-sm text-gray-500">
                      v{model.version}
                    </span>
                    <div className="flex items-center space-x-2 text-gray-900 font-medium group-hover:underline">
                      <span>En savoir plus</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Info Stats */}
          <div className="mt-12 text-center">
            <p className="text-gray-600">
              {filteredModels.length} modèle(s) disponible(s)
            </p>
          </div>
        </div>
      </section>

      {/* <Footer /> */}
    </div>
  )
}
