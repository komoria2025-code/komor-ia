'use client'

import { useState, useEffect } from 'react'
import {
  Plus, Edit, Trash2, Search, Database,
  Eye, EyeOff, Globe, CheckCircle, Clock,
  AlertCircle, X, Copy, Check,
} from 'lucide-react'

const LICENSE_OPTIONS = [
  { value: 'cc0',      label: 'CC0 — Domaine public' },
  { value: 'cc_by',    label: 'CC-BY 4.0' },
  { value: 'cc_by_sa', label: 'CC-BY-SA 4.0' },
  { value: 'cc_by_nc', label: 'CC-BY-NC 4.0' },
  { value: 'mit',      label: 'MIT License' },
  { value: 'apache2',  label: 'Apache 2.0' },
  { value: 'custom',   label: 'Licence personnalisée' },
]

const DOWNLOAD_TYPES = [
  { value: 'external', label: 'Lien externe (HuggingFace, Kaggle, Drive...)' },
  { value: 'direct',   label: 'Téléchargement direct (fichier hébergé)' },
  { value: 'both',     label: 'Les deux' },
]

const STATUS_CONFIG = {
  draft:     { label: 'Brouillon',  color: 'bg-gray-100 text-gray-700',    icon: AlertCircle },
  published: { label: 'Publié',     color: 'bg-green-100 text-green-700',  icon: CheckCircle },
  archived:  { label: 'Archivé',    color: 'bg-yellow-100 text-yellow-700', icon: EyeOff },
}

const EMPTY_FORM = {
  title:        '',
  excerpt:      '',
  description:  '',
  tags:         '',
  language:     'shi',
  domain:       'speech',
  license:      'cc_by',
  status:       'draft',
  numExamples:  0,
  sizeInMb:     0,
  downloadType: 'external',
  downloadUrl:  '',
  format:       '',
  version:      '1.0.0',
  previewData:  '',
  bibtex:       '',
}

export default function AdminDatasetsPage() {
  const [datasets,       setDatasets]       = useState([])
  const [loading,        setLoading]        = useState(true)
  const [searchQuery,    setSearchQuery]    = useState('')
  const [filterStatus,   setFilterStatus]   = useState('all')
  const [showModal,      setShowModal]      = useState(false)
  const [selectedDataset,setSelectedDataset]= useState(null)
  const [saving,         setSaving]         = useState(false)
  const [error,          setError]          = useState('')
  const [previewError,   setPreviewError]   = useState('')
  const [formData,       setFormData]       = useState(EMPTY_FORM)

  useEffect(() => { fetchDatasets() }, [filterStatus])

  const fetchDatasets = async () => {
    try {
      const params = new URLSearchParams()
      if (filterStatus !== 'all') params.append('status', filterStatus)
      const res  = await fetch(`/api/admin/datasets?${params}`)
      const data = await res.json()
      if (res.ok) setDatasets(data.datasets || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setSelectedDataset(null)
    setFormData(EMPTY_FORM)
    setError('')
    setPreviewError('')
    setShowModal(true)
  }

  const openEdit = (dataset) => {
    setSelectedDataset(dataset)
    const tags = Array.isArray(dataset.tags)
      ? dataset.tags.join(', ')
      : (dataset.tags ? JSON.parse(dataset.tags).join(', ') : '')
    const preview = dataset.previewData
      ? JSON.stringify(
          Array.isArray(dataset.previewData) ? dataset.previewData : JSON.parse(dataset.previewData),
          null, 2
        )
      : ''
    setFormData({
      title:        dataset.title        || '',
      excerpt:      dataset.excerpt      || '',
      description:  dataset.description || '',
      tags,
      language:     dataset.language    || 'shi',
      domain:       dataset.domain      || 'speech',
      license:      dataset.license     || 'cc_by',
      status:       dataset.status      || 'draft',
      numExamples:  dataset.numExamples || 0,
      sizeInMb:     dataset.sizeInMb    || 0,
      downloadType: dataset.downloadType|| 'external',
      downloadUrl:  dataset.downloadUrl || '',
      format:       dataset.format      || '',
      version:      dataset.version     || '1.0.0',
      previewData:  preview,
      bibtex:       dataset.bibtex      || '',
    })
    setError('')
    setPreviewError('')
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setPreviewError('')

    // Valider le JSON preview
    let parsedPreview = null
    if (formData.previewData.trim()) {
      try {
        parsedPreview = JSON.parse(formData.previewData)
        if (!Array.isArray(parsedPreview)) throw new Error()
      } catch {
        setPreviewError('Le JSON de préview doit être un tableau : [{"col": "val"}, ...]')
        setSaving(false)
        return
      }
    }

    try {
      const url    = selectedDataset
        ? `/api/admin/datasets/${selectedDataset.id}`
        : '/api/admin/datasets'
      const method = selectedDataset ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags:        formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
          previewData: parsedPreview,
          numExamples: parseInt(formData.numExamples) || 0,
          sizeInMb:    parseFloat(formData.sizeInMb)  || 0,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        setShowModal(false)
        fetchDatasets()
      } else {
        setError(data.message || 'Erreur lors de la sauvegarde')
      }
    } catch (e) {
      setError('Erreur réseau')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce dataset ?')) return
    try {
      const res = await fetch(`/api/admin/datasets/${id}`, { method: 'DELETE' })
      if (res.ok) setDatasets(datasets.filter(d => d.id !== id))
    } catch (e) { console.error(e) }
  }

  const handleToggleStatus = async (dataset) => {
    const newStatus = dataset.status === 'published' ? 'draft' : 'published'
    try {
      const res = await fetch(`/api/admin/datasets/${dataset.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) fetchDatasets()
    } catch (e) { console.error(e) }
  }

  const field = (key, value) => setFormData(prev => ({ ...prev, [key]: value }))

  const filtered = datasets.filter(d =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatSize = (mb) => {
    if (!mb) return '—'
    if (mb >= 1000) return `${(mb / 1000).toFixed(1)} GB`
    if (mb < 1)     return `${Math.round(mb * 1000)} KB`
    return `${mb.toFixed(1)} MB`
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des datasets</h1>
          <p className="text-gray-500 mt-1">{filtered.length} dataset(s)</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center space-x-2 px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium text-sm">
          <Plus className="w-4 h-4" />
          <span>Nouveau dataset</span>
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Rechercher..."
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">Tous les statuts</option>
            <option value="draft">Brouillons</option>
            <option value="published">Publiés</option>
            <option value="archived">Archivés</option>
          </select>
        </div>
      </div>

      {/* Tableau */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Dataset', 'Domaine', 'Statut', 'Exemples', 'Taille', 'Téléch.', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(dataset => {
                const sc      = STATUS_CONFIG[dataset.status] || STATUS_CONFIG.draft
                const Icon    = sc.icon
                return (
                  <tr key={dataset.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Database className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 line-clamp-1">{dataset.title}</p>
                          <p className="text-xs text-gray-400">v{dataset.version} · {dataset.license}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                      {dataset.domain || '—'}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${sc.color}`}>
                        <Icon className="w-3 h-3" />
                        <span>{sc.label}</span>
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Intl.NumberFormat('fr-FR').format(dataset.numExamples)}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatSize(dataset.sizeInMb)}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Intl.NumberFormat('fr-FR').format(dataset.numDownloads)}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <button onClick={() => handleToggleStatus(dataset)}
                          className={`p-2 rounded-lg transition-colors ${
                            dataset.status === 'published'
                              ? 'text-green-600 hover:bg-green-50'
                              : 'text-gray-400 hover:bg-gray-100'
                          }`}
                          title={dataset.status === 'published' ? 'Dépublier' : 'Publier'}>
                          {dataset.status === 'published' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button onClick={() => openEdit(dataset)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(dataset.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Database className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>Aucun dataset trouvé</p>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════
          MODAL CRÉATION / ÉDITION
      ══════════════════════════════════════ */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-3xl my-8 shadow-2xl flex flex-col max-h-[90vh]">

            {/* Header modal */}
            <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">
                {selectedDataset ? 'Modifier le dataset' : 'Nouveau dataset'}
              </h2>
              <button onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenu scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Titre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Titre *</label>
                  <input type="text" required value={formData.title}
                    onChange={e => field('title', e.target.value)}
                    placeholder="Ex: Shikomori Voice Corpus v1"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Extrait */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Extrait court</label>
                  <input type="text" value={formData.excerpt}
                    onChange={e => field('excerpt', e.target.value)}
                    placeholder="Résumé affiché dans la liste (1-2 phrases)"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Description complète *</label>
                  <textarea required value={formData.description}
                    onChange={e => field('description', e.target.value)}
                    rows={5} placeholder="Description détaillée du dataset, méthodologie, contenu..."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                {/* Tags + Language */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Tags (séparés par virgule)</label>
                    <input type="text" value={formData.tags}
                      onChange={e => field('tags', e.target.value)}
                      placeholder="shikomori, audio, nlp"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Langue</label>
                    <input type="text" value={formData.language}
                      onChange={e => field('language', e.target.value)}
                      placeholder="shi, zdj, nzw..."
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Domaine + Licence + Statut */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Domaine</label>
                    <select value={formData.domain} onChange={e => field('domain', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="speech">Audio / Parole</option>
                      <option value="translation">Traduction</option>
                      <option value="nlp">NLP / Texte</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Licence</label>
                    <select value={formData.license} onChange={e => field('license', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      {LICENSE_OPTIONS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Statut</label>
                    <select value={formData.status} onChange={e => field('status', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="draft">Brouillon</option>
                      <option value="published">Publié</option>
                      <option value="archived">Archivé</option>
                    </select>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre d'exemples</label>
                    <input type="number" min="0" value={formData.numExamples}
                      onChange={e => field('numExamples', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Taille (MB)</label>
                    <input type="number" min="0" step="0.1" value={formData.sizeInMb}
                      onChange={e => field('sizeInMb', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Version</label>
                    <input type="text" value={formData.version}
                      onChange={e => field('version', e.target.value)}
                      placeholder="1.0.0"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Format + Type téléchargement */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Format</label>
                    <input type="text" value={formData.format}
                      onChange={e => field('format', e.target.value)}
                      placeholder="CSV, JSON, WAV+JSON..."
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Type de téléchargement</label>
                    <select value={formData.downloadType} onChange={e => field('downloadType', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      {DOWNLOAD_TYPES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                    </select>
                  </div>
                </div>

                {/* URL téléchargement */}
                {(formData.downloadType === 'external' || formData.downloadType === 'both') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      URL externe (HuggingFace, Kaggle, Drive...)
                    </label>
                    <input type="url" value={formData.downloadUrl}
                      onChange={e => field('downloadUrl', e.target.value)}
                      placeholder="https://huggingface.co/datasets/..."
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                {/* Preview JSON */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Données de préview (JSON — tableau d'objets)
                  </label>
                  <textarea value={formData.previewData}
                    onChange={e => field('previewData', e.target.value)}
                    rows={6}
                    placeholder={`[\n  {"id": "001", "texte": "Hujambo", "dialecte": "zdj", "duree": "2.3s"},\n  {"id": "002", "texte": "Karibu", "dialecte": "nzw", "duree": "1.8s"}\n]`}
                    className={`w-full px-4 py-2.5 border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                      previewError ? 'border-red-400' : 'border-gray-300'
                    }`}
                  />
                  {previewError && <p className="text-xs text-red-600 mt-1">{previewError}</p>}
                  <p className="text-xs text-gray-400 mt-1">
                    Les colonnes seront détectées automatiquement à partir des clés du premier objet.
                  </p>
                </div>

                {/* BibTeX */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Citation BibTeX</label>
                  <textarea value={formData.bibtex}
                    onChange={e => field('bibtex', e.target.value)}
                    rows={5}
                    placeholder={`@dataset{komoria2026voice,\n  title={Shikomori Voice Corpus v1},\n  author={Komor-IA},\n  year={2026},\n  url={https://komor-ia.com/datasets/...}\n}`}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {error}
                  </div>
                )}

                {/* Boutons */}
                <div className="flex space-x-3 pt-2 border-t border-gray-100">
                  <button type="submit" disabled={saving}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium text-sm disabled:opacity-50">
                    {saving ? 'Sauvegarde...' : selectedDataset ? 'Mettre à jour' : 'Créer le dataset'}
                  </button>
                  <button type="button" onClick={() => setShowModal(false)}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium text-sm">
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}