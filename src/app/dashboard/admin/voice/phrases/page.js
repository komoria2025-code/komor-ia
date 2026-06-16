'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, Mic } from 'lucide-react'

const dialectes = ['shingazidja', 'shindzuani', 'shimwali', 'shimaore']

export default function AdminVoicePhrases() {
  const [phrases, setPhrases] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPhrase, setEditingPhrase] = useState(null)
  const [search, setSearch] = useState('')
  const [filterDialecte, setFilterDialecte] = useState('all')
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    text: '',
    dialecte: 'shingazidja',
    translation: '',
    difficulty: 1,
  })

  useEffect(() => {
    fetchPhrases()
  }, [filterDialecte])

  const fetchPhrases = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterDialecte !== 'all') params.append('dialecte', filterDialecte)
      const res = await fetch(`/api/admin/voice/phrases?${params}`)
      const data = await res.json()
      setPhrases(data.phrases || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setEditingPhrase(null)
    setForm({
      text: '',
      dialecte: 'shingazidja',
      translation: '',
      difficulty: 1,
    })
    setShowModal(true)
  }

  const openEdit = (p) => {
    setEditingPhrase(p)
    setForm({
      text: p.text,
      dialecte: p.dialecte,
      translation: p.translation || '',
      difficulty: p.difficulty,
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.text) return alert('Texte requis')
    setSaving(true)
    try {
      const url = editingPhrase
        ? `/api/admin/voice/phrases/${editingPhrase.id}`
        : '/api/admin/voice/phrases'
      const method = editingPhrase ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setShowModal(false)
        fetchPhrases()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette phrase ?')) return
    await fetch(`/api/admin/voice/phrases/${id}`, { method: 'DELETE' })
    setPhrases(phrases.filter((p) => p.id !== id))
  }

  const filtered = phrases.filter((p) =>
    p.text.toLowerCase().includes(search.toLowerCase()),
  )

  const statusColors = {
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-gray-100 text-gray-700',
    completed: 'bg-blue-100 text-blue-700',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Phrases vocales</h1>
          <p className="text-gray-600 mt-1">{filtered.length} phrase(s)</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          <span>Nouvelle phrase</span>
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterDialecte}
          onChange={(e) => setFilterDialecte(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tous les dialectes</option>
          {dialectes.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* Tableau */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  'Phrase',
                  'Dialecte',
                  'Difficulté',
                  'Enregistrements',
                  'Statut',
                  'Actions',
                ].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900 line-clamp-2 max-w-xs">
                      {p.text}
                    </p>
                    {p.translation && (
                      <p className="text-xs text-gray-500 mt-1 italic">
                        {p.translation}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-700 capitalize">
                      {p.dialecte}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-1">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full ${i <= p.difficulty ? 'bg-orange-400' : 'bg-gray-200'}`}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {p.recordingCount}/{p.maxRecordings}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[p.status]}`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openEdit(p)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Aucune phrase trouvée
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingPhrase ? 'Modifier la phrase' : 'Nouvelle phrase'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phrase en shikomori *
                </label>
                <textarea
                  value={form.text}
                  onChange={(e) => setForm({ ...form, text: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-serif text-lg"
                  placeholder="Écrivez la phrase ici..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Traduction française (optionnel)
                </label>
                <input
                  type="text"
                  value={form.translation}
                  onChange={(e) =>
                    setForm({ ...form, translation: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Traduction pour aider le contributeur..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dialecte
                  </label>
                  <select
                    value={form.dialecte}
                    onChange={(e) =>
                      setForm({ ...form, dialecte: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {dialectes.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulté
                  </label>
                  <select
                    value={form.difficulty}
                    onChange={(e) =>
                      setForm({ ...form, difficulty: parseInt(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={1}>1 — Facile</option>
                    <option value={2}>2 — Moyen</option>
                    <option value={3}>3 — Difficile</option>
                  </select>
                </div>
              </div>
              <div className="flex space-x-4 pt-4 border-t border-gray-200">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {saving
                    ? 'Sauvegarde...'
                    : editingPhrase
                      ? 'Modifier'
                      : 'Créer'}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
