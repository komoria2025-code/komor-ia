'use client'

import { useState, useEffect } from 'react'
import {
  Key,
  Search,
  Trash2,
  Ban,
  Activity,
  TrendingUp,
  User,
  Calendar,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Download,
} from 'lucide-react'

export default function ApiKeysManagement() {
  const [apiKeys, setApiKeys] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    revoked: 0,
    totalRequests: 0,
  })

  useEffect(() => {
    fetchApiKeys()
    fetchStats()
  }, [filterStatus])

  const fetchApiKeys = async () => {
    try {
      const params = new URLSearchParams()
      if (filterStatus !== 'all') params.append('status', filterStatus)

      const response = await fetch(`/api/admin/api-keys?${params}`)
      if (response.ok) {
        const data = await response.json()
        setApiKeys(data.apiKeys || [])
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/api-keys/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleRevoke = async (keyId) => {
    if (!confirm('Êtes-vous sûr de vouloir révoquer cette clé API ?')) return

    try {
      const response = await fetch(`/api/admin/api-keys/${keyId}/revoke`, {
        method: 'POST',
      })

      if (response.ok) {
        alert('Clé API révoquée avec succès')
        fetchApiKeys()
        fetchStats()
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la révocation')
    }
  }

  const handleDelete = async (keyId) => {
    if (
      !confirm('Êtes-vous sûr de vouloir supprimer définitivement cette clé ?')
    )
      return

    try {
      const response = await fetch(`/api/admin/api-keys/${keyId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setApiKeys(apiKeys.filter((k) => k.id !== keyId))
        alert('Clé API supprimée avec succès')
        fetchStats()
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const filteredKeys = apiKeys.filter(
    (key) =>
      key.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      key.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      key.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const exportToCSV = () => {
    const csvContent = [
      [
        'ID',
        'Nom',
        'Utilisateur',
        'Modèle',
        'Statut',
        'Requêtes',
        'Créée le',
      ].join(','),
      ...filteredKeys.map((key) =>
        [
          key.id,
          key.name,
          key.user?.email || '',
          key.modele?.name || '',
          key.isActive ? 'Active' : 'Révoquée',
          key._count?.usageLogs || 0,
          new Date(key.createdAt).toLocaleDateString(),
        ].join(','),
      ),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `api-keys-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Surveillance des clés API
            </h1>
            <p className="text-gray-600 mt-2">
              {filteredKeys.length} clé(s) API
            </p>
          </div>
          <button
            onClick={exportToCSV}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center space-x-2"
          >
            <Download className="w-5 h-5" />
            <span>Exporter CSV</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <Key className="w-8 h-8 text-blue-600" />
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm text-gray-600">Total clés</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-sm text-gray-600">Clés actives</p>
            <p className="text-2xl font-bold text-green-900">{stats.active}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <Ban className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-sm text-gray-600">Clés révoquées</p>
            <p className="text-2xl font-bold text-red-900">{stats.revoked}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-sm text-gray-600">Requêtes totales</p>
            <p className="text-2xl font-bold text-purple-900">
              {stats.totalRequests.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom, utilisateur..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actives</option>
            <option value="revoked">Révoquées</option>
          </select>
        </div>
      </div>

      {/* Tableau */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Nom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Modèle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Requêtes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Rate Limit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Créée
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredKeys.map((apiKey) => (
                  <tr key={apiKey.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Key className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {apiKey.name}
                          </div>
                          <div className="text-xs text-gray-500 font-mono">
                            {apiKey.key.substring(0, 20)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm text-gray-900">
                            {apiKey.user?.name || 'Sans nom'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {apiKey.user?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {apiKey.modele?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {!apiKey.isActive ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          <Ban className="w-3 h-3" />
                          <span>Révoquée</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <CheckCircle className="w-3 h-3" />
                          <span>Active</span>
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Activity className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {apiKey._count?.usageLogs || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {apiKey.rateLimit} / jour
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(apiKey.createdAt).toLocaleDateString(
                            'fr-FR',
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {apiKey.isActive && (
                          <button
                            onClick={() => handleRevoke(apiKey.id)}
                            className="text-orange-600 hover:text-orange-900 p-2 hover:bg-orange-50 rounded-lg"
                            title="Révoquer"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(apiKey.id)}
                          className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
