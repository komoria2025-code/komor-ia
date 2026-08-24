'use client'

import { useState, useEffect, use } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

import TTSDemo from '../../components/tts-demo'
import {
  Brain, ArrowRight, Code2, Cpu,
  CheckCircle, Zap, Shield, Globe,
  Mic, FileText, ChevronRight,
} from 'lucide-react'

const STATUS_COLORS = {
  production:  'bg-green-100 text-green-700',
  beta:        'bg-blue-100 text-blue-700',
  development: 'bg-yellow-100 text-yellow-700',
  deprecated:  'bg-gray-100 text-gray-500',
}

const STATUS_LABELS = {
  production:  'Production',
  beta:        'Bêta',
  development: 'Développement',
  deprecated:  'Déprécié',
}

export default function ModelPage({ params }) {

  const { slug } = use(params)
  const { data: session } = useSession()
  const [model,   setModel]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/models/${slug}`)
      .then(r => r.json())
      .then(data => setModel(data.model))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <div className="flex justify-center py-32">
        <div className="w-10 h-10 border-4 border-gray-900 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  )

  if (!model) return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <div className="text-center py-32">
        <p className="text-gray-500">Modèle non trouvé.</p>
        <Link href="/models" className="text-blue-600 hover:underline mt-2 block">
          Voir tous les modèles
        </Link>
      </div>
    </div>
  )

  const features = model.features
    ? (typeof model.features === 'string' ? JSON.parse(model.features) : model.features)
    : {}

  const pricing = model.pricing
    ? (typeof model.pricing === 'string' ? JSON.parse(model.pricing) : model.pricing)
    : null

  // Endpoint public affiché dans le curl
  const publicEndpoint = model.endpoint || `/api/v1/${slug}`

  return (
    <div className="min-h-screen bg-[#FAFAF9]">

      {/* ── Hero ─────────────────────────────────── */}
      <section className="bg-white border-b border-gray-200 py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-6 sm:px-8">

          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm text-gray-400 mb-6">
            <Link href="/models" className="hover:text-gray-600 transition-colors">Modèles</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-900">{model.name}</span>
          </div>

          <div className="flex items-start space-x-5 flex-wrap gap-4">
            {/* Icône */}
            <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center flex-shrink-0">
              {model.domaine?.toLowerCase().includes('speech') ||
               model.domaine?.toLowerCase().includes('tts') ||
               model.domaine?.toLowerCase().includes('vocal')
                ? <Mic className="w-8 h-8 text-white" />
                : model.domaine?.toLowerCase().includes('text') ||
                  model.domaine?.toLowerCase().includes('nlp')
                  ? <FileText className="w-8 h-8 text-white" />
                  : <Brain className="w-8 h-8 text-white" />
              }
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center flex-wrap gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{model.name}</h1>
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${STATUS_COLORS[model.status] || STATUS_COLORS.development}`}>
                  {STATUS_LABELS[model.status] || model.status}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-3">
                v{model.version} · {model.domaine}
              </p>
              <p className="text-gray-600 leading-relaxed max-w-2xl">
                {model.description}
              </p>

              {/* Badges */}
              <div className="flex items-center flex-wrap gap-2 mt-4">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                  <Zap className="w-3 h-3" />
                  <span>v{model.version}</span>
                </span>
                {model.endpoint && (
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    <CheckCircle className="w-3 h-3" />
                    <span>Endpoint disponible</span>
                  </span>
                )}
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  <Globe className="w-3 h-3" />
                  <span>Comores · Shikomori</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Contenu principal ────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 sm:px-8 py-10">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* ── Colonne principale ────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Caractéristiques */}
            {Object.keys(features).length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Caractéristiques</h2>
                <div className="divide-y divide-gray-50 text-sm">
                  {Object.entries(features).map(([key, value], i) => (
                    <div key={i} className="flex justify-between py-2.5">
                      <span className="text-gray-500 capitalize">{key.replace(/_/g, ' ')}</span>
                      <span className="font-medium text-gray-900 text-right ml-4">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Utilisation — instructions et exemple curl */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Utilisation</h2>
              {model.usageInstructions && (
                <div className="mb-5 text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                  {model.usageInstructions}
                </div>
              )}
              <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-400 font-mono">API Request</span>
                </div>
                <pre className="text-xs text-green-400 font-mono leading-relaxed whitespace-pre-wrap">
{`curl -X POST https://komor-ia.com${publicEndpoint} \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"texte": "Bariza lewo ?"}'`}
                </pre>
              </div>
            </div>

            {/* ✅ Demo TTS — uniquement pour komori-tts */}
            {model.slug === 'komori-tts' && <TTSDemo />}

          </div>

          {/* ── Sidebar droite ────────────────────── */}
          <div className="space-y-4">

            {/* Accès API */}
            <div className="bg-gray-900 rounded-2xl p-5 text-white">
              <div className="flex items-center space-x-2 mb-3">
                <Code2 className="w-4 h-4" />
                <h3 className="font-semibold text-sm">Accès API</h3>
              </div>
              <p className="text-sm text-gray-300 mb-4 leading-relaxed">
                Intégrez ce modèle dans vos applications via notre API REST.
              </p>
              {session ? (
                <Link href="/?section=api-keys"
                  className="block text-center px-4 py-2.5 bg-white text-gray-900 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors">
                  Obtenir une clé API →
                </Link>
              ) : (
                <Link href="/signup"
                  className="block text-center px-4 py-2.5 bg-white text-gray-900 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors">
                  Créer un compte gratuit →
                </Link>
              )}
            </div>

            {/* Tarifs */}
            {pricing && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-4 text-sm">Tarifs</h3>
                <div className="divide-y divide-gray-50 text-sm">
                  {Object.entries(pricing).map(([key, value], i) => (
                    <div key={i} className="flex justify-between py-2">
                      <span className="text-gray-500 capitalize">{key}</span>
                      <span className="font-medium text-gray-900">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Améliorer le modèle — uniquement pour modèles avec corpus */}
            {(model.slug === 'komori-tts' || model.domaine?.toLowerCase().includes('speech')) && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">Améliorer le modèle</h3>
                <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                  Contribuez au corpus vocal pour améliorer la qualité de ce modèle.
                </p>
                <Link href="/?section=voice"
                  className="block text-center px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
                  Contribuer au corpus →
                </Link>
              </div>
            )}

            {/* Documentation */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-2 text-sm">Documentation</h3>
              <p className="text-xs text-gray-500 mb-3">
                Consultez la documentation complète pour intégrer {model.name}.
              </p>
              <Link href="/docs"
                className="flex items-center space-x-1 text-sm text-blue-600 hover:underline">
                <span>Voir la documentation</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Tous les modèles */}
            <Link href="/models"
              className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-2xl hover:border-gray-300 hover:shadow-sm transition-all group">
              <div className="flex items-center space-x-3">
                <Cpu className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Tous les modèles</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

    </div>
  )
}
// 'use client'

// import { useState, useEffect } from 'react'
// import { useParams, useRouter } from 'next/navigation'
// import {
//   ArrowLeft,
//   Brain,
//   CheckCircle,
//   Code,
//   Zap,
//   Shield,
//   TrendingUp,
//   ExternalLink,
//   Copy,
//   Check,
//   ArrowRight,
// } from 'lucide-react'
// import Link from 'next/link'
// // import HorizontalNavbar from '@/app/components/horizontal-navbar'

// export default function ModelDetailPage() {
//   const params = useParams()
//   const router = useRouter()
//   const [model, setModel] = useState(null)
//   const [loading, setLoading] = useState(true)
//   const [copied, setCopied] = useState(false)

//   useEffect(() => {
//     if (params.slug) {
//       fetchModel()
//     }
//   }, [params.slug])

//   const fetchModel = async () => {
//     try {
//       setLoading(true)
//       const response = await fetch(`/api/models/${params.slug}`)
//       const data = await response.json()

//       if (data.success) {
//         setModel(data.model)
//       } else {
//         router.push('/models')
//       }
//     } catch (error) {
//       console.error('Erreur:', error)
//       router.push('/models')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const copyToClipboard = (text) => {
//     navigator.clipboard.writeText(text)
//     setCopied(true)
//     setTimeout(() => setCopied(false), 2000)
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

//   const getStatusBadge = (status) => {
//     const badges = {
//       production: {
//         bg: 'bg-green-50',
//         text: 'text-green-700',
//         label: 'Production',
//       },
//       beta: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Beta' },
//       development: {
//         bg: 'bg-yellow-50',
//         text: 'text-yellow-700',
//         label: 'Développement',
//       },
//     }
//     return badges[status] || badges.development
//   }

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center">
//         <div className="text-center">
//           <div className="inline-block w-12 h-12 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mb-4"></div>
//           <p className="text-gray-600">Chargement du modèle...</p>
//         </div>
//       </div>
//     )
//   }

//   if (!model) {
//     return null
//   }

//   const statusBadge = getStatusBadge(model.status)

//   return (
//     <div className="min-h-screen bg-[#FAFAF9]">
//       {/* <HorizontalNavbar /> */}

//       {/* Hero */}
//       <section className="pt-32 pb-12 bg-gradient-to-b from-white to-[#FAFAF9]">
//         <div className="max-w-6xl mx-auto px-6 sm:px-8">
//           {/* Breadcrumb */}
//           <Link
//             href="/models"
//             className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-8 group"
//           >
//             <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
//             <span>Retour aux modèles</span>
//           </Link>

//           {/* Header */}
//           <div className="flex items-start space-x-6 mb-8">
//             <div className="text-6xl">{getModelEmoji(model.icon)}</div>
//             <div className="flex-1">
//               <div className="flex items-center space-x-3 mb-3">
//                 <h1 className="text-5xl font-light text-gray-900">
//                   {model.name}
//                 </h1>
//                 <span
//                   className={`px-3 py-1 text-xs font-medium rounded-full ${statusBadge.bg} ${statusBadge.text}`}
//                 >
//                   {statusBadge.label}
//                 </span>
//               </div>
//               <p className="text-xl text-gray-600 mb-4">{model.domaine}</p>
//               <p className="text-lg text-gray-700 leading-relaxed font-light max-w-3xl">
//                 {model.description}
//               </p>
//             </div>
//           </div>

//           {/* Métadonnées */}
//           <div className="flex items-center space-x-8 text-sm text-gray-600">
//             <div className="flex items-center space-x-2">
//               <TrendingUp className="w-4 h-4" />
//               <span>Version {model.version}</span>
//             </div>
//             {model.endpoint && (
//               <div className="flex items-center space-x-2">
//                 <Zap className="w-4 h-4" />
//                 <span>Endpoint disponible</span>
//               </div>
//             )}
//           </div>
//         </div>
//       </section>

//       {/* Contenu principal */}
//       <section className="py-16">
//         <div className="max-w-6xl mx-auto px-6 sm:px-8">
//           <div className="grid lg:grid-cols-3 gap-12">
//             {/* Colonne principale */}
//             <div className="lg:col-span-2 space-y-12">
//               {/* Fonctionnalités */}
//               {model.features && Object.keys(model.features).length > 0 && (
//                 <div>
//                   <h2 className="text-3xl font-light text-gray-900 mb-6">
//                     Fonctionnalités
//                   </h2>
//                   <div className="bg-white border border-gray-200 rounded-xl p-8">
//                     <div className="grid md:grid-cols-2 gap-6">
//                       {Object.entries(model.features).map(([key, value], i) => (
//                         <div key={i} className="flex items-start space-x-3">
//                           <CheckCircle
//                             className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
//                               value ? 'text-green-600' : 'text-gray-300'
//                             }`}
//                           />
//                           <div>
//                             <p className="font-medium text-gray-900 capitalize">
//                               {key.replace(/_/g, ' ')}
//                             </p>
//                             <p className="text-sm text-gray-600">
//                               {value ? 'Disponible' : 'Prochainement'}
//                             </p>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Exemple d'utilisation */}
//               {model.endpoint && (
//                 <div>
//                   <h2 className="text-3xl font-light text-gray-900 mb-6">
//                     Utilisation
//                   </h2>
//                   <div className="bg-gray-900 rounded-xl p-8">
//                     <div className="flex items-center justify-between mb-4">
//                       <div className="flex items-center space-x-2 text-gray-400">
//                         <Code className="w-4 h-4" />
//                         <span className="text-sm font-mono">API Request</span>
//                       </div>
//                       <button
//                         onClick={() =>
//                           copyToClipboard(
//                             `curl -X POST https://api.komor-ia.com${model.endpoint} \\
//   -H "Authorization: Bearer YOUR_API_KEY" \\
//   -H "Content-Type: application/json" \\
//   -d '{"prompt": "Votre requête ici"}'`,
//                           )
//                         }
//                         className="text-gray-400 hover:text-white transition-colors"
//                       >
//                         {copied ? (
//                           <Check className="w-4 h-4 text-green-500" />
//                         ) : (
//                           <Copy className="w-4 h-4" />
//                         )}
//                       </button>
//                     </div>
//                     <pre className="text-sm text-gray-300 overflow-x-auto">
//                       <code>{`curl -X POST https://api.komor-ia.com${model.endpoint} \\
//   -H "Authorization: Bearer YOUR_API_KEY" \\
//   -H "Content-Type: application/json" \\
//   -d '{"prompt": "Votre requête ici"}'`}</code>
//                     </pre>
//                   </div>
//                 </div>
//               )}

//               {/* À propos */}
//               <div>
//                 <h2 className="text-3xl font-light text-gray-900 mb-6">
//                   À propos
//                 </h2>
//                 <div className="bg-white border border-gray-200 rounded-xl p-8">
//                   <div className="prose max-w-none">
//                     <p className="text-gray-700 leading-relaxed">
//                       {model.name} est un modèle d'intelligence artificielle
//                       spécialisé dans le domaine {model.domaine.toLowerCase()}.
//                       Développé par Komor-IA, il a été conçu pour répondre aux
//                       besoins spécifiques du contexte africain.
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Sidebar */}
//             <div className="space-y-6">
//               {/* CTA */}
//               <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-8 text-white">
//                 <h3 className="text-xl font-medium mb-4">
//                   Commencer à utiliser {model.name}
//                 </h3>
//                 <p className="text-gray-300 mb-6 text-sm">
//                   Créez votre compte gratuit et obtenez votre clé API pour
//                   commencer.
//                 </p>
//                 <Link
//                   href="/signup"
//                   className="block w-full px-6 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors text-center font-medium"
//                 >
//                   Créer un compte
//                 </Link>
//                 <Link
//                   href="/dashboard"
//                   className="block w-full px-6 py-3 bg-transparent border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors text-center font-medium mt-3"
//                 >
//                   Accéder au dashboard
//                 </Link>
//               </div>

//               {/* Pricing */}
//               {model.pricing && (
//                 <div className="bg-white border border-gray-200 rounded-xl p-6">
//                   <h3 className="text-lg font-medium text-gray-900 mb-4">
//                     Tarification
//                   </h3>
//                   <div className="space-y-4">
//                     {Object.entries(model.pricing).map(([plan, details], i) => (
//                       <div
//                         key={i}
//                         className="pb-4 border-b border-gray-100 last:border-0 last:pb-0"
//                       >
//                         <p className="font-medium text-gray-900 capitalize mb-1">
//                           {plan}
//                         </p>
//                         <p className="text-2xl font-light text-gray-900 mb-1">
//                           {details.price === 0
//                             ? 'Gratuit'
//                             : `${details.price}€`}
//                           <span className="text-sm text-gray-500">/mois</span>
//                         </p>
//                         <p className="text-sm text-gray-600">
//                           {details.requests.toLocaleString()} requêtes/mois
//                         </p>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Specs techniques */}
//               <div className="bg-white border border-gray-200 rounded-xl p-6">
//                 <h3 className="text-lg font-medium text-gray-900 mb-4">
//                   Spécifications
//                 </h3>
//                 <div className="space-y-3 text-sm">
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Version</span>
//                     <span className="font-medium text-gray-900">
//                       {model.version}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Statut</span>
//                     <span className="font-medium text-gray-900">
//                       {statusBadge.label}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Domaine</span>
//                     <span className="font-medium text-gray-900">
//                       {model.domaine}
//                     </span>
//                   </div>
//                   {model.endpoint && (
//                     <div className="flex justify-between">
//                       <span className="text-gray-600">API</span>
//                       <span className="font-medium text-gray-900">
//                         Disponible
//                       </span>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Documentation */}
//               <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
//                 <h3 className="text-lg font-medium text-gray-900 mb-2">
//                   Documentation
//                 </h3>
//                 <p className="text-sm text-gray-600 mb-4">
//                   Consultez la documentation complète pour intégrer {model.name}
//                   .
//                 </p>
//                 <Link
//                   href="/docs"
//                   className="inline-flex items-center space-x-2 text-blue-700 hover:text-blue-800 font-medium text-sm"
//                 >
//                   <span>Voir la documentation</span>
//                   <ExternalLink className="w-4 h-4" />
//                 </Link>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Autres modèles */}
//       <section className="py-16 bg-white">
//         <div className="max-w-6xl mx-auto px-6 sm:px-8">
//           <h2 className="text-3xl font-light text-gray-900 mb-8">
//             Découvrez nos autres modèles
//           </h2>
//           <Link
//             href="/models"
//             className="inline-flex items-center space-x-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
//           >
//             <span>Voir tous les modèles</span>
//             <ArrowRight className="w-4 h-4" />
//           </Link>
//         </div>
//       </section>
//     </div>
//   )
// }
