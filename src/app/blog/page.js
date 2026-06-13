'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, Clock, ArrowRight, Search } from 'lucide-react'

export default function BlogPage() {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  const categories = [
    { value: 'all', label: 'Tous' },
    { value: 'actualites', label: 'Actualités' },
    { value: 'technologie', label: 'Technologie' },
    { value: 'produit', label: 'Produit' },
    { value: 'tutoriel', label: 'Tutoriel' },
    { value: 'annonce', label: 'Annonce' },
  ]

  useEffect(() => {
    fetch('/api/blogs?limit=20')
      .then((r) => r.json())
      .then((data) => setBlogs(data.blogs || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = blogs.filter((b) => {
    const matchCategory =
      activeCategory === 'all' || b.category === activeCategory
    const matchSearch =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.excerpt?.toLowerCase().includes(search.toLowerCase())
    return matchCategory && matchSearch
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-5xl font-bold mb-6">Blog Komor-IA</h1>
          <p className="text-xl text-blue-100 max-w-2xl mb-8">
            Actualités, guides et insights sur l'intelligence artificielle pour
            l'Afrique
          </p>
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un article..."
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-300"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-6 -mt-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center space-x-2 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Articles */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">
              Aucun article publié pour le moment.
            </p>
            <p className="text-gray-400 mt-2">Revenez bientôt ! 🚀</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((blog) => (
              <Link
                key={blog.id}
                href={`/blog/${blog.slug}`}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all group"
              >
                {/* Image */}
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center overflow-hidden">
                  {blog.coverImage ? (
                    <img
                      src={blog.coverImage}
                      alt={blog.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-5xl">📰</span>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="px-3 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded-full capitalize">
                      {blog.category}
                    </span>
                    <div className="flex items-center text-gray-500 text-sm">
                      <Clock className="w-4 h-4 mr-1" />
                      {blog.readTime} min
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {blog.title}
                  </h3>

                  {blog.excerpt && (
                    <p className="text-gray-600 mb-4 line-clamp-2 text-sm">
                      {blog.excerpt}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-500 text-sm">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(blog.publishedAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </div>
                    <ArrowRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
