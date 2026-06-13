'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Eye, FileText, Globe, Search } from 'lucide-react'
import ImageUpload from '@/app/components/ImageUpload'

export default function AdminBlogs() {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingBlog, setEditingBlog] = useState(null)
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'actualites',
    status: 'draft',
    readTime: 5,
    coverImage: '',
  })

  const categories = [
    'actualites',
    'technologie',
    'produit',
    'tutoriel',
    'annonce',
    'autre',
  ]

  const statusConfig = {
    draft: { label: 'Brouillon', color: 'bg-gray-100 text-gray-700' },
    published: { label: 'Publié', color: 'bg-green-100 text-green-700' },
    archived: { label: 'Archivé', color: 'bg-orange-100 text-orange-700' },
  }

  useEffect(() => {
    fetchBlogs()
  }, [filterStatus])

  const fetchBlogs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterStatus !== 'all') params.append('status', filterStatus)
      const res = await fetch(`/api/admin/blogs?${params}`)
      const data = await res.json()
      setBlogs(data.blogs || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setEditingBlog(null)
    setForm({
      title: '',
      excerpt: '',
      content: '',
      category: 'actualites',
      status: 'draft',
      readTime: 5,
      coverImage: '',
    })
    setShowModal(true)
  }

  const openEdit = (blog) => {
    setEditingBlog(blog)
    setForm({
      title: blog.title,
      excerpt: blog.excerpt || '',
      content: blog.content,
      category: blog.category,
      status: blog.status,
      readTime: blog.readTime,
      coverImage: blog.coverImage || '',
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.title || !form.content) return alert('Titre et contenu requis')
    setSaving(true)
    try {
      const url = editingBlog
        ? `/api/admin/blogs/${editingBlog.id}`
        : '/api/admin/blogs'
      const method = editingBlog ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setShowModal(false)
        fetchBlogs()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce blog ?')) return
    try {
      await fetch(`/api/admin/blogs/${id}`, { method: 'DELETE' })
      setBlogs(blogs.filter((b) => b.id !== id))
    } catch (e) {
      console.error(e)
    }
  }

  const handlePublish = async (blog) => {
    try {
      await fetch(`/api/admin/blogs/${blog.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: blog.status === 'published' ? 'draft' : 'published',
        }),
      })
      fetchBlogs()
    } catch (e) {
      console.error(e)
    }
  }

  const filtered = blogs.filter((b) =>
    b.title.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion du Blog</h1>
          <p className="text-gray-600 mt-1">{filtered.length} article(s)</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          <span>Nouvel article</span>
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
        {['all', 'draft', 'published', 'archived'].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === s
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {s === 'all' ? 'Tous' : statusConfig[s]?.label}
          </button>
        ))}
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
                  'Titre',
                  'Catégorie',
                  'Statut',
                  'Date',
                  'Vues',
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
              {filtered.map((blog) => {
                const s = statusConfig[blog.status]
                return (
                  <tr key={blog.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        {blog.coverImage ? (
                          <img
                            src={blog.coverImage}
                            alt={blog.title}
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900 line-clamp-1">
                            {blog.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {blog.author?.name} • {blog.readTime} min
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700 capitalize">
                        {blog.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${s?.color}`}
                      >
                        {s?.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {blog.publishedAt
                        ? new Date(blog.publishedAt).toLocaleDateString('fr-FR')
                        : new Date(blog.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {blog.views}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handlePublish(blog)}
                          className={`p-2 rounded-lg transition-colors ${
                            blog.status === 'published'
                              ? 'text-orange-600 hover:bg-orange-50'
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={
                            blog.status === 'published'
                              ? 'Dépublier'
                              : 'Publier'
                          }
                        >
                          <Globe className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEdit(blog)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <a
                          href={`/blog/${blog.slug}`}
                          target="_blank"
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                          title="Voir"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleDelete(blog.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
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
            <div className="text-center py-12 text-gray-500">
              Aucun article trouvé
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          {/* ✅ max-h-[90vh] + flex flex-col pour limiter la hauteur */}
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header fixe */}
            <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-xl font-bold text-gray-900">
                {editingBlog ? "Modifier l'article" : 'Nouvel article'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
              >
                ✕
              </button>
            </div>

            {/* ✅ Contenu scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Image de couverture */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image de couverture
                </label>
                <ImageUpload
                  value={form.coverImage}
                  onChange={(url) => setForm({ ...form, coverImage: url })}
                />
              </div>

              {/* Titre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Titre de l'article"
                />
              </div>

              {/* Extrait */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Extrait
                </label>
                <textarea
                  value={form.excerpt}
                  onChange={(e) =>
                    setForm({ ...form, excerpt: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Courte description de l'article..."
                />
              </div>

              {/* Contenu Markdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contenu (Markdown) *
                </label>
                <textarea
                  value={form.content}
                  onChange={(e) =>
                    setForm({ ...form, content: e.target.value })
                  }
                  rows={16}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono text-sm"
                  placeholder="# Titre&#10;&#10;Votre contenu en **markdown**..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supporte le Markdown : **gras**, *italique*, # titres, listes,
                  code, etc.
                </p>
              </div>

              {/* Métadonnées */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catégorie
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Statut
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="draft">Brouillon</option>
                    <option value="published">Publié</option>
                    <option value="archived">Archivé</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Temps de lecture (min)
                  </label>
                  <input
                    type="number"
                    value={form.readTime}
                    onChange={(e) =>
                      setForm({ ...form, readTime: parseInt(e.target.value) })
                    }
                    min={1}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Footer fixe avec boutons */}
            <div className="flex-shrink-0 flex space-x-4 px-6 py-4 border-t border-gray-200 bg-white rounded-b-2xl">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Sauvegarde...' : editingBlog ? 'Modifier' : 'Créer'}
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
      )}
    </div>
  )
}
