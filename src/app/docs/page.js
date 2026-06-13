'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Book,
  Code,
  Zap,
  Shield,
  ArrowRight,
  Search,
  FileText,
  Terminal,
  Cpu,
  Database,
  Key,
  Settings,
  Download,
  Rocket,
} from 'lucide-react'

const DOCS_ENABLED = false

export default function DocsPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const sections = [
    {
      title: 'Démarrage',
      icon: Zap,
      color: 'blue',
      items: [
        { title: 'Introduction', href: '/docs/introduction', icon: Book },
        { title: 'Installation', href: '/docs/installation', icon: Download },
        { title: 'Premier projet', href: '/docs/quickstart', icon: Rocket },
        { title: 'Configuration', href: '/docs/configuration', icon: Settings },
      ],
    },
    {
      title: 'API Reference',
      icon: Code,
      color: 'purple',
      items: [
        { title: 'Authentification', href: '/docs/api/auth', icon: Key },
        { title: 'Endpoints', href: '/docs/api/endpoints', icon: Terminal },
        { title: 'Modèles', href: '/docs/api/models', icon: Cpu },
        { title: 'Webhooks', href: '/docs/api/webhooks', icon: Zap },
      ],
    },
    {
      title: 'Modèles IA',
      icon: Cpu,
      color: 'green',
      items: [
        { title: 'Press-AI', href: '/docs/models/press-ai', icon: FileText },
      ],
    },
    {
      title: 'Guides',
      icon: FileText,
      color: 'orange',
      items: [
        {
          title: 'Bonnes pratiques',
          href: '/docs/guides/best-practices',
          icon: Shield,
        },
        { title: 'Sécurité', href: '/docs/guides/security', icon: Shield },
        { title: 'Optimisation', href: '/docs/guides/optimization', icon: Zap },
        {
          title: 'Déploiement',
          href: '/docs/guides/deployment',
          icon: Database,
        },
      ],
    },
  ]

  const popularDocs = [
    {
      title: 'Guide de démarrage rapide',
      href: '/docs/quickstart',
      time: '5 min',
    },
    { title: 'Référence API complète', href: '/docs/api', time: '15 min' },
    { title: 'Exemples de code', href: '/docs/examples', time: '10 min' },
    { title: 'FAQ', href: '/docs/faq', time: '5 min' },
  ]

  const handleDisabled = (e) => {
    if (!DOCS_ENABLED) e.preventDefault()
  }

  const disabledItemClasses =
    'flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group'
  const activeItemClasses =
    'flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-6">Documentation</h1>
            <p className="text-xl text-blue-100 mb-8">
              Tout ce dont vous avez besoin pour intégrer Komor-IA dans vos
              applications
            </p>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher dans la documentation..."
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="max-w-7xl mx-auto px-6 -mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularDocs.map((doc, index) => (
            <Link
              key={index}
              href={doc.href}
              onClick={handleDisabled}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all border border-gray-200 group"
            >
              <div className="flex items-center justify-between mb-2">
                <Book className="w-5 h-5 text-blue-600" />
                <span className="text-xs text-gray-500">{doc.time}</span>
              </div>
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {doc.title}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Documentation Sections */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {sections.map((section, index) => {
            const Icon = section.icon
            const colorClasses = {
              blue: 'bg-blue-100 text-blue-600',
              purple: 'bg-purple-100 text-purple-600',
              green: 'bg-green-100 text-green-600',
              orange: 'bg-orange-100 text-orange-600',
            }

            return (
              <div
                key={index}
                className="bg-white rounded-xl p-8 shadow-sm border border-gray-200"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[section.color]}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {section.title}
                  </h2>
                </div>

                <div className="space-y-2">
                  {section.items.map((item, idx) => {
                    const ItemIcon = item.icon
                    return (
                      <Link
                        key={idx}
                        href={item.href}
                        onClick={handleDisabled}
                        className={
                          DOCS_ENABLED ? activeItemClasses : disabledItemClasses
                        }
                      >
                        <div className="flex items-center space-x-3">
                          <ItemIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                          <span className="text-gray-700 group-hover:text-blue-600 transition-colors font-medium">
                            {item.title}
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Besoin d'aide ?</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Notre équipe est là pour vous accompagner dans votre intégration
          </p>
          <div className="flex items-center justify-center space-x-4">
            {/* Nous contacter — toujours fonctionnel */}
            <Link
              href="/contact"
              className="px-6 py-3 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Nous contacter
            </Link>

            <Link
              href="/docs/api"
              onClick={handleDisabled}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Voir l'API Reference
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

// 'use client'

// import { useState } from 'react'
// import Link from 'next/link'
// import {
//   Book,
//   Code,
//   Zap,
//   Shield,
//   Globe,
//   ArrowRight,
//   Search,
//   FileText,
//   Terminal,
//   Cpu,
//   Database,
//   Key,
//   Settings,
//   Download,
//   Rocket,
// } from 'lucide-react'

// export default function DocsPage() {
//   const [searchQuery, setSearchQuery] = useState('')

//   const sections = [
//     {
//       title: 'Démarrage',
//       icon: Zap,
//       color: 'blue',
//       items: [
//         { title: 'Introduction', href: '/docs/introduction', icon: Book },
//         { title: 'Installation', href: '/docs/installation', icon: Download },
//         { title: 'Premier projet', href: '/docs/quickstart', icon: Rocket },
//         { title: 'Configuration', href: '/docs/configuration', icon: Settings },
//       ],
//     },
//     {
//       title: 'API Reference',
//       icon: Code,
//       color: 'purple',
//       items: [
//         { title: 'Authentification', href: '/docs/api/auth', icon: Key },
//         { title: 'Endpoints', href: '/docs/api/endpoints', icon: Terminal },
//         { title: 'Modèles', href: '/docs/api/models', icon: Cpu },
//         { title: 'Webhooks', href: '/docs/api/webhooks', icon: Zap },
//       ],
//     },
//     {
//       title: 'Modèles IA',
//       icon: Cpu,
//       color: 'green',
//       items: [
//         { title: 'Press-AI', href: '/docs/models/press-ai', icon: FileText },
//         // { title: 'Wazir', href: '/docs/models/wazir', icon: Brain },
//         // { title: 'Translate-AI', href: '/docs/models/translate', icon: Globe },
//         // { title: 'Custom Models', href: '/docs/models/custom', icon: Settings },
//       ],
//     },
//     {
//       title: 'Guides',
//       icon: FileText,
//       color: 'orange',
//       items: [
//         {
//           title: 'Bonnes pratiques',
//           href: '/docs/guides/best-practices',
//           icon: Shield,
//         },
//         { title: 'Sécurité', href: '/docs/guides/security', icon: Shield },
//         { title: 'Optimisation', href: '/docs/guides/optimization', icon: Zap },
//         {
//           title: 'Déploiement',
//           href: '/docs/guides/deployment',
//           icon: Database,
//         },
//       ],
//     },
//   ]

//   const popularDocs = [
//     {
//       title: 'Guide de démarrage rapide',
//       href: '/docs/quickstart',
//       time: '5 min',
//     },
//     { title: 'Référence API complète', href: '/docs/api', time: '15 min' },
//     { title: 'Exemples de code', href: '/docs/examples', time: '10 min' },
//     { title: 'FAQ', href: '/docs/faq', time: '5 min' },
//   ]

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Hero Section */}
//       <section className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white py-20">
//         <div className="max-w-7xl mx-auto px-6">
//           <div className="max-w-3xl">
//             <h1 className="text-5xl font-bold mb-6">Documentation</h1>
//             <p className="text-xl text-blue-100 mb-8">
//               Tout ce dont vous avez besoin pour intégrer Komor-IA dans vos
//               applications
//             </p>

//             {/* Search Bar */}
//             <div className="relative">
//               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//               <input
//                 type="text"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 placeholder="Rechercher dans la documentation..."
//                 className="w-full pl-12 pr-4 py-4 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all"
//               />
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Quick Links */}
//       <section className="max-w-7xl mx-auto px-6 -mt-12">
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//           {popularDocs.map((doc, index) => (
//             <Link
//               key={index}
//               href={doc.href}
//               className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all border border-gray-200 group"
//             >
//               <div className="flex items-center justify-between mb-2">
//                 <Book className="w-5 h-5 text-blue-600" />
//                 <span className="text-xs text-gray-500">{doc.time}</span>
//               </div>
//               <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
//                 {doc.title}
//               </h3>
//             </Link>
//           ))}
//         </div>
//       </section>

//       {/* Documentation Sections */}
//       <section className="max-w-7xl mx-auto px-6 py-16">
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//           {sections.map((section, index) => {
//             const Icon = section.icon
//             const colorClasses = {
//               blue: 'bg-blue-100 text-blue-600',
//               purple: 'bg-purple-100 text-purple-600',
//               green: 'bg-green-100 text-green-600',
//               orange: 'bg-orange-100 text-orange-600',
//             }

//             return (
//               <div
//                 key={index}
//                 className="bg-white rounded-xl p-8 shadow-sm border border-gray-200"
//               >
//                 <div className="flex items-center space-x-3 mb-6">
//                   <div
//                     className={`w-12 h-12 rounded-lg flex items-center justify-center ${
//                       colorClasses[section.color]
//                     }`}
//                   >
//                     <Icon className="w-6 h-6" />
//                   </div>
//                   <h2 className="text-2xl font-bold text-gray-900">
//                     {section.title}
//                   </h2>
//                 </div>

//                 <div className="space-y-2">
//                   {section.items.map((item, idx) => {
//                     const ItemIcon = item.icon
//                     return (
//                       <Link
//                         key={idx}
//                         href={item.href}
//                         className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
//                       >
//                         <div className="flex items-center space-x-3">
//                           <ItemIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
//                           <span className="text-gray-700 group-hover:text-blue-600 transition-colors font-medium">
//                             {item.title}
//                           </span>
//                         </div>
//                         <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
//                       </Link>
//                     )
//                   })}
//                 </div>
//               </div>
//             )
//           })}
//         </div>
//       </section>

//       {/* CTA Section */}
//       <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16">
//         <div className="max-w-7xl mx-auto px-6 text-center">
//           <h2 className="text-3xl font-bold mb-4">Besoin d'aide ?</h2>
//           <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
//             Notre équipe est là pour vous accompagner dans votre intégration
//           </p>
//           <div className="flex items-center justify-center space-x-4">
//             <Link
//               href="/contact"
//               className="px-6 py-3 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors"
//             >
//               Nous contacter
//             </Link>
//             <Link
//               href="/docs/api"
//               className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
//             >
//               Voir l'API Reference
//             </Link>
//           </div>
//         </div>
//       </section>
//     </div>
//   )
// }
