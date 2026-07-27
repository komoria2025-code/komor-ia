// // app/models/page.js
// 'use client'

// import { useState, useEffect } from 'react'
// import {
//   Brain,
//   ArrowRight,
//   Filter,
//   Search,
//   CheckCircle,
//   TrendingUp,
// } from 'lucide-react'
// import Link from 'next/link'
// // import HorizontalNavbar from '../components/horizontal-navbar'
// import Footer from '../components/footer'

// export default function ModelsPage() {
//   const [models, setModels] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [searchQuery, setSearchQuery] = useState('')
//   const [filterStatus, setFilterStatus] = useState('all')
//   const [filterDomain, setFilterDomain] = useState('all')

//   useEffect(() => {
//     fetchModels()
//   }, [filterStatus])

//   const fetchModels = async () => {
//     try {
//       setLoading(true)
//       const params = new URLSearchParams()
//       if (filterStatus !== 'all') params.append('status', filterStatus)
//       params.append('public', 'true')

//       const response = await fetch(`/api/models?${params}`)
//       const data = await response.json()

//       if (data.success) {
//         setModels(data.models)
//       }
//     } catch (error) {
//       console.error('Erreur:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const getModelEmoji = (icon) => {
//     const emojis = {
//       Brain: '🧠',
//       Bot: '🤖',
//       MessageSquare: '💬',
//       FileText: '📰',
//       Languages: '🌐',
//       Zap: '⚡',
//     }
//     return emojis[icon] || '🤖'
//   }

//   const filteredModels = models.filter((model) => {
//     const matchesSearch =
//       model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       model.description.toLowerCase().includes(searchQuery.toLowerCase())

//     const matchesDomain =
//       filterDomain === 'all' || model.domaine === filterDomain

//     return matchesSearch && matchesDomain
//   })

//   // Extraire les domaines uniques
//   const uniqueDomains = [...new Set(models.map((m) => m.domaine))]

//   return (
//     <div className="min-h-screen bg-[#FAFAF9]">
//       {/* <HorizontalNavbar /> */}

//       {/* Hero */}
//       <section className="pt-32 pb-20 bg-gradient-to-b from-white to-[#FAFAF9]">
//         <div className="max-w-6xl mx-auto px-6 sm:px-8">
//           <div className="max-w-3xl">
//             <h1 className="text-5xl sm:text-6xl font-light text-gray-900 mb-6 leading-tight">
//               Nos modèles d'IA
//             </h1>
//             <p className="text-xl text-gray-600 leading-relaxed font-light">
//               Découvrez notre catalogue de modèles d'intelligence artificielle
//               conçus pour l'Afrique.
//             </p>
//           </div>
//         </div>
//       </section>

//       {/* Filtres */}
//       <section className="py-8 bg-white border-b border-gray-200">
//         <div className="max-w-6xl mx-auto px-6 sm:px-8">
//           <div className="flex flex-col md:flex-row gap-4">
//             {/* Recherche */}
//             <div className="flex-1 relative">
//               <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//               <input
//                 type="text"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 placeholder="Rechercher un modèle..."
//                 className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
//               />
//             </div>

//             {/* Filtre Statut */}
//             <select
//               value={filterStatus}
//               onChange={(e) => setFilterStatus(e.target.value)}
//               className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
//             >
//               <option value="all">Tous les statuts</option>
//               <option value="production">Production</option>
//               <option value="beta">Beta</option>
//               <option value="development">Développement</option>
//             </select>

//             {/* Filtre Domaine */}
//             <select
//               value={filterDomain}
//               onChange={(e) => setFilterDomain(e.target.value)}
//               className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
//             >
//               <option value="all">Tous les domaines</option>
//               {uniqueDomains.map((domain) => (
//                 <option key={domain} value={domain}>
//                   {domain}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>
//       </section>

//       {/* Liste modèles */}
//       <section className="py-16">
//         <div className="max-w-6xl mx-auto px-6 sm:px-8">
//           {loading ? (
//             <div className="text-center py-20">
//               <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mb-4"></div>
//               <p className="text-gray-600">Chargement des modèles...</p>
//             </div>
//           ) : filteredModels.length === 0 ? (
//             <div className="text-center py-20">
//               <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//               <h3 className="text-xl font-medium text-gray-900 mb-2">
//                 Aucun modèle trouvé
//               </h3>
//               <p className="text-gray-600">
//                 Essayez de modifier vos filtres de recherche
//               </p>
//             </div>
//           ) : (
//             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
//               {filteredModels.map((model) => (
//                 <Link
//                   key={model.id}
//                   href={`/models/${model.slug}`}
//                   className="group bg-white border border-gray-200 rounded-xl p-8 hover:shadow-lg transition-all duration-300"
//                 >
//                   {/* Header */}
//                   <div className="flex items-start justify-between mb-6">
//                     <div className="text-4xl">{getModelEmoji(model.icon)}</div>
//                     <span
//                       className={`px-3 py-1 text-xs font-medium rounded-full ${
//                         model.status === 'production'
//                           ? 'bg-green-50 text-green-700'
//                           : model.status === 'beta'
//                             ? 'bg-blue-50 text-blue-700'
//                             : 'bg-yellow-50 text-yellow-700'
//                       }`}
//                     >
//                       {model.status}
//                     </span>
//                   </div>

//                   {/* Titre */}
//                   <h3 className="text-2xl font-medium text-gray-900 mb-2 group-hover:text-gray-700">
//                     {model.name}
//                   </h3>

//                   {/* Domaine */}
//                   <div className="text-sm text-gray-500 mb-4">
//                     {model.domaine}
//                   </div>

//                   {/* Description */}
//                   <p className="text-gray-600 mb-6 leading-relaxed font-light line-clamp-3">
//                     {model.description}
//                   </p>

//                   {/* Footer */}
//                   <div className="flex items-center justify-between pt-4 border-t border-gray-100">
//                     <span className="text-sm text-gray-500">
//                       v{model.version}
//                     </span>
//                     <div className="flex items-center space-x-2 text-gray-900 font-medium group-hover:underline">
//                       <span>En savoir plus</span>
//                       <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
//                     </div>
//                   </div>
//                 </Link>
//               ))}
//             </div>
//           )}

//           {/* Info Stats */}
//           <div className="mt-12 text-center">
//             <p className="text-gray-600">
//               {filteredModels.length} modèle(s) disponible(s)
//             </p>
//           </div>
//         </div>
//       </section>

//       {/* <Footer /> */}
//     </div>
//   )
// }

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import PublicNavbar from '../components/public-navbar'
import Footer from '../components/footer'
import {
  Brain, Mic, FileText, Globe, Eye, Cpu,
  MessageSquare, Image, Music, Code2,
  ChevronRight, Search, Filter,
} from 'lucide-react'

// ── Icône selon le domaine du modèle ──────────────────
function ModelIcon({ domaine, className = 'w-7 h-7 text-white' }) {
  const d = domaine?.toLowerCase() || ''

  if (d.includes('speech') || d.includes('tts') || d.includes('vocal') || d.includes('audio'))
    return <Mic className={className} />
  if (d.includes('translation') || d.includes('traduction'))
    return <Globe className={className} />
  if (d.includes('nlp') || d.includes('text') || d.includes('texte'))
    return <FileText className={className} />
  if (d.includes('vision') || d.includes('image') || d.includes('ocr'))
    return <Eye className={className} />
  if (d.includes('chat') || d.includes('conversation') || d.includes('dialogue'))
    return <MessageSquare className={className} />
  if (d.includes('music') || d.includes('musique') || d.includes('son'))
    return <Music className={className} />
  if (d.includes('code') || d.includes('generation'))
    return <Code2 className={className} />

  return <Brain className={className} />
}

// ── Couleur de fond selon le domaine ──────────────────
function getIconBg(domaine) {
  const d = domaine?.toLowerCase() || ''
  if (d.includes('speech') || d.includes('tts') || d.includes('vocal'))
    return 'bg-indigo-600'
  if (d.includes('translation') || d.includes('traduction'))
    return 'bg-blue-600'
  if (d.includes('nlp') || d.includes('text'))
    return 'bg-purple-600'
  if (d.includes('vision') || d.includes('image'))
    return 'bg-pink-600'
  if (d.includes('chat') || d.includes('conversation'))
    return 'bg-green-600'
  return 'bg-gray-900'
}

const STATUS_CONFIG = {
  production:  { label: 'Production', color: 'bg-green-100 text-green-700' },
  beta:        { label: 'Bêta',       color: 'bg-blue-100 text-blue-700' },
  development: { label: 'Dev',        color: 'bg-yellow-100 text-yellow-700' },
  deprecated:  { label: 'Déprécié',  color: 'bg-gray-100 text-gray-500' },
}

const DOMAINS = [
  { value: 'all',         label: 'Tous les domaines' },
  { value: 'tts',         label: 'Text-to-Speech' },
  { value: 'translation', label: 'Traduction' },
  { value: 'nlp',         label: 'NLP / Texte' },
  { value: 'vision',      label: 'Vision' },
  { value: 'chat',        label: 'Conversation' },
]

export default function ModelsPage() {
  const [models,  setModels]  = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [domain,  setDomain]  = useState('all')

  useEffect(() => {
    fetch('/api/models?status=production,beta&public=true')
      .then(r => r.json())
      .then(data => setModels(data.models || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = models.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
                        m.description?.toLowerCase().includes(search.toLowerCase())
    const matchDomain = domain === 'all' ||
                        m.domaine?.toLowerCase().includes(domain)
    return matchSearch && matchDomain
  })

  return (
    <div className="min-h-screen bg-[#FAFAF9]">

      {/* Hero */}
      <section className="bg-white border-b border-gray-200 py-14 sm:py-20">
        <div className="max-w-5xl mx-auto px-6 sm:px-8">
          <div className="flex items-center space-x-2 text-sm text-gray-400 mb-6">
            <Cpu className="w-4 h-4" />
            <span>Modèles IA</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-light text-gray-900 mb-4 leading-tight">
            Nos modèles d'IA
          </h1>
          <p className="text-xl text-gray-500 font-light max-w-2xl leading-relaxed">
            Des modèles entraînés spécifiquement pour les langues et contextes africains,
            avec une spécialisation sur le shikomori.
          </p>
        </div>
      </section>

      {/* Filtres */}
      <div className="max-w-5xl mx-auto px-6 sm:px-8 py-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text" value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un modèle..."
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <select value={domain} onChange={e => setDomain(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900">
              {DOMAINS.map(d => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Grille modèles */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-gray-900 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Brain className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Aucun modèle trouvé</p>
            <p className="text-gray-400 text-sm mt-1">De nouveaux modèles arrivent prochainement.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(model => {
              const sc     = STATUS_CONFIG[model.status] || STATUS_CONFIG.development
              const iconBg = getIconBg(model.domaine)

              return (
                <Link key={model.id} href={`/models/${model.slug}`}
                  className="group bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:border-gray-300 transition-all duration-300 flex flex-col">

                  {/* Header */}
                  <div className="flex items-start justify-between mb-5">
                    <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
                      <ModelIcon domaine={model.domaine} />
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${sc.color}`}>
                      {sc.label}
                    </span>
                  </div>

                  {/* Nom + domaine */}
                  <h2 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                    {model.name}
                  </h2>
                  <p className="text-xs text-gray-400 mb-3 font-medium uppercase tracking-wider">
                    {model.domaine}
                  </p>

                  {/* Description */}
                  <p className="text-sm text-gray-500 leading-relaxed flex-1 line-clamp-3 mb-5">
                    {model.description}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-xs text-gray-400">v{model.version}</span>
                    <span className="flex items-center space-x-1 text-sm text-blue-600 font-medium group-hover:translate-x-1 transition-transform">
                      <span>Découvrir</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Coming soon */}
        <div className="mt-16 bg-white border border-dashed border-gray-300 rounded-2xl p-10 text-center">
          <Cpu className="w-10 h-10 text-gray-300 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-700 mb-2">D'autres modèles arrivent</h3>
          <p className="text-sm text-gray-400 max-w-md mx-auto">
            Nous travaillons sur des modèles de reconnaissance vocale (ASR),
            de traduction automatique et de traitement du texte shikomori.
          </p>
        </div>
      </div>

    </div>
  )
}