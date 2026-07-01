// 'use client'

// import { useState, useEffect } from 'react'
// import { useSession, signOut } from 'next-auth/react'
// import {
//   Search,
//   User,
//   LogIn,
//   LogOut,
//   Menu,
//   X,
//   ChevronDown,
//   Home,
//   Key,
//   BarChart3,
//   BookOpen,
//   Languages,
//   Brain,
//   ChevronRight,
//   Mic,
// } from 'lucide-react'
// import Image from 'next/image'
// import Link from 'next/link'
// import { usePathname } from 'next/navigation'

// export default function HorizontalNavbar({
//   onMenuClick,
//   showMenu = true,
//   activeSection,
//   setActiveSection,
//   isSidebarOpen,
// }) {
//   const { data: session, status } = useSession()
//   const [searchQuery, setSearchQuery] = useState('')
//   const [isSearchFocused, setIsSearchFocused] = useState(false)
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
//   const [userMenuOpen, setUserMenuOpen] = useState(false)
//   const [modelsExpanded, setModelsExpanded] = useState(false)
//   const [models, setModels] = useState([])
//   const pathname = usePathname()
//   const showLogo = pathname !== '/'
//   const isDashboard = pathname?.startsWith('/dashboard')

//   useEffect(() => {
//     if (isDashboard) {
//       fetch('/api/models?status=production&public=true')
//         .then((r) => r.json())
//         .then((data) => setModels(data.models || []))
//         .catch(() =>
//           setModels([
//             { id: 1, slug: 'press-ai', name: 'Press-AI', status: 'production' },
//             { id: 2, slug: 'wazir', name: 'Wazir', status: 'production' },
//           ]),
//         )
//     }
//   }, [isDashboard])

//   const menuItems = [
//     { id: 'home', label: 'Accueil', icon: Home },
//     { id: 'api-keys', label: 'Clés API', icon: Key },
//     { id: 'articles', label: 'Articles & Traduction', icon: Languages },
//     { id: 'voice', label: 'Enregistrement vocale', icon: Mic },
//     { id: 'usage', label: 'Utilisation', icon: BarChart3 },
//     { id: 'docs', label: 'Documentation', icon: BookOpen },
//   ]

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'production':
//         return 'bg-green-100 text-green-700'
//       case 'beta':
//         return 'bg-blue-100 text-blue-700'
//       case 'development':
//         return 'bg-yellow-100 text-yellow-700'
//       default:
//         return 'bg-gray-100 text-gray-700'
//     }
//   }

//   const handleSearch = (e) => {
//     e.preventDefault()
//     if (searchQuery.trim()) console.log('Recherche:', searchQuery)
//   }

//   // const handleLogout = async () => {
//   //   await signOut({ callbackUrl: '/' })
//   // }
//   const handleLogout = async () => {
//     try {
//       // ✅ Attendre la déconnexion complète
//       await signOut({
//         redirect: true,
//         callbackUrl: '/',
//       })
//     } catch (error) {
//       console.error('Erreur déconnexion:', error)
//     }
//   }

//   const handleSectionClick = (id) => {
//     setActiveSection?.(id)
//     setMobileMenuOpen(false)
//   }

//   return (
//     <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between items-center h-20">
//           {/* Logo - toujours visible */}
//           {/* <Link href="/" className="flex items-center space-x-3">
//             <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
//               <Image
//                 src="/logo3.svg"
//                 alt="Komor-IA Logo"
//                 width={64}
//                 height={64}
//                 priority
//               />
//             </div>
//             <div>
//               <h2 className="text-lg font-semibold text-gray-900">Komor-IA</h2>
//               <p className="text-xs text-gray-500">AI Platform</p>
//             </div>
//           </Link> */}
//           {/* Logo - caché en desktop quand sidebar est ouvert */}
//           <Link
//             href="/"
//             className={`flex items-center space-x-3 ${
//               isSidebarOpen ? 'lg:hidden' : 'lg:flex'
//             }`}
//           >
//             <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
//               <Image
//                 src="/logo3.svg"
//                 alt="Komor-IA Logo"
//                 width={64}
//                 height={64}
//                 priority
//               />
//             </div>
//             <div>
//               <h2 className="text-lg font-semibold text-gray-900">Komor-IA</h2>
//               <p className="text-xs text-gray-500">AI Platform</p>
//             </div>
//           </Link>

//           {/* Search Bar - Desktop uniquement */}
//           <div className="hidden lg:flex flex-1 max-w-md mx-8">
//             <form onSubmit={handleSearch} className="w-full group">
//               <div className="relative">
//                 <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-0 group-focus-within:opacity-20 transition-opacity duration-300"></div>
//                 <div className="relative flex items-center">
//                   <Search className="absolute left-4 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
//                   <input
//                     type="text"
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                     onFocus={() => setIsSearchFocused(true)}
//                     onBlur={() => setIsSearchFocused(false)}
//                     placeholder="Rechercher..."
//                     className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-2xl font-medium focus:outline-none transition-all duration-300 ${
//                       isSearchFocused
//                         ? 'bg-white border-blue-500 shadow-lg shadow-blue-500/10'
//                         : 'bg-gray-50/50 border-gray-200 hover:border-gray-300'
//                     }`}
//                   />
//                 </div>
//               </div>
//             </form>
//           </div>

//           {/* Nav Links + Auth - Desktop */}
//           <div className="hidden lg:flex items-center space-x-2">
//             {['Models', 'Blog', 'Docs'].map((item, i) => (
//               <Link
//                 key={i}
//                 href={`/${item.toLowerCase()}`}
//                 className="px-4 py-2.5 text-sm font-bold text-gray-700 hover:text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-300"
//               >
//                 {item}
//               </Link>
//             ))}

//             <div className="flex items-center space-x-2 ml-4 pl-4 border-l-2 border-gray-200">
//               {status === 'loading' ? (
//                 <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
//               ) : session ? (
//                 <div className="relative">
//                   <button
//                     onClick={() => setUserMenuOpen(!userMenuOpen)}
//                     className="flex items-center space-x-2 px-3 py-2 rounded-xl hover:bg-blue-50 transition-all duration-300 group"
//                   >
//                     <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
//                       {session.user?.image ? (
//                         <img
//                           src={session.user.image}
//                           alt={session.user.name || 'User'}
//                           className="w-8 h-8 rounded-full"
//                         />
//                       ) : (
//                         <User className="w-4 h-4 text-white" />
//                       )}
//                     </div>
//                     <div className="hidden xl:block text-left">
//                       <p className="text-sm font-bold text-gray-900">
//                         {session.user?.name || 'Utilisateur'}
//                       </p>
//                       <p className="text-xs text-gray-500">
//                         {session.user?.email}
//                       </p>
//                     </div>
//                     <ChevronDown className="w-4 h-4 text-gray-500" />
//                   </button>
//                   {userMenuOpen && (
//                     <>
//                       <div
//                         className="fixed inset-0 z-10"
//                         onClick={() => setUserMenuOpen(false)}
//                       ></div>
//                       <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-20">
//                         <div className="px-4 py-3 border-b border-gray-100">
//                           <p className="text-sm font-bold text-gray-900">
//                             {session.user?.name || 'Utilisateur'}
//                           </p>
//                           <p className="text-xs text-gray-500 truncate">
//                             {session.user?.email}
//                           </p>
//                         </div>
//                         <Link
//                           href="/dashboard"
//                           className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
//                           onClick={() => setUserMenuOpen(false)}
//                         >
//                           Dashboard
//                         </Link>
//                         <div className="border-t border-gray-100 mt-2 pt-2">
//                           <button
//                             onClick={handleLogout}
//                             className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2"
//                           >
//                             <LogOut className="w-4 h-4" />
//                             <span>Déconnexion</span>
//                           </button>
//                         </div>
//                       </div>
//                     </>
//                   )}
//                 </div>
//               ) : (
//                 <>
//                   <Link
//                     href="/login"
//                     className="flex items-center space-x-2 px-4 py-2.5 text-sm font-bold text-gray-700 hover:text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-300"
//                   >
//                     <LogIn className="w-4 h-4" />
//                     <span>Connexion</span>
//                   </Link>
//                   <Link
//                     href="/signup"
//                     className="relative group overflow-hidden"
//                   >
//                     <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl"></div>
//                     <div className="relative flex items-center space-x-2 px-5 py-2.5 text-sm font-bold text-white">
//                       <User className="w-4 h-4" />
//                       <span>Inscription</span>
//                     </div>
//                   </Link>
//                 </>
//               )}
//             </div>
//           </div>

//           {/* Burger - Mobile/Tablette */}
//           <button
//             onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//             className="lg:hidden p-2.5 rounded-xl hover:bg-blue-50 transition-all duration-300 group"
//           >
//             {mobileMenuOpen ? (
//               <X className="w-6 h-6 text-gray-700" />
//             ) : (
//               <Menu className="w-6 h-6 text-gray-700" />
//             )}
//           </button>
//         </div>

//         {/* Mobile Menu */}
//         {mobileMenuOpen && (
//           <div className="lg:hidden pb-6 border-t border-gray-200 max-h-[calc(100vh-5rem)] overflow-y-auto">
//             {/* Search mobile */}
//             <form onSubmit={handleSearch} className="my-4">
//               <div className="relative">
//                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//                 <input
//                   type="text"
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   placeholder="Rechercher..."
//                   className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 bg-gray-50 font-medium transition-all"
//                 />
//               </div>
//             </form>

//             {/* Si dashboard : afficher les items du sidebar */}
//             {setActiveSection && (
//               <>
//                 <div className="mb-2">
//                   <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
//                     Navigation
//                   </p>
//                   <div className="space-y-1">
//                     {menuItems.map((item) => {
//                       const Icon = item.icon
//                       const isActive = activeSection === item.id
//                       return (
//                         <button
//                           key={item.id}
//                           onClick={() => handleSectionClick(item.id)}
//                           className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
//                             isActive
//                               ? 'bg-gray-900 text-white'
//                               : 'text-gray-700 hover:bg-gray-100'
//                           }`}
//                         >
//                           <Icon className="w-5 h-5 flex-shrink-0" />
//                           <span className="text-sm font-medium">
//                             {item.label}
//                           </span>
//                         </button>
//                       )
//                     })}
//                   </div>
//                 </div>

//                 {/* Modèles IA */}
//                 <div className="mb-4">
//                   <button
//                     onClick={() => setModelsExpanded(!modelsExpanded)}
//                     className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700"
//                   >
//                     <span>Modèles IA</span>
//                     {modelsExpanded ? (
//                       <ChevronDown className="w-4 h-4" />
//                     ) : (
//                       <ChevronRight className="w-4 h-4" />
//                     )}
//                   </button>
//                   {modelsExpanded && (
//                     <div className="mt-1 space-y-1">
//                       {models.map((model) => {
//                         const modelId = `model-${model.slug}`
//                         const isActive = activeSection === modelId
//                         return (
//                           <button
//                             key={model.id}
//                             onClick={() => handleSectionClick(modelId)}
//                             className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 ${
//                               isActive
//                                 ? 'bg-gray-100 text-gray-900'
//                                 : 'text-gray-600 hover:bg-gray-50'
//                             }`}
//                           >
//                             <div className="flex items-center space-x-2">
//                               <Brain className="w-4 h-4 flex-shrink-0" />
//                               <span className="text-sm font-medium">
//                                 {model.name}
//                               </span>
//                             </div>
//                             <span
//                               className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(model.status)}`}
//                             >
//                               {model.status === 'production'
//                                 ? 'Prod'
//                                 : model.status}
//                             </span>
//                           </button>
//                         )
//                       })}
//                     </div>
//                   )}
//                 </div>

//                 <div className="border-t border-gray-200 mb-4" />
//               </>
//             )}

//             {/* Liens publics */}
//             {!isDashboard && (
//               <div className="mb-4">
//                 <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
//                   Explorer
//                 </p>
//                 {['Models', 'Tarifs', 'Blog', 'Documentation'].map(
//                   (item, i) => (
//                     <Link
//                       key={i}
//                       href={`/${item.toLowerCase()}`}
//                       className="block px-4 py-3 text-sm font-bold text-gray-700 hover:text-blue-600 rounded-xl hover:bg-blue-50 transition-all"
//                       onClick={() => setMobileMenuOpen(false)}
//                     >
//                       {item}
//                     </Link>
//                   ),
//                 )}
//               </div>
//             )}

//             {/* Auth mobile */}
//             {session ? (
//               <div className="pt-4 border-t border-gray-200 space-y-2">
//                 <div className="flex items-center space-x-3 px-3 py-3 bg-gray-50 rounded-xl mb-3">
//                   <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
//                     {session.user?.image ? (
//                       <img
//                         src={session.user.image}
//                         alt=""
//                         className="w-10 h-10 rounded-full"
//                       />
//                     ) : (
//                       <User className="w-5 h-5 text-white" />
//                     )}
//                   </div>
//                   <div>
//                     <p className="text-sm font-bold text-gray-900">
//                       {session.user?.name}
//                     </p>
//                     <p className="text-xs text-gray-500 truncate">
//                       {session.user?.email}
//                     </p>
//                   </div>
//                 </div>
//                 <button
//                   onClick={() => {
//                     handleLogout()
//                     setMobileMenuOpen(false)
//                   }}
//                   className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all"
//                 >
//                   <LogOut className="w-4 h-4" />
//                   <span>Déconnexion</span>
//                 </button>
//               </div>
//             ) : (
//               <div className="pt-4 border-t border-gray-200 space-y-2">
//                 <Link
//                   href="/login"
//                   onClick={() => setMobileMenuOpen(false)}
//                   className="flex items-center justify-center space-x-2 px-4 py-3 text-sm font-bold text-gray-700 border-2 border-gray-200 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all"
//                 >
//                   <LogIn className="w-4 h-4" />
//                   <span>Connexion</span>
//                 </Link>
//                 <Link
//                   href="/signup"
//                   onClick={() => setMobileMenuOpen(false)}
//                   className="relative block overflow-hidden"
//                 >
//                   <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl"></div>
//                   <div className="relative flex items-center justify-center space-x-2 px-4 py-3 text-sm font-bold text-white">
//                     <User className="w-4 h-4" />
//                     <span>Inscription gratuite</span>
//                   </div>
//                 </Link>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </nav>
//   )
// }

'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import {
  Search,
  User,
  LogIn,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Home,
  Key,
  BarChart3,
  BookOpen,
  Languages,
  Brain,
  ChevronRight,
  Mic,
  Flame,
  Star,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function HorizontalNavbar({
  onMenuClick,
  showMenu = true,
  activeSection,
  setActiveSection,
  isSidebarOpen,
}) {
  const { data: session, status } = useSession()
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [modelsExpanded, setModelsExpanded] = useState(false)
  const [models, setModels] = useState([])
  const [gamif, setGamif] = useState(null) // ✅ NOUVEAU

  const pathname = usePathname()
  const isDashboard = pathname?.startsWith('/dashboard')

  useEffect(() => {
    if (isDashboard) {
      fetch('/api/models?status=production&public=true')
        .then((r) => r.json())
        .then((data) => setModels(data.models || []))
        .catch(() =>
          setModels([
            { id: 1, slug: 'press-ai', name: 'Press-AI', status: 'production' },
            { id: 2, slug: 'wazir', name: 'Wazir', status: 'production' },
          ]),
        )
    }
  }, [isDashboard])

  // ✅ Charger la gamification si connecté
  useEffect(() => {
    if (session?.user?.id) {
      fetch('/api/gamification')
        .then((r) => r.json())
        .then((data) => {
          if (data?.level) setGamif(data)
        })
        .catch(() => {})
    }
  }, [session])

  const menuItems = [
    { id: 'home', label: 'Accueil', icon: Home },
    { id: 'api-keys', label: 'Clés API', icon: Key },
    { id: 'articles', label: 'Articles & Traduction', icon: Languages },
    { id: 'voice', label: 'Enregistrement vocal', icon: Mic },
    { id: 'usage', label: 'Utilisation', icon: BarChart3 },
    { id: 'docs', label: 'Documentation', icon: BookOpen },
  ]

  const getStatusColor = (s) => {
    switch (s) {
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

  const handleSearch = (e) => {
    e.preventDefault()
  }
  const handleLogout = async () => {
    try {
      await signOut({ redirect: true, callbackUrl: '/' })
    } catch (e) {
      console.error(e)
    }
  }
  const handleSectionClick = (id) => {
    setActiveSection?.(id)
    setMobileMenuOpen(false)
  }

  return (
    <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link
            href="/"
            className={`flex items-center space-x-3 ${isSidebarOpen ? 'lg:hidden' : 'lg:flex'}`}
          >
            <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
              <Image
                src="/logo3.svg"
                alt="Komor-IA Logo"
                width={64}
                height={64}
                priority
              />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Komor-IA</h2>
              <p className="text-xs text-gray-500">AI Platform</p>
            </div>
          </Link>

          {/* Search — Desktop */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="w-full group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-0 group-focus-within:opacity-20 transition-opacity duration-300" />
                <div className="relative flex items-center">
                  <Search className="absolute left-4 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    placeholder="Rechercher..."
                    className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-2xl font-medium focus:outline-none transition-all duration-300 ${
                      isSearchFocused
                        ? 'bg-white border-blue-500 shadow-lg shadow-blue-500/10'
                        : 'bg-gray-50/50 border-gray-200 hover:border-gray-300'
                    }`}
                  />
                </div>
              </div>
            </form>
          </div>

          {/* Nav + Auth — Desktop */}
          <div className="hidden lg:flex items-center space-x-2">
            {['Models', 'Blog', 'Docs'].map((item, i) => (
              <Link
                key={i}
                href={`/${item.toLowerCase()}`}
                className="px-4 py-2.5 text-sm font-bold text-gray-700 hover:text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-300"
              >
                {item}
              </Link>
            ))}

            <div className="flex items-center space-x-2 ml-4 pl-4 border-l-2 border-gray-200">
              {status === 'loading' ? (
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
              ) : session ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-xl hover:bg-blue-50 transition-all duration-300 group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                      {session.user?.image ? (
                        <img
                          src={session.user.image}
                          alt={session.user.name || 'User'}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <User className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className="hidden xl:block text-left">
                      <p className="text-sm font-bold text-gray-900">
                        {session.user?.name || 'Utilisateur'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {session.user?.email}
                      </p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </button>

                  {userMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setUserMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-20">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-bold text-gray-900">
                            {session.user?.name || 'Utilisateur'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {session.user?.email}
                          </p>
                        </div>
                        <Link
                          href="/dashboard"
                          className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Dashboard
                        </Link>
                        <div className="border-t border-gray-100 mt-2 pt-2">
                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Déconnexion</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="flex items-center space-x-2 px-4 py-2.5 text-sm font-bold text-gray-700 hover:text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-300"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Connexion</span>
                  </Link>
                  <Link
                    href="/signup"
                    className="relative group overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl" />
                    <div className="relative flex items-center space-x-2 px-5 py-2.5 text-sm font-bold text-white">
                      <User className="w-4 h-4" />
                      <span>Inscription</span>
                    </div>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Burger — Mobile */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2.5 rounded-xl hover:bg-blue-50 transition-all duration-300"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* ══════════════════════════════════════
            MOBILE MENU
        ══════════════════════════════════════ */}
        {mobileMenuOpen && (
          <div className="lg:hidden pb-6 border-t border-gray-200 max-h-[calc(100vh-5rem)] overflow-y-auto">
            {/* Search mobile */}
            <form onSubmit={handleSearch} className="my-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher..."
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 bg-gray-50 font-medium transition-all"
                />
              </div>
            </form>

            {/* Navigation dashboard */}
            {setActiveSection && (
              <>
                <div className="mb-2">
                  <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Navigation
                  </p>
                  <div className="space-y-1">
                    {menuItems.map((item) => {
                      const Icon = item.icon
                      const isActive = activeSection === item.id
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSectionClick(item.id)}
                          className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                            isActive
                              ? 'bg-gray-900 text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <Icon className="w-5 h-5 flex-shrink-0" />
                          <span className="text-sm font-medium">
                            {item.label}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Modèles IA */}
                <div className="mb-4">
                  <button
                    onClick={() => setModelsExpanded(!modelsExpanded)}
                    className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700"
                  >
                    <span>Modèles IA</span>
                    {modelsExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                  {modelsExpanded && (
                    <div className="mt-1 space-y-1">
                      {models.map((model) => {
                        const modelId = `model-${model.slug}`
                        const isActive = activeSection === modelId
                        return (
                          <button
                            key={model.id}
                            onClick={() => handleSectionClick(modelId)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 ${
                              isActive
                                ? 'bg-gray-100 text-gray-900'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <Brain className="w-4 h-4 flex-shrink-0" />
                              <span className="text-sm font-medium">
                                {model.name}
                              </span>
                            </div>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(model.status)}`}
                            >
                              {model.status === 'production'
                                ? 'Prod'
                                : model.status}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
                <div className="border-t border-gray-200 mb-4" />
              </>
            )}

            {/* Liens publics */}
            {!isDashboard && (
              <div className="mb-4">
                <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Explorer
                </p>
                {['Models', 'Tarifs', 'Blog', 'Documentation'].map(
                  (item, i) => (
                    <Link
                      key={i}
                      href={`/${item.toLowerCase()}`}
                      className="block px-4 py-3 text-sm font-bold text-gray-700 hover:text-blue-600 rounded-xl hover:bg-blue-50 transition-all"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item}
                    </Link>
                  ),
                )}
              </div>
            )}

            {/* Auth mobile */}
            {session ? (
              <div className="pt-4 border-t border-gray-200 space-y-3">
                {/* Infos utilisateur */}
                <div className="flex items-center space-x-3 px-3 py-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                    {session.user?.image ? (
                      <img
                        src={session.user.image}
                        alt=""
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <User className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900">
                      {session.user?.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {session.user?.email}
                    </p>
                  </div>
                </div>

                {/* ✅ Widget gamification mobile */}
                {gamif?.level && (
                  <button
                    onClick={() => handleSectionClick('profil')}
                    className="w-full text-left px-4 py-3 bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {gamif.level.level}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900">
                            {gamif.level.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {gamif.totalPoints} pts
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {gamif.streak > 0 && (
                          <div className="flex items-center space-x-0.5 bg-red-50 px-2 py-0.5 rounded-full">
                            <Flame className="w-3 h-3 text-red-500" />
                            <span className="text-xs font-bold text-red-600">
                              {gamif.streak}j
                            </span>
                          </div>
                        )}
                        <Star className="w-3 h-3 text-yellow-500" />
                      </div>
                    </div>
                    {/* Barre de progression */}
                    {gamif.level.next && (
                      <div>
                        <div className="w-full bg-yellow-100 rounded-full h-1.5">
                          <div
                            className="bg-gradient-to-r from-yellow-400 to-orange-500 h-1.5 rounded-full"
                            style={{ width: `${gamif.level.progressToNext}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {gamif.level.next.min - gamif.totalPoints} pts →{' '}
                          {gamif.level.next.name}
                        </p>
                      </div>
                    )}
                  </button>
                )}

                <button
                  onClick={() => {
                    handleLogout()
                    setMobileMenuOpen(false)
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Déconnexion</span>
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t border-gray-200 space-y-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center space-x-2 px-4 py-3 text-sm font-bold text-gray-700 border-2 border-gray-200 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Connexion</span>
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="relative block overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl" />
                  <div className="relative flex items-center justify-center space-x-2 px-4 py-3 text-sm font-bold text-white">
                    <User className="w-4 h-4" />
                    <span>Inscription gratuite</span>
                  </div>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
