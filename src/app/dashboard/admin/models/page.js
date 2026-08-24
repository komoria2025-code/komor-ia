'use client'

import { useState, useEffect } from 'react'
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Brain,
  Zap,
  Activity,
} from 'lucide-react'

export default function ModelsManagement() {
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedModel, setSelectedModel] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    domaine: '',
    status: 'development',
    version: '1.0.0',
    endpoint: '',
    usageInstructions: '',
    documentationContent: '',
    icon: 'Brain',
    color: 'blue',
    isPublic: true,
  })

  useEffect(() => {
    fetchModels()
  }, [])

  const fetchModels = async () => {
    try {
      const response = await fetch('/api/admin/models')
      if (response.ok) {
        const data = await response.json()
        setModels(data.models || [])
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const url = selectedModel
        ? `/api/admin/models/${selectedModel.id}`
        : '/api/admin/models'

      const response = await fetch(url, {
        method: selectedModel ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        alert(
          selectedModel
            ? 'Modèle mis à jour avec succès'
            : 'Modèle créé avec succès',
        )
        setShowModal(false)
        setSelectedModel(null)
        setFormData({
          name: '',
          slug: '',
          description: '',
          domaine: '',
          status: 'development',
          version: '1.0.0',
          endpoint: '',
          usageInstructions: '',
          documentationContent: '',
          icon: 'Brain',
          color: 'blue',
          isPublic: true,
        })
        fetchModels()
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la sauvegarde')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce modèle ?')) return

    try {
      const response = await fetch(`/api/admin/models/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setModels(models.filter((m) => m.id !== id))
        alert('Modèle supprimé avec succès')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const handleEdit = (model) => {
    setSelectedModel(model)
    setFormData({
      name: model.name,
      slug: model.slug,
      description: model.description,
      domaine: model.domaine,
      status: model.status,
      version: model.version,
      endpoint: model.endpoint || '',
      usageInstructions: model.usageInstructions || '',
      documentationContent: model.documentationContent || '',
      icon: model.icon || 'Brain',
      color: model.color || 'blue',
      isPublic: model.isPublic,
    })
    setShowModal(true)
  }

  const getStatusBadge = (status) => {
    const badges = {
      production: 'bg-green-100 text-green-700',
      beta: 'bg-blue-100 text-blue-700',
      development: 'bg-yellow-100 text-yellow-700',
      deprecated: 'bg-red-100 text-red-700',
    }
    return badges[status] || badges.development
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gestion des modèles IA
          </h1>
          <p className="text-gray-600 mt-2">{models.length} modèle(s)</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Créer un modèle</span>
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {models.map((model) => (
            <div
              key={model.id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Brain className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{model.name}</h3>
                    <p className="text-xs text-gray-500">v{model.version}</p>
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusBadge(
                    model.status,
                  )}`}
                >
                  {model.status}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {model.description}
              </p>

              {/* Info */}
              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <span>Domaine: {model.domaine}</span>
                {model.isPublic ? (
                  <div className="flex items-center space-x-1 text-green-600">
                    <Eye className="w-3 h-3" />
                    <span>Public</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 text-gray-600">
                    <EyeOff className="w-3 h-3" />
                    <span>Privé</span>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4 pt-4 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-500">Clés API</p>
                  <p className="text-lg font-bold text-gray-900">
                    {model._count?.apiKeys || 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Requêtes</p>
                  <p className="text-lg font-bold text-gray-900">
                    {model._count?.usageLogs || 0}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit(model)}
                  className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm flex items-center justify-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Modifier</span>
                </button>
                <button
                  onClick={() => handleDelete(model.id)}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {selectedModel ? 'Modifier le modèle' : 'Créer un modèle'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Domaine
                  </label>
                  <input
                    type="text"
                    value={formData.domaine}
                    onChange={(e) =>
                      setFormData({ ...formData, domaine: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Version
                  </label>
                  <input
                    type="text"
                    value={formData.version}
                    onChange={(e) =>
                      setFormData({ ...formData, version: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Statut
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="development">Développement</option>
                    <option value="beta">Beta</option>
                    <option value="production">Production</option>
                    <option value="deprecated">Déprécié</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Endpoint API
                  </label>
                  <input
                    type="text"
                    value={formData.endpoint}
                    onChange={(e) =>
                      setFormData({ ...formData, endpoint: e.target.value })
                    }
                    placeholder="/api/v1/..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instructions d'utilisation
                </label>
                <textarea
                  value={formData.usageInstructions}
                  onChange={(e) =>
                    setFormData({ ...formData, usageInstructions: e.target.value })
                  }
                  rows={6}
                  placeholder="Exemple de commande ou instructions pour utiliser ce modèle..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Documentation du modèle (Markdown)
                </label>
                <textarea
                  value={formData.documentationContent}
                  onChange={(e) =>
                    setFormData({ ...formData, documentationContent: e.target.value })
                  }
                  rows={12}
                  placeholder={'# Présentation\n\n## Paramètres\n\nDécrivez ici le fonctionnement du modèle...'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={formData.isPublic}
                  onChange={(e) =>
                    setFormData({ ...formData, isPublic: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="isPublic"
                  className="text-sm font-medium text-gray-700"
                >
                  Modèle public
                </label>
              </div>

              <div className="flex items-center space-x-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {selectedModel ? 'Mettre à jour' : 'Créer'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setSelectedModel(null)
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
