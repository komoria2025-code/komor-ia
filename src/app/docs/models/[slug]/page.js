// 'use client'

// import { use, useEffect, useState } from 'react'
// import Link from 'next/link'
// import ReactMarkdown from 'react-markdown'
// import remarkGfm from 'remark-gfm'
// import { ArrowLeft, BookOpen } from 'lucide-react'

// function normalizeMarkdown(content) {
//   const markdown = content.trim()
//   const wrapped = markdown.match(/^```(?:markdown|md|text)?\s*\n([\s\S]*?)\n```$/i)
//   return wrapped ? wrapped[1] : content
// }

// export default function ModelDocumentationPage({ params }) {
//   const { slug } = use(params)
//   const [model, setModel] = useState(null)
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     fetch(`/api/models/${slug}`)
//       .then((response) => response.json())
//       .then((data) => setModel(data.model || null))
//       .catch(() => setModel(null))
//       .finally(() => setLoading(false))
//   }, [slug])

//   if (loading) {
//     return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Chargement...</div>
//   }

//   if (!model) {
//     return (
//       <div className="min-h-screen bg-gray-50 text-center py-32">
//         <p className="text-gray-500 mb-4">Documentation introuvable.</p>
//         <Link href="/models" className="text-blue-600 hover:underline">Voir les modèles</Link>
//       </div>
//     )
//   }

//   return (
//     <main className="min-h-screen bg-gray-50 py-12">
//       <div className="max-w-4xl mx-auto px-6">
//         <Link href={`/models/${model.slug}`} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-8">
//           <ArrowLeft className="w-4 h-4" /> Retour à {model.name}
//         </Link>

//         <header className="bg-white border border-gray-200 rounded-2xl p-8 mb-6">
//           <div className="flex items-center gap-3 mb-3">
//             <BookOpen className="w-6 h-6 text-blue-600" />
//             <span className="text-sm text-gray-500">Documentation du modèle</span>
//           </div>
//           <h1 className="text-3xl font-bold text-gray-900">{model.name}</h1>
//           <p className="text-gray-500 mt-2">Version {model.version} · {model.domaine}</p>
//         </header>

//         <article className="bg-white border border-gray-200 rounded-2xl p-8 prose prose-gray max-w-none">
//           {model.documentationContent ? (
//             <ReactMarkdown remarkPlugins={[remarkGfm]}>
//               {normalizeMarkdown(model.documentationContent)}
//             </ReactMarkdown>
//           ) : (
//             <p className="text-gray-500">La documentation de ce modèle sera bientôt disponible.</p>
//           )}
//         </article>
//       </div>
//     </main>
//   )
// }

'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ArrowLeft, BookOpen } from 'lucide-react'

function normalizeMarkdown(content) {
  const markdown = content.trim()
  const wrapped = markdown.match(/^```(?:markdown|md|text)?\s*\n([\s\S]*?)\n```$/i)
  return wrapped ? wrapped[1] : content
}

export default function ModelDocumentationPage({ params }) {
  const { slug } = use(params)
  const [model, setModel] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/models/${slug}`)
      .then((response) => response.json())
      .then((data) => setModel(data.model || null))
      .catch(() => setModel(null))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Chargement...</div>
  }

  if (!model) {
    return (
      <div className="min-h-screen bg-gray-50 text-center py-32">
        <p className="text-gray-500 mb-4">Documentation introuvable.</p>
        <Link href="/models" className="text-blue-600 hover:underline">Voir les modèles</Link>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Link href={`/models/${model.slug}`} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-8">
          <ArrowLeft className="w-4 h-4" /> Retour à {model.name}
        </Link>

        <header className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <span className="text-sm text-gray-500">Documentation du modèle</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{model.name}</h1>
          <p className="text-gray-500 mt-2">Version {model.version} · {model.domaine}</p>
        </header>

        <article className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 prose prose-gray max-w-none">
          {model.documentationContent ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                table: ({ node, ...props }) => (
                  <div className="overflow-x-auto">
                    <table {...props} />
                  </div>
                ),
                pre: ({ node, ...props }) => (
                  <pre className="overflow-x-auto" {...props} />
                ),
              }}
            >
              {normalizeMarkdown(model.documentationContent)}
            </ReactMarkdown>
          ) : (
            <p className="text-gray-500">La documentation de ce modèle sera bientôt disponible.</p>
          )}
        </article>
      </div>
    </main>
  )
}