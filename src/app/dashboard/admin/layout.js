'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import {
  LayoutDashboard,
  Users,
  Brain,
  FileText,
  Languages,
  Key,
  Settings,
  Shield,
  Mic,
} from 'lucide-react'
import Link from 'next/link'

export default function AdminLayout({ children }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (session && session.user?.role !== 'admin') {
      router.push('/dashboard')
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!session || session.user?.role !== 'admin') {
    return null
  }

  const adminMenuItems = [
    {
      href: '/dashboard/admin',
      label: "Vue d'ensemble",
      icon: LayoutDashboard,
    },
    { href: '/dashboard/admin/users', label: 'Utilisateurs', icon: Users },
    { href: '/dashboard/admin/models', label: 'Modèles IA', icon: Brain },
    { href: '/dashboard/admin/articles', label: 'Articles', icon: FileText },
    { href: '/dashboard/admin/stats', label: 'Statistiques', icon: FileText },
    {
      href: '/dashboard/admin/voice/phrases',
      label: 'Phrases vocales',
      icon: Mic,
    }, // ← NOUVEAU
    {
      href: '/dashboard/admin/voice/recordings',
      label: 'Enregistrements',
      icon: Mic,
    }, // ← NOUVEAU

    {
      href: '/dashboard/admin/translations',
      label: 'Traductions',
      icon: Languages,
    },
    { href: '/dashboard/admin/api-keys', label: 'Clés API', icon: Key },
    { href: '/dashboard/admin/blogs', label: 'Blogs', icon: Key },
    { href: '/dashboard/admin/settings', label: 'Paramètres', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Admin */}
      <div className="bg-red-600 text-white py-3 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="w-5 h-5" />
            <span className="font-bold">Mode Administrateur</span>
          </div>
          <Link href="/dashboard" className="text-sm hover:underline">
            ← Retour au Dashboard
          </Link>
        </div>
      </div>

      {/* Admin Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-1 overflow-x-auto">
            {adminMenuItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center space-x-2 px-4 py-4 text-sm font-medium text-gray-600 hover:text-blue-600 hover:border-b-2 hover:border-blue-600 transition-colors whitespace-nowrap"
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">{children}</div>
    </div>
  )
}
