// src/app/datasets/page.js
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import PublicNavbar from '../components/public-navbar'
import Footer from '../components/footer'
import {
  Search, Download, Database, Globe,
  FileText, Mic, Eye, ChevronRight, Filter,
} from 'lucide-react'

const LICENSE_LABELS = {
  cc0:     { label: 'CC0',      color: 'bg-green-100 text-green-700' },
  cc_by:   { label: 'CC-BY',    color: 'bg-blue-100 text-blue-700' },
  cc_by_sa:{ label: 'CC-BY-SA', color: 'bg-indigo-100 text-indigo-700' },
  cc_by_nc:{ label: 'CC-BY-NC', color: 'bg-yellow-100 text-yellow-700' },
  mit:     { label: 'MIT',      color: 'bg-purple-100 text-purple-700' },
  apache2: { label: 'Apache 2', color: 'bg-orange-100 text-orange-700' },
  custom:  { label: 'Custom',   color: 'bg-gray-100 text-gray-700' },
}

const DOMAIN_ICONS = {
  speech:      { icon: Mic,      label: 'Audio / Parole' },
  translation: { icon: Globe,    label: 'Traduction' },
  nlp:         { icon: FileText, label: 'NLP / Texte' },
  other:       { icon: Database, label: 'Autre' },
}

const DOMAINS = [
  { value: 'all',         label: 'Tous les domaines' },
  { value: 'speech',      label: 'Audio / Parole' },
  { value: 'translation', label: 'Traduction' },
  { value: 'nlp',         label: 'NLP / Texte' },
  { value: 'other',       label: 'Autre' },
]

export default function DatasetsPage() {
  const [datasets,   setDatasets]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [domain,     setDomain]     = useState('all')
  const [offset,     setOffset]     = useState(0)
  const [hasMore,    setHasMore]    = useState(false)
  const [total,      setTotal]      = useState(0)

  const LIMIT = 12

  useEffect(() => {
    setOffset(0)
    setDatasets([])
    fetchDatasets(true)
  }, [domain])

  // Recherche avec debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setOffset(0)
      setDatasets([])
      fetchDatasets(true)
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  const fetchDatasets = async (reset = false) => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search)            params.append('search',   search)
      if (domain !== 'all')  params.append('domain',   domain)
      params.append('limit',  LIMIT)
      params.append('offset', reset ? 0 : offset)

      const res  = await fetch(`/api/datasets?${params}`)
      const data = await res.json()

      if (res.ok) {
        setDatasets(prev => reset ? data.datasets : [...prev, ...data.datasets])
        setTotal(data.total)
        setHasMore(data.hasMore)
        setOffset(prev => prev + LIMIT)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const formatSize = (mb) => {
    if (mb >= 1000) return `${(mb / 1000).toFixed(1)} GB`
    if (mb < 1)     return `${Math.round(mb * 1000)} KB`
    return `${mb.toFixed(1)} MB`
  }

  const formatNumber = (n) => new Intl.NumberFormat('fr-FR').format(n)

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      {/* <PublicNavbar /> */}

      {/* Hero */}
      <section className="bg-white border-b border-gray-200 py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full mb-6">
              <Database className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Données ouvertes</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-light text-gray-900 mb-6 leading-tight">
              Datasets Komor-IA
            </h1>
            <p className="text-xl text-gray-600 font-light leading-relaxed mb-8">
              Nos jeux de données linguistiques en shikomori, librement accessibles
              pour la recherche en intelligence artificielle et en linguistique africaine.
            </p>

            {/* Stats globales */}
            <div className="flex items-center space-x-8">
              {[
                { value: total,  label: 'datasets publiés' },
                { value: '4',    label: 'dialectes couverts' },
                { value: 'Libre',label: 'accès à la recherche' },
              ].map((stat, i) => (
                <div key={i}>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contenu */}
      <section className="py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">

          {/* Filtres */}
          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text" value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher un dataset..."
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <select
                value={domain} onChange={e => setDomain(e.target.value)}
                className="border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                {DOMAINS.map(d => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Grille datasets */}
          {loading && datasets.length === 0 ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-gray-900 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : datasets.length === 0 ? (
            <div className="text-center py-20">
              <Database className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Aucun dataset trouvé</p>
              <p className="text-gray-400 text-sm mt-1">Revenez bientôt — de nouveaux datasets seront publiés prochainement.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {datasets.map(dataset => {
                const license    = LICENSE_LABELS[dataset.license] || LICENSE_LABELS.custom
                const domainInfo = DOMAIN_ICONS[dataset.domain]   || DOMAIN_ICONS.other
                const DomainIcon = domainInfo.icon
                const tags       = Array.isArray(dataset.tags)
                  ? dataset.tags
                  : (dataset.tags ? JSON.parse(dataset.tags) : [])

                return (
                  <Link key={dataset.id} href={`/datasets/${dataset.slug}`}
                    className="group bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:border-gray-300 transition-all duration-300 flex flex-col"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 bg-gray-100 group-hover:bg-gray-900 rounded-xl flex items-center justify-center transition-colors duration-300 flex-shrink-0">
                        <DomainIcon className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors duration-300" />
                      </div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${license.color}`}>
                        {license.label}
                      </span>
                    </div>

                    {/* Titre + extrait */}
                    <h2 className="text-base font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {dataset.title}
                    </h2>
                    <p className="text-sm text-gray-500 font-light leading-relaxed mb-4 flex-1 line-clamp-3">
                      {dataset.excerpt || dataset.description?.substring(0, 120) + '...'}
                    </p>

                    {/* Tags */}
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {tags.slice(0, 3).map((tag, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                            {tag}
                          </span>
                        ))}
                        {tags.length > 3 && (
                          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-400 rounded-full">
                            +{tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Stats */}
                    <div className="border-t border-gray-100 pt-4 grid grid-cols-3 gap-2 text-center mb-4">
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          {formatNumber(dataset.numExamples)}
                        </p>
                        <p className="text-xs text-gray-400">exemples</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          {formatSize(dataset.sizeInMb)}
                        </p>
                        <p className="text-xs text-gray-400">taille</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          {formatNumber(dataset.numDownloads)}
                        </p>
                        <p className="text-xs text-gray-400">téléch.</p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>v{dataset.version} · {dataset.format || 'Multi-format'}</span>
                      <span className="flex items-center space-x-1 text-blue-600 font-medium group-hover:translate-x-1 transition-transform">
                        <span>Voir</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          {/* Load more */}
          {hasMore && (
            <div className="text-center mt-10">
              <button
                onClick={() => fetchDatasets()}
                disabled={loading}
                className="px-8 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {loading ? 'Chargement...' : 'Charger plus'}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* <Footer /> */}
    </div>
  )
}