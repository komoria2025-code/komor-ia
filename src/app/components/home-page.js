'use client'

import {
  ArrowRight,
  Brain,
  Zap,
  Globe,
  Shield,
  Star,
  CheckCircle,
  TrendingUp,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import Footer from './footer'
import HorizontalNavbar from './horizontal-navbar'

// export default function HomePage() {
export default function HomePage({ onSectionChange }) {
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchModels()
  }, [])

  const fetchModels = async () => {
    try {
      const response = await fetch('/api/models?status=production&public=true')
      const data = await response.json()

      if (data.success) {
        setModels(data.models.slice(0, 4)) // Max 4 modèles sur la home
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

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      {/* <HorizontalNavbar /> */}

      {/* Hero Section */}
      <section className="relative pt-20 sm:pt-32 pb-20 sm:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#FAFAF9] via-blue-50/20 to-[#FAFAF9]"></div>

        <div className="relative max-w-6xl mx-auto px-6 sm:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-full mb-8 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm font-medium text-gray-700">
                Fondée en Août 2025 · Comores 🇰🇲
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light text-gray-900 mb-8 tracking-tight leading-[1.1]">
              L'Intelligence Artificielle
              <br />
              <span className="font-normal">pour l'Afrique</span>
            </h1>

            <p className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
              Komor-IA développe des modèles d'IA adaptés au contexte africain.
              De l'éducation aux médias, en passant par la santé.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => onSectionChange?.('voice')}
                className="group inline-flex items-center space-x-2 px-8 py-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <span className="font-medium">Contribuer au shikomori </span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <Link
                href="/contribution"
                className="group inline-flex items-center space-x-2 px-8 py-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <span className="font-medium">Guide de contribution</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/datasets"
                className="inline-flex items-center space-x-2 px-8 py-4 bg-white text-gray-900 border border-gray-300 rounded-lg hover:border-gray-400 transition-all duration-200"
              >
                <span className="font-medium">Nos datasets</span>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-20 pt-12 border-t border-gray-200">
              {[
                { value: `${models.length}+`, label: 'Modèles' },
                { value: '1K+', label: 'Requêtes/jour' },
                { value: '99.9%', label: 'Disponibilité' },
                { value: '< 2s', label: 'Temps de réponse' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-4xl font-light text-gray-900 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Notre Mission */}
      <section className="py-24 sm:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <div className="max-w-3xl mb-20">
            <h2 className="text-4xl sm:text-5xl font-light text-gray-900 mb-6 leading-tight">
              Notre mission
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed font-light">
              Créer des solutions d'intelligence artificielle adaptées au
              contexte comorien et africain. Comme OpenAI ou Anthropic, mais
              pour et par l'Afrique.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                icon: Brain,
                title: 'Innovation Africaine',
                description:
                  'Des modèles qui comprennent le contexte linguistique, culturel et socio-économique africain.',
              },
              {
                icon: Globe,
                title: 'Impact Continental',
                description:
                  "Commencer aux Comores pour rayonner dans toute l'Afrique de l'Est, puis sur le continent.",
              },
              {
                icon: Shield,
                title: 'Éthique & Transparence',
                description:
                  "Solutions responsables alignées sur les valeurs africaines d'Ubuntu et de solidarité.",
              },
            ].map((item, i) => (
              <div key={i} className="group">
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mb-6 group-hover:bg-gray-900 transition-colors duration-300">
                  <item.icon className="w-6 h-6 text-gray-900 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-4">
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed font-light">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nos Modèles - Dynamique */}
      <section id="models" className="py-24 sm:py-32 bg-[#FAFAF9]">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <div className="max-w-3xl mb-20">
            <h2 className="text-4xl sm:text-5xl font-light text-gray-900 mb-6 leading-tight">
              Nos modèles
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed font-light">
              Des solutions d'intelligence artificielle conçues pour répondre
              aux besoins spécifiques de l'Afrique.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Chargement des modèles...</p>
            </div>
          ) : (
            <>
              <div className="grid lg:grid-cols-2 gap-8 mb-16">
                {models.map((model) => (
                  <div
                    key={model.id}
                    className="group bg-white border border-gray-200 rounded-2xl p-10 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-8">
                      <div className="flex items-center space-x-4">
                        <div className="text-3xl">
                          {getModelEmoji(model.icon)}
                        </div>
                        <div>
                          <h3 className="text-2xl font-medium text-gray-900">
                            {model.name}
                          </h3>
                          <span
                            className={`inline-block mt-1 px-3 py-1 text-xs font-medium rounded-full ${
                              model.status === 'production'
                                ? 'bg-green-50 text-green-700'
                                : model.status === 'beta'
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'bg-yellow-50 text-yellow-700'
                            }`}
                          >
                            {model.status === 'production'
                              ? 'Production'
                              : model.status === 'beta'
                                ? 'Beta'
                                : 'Développement'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-8 leading-relaxed font-light">
                      {model.description}
                    </p>

                    {model.features && (
                      <div className="space-y-3 mb-8">
                        {Object.entries(model.features)
                          .slice(0, 3)
                          .map(([key, value], i) => (
                            <div
                              key={i}
                              className="flex items-center space-x-3"
                            >
                              <CheckCircle className="w-5 h-5 text-gray-400" />
                              <span className="text-gray-600 font-light">
                                {key.replace(/_/g, ' ')}
                              </span>
                            </div>
                          ))}
                      </div>
                    )}

                    <Link
                      href={`/models/${model.slug}`}
                      className="inline-flex items-center space-x-2 text-gray-900 font-medium group-hover:underline"
                    >
                      <span>Découvrir {model.name}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <Link
                  href="/models"
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-white border border-gray-300 rounded-lg hover:border-gray-400 transition-all"
                >
                  <span className="font-medium">Voir tous les modèles</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Nos Services */}
      <section className="py-24 sm:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <div className="max-w-3xl mb-20">
            <h2 className="text-4xl sm:text-5xl font-light text-gray-900 mb-6 leading-tight">
              Nos services
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed font-light">
              Au-delà de nos modèles, nous proposons un accompagnement complet.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                icon: Zap,
                title: 'API Freemium',
                description:
                  'Accédez à nos modèles via des API simples. Plan gratuit pour commencer, plans premium pour scaler.',
              },
              {
                icon: Users,
                title: 'Consulting IA',
                description:
                  "Nous vous accompagnons dans vos projets d'IA : audit, conseil stratégique, formation de vos équipes.",
              },
              {
                icon: Brain,
                title: 'Développement sur mesure',
                description:
                  "Besoin d'un modèle spécifique ? Nous développons des solutions IA adaptées à vos besoins métier.",
              },
            ].map((service, i) => (
              <div key={i} className="group">
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mb-6 group-hover:bg-gray-900 transition-colors duration-300">
                  <service.icon className="w-6 h-6 text-gray-900 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-4">
                  {service.title}
                </h3>
                <p className="text-gray-600 leading-relaxed font-light">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 sm:py-32 bg-[#FAFAF9]">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-light text-gray-900 mb-6 leading-tight">
            Prêt à intégrer l'IA
            <br />
            dans vos projets ?
          </h2>
          <p className="text-xl text-gray-600 mb-10 font-light">
            Rejoignez-nous dans cette aventure pour démocratiser l'IA en
            Afrique.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center px-8 py-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <span className="font-medium">Créer un compte gratuit</span>
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 border border-gray-300 rounded-lg hover:border-gray-400 transition-all duration-200"
            >
              <span className="font-medium">Discuter d'un projet</span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
// 'use client'

// import {
//   ArrowRight,
//   Brain,
//   Zap,
//   Globe,
//   Shield,
//   Star,
//   CheckCircle,
//   Sparkles,
//   Users,
//   TrendingUp,
// } from 'lucide-react'
// import Link from 'next/link'
// import { useState } from 'react'

// import Footer from './footer'
// import HorizontalNavbar from './horizontal-navbar'

// export default function HomePage() {
//   const [activeSection, setActiveSection] = useState('home')
//   const [sidebarOpen, setSidebarOpen] = useState(false)
//   return (
//     <div className="min-h-screen bg-[#FAFAF9]">
//       {/* <HorizontalNavbar showMenu={false} /> */}

//       {/* Hero Section - Style Anthropic */}
//       <section className="relative pt-20 sm:pt-32 pb-20 sm:pb-32 overflow-hidden">
//         {/* Gradient subtil en fond */}
//         <div className="absolute inset-0 bg-gradient-to-b from-[#FAFAF9] via-blue-50/20 to-[#FAFAF9]"></div>

//         <div className="relative max-w-6xl mx-auto px-6 sm:px-8">
//           <div className="max-w-4xl mx-auto text-center">
//             {/* Badge minimaliste */}
//             <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-full mb-8 shadow-sm">
//               <div className="w-2 h-2 rounded-full bg-green-500"></div>
//               <span className="text-sm font-medium text-gray-700">
//                 Fondée en Août 2024 · Comores 🇰🇲
//               </span>
//             </div>

//             {/* Titre principal - typographie élégante */}
//             <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light text-gray-900 mb-8 tracking-tight leading-[1.1]">
//               L'Intelligence Artificielle
//               <br />
//               <span className="font-normal">pour l'Afrique</span>
//             </h1>

//             {/* Sous-titre épuré */}
//             <p className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
//               Komor-IA développe des modèles d'IA adaptés au contexte africain.
//               De l'éducation aux médias, en passant par la santé.
//             </p>

//             {/* CTA simple et élégant */}
//             <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
//               <Link
//                 href="#models"
//                 className="group inline-flex items-center space-x-2 px-8 py-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all duration-200 shadow-sm hover:shadow-md"
//               >
//                 <span className="font-medium">Découvrir nos modèles</span>
//                 <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
//               </Link>
//               <Link
//                 href="/contact"
//                 className="inline-flex items-center space-x-2 px-8 py-4 bg-white text-gray-900 border border-gray-300 rounded-lg hover:border-gray-400 transition-all duration-200"
//               >
//                 <span className="font-medium">Nous contacter</span>
//               </Link>
//             </div>

//             {/* Stats minimalistes */}
//             <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-20 pt-12 border-t border-gray-200">
//               {[
//                 { value: '2+', label: 'Modèles' },
//                 { value: '1K+', label: 'Requêtes/jour' },
//                 { value: '99.9%', label: 'Disponibilité' },
//                 { value: '< 2s', label: 'Temps de réponse' },
//               ].map((stat, i) => (
//                 <div key={i} className="text-center">
//                   <div className="text-4xl font-light text-gray-900 mb-2">
//                     {stat.value}
//                   </div>
//                   <div className="text-sm text-gray-600 font-medium">
//                     {stat.label}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Notre Mission - Design épuré */}
//       <section className="py-24 sm:py-32 bg-white">
//         <div className="max-w-6xl mx-auto px-6 sm:px-8">
//           <div className="max-w-3xl mb-20">
//             <h2 className="text-4xl sm:text-5xl font-light text-gray-900 mb-6 leading-tight">
//               Notre mission
//             </h2>
//             <p className="text-xl text-gray-600 leading-relaxed font-light">
//               Créer des solutions d'intelligence artificielle adaptées au
//               contexte comorien et africain. Comme OpenAI ou Anthropic, mais
//               pour et par l'Afrique.
//             </p>
//           </div>

//           <div className="grid md:grid-cols-3 gap-12">
//             {[
//               {
//                 icon: Brain,
//                 title: 'Innovation Africaine',
//                 description:
//                   'Des modèles qui comprennent le contexte linguistique, culturel et socio-économique africain.',
//               },
//               {
//                 icon: Globe,
//                 title: 'Impact Continental',
//                 description:
//                   "Commencer aux Comores pour rayonner dans toute l'Afrique de l'Est, puis sur le continent.",
//               },
//               {
//                 icon: Shield,
//                 title: 'Éthique & Transparence',
//                 description:
//                   "Solutions responsables alignées sur les valeurs africaines d'Ubuntu et de solidarité.",
//               },
//             ].map((item, i) => (
//               <div key={i} className="group">
//                 <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mb-6 group-hover:bg-gray-900 transition-colors duration-300">
//                   <item.icon className="w-6 h-6 text-gray-900 group-hover:text-white transition-colors duration-300" />
//                 </div>
//                 <h3 className="text-xl font-medium text-gray-900 mb-4">
//                   {item.title}
//                 </h3>
//                 <p className="text-gray-600 leading-relaxed font-light">
//                   {item.description}
//                 </p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Nos Modèles - Design carte simple */}
//       <section id="models" className="py-24 sm:py-32 bg-[#FAFAF9]">
//         <div className="max-w-6xl mx-auto px-6 sm:px-8">
//           <div className="max-w-3xl mb-20">
//             <h2 className="text-4xl sm:text-5xl font-light text-gray-900 mb-6 leading-tight">
//               Nos modèles
//             </h2>
//             <p className="text-xl text-gray-600 leading-relaxed font-light">
//               Des solutions d'intelligence artificielle conçues pour répondre
//               aux besoins spécifiques de l'Afrique.
//             </p>
//           </div>

//           <div className="grid lg:grid-cols-2 gap-8 mb-16">
//             {/* Press-AI */}
//             <div className="group bg-white border border-gray-200 rounded-2xl p-10 hover:shadow-lg transition-all duration-300">
//               <div className="flex items-start justify-between mb-8">
//                 <div className="flex items-center space-x-4">
//                   <div className="text-3xl">💬</div>
//                   <div>
//                     <h3 className="text-2xl font-medium text-gray-900">
//                       Press-AI
//                     </h3>
//                     <span className="inline-block mt-1 px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
//                       Production
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               <p className="text-gray-600 mb-8 leading-relaxed font-light">
//                 Chatbot intelligent développé en partenariat avec{' '}
//                 <a
//                   href="https://km-news.net"
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="text-gray-900 underline decoration-gray-300 hover:decoration-gray-900 transition-colors"
//                 >
//                   Km-news
//                 </a>
//                 . Capable d'analyser, de classer et de générer des résumés
//                 d'articles de presse en français.
//               </p>

//               <div className="space-y-3 mb-8">
//                 {[
//                   "Classification automatique d'articles",
//                   'Génération de résumés pertinents',
//                   'Interface conversationnelle intuitive',
//                 ].map((feature, i) => (
//                   <div key={i} className="flex items-center space-x-3">
//                     <CheckCircle className="w-5 h-5 text-gray-400" />
//                     <span className="text-gray-600 font-light">{feature}</span>
//                   </div>
//                 ))}
//               </div>

//               <Link
//                 href="/models/press-ai"
//                 className="inline-flex items-center space-x-2 text-gray-900 font-medium group-hover:underline"
//               >
//                 <span>Tester Press-AI</span>
//                 <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
//               </Link>
//             </div>

//             {/* Wazir */}
//             <div className="group bg-white border border-gray-200 rounded-2xl p-10 hover:shadow-lg transition-all duration-300">
//               <div className="flex items-start justify-between mb-8">
//                 <div className="flex items-center space-x-4">
//                   <div className="text-3xl">🤖</div>
//                   <div>
//                     <h3 className="text-2xl font-medium text-gray-900">
//                       Wazir
//                     </h3>
//                     <span className="inline-block mt-1 px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
//                       Production
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               <p className="text-gray-600 mb-8 leading-relaxed font-light">
//                 Assistant conversationnel général en français. Son nom signifie
//                 "ministre" en comorien (Shikomori), incarnant le "ministre du
//                 savoir". Actuellement propulsé par Mistral.
//               </p>

//               <div className="space-y-3 mb-8">
//                 {[
//                   'Réponses en français fluide',
//                   'Contexte conversationnel',
//                   'Polyvalent et adaptatif',
//                 ].map((feature, i) => (
//                   <div key={i} className="flex items-center space-x-3">
//                     <CheckCircle className="w-5 h-5 text-gray-400" />
//                     <span className="text-gray-600 font-light">{feature}</span>
//                   </div>
//                 ))}
//               </div>

//               <Link
//                 href="/models/wazir"
//                 className="inline-flex items-center space-x-2 text-gray-900 font-medium group-hover:underline"
//               >
//                 <span>Tester Wazir</span>
//                 <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
//               </Link>
//             </div>
//           </div>

//           {/* Badge développement */}
//           <div className="text-center">
//             <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-full">
//               <TrendingUp className="w-4 h-4 text-gray-600" />
//               <span className="text-sm text-gray-600 font-medium">
//                 D'autres modèles en cours de développement
//               </span>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Nos Services */}
//       <section className="py-24 sm:py-32 bg-white">
//         <div className="max-w-6xl mx-auto px-6 sm:px-8">
//           <div className="max-w-3xl mb-20">
//             <h2 className="text-4xl sm:text-5xl font-light text-gray-900 mb-6 leading-tight">
//               Nos services
//             </h2>
//             <p className="text-xl text-gray-600 leading-relaxed font-light">
//               Au-delà de nos modèles, nous proposons un accompagnement complet.
//             </p>
//           </div>

//           <div className="grid md:grid-cols-3 gap-12">
//             {[
//               {
//                 icon: Zap,
//                 title: 'API Freemium',
//                 description:
//                   'Accédez à nos modèles via des API simples. Plan gratuit pour commencer, plans premium pour scaler.',
//               },
//               {
//                 icon: Users,
//                 title: 'Consulting IA',
//                 description:
//                   "Nous vous accompagnons dans vos projets d'IA : audit, conseil stratégique, formation de vos équipes.",
//               },
//               {
//                 icon: Brain,
//                 title: 'Développement sur mesure',
//                 description:
//                   "Besoin d'un modèle spécifique ? Nous développons des solutions IA adaptées à vos besoins métier.",
//               },
//             ].map((service, i) => (
//               <div key={i} className="group">
//                 <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mb-6 group-hover:bg-gray-900 transition-colors duration-300">
//                   <service.icon className="w-6 h-6 text-gray-900 group-hover:text-white transition-colors duration-300" />
//                 </div>
//                 <h3 className="text-xl font-medium text-gray-900 mb-4">
//                   {service.title}
//                 </h3>
//                 <p className="text-gray-600 leading-relaxed font-light">
//                   {service.description}
//                 </p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Témoignage Km-news - Minimaliste */}
//       <section className="py-24 sm:py-32 bg-gray-900">
//         <div className="max-w-4xl mx-auto px-6 sm:px-8 text-center">
//           <div className="flex items-center justify-center space-x-1 mb-8">
//             {[...Array(5)].map((_, i) => (
//               <Star key={i} className="w-5 h-5 text-gray-400 fill-current" />
//             ))}
//           </div>
//           <blockquote className="text-2xl sm:text-3xl font-light text-white mb-8 leading-relaxed">
//             "Press-AI a transformé notre façon de gérer l'information. Le
//             chatbot est devenu un outil indispensable pour nos lecteurs."
//           </blockquote>
//           <div>
//             <p className="text-white font-medium mb-1">Équipe Km-news</p>
//             <a
//               href="https://km-news.net"
//               target="_blank"
//               rel="noopener noreferrer"
//               className="text-gray-400 hover:text-white transition-colors underline decoration-gray-600 hover:decoration-white"
//             >
//               km-news.net
//             </a>
//           </div>
//         </div>
//       </section>

//       {/* CTA Final - Sobre */}
//       <section className="py-24 sm:py-32 bg-[#FAFAF9]">
//         <div className="max-w-4xl mx-auto px-6 sm:px-8 text-center">
//           <h2 className="text-4xl sm:text-5xl font-light text-gray-900 mb-6 leading-tight">
//             Prêt à intégrer l'IA
//             <br />
//             dans vos projets ?
//           </h2>
//           <p className="text-xl text-gray-600 mb-10 font-light">
//             Rejoignez-nous dans cette aventure pour démocratiser l'IA en
//             Afrique.
//           </p>
//           <div className="flex flex-col sm:flex-row gap-4 justify-center">
//             <Link
//               href="/signup"
//               className="inline-flex items-center justify-center px-8 py-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all duration-200 shadow-sm hover:shadow-md"
//             >
//               <span className="font-medium">Créer un compte gratuit</span>
//             </Link>
//             <Link
//               href="/contact"
//               className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 border border-gray-300 rounded-lg hover:border-gray-400 transition-all duration-200"
//             >
//               <span className="font-medium">Discuter d'un projet</span>
//             </Link>
//           </div>
//         </div>
//       </section>

//       <Footer />
//     </div>
//   )
// }
