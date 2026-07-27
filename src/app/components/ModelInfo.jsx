// 'use client'

// import { useState, useEffect } from 'react'
// import {
//   CheckCircle,
//   Code,
//   Zap,
//   TrendingUp,
//   ExternalLink,
//   Copy,
//   Check,
// } from 'lucide-react'
// import Link from 'next/link'

// export default function ModelInfo({ slug }) {
//   const [model, setModel] = useState(null)
//   const [loading, setLoading] = useState(true)
//   const [copied, setCopied] = useState(false)

//   useEffect(() => {
//     setLoading(true)
//     fetch(`/api/models/${slug}`)
//       .then((r) => r.json())
//       .then((data) => {
//         if (data.success) setModel(data.model)
//         else setModel(null)
//       })
//       .catch(console.error)
//       .finally(() => setLoading(false))
//   }, [slug])

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
//       <div className="flex items-center justify-center h-96">
//         <div className="text-center">
//           <div className="inline-block w-12 h-12 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mb-4"></div>
//           <p className="text-gray-600">Chargement du modèle...</p>
//         </div>
//       </div>
//     )
//   }

//   if (!model) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <p className="text-gray-500">Modèle introuvable.</p>
//       </div>
//     )
//   }

//   const statusBadge = getStatusBadge(model.status)

//   return (
//     <div className="space-y-8">
//       {/* Hero */}
//       <div className="bg-gradient-to-b from-white to-[#FAFAF9] border border-gray-200 rounded-xl p-8">
//         <div className="flex items-start space-x-6 mb-6">
//           <div className="text-6xl">{getModelEmoji(model.icon)}</div>
//           <div className="flex-1">
//             <div className="flex items-center space-x-3 mb-3">
//               <h1 className="text-4xl font-light text-gray-900">
//                 {model.name}
//               </h1>
//               <span
//                 className={`px-3 py-1 text-xs font-medium rounded-full ${statusBadge.bg} ${statusBadge.text}`}
//               >
//                 {statusBadge.label}
//               </span>
//             </div>
//             <p className="text-lg text-gray-600 mb-3">{model.domaine}</p>
//             <p className="text-gray-700 leading-relaxed font-light">
//               {model.description}
//             </p>
//           </div>
//         </div>
//         <div className="flex items-center space-x-8 text-sm text-gray-600">
//           <div className="flex items-center space-x-2">
//             <TrendingUp className="w-4 h-4" />
//             <span>Version {model.version}</span>
//           </div>
//           {model.endpoint && (
//             <div className="flex items-center space-x-2">
//               <Zap className="w-4 h-4" />
//               <span>Endpoint disponible</span>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Contenu */}
//       <div className="grid lg:grid-cols-3 gap-8">
//         <div className="lg:col-span-2 space-y-8">
//           {model.features && Object.keys(model.features).length > 0 && (
//             <div>
//               <h2 className="text-2xl font-light text-gray-900 mb-4">
//                 Fonctionnalités
//               </h2>
//               <div className="bg-white border border-gray-200 rounded-xl p-6">
//                 <div className="grid md:grid-cols-2 gap-4">
//                   {Object.entries(model.features).map(([key, value], i) => (
//                     <div key={i} className="flex items-start space-x-3">
//                       <CheckCircle
//                         className={`w-5 h-5 mt-0.5 flex-shrink-0 ${value ? 'text-green-600' : 'text-gray-300'}`}
//                       />
//                       <div>
//                         <p className="font-medium text-gray-900 capitalize">
//                           {key.replace(/_/g, ' ')}
//                         </p>
//                         <p className="text-sm text-gray-600">
//                           {value ? 'Disponible' : 'Prochainement'}
//                         </p>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           )}

//           {model.endpoint && (
//             <div>
//               <h2 className="text-2xl font-light text-gray-900 mb-4">
//                 Utilisation
//               </h2>
//               <div className="bg-gray-900 rounded-xl p-6">
//                 <div className="flex items-center justify-between mb-4">
//                   <div className="flex items-center space-x-2 text-gray-400">
//                     <Code className="w-4 h-4" />
//                     <span className="text-sm font-mono">API Request</span>
//                   </div>
//                   <button
//                     onClick={() =>
//                       copyToClipboard(
//                         `curl -X POST https://api.komor-ia.com${model.endpoint} \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{"prompt": "Votre requête ici"}'`,
//                       )
//                     }
//                     className="text-gray-400 hover:text-white transition-colors"
//                   >
//                     {copied ? (
//                       <Check className="w-4 h-4 text-green-500" />
//                     ) : (
//                       <Copy className="w-4 h-4" />
//                     )}
//                   </button>
//                 </div>
//                 <pre className="text-sm text-gray-300 overflow-x-auto">
//                   <code>{`curl -X POST https://api.komor-ia.com${model.endpoint} \\
//   -H "Authorization: Bearer YOUR_API_KEY" \\
//   -H "Content-Type: application/json" \\
//   -d '{"prompt": "Votre requête ici"}'`}</code>
//                 </pre>
//               </div>
//             </div>
//           )}

//           <div>
//             <h2 className="text-2xl font-light text-gray-900 mb-4">À propos</h2>
//             <div className="bg-white border border-gray-200 rounded-xl p-6">
//               <p className="text-gray-700 leading-relaxed">
//                 {model.name} est un modèle d'intelligence artificielle
//                 spécialisé dans le domaine {model.domaine?.toLowerCase()}.
//                 Développé par Komor-IA, il a été conçu pour répondre aux besoins
//                 spécifiques du contexte africain.
//               </p>
//             </div>
//           </div>
//         </div>

//         <div className="space-y-6">
//           <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 text-white">
//             <h3 className="text-lg font-medium mb-3">
//               Commencer à utiliser {model.name}
//             </h3>
//             <p className="text-gray-300 mb-5 text-sm">
//               Créez votre compte gratuit et obtenez votre clé API.
//             </p>
//             <Link
//               href="/signup"
//               className="block w-full px-5 py-2.5 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors text-center font-medium text-sm"
//             >
//               Créer un compte
//             </Link>
//           </div>

//           {model.pricing && (
//             <div className="bg-white border border-gray-200 rounded-xl p-6">
//               <h3 className="text-lg font-medium text-gray-900 mb-4">
//                 Tarification
//               </h3>
//               <div className="space-y-4">
//                 {Object.entries(model.pricing).map(([plan, details], i) => (
//                   <div
//                     key={i}
//                     className="pb-4 border-b border-gray-100 last:border-0 last:pb-0"
//                   >
//                     <p className="font-medium text-gray-900 capitalize mb-1">
//                       {plan}
//                     </p>
//                     <p className="text-2xl font-light text-gray-900 mb-1">
//                       {details.price === 0 ? 'Gratuit' : `${details.price}€`}
//                       <span className="text-sm text-gray-500">/mois</span>
//                     </p>
//                     <p className="text-sm text-gray-600">
//                       {details.requests?.toLocaleString()} requêtes/mois
//                     </p>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           <div className="bg-white border border-gray-200 rounded-xl p-6">
//             <h3 className="text-lg font-medium text-gray-900 mb-4">
//               Spécifications
//             </h3>
//             <div className="space-y-3 text-sm">
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Version</span>
//                 <span className="font-medium text-gray-900">
//                   {model.version}
//                 </span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Statut</span>
//                 <span className="font-medium text-gray-900">
//                   {statusBadge.label}
//                 </span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Domaine</span>
//                 <span className="font-medium text-gray-900">
//                   {model.domaine}
//                 </span>
//               </div>
//               {model.endpoint && (
//                 <div className="flex justify-between">
//                   <span className="text-gray-600">API</span>
//                   <span className="font-medium text-gray-900">Disponible</span>
//                 </div>
//               )}
//             </div>
//           </div>

//           <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
//             <h3 className="text-lg font-medium text-gray-900 mb-2">
//               Documentation
//             </h3>
//             <p className="text-sm text-gray-600 mb-4">
//               Consultez la documentation complète pour intégrer {model.name}.
//             </p>
//             <Link
//               href="/docs"
//               className="inline-flex items-center space-x-2 text-blue-700 hover:text-blue-800 font-medium text-sm"
//             >
//               <span>Voir la documentation</span>
//               <ExternalLink className="w-4 h-4" />
//             </Link>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// Dans ModelInfo.jsx — au lieu de tout ré-afficher :
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ModelInfo({ slug }) {
  const router = useRouter()
  
  useEffect(() => {
    router.push(`/models/${slug}`)
  }, [slug])

  return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-gray-900 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}