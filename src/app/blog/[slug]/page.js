'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Link from 'next/link'
import {
  Calendar,
  Clock,
  User,
  ArrowLeft,
  Eye,
  Tag,
  Copy,
  Check,
  ArrowRight,
} from 'lucide-react'

export default function BlogPost() {
  const { slug } = useParams()
  const router = useRouter()
  const [blog, setBlog] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch(`/api/blogs/${slug}`)
      .then((r) => {
        if (!r.ok) router.push('/blog')
        return r.json()
      })
      .then((data) => {
        setBlog(data.blog)
        // Charger les articles similaires
        if (data.blog?.category) {
          fetch(`/api/blogs?limit=3&category=${data.blog.category}`)
            .then((r) => r.json())
            .then((d) =>
              setRelated((d.blogs || []).filter((b) => b.slug !== slug)),
            )
        }
      })
      .catch(() => router.push('/blog'))
      .finally(() => setLoading(false))
  }, [slug])

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!blog) return null

  return (
    <div className="min-h-screen bg-white">
      {/* Hero — image pleine largeur avec overlay sombre */}
      <div className="relative h-72 md:h-96 bg-gray-900 overflow-hidden">
        {blog.coverImage ? (
          <img
            src={blog.coverImage}
            alt={blog.title}
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-gray-900" />
        )}
        <div className="absolute inset-0 flex flex-col justify-end px-6 pb-10 max-w-4xl mx-auto w-full">
          <span className="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-semibold uppercase tracking-wider rounded mb-4 w-fit">
            {blog.category}
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
            {blog.title}
          </h1>
        </div>
      </div>

      {/* Barre méta */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>
                {new Date(blog.publishedAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>{blog.author?.name || 'Komor-IA'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>{blog.readTime} min de lecture</span>
            </div>
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4" />
              <span>{blog.views} vues</span>
            </div>
          </div>
          <Link
            href="/blog"
            className="flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour aux actualités</span>
          </Link>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Extrait mis en valeur */}
        {blog.excerpt && (
          <p className="text-xl text-gray-500 italic border-l-4 border-blue-500 pl-6 mb-10 leading-relaxed">
            {blog.excerpt}
          </p>
        )}

        <hr className="border-gray-200 mb-10" />

        {/* Article Markdown */}
        <article className="prose-custom">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => (
                <h1 className="text-3xl font-bold text-gray-900 mb-6 mt-10 first:mt-0">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-10">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-8">
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="text-gray-700 leading-relaxed mb-5 text-base">
                  {children}
                </p>
              ),
              strong: ({ children }) => (
                <strong className="font-bold text-gray-900">{children}</strong>
              ),
              em: ({ children }) => (
                <em className="italic text-gray-600">{children}</em>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-outside mb-5 space-y-2 text-gray-700 ml-6">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-outside mb-5 space-y-2 text-gray-700 ml-6">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="text-gray-700 leading-relaxed">{children}</li>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-blue-400 pl-6 py-1 my-8 italic text-gray-600">
                  {children}
                </blockquote>
              ),
              code: ({ inline, children }) =>
                inline ? (
                  <code className="bg-gray-100 text-blue-700 px-1.5 py-0.5 rounded text-sm font-mono">
                    {children}
                  </code>
                ) : (
                  <pre className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto mb-6 text-sm">
                    <code className="font-mono">{children}</code>
                  </pre>
                ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  className="text-blue-600 hover:text-blue-800 underline underline-offset-2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {children}
                </a>
              ),
              img: ({ src, alt }) => (
                <figure className="my-8">
                  <img
                    src={src}
                    alt={alt}
                    className="w-full rounded-lg shadow-sm"
                  />
                  {alt && (
                    <figcaption className="text-center text-sm text-gray-500 mt-2">
                      {alt}
                    </figcaption>
                  )}
                </figure>
              ),
              hr: () => <hr className="my-10 border-gray-200" />,
              table: ({ children }) => (
                <div className="overflow-x-auto mb-6">
                  <table className="min-w-full border border-gray-200 text-sm">
                    {children}
                  </table>
                </div>
              ),
              th: ({ children }) => (
                <th className="px-4 py-3 bg-gray-50 text-left font-semibold text-gray-900 border-b border-gray-200">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="px-4 py-3 text-gray-700 border-b border-gray-100">
                  {children}
                </td>
              ),
            }}
          >
            {blog.content}
          </ReactMarkdown>
        </article>

        {/* Footer article */}
        <div className="mt-12 pt-6 border-t border-gray-200 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {blog.author?.name?.[0] || 'K'}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {blog.author?.name || 'Komor-IA'}
              </p>
              <p className="text-xs text-gray-500">Équipe Komor-IA</p>
            </div>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-green-600">Lien copié !</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Partager</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Articles similaires */}
      {related.length > 0 && (
        <div className="bg-gray-50 border-t border-gray-200 py-16">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Articles similaires
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.slice(0, 3).map((article) => (
                <Link
                  key={article.id}
                  href={`/blog/${article.slug}`}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-sm transition-all group"
                >
                  <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                    {article.category}
                  </span>
                  <h3 className="text-base font-semibold text-gray-900 mt-2 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {new Date(article.publishedAt).toLocaleDateString('fr-FR')}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
