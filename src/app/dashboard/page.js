'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
  Key,
  BarChart3,
  Zap,
  TrendingUp,
  ArrowRight,
  Clock,
  CheckCircle,
} from 'lucide-react'

export default function DashboardPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState({
    apiKeys: 0,
    totalRequests: 0,
    requestsToday: 0,
    totalCost: 0,
  })
  const [recentLogs, setRecentLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
    fetchRecentLogs()
  }, [])

  const fetchStats = async () => {
    try {
      const [keysRes, usageRes] = await Promise.all([
        fetch('/api/user/api-keys'),
        fetch('/api/user/usage?period=all'),
      ])

      const keysData = await keysRes.json()
      const usageData = await usageRes.json()

      setStats({
        apiKeys: keysData.apiKeys?.length || 0,
        totalRequests: usageData.stats?.totalRequests || 0,
        requestsToday: usageData.stats?.requestsToday || 0,
        totalCost: usageData.stats?.totalCost || 0,
      })
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRecentLogs = async () => {
    try {
      const response = await fetch('/api/user/usage/logs?page=1&limit=5')
      const data = await response.json()
      setRecentLogs(data.logs || [])
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const statCards = [
    {
      title: 'Clés API actives',
      value: stats.apiKeys,
      icon: Key,
      color: 'blue',
      link: '/dashboard/api-keys-page',
    },
    {
      title: 'Requêtes totales',
      value: stats.totalRequests.toLocaleString(),
      icon: BarChart3,
      color: 'green',
      link: '/dashboard/usage',
    },
    {
      title: "Aujourd'hui",
      value: stats.requestsToday,
      icon: Zap,
      color: 'purple',
      link: '/dashboard/usage',
    },
    {
      title: 'Coût total',
      value: `€${stats.totalCost.toFixed(2)}`,
      icon: TrendingUp,
      color: 'orange',
      link: '/dashboard/usage',
    },
  ]

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600',
      green: 'bg-green-50 text-green-600',
      purple: 'bg-purple-50 text-purple-600',
      orange: 'bg-orange-50 text-orange-600',
    }
    return colors[color] || colors.blue
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Bienvenue, {session?.user?.name || 'Utilisateur'} 👋
        </h1>
        <p className="text-gray-600">
          Voici un aperçu de votre activité sur Komor-IA
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => {
          const Icon = card.icon
          return (
            <Link
              key={index}
              href={card.link}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${getColorClasses(
                    card.color,
                  )}`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-sm text-gray-600 mb-1">{card.title}</p>
              <p className="text-2xl font-semibold text-gray-900">
                {card.value}
              </p>
            </Link>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <h3 className="text-xl font-semibold mb-2">Commencer rapidement</h3>
          <p className="text-blue-100 mb-4">
            Créez votre première clé API pour accéder à nos modèles
          </p>
          <Link
            href="/dashboard/api-keys-page"
            className="inline-flex items-center space-x-2 bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors font-medium"
          >
            <Key className="w-4 h-4" />
            <span>Créer une clé API</span>
          </Link>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <h3 className="text-xl font-semibold mb-2">Documentation</h3>
          <p className="text-purple-100 mb-4">
            Apprenez à intégrer nos modèles dans vos applications
          </p>
          <Link
            href="/docs"
            className="inline-flex items-center space-x-2 bg-white text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-50 transition-colors font-medium"
          >
            <span>Voir la doc</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Activité récente
          </h3>
          <Link
            href="/dashboard/usage"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Tout voir →
          </Link>
        </div>

        {recentLogs.length === 0 ? (
          <div className="p-12 text-center">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Aucune activité récente</p>
            <p className="text-sm text-gray-500">
              Créez une clé API et commencez à utiliser nos modèles
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {recentLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        log.statusCode >= 200 && log.statusCode < 300
                          ? 'bg-green-500'
                          : 'bg-red-500'
                      }`}
                    ></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {log.modele?.name || 'Modèle'} - {log.endpoint}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(log.createdAt).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {log.tokens} tokens
                    </p>
                    <p className="text-xs text-gray-500">
                      €{log.cost.toFixed(4)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
