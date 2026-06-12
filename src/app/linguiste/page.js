'use client'

import { useState, useEffect } from 'react'
import {
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Star,
  TrendingUp,
} from 'lucide-react'

export default function LinguisteDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/linguiste/stats')
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const cards = [
    {
      label: 'En attente de validation',
      value: stats?.pending ?? 0,
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-700',
      border: 'border-yellow-200',
    },
    {
      label: 'Validées ce mois',
      value: stats?.verifiedThisMonth ?? 0,
      icon: CheckCircle,
      color: 'bg-green-100 text-green-700',
      border: 'border-green-200',
    },
    {
      label: 'Rejetées ce mois',
      value: stats?.rejectedThisMonth ?? 0,
      icon: XCircle,
      color: 'bg-red-100 text-red-700',
      border: 'border-red-200',
    },
    {
      label: 'Total articles',
      value: stats?.totalArticles ?? 0,
      icon: FileText,
      color: 'bg-indigo-100 text-indigo-700',
      border: 'border-indigo-200',
    },
    {
      label: 'Traductions complètes',
      value: stats?.completed ?? 0,
      icon: TrendingUp,
      color: 'bg-blue-100 text-blue-700',
      border: 'border-blue-200',
    },
    {
      label: 'Qualité moyenne',
      value: stats?.avgQuality ? `${stats.avgQuality}/5` : 'N/A',
      icon: Star,
      color: 'bg-purple-100 text-purple-700',
      border: 'border-purple-200',
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Tableau de bord linguiste
        </h1>
        <p className="text-gray-600 mt-2">
          Gérez et validez les traductions de la plateforme
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, i) => {
          const Icon = card.icon
          return (
            <div
              key={i}
              className={`bg-white rounded-xl border ${card.border} p-6 shadow-sm`}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${card.color}`}
                >
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">{card.label}</p>
              <p className="text-3xl font-bold text-gray-900">{card.value}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
