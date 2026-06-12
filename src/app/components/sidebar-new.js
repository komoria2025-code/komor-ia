'use client'

import { useState, useEffect } from 'react'
import {
  Home,
  Key,
  BarChart3,
  BookOpen,
  Settings,
  ChevronDown,
  ChevronRight,
  Brain,
  Languages,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useSession } from 'next-auth/react'

export default function Sidebar({
  isOpen,
  onToggle,
  activeSection,
  setActiveSection,
}) {
  const [modelsExpanded, setModelsExpanded] = useState(true)
  const [models, setModels] = useState([])
  const [loadingModels, setLoadingModels] = useState(true)
  const { data: session } = useSession()

  useEffect(() => {
    fetchModels()
  }, [])

  const fetchModels = async () => {
    try {
      const response = await fetch('/api/models?status=production&public=true')
      if (response.ok) {
        const data = await response.json()
        console.log('data', data)
        setModels(data.models || [])
      }
    } catch (error) {
      console.error('Erreur:', error)
      // Modèles par défaut si l'API échoue
      setModels([
        { id: 1, slug: 'press-ai', name: 'Press-AI', status: 'production' },
        { id: 2, slug: 'wazir', name: 'Wazir', status: 'production' },
      ])
    } finally {
      setLoadingModels(false)
    }
  }

  console.log('nos modeles', models)
  const menuItems = [
    { id: 'home', label: 'Accueil', icon: Home },
    { id: 'api-keys', label: 'Clés API', icon: Key },
    { id: 'articles', label: 'Articles & Traduction', icon: Languages },
    { id: 'usage', label: 'Utilisation', icon: BarChart3 },
    { id: 'docs', label: 'Documentation', icon: BookOpen },
    // { id: 'settings', label: 'Paramètres', icon: Settings },
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'production':
        return 'bg-green-100 text-green-700'
      case 'beta':
        return 'bg-blue-100 text-blue-700'
      case 'development':
        return 'bg-yellow-100 text-yellow-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'production':
        return 'Prod'
      case 'beta':
        return 'Beta'
      case 'development':
        return 'Dev'
      default:
        return status
    }
  }

  return (
    <>
      {/* Sidebar - Toujours visible en desktop */}
      <aside
        className={`
          hidden lg:block
          fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-[9999]
          transition-all duration-300 ease-in-out
          ${isOpen ? 'w-64' : 'w-20'}
        `}
      >
        <div className="flex flex-col h-full">
          <div className="h-20 px-4 border-b border-gray-200 flex items-center justify-between">
            {isOpen && (
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br  rounded-lg flex items-center justify-center flex-shrink-0">
                  <Image
                    src="/logo3.svg"
                    alt="Komor-IA Logo"
                    width={64}
                    height={64}
                    priority
                  />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Komor-IA
                  </h2>
                  <p className="text-xs text-gray-500">AI Platform</p>
                </div>
              </Link>
            )}
            {!isOpen && (
              <button
                onClick={onToggle}
                className="w-8 h-8 bg-[#1A1A1A] rounded-lg flex items-center justify-center mx-auto hover:bg-gray-700 transition-colors"
                title="Ouvrir le menu"
              >
                <span className="text-white text-sm font-bold">K</span>
              </button>
            )}

            {isOpen && (
              <button
                onClick={onToggle}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Fermer le menu"
              >
                <PanelLeftClose className="w-5 h-5 text-gray-600" />
              </button>
            )}
          </div>

          {/* Menu */}
          <nav className="flex-1 overflow-y-auto p-4">
            {isOpen ? (
              <>
                {/* Menu complet */}
                <div className="space-y-1">
                  {menuItems.map((item) => {
                    const isActive = activeSection === item.id
                    const Icon = item.icon

                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={`
                          w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg
                          transition-all duration-200
                          ${
                            isActive
                              ? 'bg-gray-900 text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          }
                        `}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm font-medium">
                          {item.label}
                        </span>
                      </button>
                    )
                  })}
                </div>

                {/* Section Modèles */}
                <div className="mt-6">
                  <button
                    onClick={() => setModelsExpanded(!modelsExpanded)}
                    className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
                  >
                    <span>Modèles IA</span>
                    {modelsExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>

                  {modelsExpanded && (
                    <div className="mt-2 space-y-1">
                      {loadingModels ? (
                        <div className="px-3 py-2 text-sm text-gray-500">
                          Chargement...
                        </div>
                      ) : models.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-gray-500">
                          Aucun modèle disponible
                        </div>
                      ) : (
                        models.map((model) => {
                          const modelId = `model-${model.slug}`
                          const isActive = activeSection === modelId

                          return (
                            <button
                              key={model.id}
                              onClick={() => setActiveSection(modelId)}
                              className={`
                                w-full flex items-center justify-between px-3 py-2 rounded-lg
                                transition-all duration-200 group
                                ${
                                  isActive
                                    ? 'bg-gray-100 text-gray-900'
                                    : 'text-gray-600 hover:bg-gray-50'
                                }
                              `}
                            >
                              <div className="flex items-center space-x-2 flex-1 min-w-0">
                                <Brain className="w-4 h-4 flex-shrink-0" />
                                <span className="text-sm font-medium truncate">
                                  {model.name}
                                </span>
                              </div>
                              <span
                                className={`
                                  text-xs px-2 py-0.5 rounded-full flex-shrink-0 ml-2
                                  ${getStatusColor(model.status)}
                                `}
                              >
                                {getStatusLabel(model.status)}
                              </span>
                            </button>
                          )
                        })
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : (
              // Menu réduit (icônes seulement)
              <div className="space-y-2">
                {menuItems.map((item) => {
                  const isActive = activeSection === item.id
                  const Icon = item.icon

                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`
                        w-full flex items-center justify-center p-3 rounded-lg
                        transition-all duration-200
                        ${
                          isActive
                            ? 'bg-gray-900 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }
                      `}
                      title={item.label}
                    >
                      <Icon className="w-5 h-5" />
                    </button>
                  )
                })}
              </div>
            )}
          </nav>

          {/* Footer */}
          {/* {isOpen && (
            <div className="p-4 border-t border-gray-200">
              <div className="text-xs text-gray-500 text-center">
                Version 2.1.0
              </div>
            </div>
          )} */}
          {/* Footer */}
          <div className="p-4 border-t border-gray-200 space-y-2">
            {/* ✅ Bouton Espace Linguiste - admin et linguiste seulement */}
            {(session?.user?.role === 'admin' ||
              session?.user?.role === 'linguiste') &&
              (isOpen ? (
                <Link
                  href="/linguiste"
                  className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                >
                  <Languages className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">Espace Linguiste</span>
                </Link>
              ) : (
                <Link
                  href="/linguiste"
                  className="w-full flex items-center justify-center p-3 rounded-lg text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                  title="Espace Linguiste"
                >
                  <Languages className="w-5 h-5" />
                </Link>
              ))}

            {isOpen && (
              <div className="text-xs text-gray-500 text-center">
                Version 2.1.0
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Bouton toggle floating */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="hidden lg:flex fixed top-4 left-4 z-50 p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all"
          title="Ouvrir le menu"
        >
          <PanelLeftOpen className="w-5 h-5 text-gray-600" />
        </button>
      )}
    </>
  )
}
// 'use client'

// import { useState, useEffect } from 'react'
// import {
//   Home,
//   Box,
//   Key,
//   Settings,
//   BarChart3,
//   BookOpen,
//   ChevronDown,
//   ChevronRight,
// } from 'lucide-react'
// import Image from 'next/image'
// import Link from 'next/link'

// export default function Sidebar({
//   activeSection,
//   setActiveSection,
//   isMobile = false,
// }) {
//   const [models, setModels] = useState([])
//   const [modelsExpanded, setModelsExpanded] = useState(true)
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     // Charger les modèles depuis l'API
//     fetchModels()
//   }, [])

//   const fetchModels = async () => {
//     try {
//       const response = await fetch('/api/models')
//       const data = await response.json()
//       if (data.success) {
//         setModels(data.models)
//       }
//     } catch (error) {
//       console.error('Erreur lors du chargement des modèles:', error)
//       // Données de fallback si l'API n'est pas encore implémentée
//       setModels([
//         {
//           id: 1,
//           slug: 'press-ai',
//           name: 'Press-AI',
//           icon: 'MessageSquare',
//           color: 'blue',
//           status: 'production',
//         },
//         {
//           id: 2,
//           slug: 'wazir',
//           name: 'Wazir',
//           icon: 'Bot',
//           color: 'green',
//           status: 'production',
//         },
//       ])
//     } finally {
//       setLoading(false)
//     }
//   }

//   const mainMenuItems = [
//     { id: 'home', label: 'Accueil', icon: Home },
//     { id: 'api-keys', label: 'API Keys', icon: Key },
//     { id: 'usage', label: 'Utilisation', icon: BarChart3 },
//     { id: 'docs', label: 'Documentation', icon: BookOpen },
//     { id: 'settings', label: 'Paramètres', icon: Settings },
//   ]

//   const getModelIcon = (iconName) => {
//     // Mapping des icônes
//     const icons = {
//       MessageSquare: '💬',
//       Bot: '🤖',
//       Brain: '🧠',
//       Zap: '⚡',
//     }
//     return icons[iconName] || '📦'
//   }

//   const getStatusBadge = (status) => {
//     const badges = {
//       production: { text: 'Prod', class: 'bg-green-100 text-green-700' },
//       beta: { text: 'Beta', class: 'bg-blue-100 text-blue-700' },
//       development: { text: 'Dev', class: 'bg-yellow-100 text-yellow-700' },
//     }
//     return badges[status] || badges.development
//   }

//   return (
//     <div
//       className={`
//         bg-white border-r border-gray-200 h-screen
//         ${isMobile ? 'w-80' : 'w-64'}
//         flex flex-col shadow-lg lg:shadow-none
//       `}
//     >
//       {/* Header */}
//       <div className="p-6 border-b border-gray-200">
//         <Link href="/" className="flex items-center space-x-3">
//           <div className="w-12 h-12 bg-gradient-to-br  rounded-lg flex items-center justify-center flex-shrink-0">
//             <Image
//               src="/logo3.svg"
//               alt="Komor-IA Logo"
//               width={64}
//               height={64}
//               priority
//             />
//           </div>
//           <div>
//             <h2 className="text-lg font-semibold text-gray-900">Komor-IA</h2>
//             <p className="text-xs text-gray-500">AI Platform</p>
//           </div>
//         </Link>
//       </div>

//       {/* Navigation */}
//       <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
//         {/* Main Menu */}
//         <div>
//           <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
//             Menu
//           </h3>
//           <div className="space-y-1">
//             {mainMenuItems.map((item) => {
//               const IconComponent = item.icon
//               const isActive = activeSection === item.id

//               return (
//                 <button
//                   key={item.id}
//                   onClick={() => setActiveSection(item.id)}
//                   className={`
//                     w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left
//                     transition-all duration-200 ease-in-out group
//                     ${
//                       isActive
//                         ? 'bg-blue-50 text-blue-700 shadow-sm'
//                         : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
//                     }
//                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
//                   `}
//                 >
//                   <IconComponent
//                     className={`w-5 h-5 flex-shrink-0 ${
//                       isActive
//                         ? 'text-blue-600'
//                         : 'text-gray-500 group-hover:text-gray-700'
//                     }`}
//                   />
//                   <span className="font-medium truncate">{item.label}</span>
//                   {isActive && (
//                     <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
//                   )}
//                 </button>
//               )
//             })}
//           </div>
//         </div>

//         {/* Models Section */}
//         <div>
//           <button
//             onClick={() => setModelsExpanded(!modelsExpanded)}
//             className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
//           >
//             <div className="flex items-center space-x-2">
//               <Box className="w-4 h-4" />
//               <span>Modèles IA</span>
//             </div>
//             {modelsExpanded ? (
//               <ChevronDown className="w-4 h-4" />
//             ) : (
//               <ChevronRight className="w-4 h-4" />
//             )}
//           </button>

//           {modelsExpanded && (
//             <div className="mt-2 space-y-1">
//               {loading ? (
//                 <div className="px-3 py-2 text-sm text-gray-500">
//                   Chargement...
//                 </div>
//               ) : models.length === 0 ? (
//                 <div className="px-3 py-2 text-sm text-gray-500">
//                   Aucun modèle disponible
//                 </div>
//               ) : (
//                 models.map((model) => {
//                   const isActive = activeSection === `model-${model.slug}`
//                   const statusBadge = getStatusBadge(model.status)

//                   return (
//                     <button
//                       key={model.id}
//                       onClick={() => setActiveSection(`model-${model.slug}`)}
//                       className={`
//                         w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left
//                         transition-all duration-200 ease-in-out group
//                         ${
//                           isActive
//                             ? 'bg-blue-50 text-blue-700 shadow-sm'
//                             : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
//                         }
//                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
//                       `}
//                     >
//                       <span className="text-lg flex-shrink-0">
//                         {getModelIcon(model.icon)}
//                       </span>
//                       <div className="flex-1 min-w-0">
//                         <div className="flex items-center space-x-2">
//                           <span className="font-medium truncate">
//                             {model.name}
//                           </span>
//                           <span
//                             className={`text-xs px-1.5 py-0.5 rounded ${statusBadge.class}`}
//                           >
//                             {statusBadge.text}
//                           </span>
//                         </div>
//                       </div>
//                       {isActive && (
//                         <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
//                       )}
//                     </button>
//                   )
//                 })
//               )}
//             </div>
//           )}
//         </div>
//       </nav>

//       {/* Footer */}
//       <div className="p-4 border-t border-gray-200">
//         <div className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50">
//           <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
//             <span className="text-sm font-bold text-white">KM</span>
//           </div>
//           <div className="flex-1 min-w-0">
//             <p className="text-sm font-medium text-gray-900 truncate">
//               Version 1.0.0
//             </p>
//             <p className="text-xs text-gray-500 truncate">Août 2024</p>
//           </div>
//           <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0" />
//         </div>
//       </div>
//     </div>
//   )
// }
