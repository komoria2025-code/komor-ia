'use client'

import { useState, useEffect } from 'react'
import {
  TrendingUp,
  Users,
  Zap,
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  RefreshCw,
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts'

export default function AdminStatsPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30days')

  useEffect(() => {
    fetchStats()
  }, [period])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/stats?period=${period}`)
      const data = await response.json()

      if (response.ok) {
        setStats(data)
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-gray-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement des statistiques...</p>
        </div>
      </div>
    )
  }

  // Données par défaut si pas encore d'API
  const defaultStats = {
    overview: {
      totalUsers: 1247,
      totalRequests: 45623,
      totalRevenue: 3421.5,
      activeUsers: 892,
      changes: {
        users: 12.5,
        requests: 8.3,
        revenue: 15.2,
        activeUsers: 5.7,
      },
    },
    dailyUsage: [
      { date: '01 Mar', requests: 1234, users: 45, revenue: 123 },
      { date: '02 Mar', requests: 1456, users: 52, revenue: 145 },
      { date: '03 Mar', requests: 1678, users: 48, revenue: 167 },
      { date: '04 Mar', requests: 1543, users: 61, revenue: 154 },
      { date: '05 Mar', requests: 1789, users: 58, revenue: 178 },
      { date: '06 Mar', requests: 1654, users: 55, revenue: 165 },
      { date: '07 Mar', requests: 1876, users: 63, revenue: 187 },
    ],
    modelUsage: [
      { name: 'Press-AI', requests: 15234, percentage: 45 },
      { name: 'Wazir', requests: 10456, percentage: 31 },
      { name: 'Translate-AI', requests: 8123, percentage: 24 },
    ],
    topUsers: [
      {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        requests: 2341,
        spent: 234.5,
      },
      {
        id: 2,
        name: 'Jane Smith',
        email: 'jane@example.com',
        requests: 1987,
        spent: 198.7,
      },
      {
        id: 3,
        name: 'Bob Johnson',
        email: 'bob@example.com',
        requests: 1654,
        spent: 165.4,
      },
      {
        id: 4,
        name: 'Alice Brown',
        email: 'alice@example.com',
        requests: 1432,
        spent: 143.2,
      },
      {
        id: 5,
        name: 'Charlie Wilson',
        email: 'charlie@example.com',
        requests: 1289,
        spent: 128.9,
      },
    ],
    apiKeyStats: {
      total: 342,
      active: 287,
      expired: 55,
      revoked: 12,
    },
  }

  const data = stats || defaultStats

  const statCards = [
    {
      title: 'Utilisateurs totaux',
      value: data.overview.totalUsers.toLocaleString(),
      change: data.overview.changes.users,
      icon: Users,
      color: 'blue',
    },
    {
      title: 'Requêtes API',
      value: data.overview.totalRequests.toLocaleString(),
      change: data.overview.changes.requests,
      icon: Zap,
      color: 'green',
    },
    {
      title: 'Revenus',
      value: `€${data.overview.totalRevenue.toLocaleString()}`,
      change: data.overview.changes.revenue,
      icon: DollarSign,
      color: 'purple',
    },
    {
      title: 'Utilisateurs actifs',
      value: data.overview.activeUsers.toLocaleString(),
      change: data.overview.changes.activeUsers,
      icon: Activity,
      color: 'orange',
    },
  ]

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      orange: 'bg-orange-100 text-orange-600',
    }
    return colors[color] || colors.blue
  }

  const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Statistiques</h1>
          <p className="text-gray-600">Vue d'ensemble de la plateforme</p>
        </div>

        {/* Sélecteur de période */}
        <div className="flex items-center space-x-2 bg-white rounded-lg border border-gray-200 p-1">
          {[
            { value: '7days', label: '7 jours' },
            { value: '30days', label: '30 jours' },
            { value: '90days', label: '90 jours' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setPeriod(option.value)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                period === option.value
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon
          const isPositive = card.change >= 0
          const TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight

          return (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${getColorClasses(
                    card.color,
                  )}`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div
                  className={`flex items-center space-x-1 text-sm font-medium ${
                    isPositive ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  <TrendIcon className="w-4 h-4" />
                  <span>{Math.abs(card.change)}%</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {card.value}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Utilisation quotidienne */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Utilisation quotidienne
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.dailyUsage}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6b7280" />
              <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="requests"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.2}
                name="Requêtes"
              />
              <Area
                type="monotone"
                dataKey="users"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.2}
                name="Utilisateurs"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Utilisation par modèle */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Utilisation par modèle
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.modelUsage}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="requests"
              >
                {data.modelUsage.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Revenus quotidiens */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Revenus quotidiens
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.dailyUsage}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6b7280" />
              <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Bar
                dataKey="revenue"
                fill="#8B5CF6"
                radius={[8, 8, 0, 0]}
                name="Revenus (€)"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Stats Clés API */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            État des clés API
          </h3>
          <div className="space-y-4">
            {[
              {
                label: 'Total',
                value: data.apiKeyStats.total,
                color: 'bg-blue-500',
              },
              {
                label: 'Actives',
                value: data.apiKeyStats.active,
                color: 'bg-green-500',
              },
              {
                label: 'Expirées',
                value: data.apiKeyStats.expired,
                color: 'bg-yellow-500',
              },
              {
                label: 'Révoquées',
                value: data.apiKeyStats.revoked,
                color: 'bg-red-500',
              },
            ].map((stat, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {stat.label}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {stat.value}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`${stat.color} h-2 rounded-full transition-all duration-300`}
                    style={{
                      width: `${(stat.value / data.apiKeyStats.total) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Utilisateurs */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Top 5 Utilisateurs
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Requêtes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Dépensé
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.topUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {(user.name || user.email || '?').charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name || 'Sans nom'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(user.requests ?? 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    €{(user.spent ?? 0).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
