'use client'

import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import {
  Languages,
  FileText,
  LayoutDashboard,
  LogOut,
  Shield,
  User,
} from 'lucide-react'

export default function LinguisteLayout({ children }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (
      session &&
      session.user?.role !== 'linguiste' &&
      session.user?.role !== 'admin'
    ) {
      router.push('/dashboard')
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (
    !session ||
    (session.user?.role !== 'linguiste' && session.user?.role !== 'admin')
  ) {
    return null
  }

  const menuItems = [
    {
      href: '/linguiste',
      label: "Vue d'ensemble",
      icon: LayoutDashboard,
    },
    {
      href: '/linguiste/articles',
      label: 'Articles',
      icon: FileText,
    },
    {
      href: '/linguiste/translations',
      label: 'Traductions',
      icon: Languages,
    },
  ]

  const isActive = (href) =>
    href === '/linguiste' ? pathname === href : pathname.startsWith(href)

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-indigo-900 text-white flex flex-col fixed h-full z-10">
        {/* Logo */}
        <div className="p-6 border-b border-indigo-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Languages className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-white">Espace Linguiste</h2>
              <p className="text-xs text-indigo-300">Komor-IA</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-indigo-600 text-white'
                    : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}

          {/* Lien admin si role admin */}
          {session.user?.role === 'admin' && (
            <div className="pt-4 border-t border-indigo-800">
              <Link
                href="/dashboard/admin"
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-indigo-200 hover:bg-indigo-800 hover:text-white transition-colors"
              >
                <Shield className="w-5 h-5" />
                <span className="font-medium">Panel Admin</span>
              </Link>
            </div>
          )}
        </nav>

        {/* User info + Logout */}
        <div className="p-4 border-t border-indigo-800">
          <div className="flex items-center space-x-3 mb-3 px-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
              {session.user?.image ? (
                <img
                  src={session.user.image}
                  alt=""
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <User className="w-4 h-4 text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {session.user?.name}
              </p>
              <p className="text-xs text-indigo-300 truncate">
                {session.user?.role}
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full flex items-center space-x-2 px-4 py-2 text-indigo-200 hover:bg-indigo-800 hover:text-white rounded-lg transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Contenu principal */}
      <main className="ml-64 flex-1 p-8 min-h-screen">{children}</main>
    </div>
  )
}
