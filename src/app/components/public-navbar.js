// 'use client'

// import { useState } from 'react'
// import { useSession, signOut } from 'next-auth/react'
// import Link from 'next/link'
// import Image from 'next/image'
// import { Menu, X, User, LogIn, LogOut, ChevronDown } from 'lucide-react'

// export default function PublicNavbar() {
//   const { data: session, status } = useSession()
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
//   const [userMenuOpen, setUserMenuOpen] = useState(false)

//   const handleLogout = async () => {
//     await signOut({ redirect: true, callbackUrl: '/' })
//   }

//   const navLinks = [
//     { href: '/models', label: 'Modèles' },
//     { href: '/tarifs', label: 'Tarifs' },
//     { href: '/docs', label: 'Documentation' },
//     { href: '/blog', label: 'Blog' },
//     { href: '/about', label: 'À propos' },
//   ]

//   return (
//     <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between items-center h-16">
//           {/* Logo */}
//           <Link href="/" className="flex items-center space-x-3 ">
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

//           {/* Desktop Navigation */}
//           <div className="hidden md:flex items-center space-x-1">
//             {navLinks.map((link) => (
//               <Link
//                 key={link.href}
//                 href={link.href}
//                 className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
//               >
//                 {link.label}
//               </Link>
//             ))}
//           </div>

//           {/* Auth Section */}
//           <div className="hidden md:flex items-center space-x-3">
//             {status === 'loading' ? (
//               <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
//             ) : session ? (
//               <div className="relative">
//                 <button
//                   onClick={() => setUserMenuOpen(!userMenuOpen)}
//                   className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
//                 >
//                   <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
//                     {session.user?.image ? (
//                       <img
//                         src={session.user.image}
//                         alt={session.user.name || 'User'}
//                         className="w-8 h-8 rounded-full"
//                       />
//                     ) : (
//                       <User className="w-4 h-4 text-white" />
//                     )}
//                   </div>
//                   <span className="text-sm font-medium text-gray-900">
//                     {session.user?.name}
//                   </span>
//                   <ChevronDown className="w-4 h-4 text-gray-500" />
//                 </button>

//                 {userMenuOpen && (
//                   <>
//                     <div
//                       className="fixed inset-0 z-10"
//                       onClick={() => setUserMenuOpen(false)}
//                     ></div>
//                     <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
//                       <div className="px-4 py-3 border-b border-gray-100">
//                         <p className="text-sm font-medium text-gray-900 truncate">
//                           {session.user?.email}
//                         </p>
//                       </div>
//                       <Link
//                         href="/dashboard"
//                         className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                         onClick={() => setUserMenuOpen(false)}
//                       >
//                         Dashboard
//                       </Link>
//                       <Link
//                         href="/dashboard/settings"
//                         className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                         onClick={() => setUserMenuOpen(false)}
//                       >
//                         Paramètres
//                       </Link>
//                       <div className="border-t border-gray-100 mt-1 pt-1">
//                         <button
//                           onClick={handleLogout}
//                           className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
//                         >
//                           <LogOut className="w-4 h-4" />
//                           <span>Déconnexion</span>
//                         </button>
//                       </div>
//                     </div>
//                   </>
//                 )}
//               </div>
//             ) : (
//               <>
//                 <Link
//                   href="/login"
//                   className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
//                 >
//                   <LogIn className="w-4 h-4" />
//                   <span>Connexion</span>
//                 </Link>
//                 <Link
//                   href="/signup"
//                   className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
//                 >
//                   Inscription
//                 </Link>
//               </>
//             )}
//           </div>

//           {/* Mobile Menu Button */}
//           <button
//             onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//             className="md:hidden p-2 rounded-lg hover:bg-gray-100"
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
//           <div className="md:hidden py-4 border-t border-gray-200">
//             {navLinks.map((link) => (
//               <Link
//                 key={link.href}
//                 href={link.href}
//                 className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg"
//                 onClick={() => setMobileMenuOpen(false)}
//               >
//                 {link.label}
//               </Link>
//             ))}

//             <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
//               {session ? (
//                 <>
//                   <div className="px-4 py-2 bg-gray-50 rounded-lg">
//                     <p className="text-sm font-medium text-gray-900">
//                       {session.user?.name}
//                     </p>
//                     <p className="text-xs text-gray-500 truncate">
//                       {session.user?.email}
//                     </p>
//                   </div>
//                   <Link
//                     href="/dashboard"
//                     className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
//                     onClick={() => setMobileMenuOpen(false)}
//                   >
//                     Dashboard
//                   </Link>
//                   <button
//                     onClick={() => {
//                       handleLogout()
//                       setMobileMenuOpen(false)
//                     }}
//                     className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
//                   >
//                     Déconnexion
//                   </button>
//                 </>
//               ) : (
//                 <>
//                   <Link
//                     href="/login"
//                     className="block px-4 py-2 text-center border-2 border-gray-200 rounded-lg hover:bg-gray-50"
//                     onClick={() => setMobileMenuOpen(false)}
//                   >
//                     Connexion
//                   </Link>
//                   <Link
//                     href="/signup"
//                     className="block px-4 py-2 text-center bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//                     onClick={() => setMobileMenuOpen(false)}
//                   >
//                     Inscription
//                   </Link>
//                 </>
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     </nav>
//   )
// }

'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Menu,
  X,
  User,
  LogIn,
  LogOut,
  ChevronDown,
  Languages,
  Mic,
} from 'lucide-react'

export default function PublicNavbar() {
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [contribuerOpen, setContribuerOpen] = useState(false)

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/' })
  }

  const navLinks = [
    { href: '/models', label: 'Modèles' },
    { href: '/tarifs', label: 'Tarifs' },
    { href: '/docs', label: 'Documentation' },
    { href: '/blog', label: 'Blog' },
    { href: '/about', label: 'À propos' },
  ]

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
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

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Section — Desktop */}
          <div className="hidden md:flex items-center space-x-3">
            {status === 'loading' ? (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
            ) : session ? (
              <div className="flex items-center space-x-2">
                {/* ✅ Dropdown Contribuer — séparé du menu user */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setContribuerOpen(!contribuerOpen)
                      setUserMenuOpen(false)
                    }}
                    className="flex items-center space-x-1 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <span>Contribuer</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${contribuerOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {contribuerOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setContribuerOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-20">
                        <Link
                          href="/?section=articles"
                          onClick={() => setContribuerOpen(false)}
                          className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Languages className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">Articles & Traduction</p>
                            <p className="text-xs text-gray-400">
                              Traduire en shikomori
                            </p>
                          </div>
                        </Link>
                        <Link
                          href="/?section=voice"
                          onClick={() => setContribuerOpen(false)}
                          className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Mic className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">Enregistrement vocal</p>
                            <p className="text-xs text-gray-400">
                              Contribuer au corpus audio
                            </p>
                          </div>
                        </Link>
                      </div>
                    </>
                  )}
                </div>

                {/* Menu utilisateur */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setUserMenuOpen(!userMenuOpen)
                      setContribuerOpen(false)
                    }}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center overflow-hidden">
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
                    <span className="text-sm font-medium text-gray-900">
                      {session.user?.name}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </button>

                  {userMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setUserMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">
                            {session.user?.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {session.user?.email}
                          </p>
                        </div>
                        <Link
                          href="/"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Dashboard
                        </Link>
                        <Link
                          href="/dashboard/settings"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Paramètres
                        </Link>
                        <div className="border-t border-gray-100 mt-1 pt-1">
                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Déconnexion</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Connexion</span>
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Inscription
                </Link>
              </>
            )}
          </div>

          {/* Burger — Mobile */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 space-y-1">
            {/* Liens publics */}
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {/* ✅ Section Contribuer — si connecté */}
            {session && (
              <div className="border-t border-gray-100 pt-3 mt-2">
                <p className="px-4 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Contribuer
                </p>
                <Link
                  href="/?section=articles"
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Languages className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Articles & Traduction</p>
                    <p className="text-xs text-gray-400">
                      Traduire en shikomori
                    </p>
                  </div>
                </Link>
                <Link
                  href="/?section=voice"
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mic className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Enregistrement vocal</p>
                    <p className="text-xs text-gray-400">
                      Contribuer au corpus audio
                    </p>
                  </div>
                </Link>
              </div>
            )}

            {/* Auth mobile */}
            <div className="border-t border-gray-200 pt-4 mt-2 space-y-2">
              {session ? (
                <>
                  <div className="flex items-center space-x-3 px-4 py-3 bg-gray-50 rounded-lg">
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                      {session.user?.image ? (
                        <img
                          src={session.user.image}
                          alt=""
                          className="w-9 h-9 rounded-full"
                        />
                      ) : (
                        <User className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {session.user?.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {session.user?.email}
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout()
                      setMobileMenuOpen(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Déconnexion</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block px-4 py-3 text-center text-sm border-2 border-gray-200 rounded-lg hover:bg-gray-50 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/signup"
                    className="block px-4 py-3 text-center text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Inscription
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
