// src/app/datasets/[slug]/page.js
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import PublicNavbar from '../../components/public-navbar'
import Footer from '../../components/footer'
import {
  Download, ExternalLink, Database,
  ArrowLeft, Copy, Check,
  Lock, AlertCircle, ChevronRight, User,
} from 'lucide-react'

const LICENSE_LABELS = {
  cc0:     { label: 'CC0',      color: 'bg-green-100 text-green-700',   url: 'https://creativecommons.org/publicdomain/zero/1.0/' },
  cc_by:   { label: 'CC-BY 4.0', color: 'bg-blue-100 text-blue-700',   url: 'https://creativecommons.org/licenses/by/4.0/' },
  cc_by_sa:{ label: 'CC-BY-SA', color: 'bg-indigo-100 text-indigo-700', url: 'https://creativecommons.org/licenses/by-sa/4.0/' },
  cc_by_nc:{ label: 'CC-BY-NC', color: 'bg-yellow-100 text-yellow-700', url: 'https://creativecommons.org/licenses/by-nc/4.0/' },
  mit:     { label: 'MIT',      color: 'bg-purple-100 text-purple-700', url: 'https://opensource.org/licenses/MIT' },
  apache2: { label: 'Apache 2', color: 'bg-orange-100 text-orange-700', url: 'https://www.apache.org/licenses/LICENSE-2.0' },
  custom:  { label: 'Custom',   color: 'bg-gray-100 text-gray-700',     url: null },
}

export default function DatasetDetailPage() {
  const params  = useParams()
  const router  = useRouter()
  const { data: session } = useSession()

  const [dataset,     setDataset]     = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [copied,      setCopied]      = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [dlError,     setDlError]     = useState('')

  useEffect(() => {
    if (params?.slug) fetchDataset()
  }, [params?.slug])

  const fetchDataset = async () => {
    try {
      const res  = await fetch(`/api/datasets/${params.slug}`)
      const data = await res.json()
      if (res.ok) setDataset(data.dataset)
      else router.push('/datasets')
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!session) { router.push('/login'); return }
    setDownloading(true)
    setDlError('')
    try {
      const res  = await fetch(`/api/datasets/${params.slug}/download`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { setDlError(data.message); return }
      if (data.downloadType === 'direct'   && data.fileUrl)     window.open(data.fileUrl,     '_blank')
      if (data.downloadType === 'external' && data.downloadUrl) window.open(data.downloadUrl, '_blank')
      if (data.downloadType === 'both') {
        if (data.fileUrl)     window.open(data.fileUrl,     '_blank')
        if (data.downloadUrl) window.open(data.downloadUrl, '_blank')
      }
      setDataset(prev => ({ ...prev, numDownloads: prev.numDownloads + 1 }))
    } catch (e) {
      setDlError('Erreur lors du téléchargement')
    } finally {
      setDownloading(false)
    }
  }

  const handleCopyBibtex = async () => {
    if (!dataset?.bibtex) return
    try {
      await navigator.clipboard.writeText(dataset.bibtex)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {}
  }

  const formatSize   = (mb) => {
    if (!mb || mb === 0) return '—'
    if (mb >= 1000) return `${(mb / 1000).toFixed(1)} GB`
    if (mb < 1)     return `${Math.round(mb * 1000)} KB`
    return `${mb.toFixed(1)} MB`
  }
  const formatNumber = (n) => new Intl.NumberFormat('fr-FR').format(n)

  if (loading) return (
    <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-gray-900 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!dataset) return null

  const license     = LICENSE_LABELS[dataset.license] || LICENSE_LABELS.custom
  const tags        = Array.isArray(dataset.tags) ? dataset.tags : (dataset.tags ? JSON.parse(dataset.tags) : [])
  const preview     = dataset.previewData
    ? (Array.isArray(dataset.previewData) ? dataset.previewData : JSON.parse(dataset.previewData))
    : []
  const previewKeys = preview.length > 0 ? Object.keys(preview[0]) : []

  // ─── Bloc téléchargement (réutilisé mobile + desktop) ─────
  const DownloadBlock = () => (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <h3 className="font-semibold text-gray-900 mb-4">Télécharger</h3>

      {!session && (
        <div className="flex items-start space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
          <Lock className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700">
            Connexion requise.{' '}
            <Link href="/login" className="font-semibold underline">Se connecter</Link>
          </p>
        </div>
      )}

      {dlError && (
        <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-700">{dlError}</p>
        </div>
      )}

      <div className="space-y-2">
        {(dataset.downloadType === 'direct' || dataset.downloadType === 'both') && (
          <button onClick={handleDownload} disabled={downloading || !session}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-50 text-sm font-medium">
            {downloading
              ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <Download className="w-4 h-4" />
            }
            <span>{downloading ? 'Téléchargement...' : 'Télécharger'}</span>
          </button>
        )}
        {(dataset.downloadType === 'external' || dataset.downloadType === 'both') && dataset.downloadUrl && (
          <button onClick={handleDownload} disabled={downloading || !session}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm font-medium">
            <ExternalLink className="w-4 h-4" />
            <span>Voir sur {
              dataset.downloadUrl?.includes('huggingface') ? 'Hugging Face' :
              dataset.downloadUrl?.includes('kaggle')      ? 'Kaggle' :
              dataset.downloadUrl?.includes('drive')       ? 'Google Drive' :
              'Source externe'
            }</span>
          </button>
        )}
      </div>
    </div>
  )

  // ─── Bloc infos techniques ─────────────────────────────────
  const InfoBlock = () => (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <h3 className="font-semibold text-gray-900 mb-4">Informations</h3>
      <div className="space-y-0 text-sm divide-y divide-gray-50">
        {[
          { label: 'Format',    value: dataset.format   || '—' },
          { label: 'Version',   value: `v${dataset.version}` },
          { label: 'Langue',    value: dataset.language || '—' },
          { label: 'Domaine',   value: dataset.domain   || '—' },
          { label: 'Licence',   value: license.label },
          { label: 'Taille',    value: formatSize(dataset.sizeInMb) },
          { label: 'Exemples',  value: formatNumber(dataset.numExamples) },
        ].map((item, i) => (
          <div key={i} className="flex items-center justify-between py-2.5">
            <span className="text-gray-500">{item.label}</span>
            <span className="font-medium text-gray-900 text-right ml-4">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )

  // ─── Bloc contribuer ───────────────────────────────────────
  const ContribBlock = () => (
    <div className="bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl p-5 text-white">
      <h3 className="font-semibold mb-2">Contribuer</h3>
      <p className="text-sm text-gray-300 mb-4 leading-relaxed">
        Aidez-nous à enrichir ce dataset en traduisant des phrases ou en enregistrant votre voix.
      </p>
      <Link href="/?section=articles"
        className="block text-center px-4 py-2.5 bg-white text-gray-900 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors">
        Contribuer →
      </Link>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FAFAF9]">

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">

        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-400 mb-6 sm:mb-8">
          <Link href="/datasets" className="hover:text-gray-600 transition-colors flex items-center space-x-1">
            <ArrowLeft className="w-3 h-3" />
            <span>Datasets</span>
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-900 truncate text-xs sm:text-sm">{dataset.title}</span>
        </div>

        {/* Layout principal */}
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">

          {/* ── Colonne principale ────────────────── */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">

            {/* En-tête */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-8">
              {/* Tags + Licence */}
              <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{tag}</span>
                  ))}
                </div>
                <a href={license.url || '#'} target="_blank" rel="noopener noreferrer"
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${license.color}`}>
                  {license.label}
                </a>
              </div>

              {/* Titre */}
              <h1 className="text-xl sm:text-3xl font-semibold text-gray-900 mb-3 leading-tight">
                {dataset.title}
              </h1>

              {/* Méta */}
              <div className="flex items-center flex-wrap gap-2 text-xs sm:text-sm text-gray-500 mb-5">
                <div className="flex items-center space-x-1">
                  <User className="w-3.5 h-3.5" />
                  <span>{dataset.author?.name || 'Komor-IA'}</span>
                </div>
                <span>·</span>
                <span>v{dataset.version}</span>
                {dataset.publishedAt && (
                  <>
                    <span>·</span>
                    <span>{new Date(dataset.publishedAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</span>
                  </>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 p-3 sm:p-4 bg-gray-50 rounded-xl">
                {[
                  { label: 'Exemples',       value: formatNumber(dataset.numExamples) },
                  { label: 'Taille',         value: formatSize(dataset.sizeInMb) },
                  { label: 'Téléch.',        value: formatNumber(dataset.numDownloads) },
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <p className="text-base sm:text-lg font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ✅ Téléchargement — visible sur mobile uniquement ici */}
            <div className="lg:hidden">
              <DownloadBlock />
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-8">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Description</h2>
              <div className="text-sm sm:text-base text-gray-600 leading-relaxed whitespace-pre-wrap">
                {dataset.description}
              </div>
            </div>

            {/* Aperçu des données */}
            {preview.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-8">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
                  Aperçu des données
                  <span className="text-sm font-normal text-gray-400 ml-2">({preview.length} exemples)</span>
                </h2>
                {/* ✅ Tableau scrollable horizontalement sur mobile */}
                <div className="overflow-x-auto -mx-5 sm:mx-0">
                  <div className="min-w-max sm:min-w-0 px-5 sm:px-0">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100">
                          {previewKeys.map(key => (
                            <th key={key} className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                              {key.replace(/_/g, ' ')}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {preview.map((row, i) => (
                          <tr key={i} className="hover:bg-gray-50 transition-colors">
                            {previewKeys.map(key => (
                              <td key={key} className="py-2.5 px-3 text-gray-700 text-xs sm:text-sm">
                                {/* ✅ Pas de truncate — affichage complet */}
                                <span className="block max-w-[200px] sm:max-w-xs break-words">
                                  {String(row[key] ?? '—')}
                                </span>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ✅ Infos techniques — visible mobile uniquement ici */}
            <div className="lg:hidden">
              <InfoBlock />
            </div>

            {/* Citation BibTeX */}
            {dataset.bibtex && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">Citer ce dataset</h2>
                  <button onClick={handleCopyBibtex}
                    className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex-shrink-0">
                    {copied
                      ? <><Check className="w-3 h-3 text-green-600" /><span className="text-green-600">Copié !</span></>
                      : <><Copy className="w-3 h-3" /><span>Copier</span></>
                    }
                  </button>
                </div>
                <pre className="bg-gray-50 rounded-xl p-4 text-xs text-gray-600 overflow-x-auto font-mono leading-relaxed whitespace-pre-wrap break-words">
                  {dataset.bibtex}
                </pre>
              </div>
            )}

            {/* ✅ Contribuer — visible mobile uniquement ici */}
            <div className="lg:hidden">
              <ContribBlock />
            </div>
          </div>

          {/* ── Sidebar droite — desktop uniquement ─ */}
          <div className="hidden lg:flex lg:flex-col space-y-4">
            <DownloadBlock />
            <InfoBlock />
            <ContribBlock />
          </div>
        </div>
      </div>

    </div>
  )
}
// // src/app/datasets/[slug]/page.js
// 'use client'

// import { useState, useEffect } from 'react'
// import { useParams, useRouter } from 'next/navigation'
// import { useSession } from 'next-auth/react'
// import Link from 'next/link'
// import PublicNavbar from '../../components/public-navbar'
// import Footer from '../../components/footer'
// import {
//   Download, ExternalLink, Database, Globe,
//   FileText, Mic, ArrowLeft, Copy, Check,
//   Lock, AlertCircle, ChevronRight, User,
// } from 'lucide-react'

// const LICENSE_LABELS = {
//   cc0:     { label: 'CC0 — Domaine public',          color: 'bg-green-100 text-green-700',   url: 'https://creativecommons.org/publicdomain/zero/1.0/' },
//   cc_by:   { label: 'CC-BY 4.0',                     color: 'bg-blue-100 text-blue-700',     url: 'https://creativecommons.org/licenses/by/4.0/' },
//   cc_by_sa:{ label: 'CC-BY-SA 4.0',                  color: 'bg-indigo-100 text-indigo-700', url: 'https://creativecommons.org/licenses/by-sa/4.0/' },
//   cc_by_nc:{ label: 'CC-BY-NC 4.0',                  color: 'bg-yellow-100 text-yellow-700', url: 'https://creativecommons.org/licenses/by-nc/4.0/' },
//   mit:     { label: 'MIT License',                   color: 'bg-purple-100 text-purple-700', url: 'https://opensource.org/licenses/MIT' },
//   apache2: { label: 'Apache 2.0',                    color: 'bg-orange-100 text-orange-700', url: 'https://www.apache.org/licenses/LICENSE-2.0' },
//   custom:  { label: 'Licence personnalisée',         color: 'bg-gray-100 text-gray-700',     url: null },
// }

// export default function DatasetDetailPage() {
//   const params     = useParams()
//   const router     = useRouter()
//   const { data: session } = useSession()
//   const [dataset,    setDataset]    = useState(null)
//   const [loading,    setLoading]    = useState(true)
//   const [copying,    setCopying]    = useState(false)
//   const [copied,     setCopied]     = useState(false)
//   const [downloading,setDownloading]= useState(false)
//   const [dlError,    setDlError]    = useState('')

//   useEffect(() => {
//     if (params?.slug) fetchDataset()
//   }, [params?.slug])

//   const fetchDataset = async () => {
//     try {
//       const res  = await fetch(`/api/datasets/${params.slug}`)
//       const data = await res.json()
//       if (res.ok) setDataset(data.dataset)
//       else router.push('/datasets')
//     } catch (e) {
//       console.error(e)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleDownload = async () => {
//     if (!session) {
//       router.push('/login')
//       return
//     }
//     setDownloading(true)
//     setDlError('')
//     try {
//       const res  = await fetch(`/api/datasets/${params.slug}/download`, { method: 'POST' })
//       const data = await res.json()

//       if (!res.ok) { setDlError(data.message); return }

//       if (data.downloadType === 'direct' && data.fileUrl) {
//         window.open(data.fileUrl, '_blank')
//       } else if (data.downloadType === 'external' && data.downloadUrl) {
//         window.open(data.downloadUrl, '_blank')
//       } else if (data.downloadType === 'both') {
//         if (data.fileUrl)     window.open(data.fileUrl,     '_blank')
//         if (data.downloadUrl) window.open(data.downloadUrl, '_blank')
//       }

//       // Rafraîchir le compteur
//       setDataset(prev => ({ ...prev, numDownloads: prev.numDownloads + 1 }))
//     } catch (e) {
//       setDlError('Erreur lors du téléchargement')
//     } finally {
//       setDownloading(false)
//     }
//   }

//   const handleCopyBibtex = async () => {
//     if (!dataset?.bibtex) return
//     setCopying(true)
//     try {
//       await navigator.clipboard.writeText(dataset.bibtex)
//       setCopied(true)
//       setTimeout(() => setCopied(false), 2000)
//     } catch (e) {}
//     finally { setCopying(false) }
//   }

//   const formatSize    = (mb) => {
//     if (mb >= 1000) return `${(mb / 1000).toFixed(1)} GB`
//     if (mb < 1)     return `${Math.round(mb * 1000)} KB`
//     return `${mb.toFixed(1)} MB`
//   }
//   const formatNumber  = (n) => new Intl.NumberFormat('fr-FR').format(n)

//   if (loading) return (
//     <div className="min-h-screen bg-[#FAFAF9]">
//       <div className="flex justify-center py-32">
//         <div className="w-10 h-10 border-4 border-gray-900 border-t-transparent rounded-full animate-spin" />
//       </div>
//     </div>
//   )

//   if (!dataset) return null

//   const license    = LICENSE_LABELS[dataset.license] || LICENSE_LABELS.custom
//   const tags       = Array.isArray(dataset.tags) ? dataset.tags : (dataset.tags ? JSON.parse(dataset.tags) : [])
//   const preview    = dataset.previewData
//     ? (Array.isArray(dataset.previewData) ? dataset.previewData : JSON.parse(dataset.previewData))
//     : []
//   const previewKeys = preview.length > 0 ? Object.keys(preview[0]) : []

//   return (
//     <div className="min-h-screen bg-[#FAFAF9]">

//       <div className="max-w-5xl mx-auto px-6 sm:px-8 py-10">

//         {/* Breadcrumb */}
//         <div className="flex items-center space-x-2 text-sm text-gray-400 mb-8">
//           <Link href="/datasets" className="hover:text-gray-600 transition-colors flex items-center space-x-1">
//             <ArrowLeft className="w-3 h-3" />
//             <span>Datasets</span>
//           </Link>
//           <ChevronRight className="w-3 h-3" />
//           <span className="text-gray-900 truncate">{dataset.title}</span>
//         </div>

//         <div className="grid lg:grid-cols-3 gap-8">

//           {/* ── Colonne principale ─────────────────── */}
//           <div className="lg:col-span-2 space-y-6">

//             {/* En-tête */}
//             <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
//               <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
//                 <div className="flex flex-wrap gap-2">
//                   {tags.map((tag, i) => (
//                     <span key={i} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">{tag}</span>
//                   ))}
//                 </div>
//                 <a href={license.url || '#'} target="_blank" rel="noopener noreferrer"
//                   className={`text-xs font-semibold px-3 py-1 rounded-full ${license.color}`}>
//                   {license.label}
//                 </a>
//               </div>

//               <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-3">{dataset.title}</h1>

//               <div className="flex items-center space-x-3 text-sm text-gray-500 mb-6">
//                 <div className="flex items-center space-x-1">
//                   <User className="w-4 h-4" />
//                   <span>{dataset.author?.name || 'Komor-IA'}</span>
//                 </div>
//                 <span>·</span>
//                 <span>v{dataset.version}</span>
//                 {dataset.publishedAt && (
//                   <>
//                     <span>·</span>
//                     <span>{new Date(dataset.publishedAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</span>
//                   </>
//                 )}
//               </div>

//               {/* Stats en ligne */}
//               <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl">
//                 {[
//                   { label: 'Exemples',       value: formatNumber(dataset.numExamples) },
//                   { label: 'Taille',         value: formatSize(dataset.sizeInMb) },
//                   { label: 'Téléchargements',value: formatNumber(dataset.numDownloads) },
//                 ].map((stat, i) => (
//                   <div key={i} className="text-center">
//                     <p className="text-lg font-bold text-gray-900">{stat.value}</p>
//                     <p className="text-xs text-gray-500">{stat.label}</p>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Description */}
//             <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
//               <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
//               <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap">
//                 {dataset.description}
//               </div>
//             </div>

//             {/* Aperçu des données */}
//             {preview.length > 0 && (
//               <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
//                 <h2 className="text-lg font-semibold text-gray-900 mb-4">
//                   Aperçu des données
//                   <span className="text-sm font-normal text-gray-400 ml-2">({preview.length} exemples)</span>
//                 </h2>
//                 <div className="overflow-x-auto">
//                   <table className="min-w-full text-sm">
//                     <thead>
//                       <tr className="border-b border-gray-100">
//                         {previewKeys.map(key => (
//                           <th key={key} className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
//                             {key}
//                           </th>
//                         ))}
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-gray-50">
//                       {preview.map((row, i) => (
//                         <tr key={i} className="hover:bg-gray-50 transition-colors">
//                           {previewKeys.map(key => (
//                             <td key={key} className="py-2.5 px-3 text-gray-700 max-w-xs truncate">
//                               {String(row[key] ?? '—')}
//                             </td>
//                           ))}
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             )}

//             {/* Citation BibTeX */}
//             {dataset.bibtex && (
//               <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
//                 <div className="flex items-center justify-between mb-4">
//                   <h2 className="text-lg font-semibold text-gray-900">Citer ce dataset</h2>
//                   <button onClick={handleCopyBibtex}
//                     className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
//                     {copied
//                       ? <><Check className="w-3 h-3 text-green-600" /><span className="text-green-600">Copié !</span></>
//                       : <><Copy className="w-3 h-3" /><span>Copier</span></>
//                     }
//                   </button>
//                 </div>
//                 <pre className="bg-gray-50 rounded-xl p-4 text-xs text-gray-600 overflow-x-auto font-mono leading-relaxed whitespace-pre-wrap">
//                   {dataset.bibtex}
//                 </pre>
//               </div>
//             )}
//           </div>

//           {/* ── Sidebar droite ─────────────────────── */}
//           <div className="space-y-4">

//             {/* Téléchargement */}
//             <div className="bg-white rounded-2xl border border-gray-200 p-6">
//               <h3 className="font-semibold text-gray-900 mb-4">Télécharger</h3>

//               {!session && (
//                 <div className="flex items-start space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
//                   <Lock className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
//                   <p className="text-xs text-blue-700">
//                     Connexion requise pour télécharger.{' '}
//                     <Link href="/login" className="font-semibold underline">Se connecter</Link>
//                   </p>
//                 </div>
//               )}

//               {dlError && (
//                 <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
//                   <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
//                   <p className="text-xs text-red-700">{dlError}</p>
//                 </div>
//               )}

//               <div className="space-y-2">
//                 {/* Bouton téléchargement direct */}
//                 {(dataset.downloadType === 'direct' || dataset.downloadType === 'both') && (
//                   <button onClick={handleDownload} disabled={downloading || !session}
//                     className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-50 text-sm font-medium">
//                     {downloading
//                       ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                       : <Download className="w-4 h-4" />
//                     }
//                     <span>{downloading ? 'Téléchargement...' : 'Télécharger'}</span>
//                   </button>
//                 )}

//                 {/* Bouton lien externe */}
//                 {(dataset.downloadType === 'external' || dataset.downloadType === 'both') && dataset.downloadUrl && (
//                   <button onClick={handleDownload} disabled={downloading || !session}
//                     className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm font-medium">
//                     <ExternalLink className="w-4 h-4" />
//                     <span>Voir sur {
//                       dataset.downloadUrl?.includes('huggingface') ? 'Hugging Face' :
//                       dataset.downloadUrl?.includes('kaggle')      ? 'Kaggle' :
//                       dataset.downloadUrl?.includes('drive')       ? 'Google Drive' :
//                       'Source externe'
//                     }</span>
//                   </button>
//                 )}
//               </div>
//             </div>

//             {/* Infos techniques */}
//             <div className="bg-white rounded-2xl border border-gray-200 p-6">
//               <h3 className="font-semibold text-gray-900 mb-4">Informations</h3>
//               <div className="space-y-3 text-sm">
//                 {[
//                   { label: 'Format',    value: dataset.format  || '—' },
//                   { label: 'Version',   value: `v${dataset.version}` },
//                   { label: 'Langue',    value: dataset.language || '—' },
//                   { label: 'Domaine',   value: dataset.domain  || '—' },
//                   { label: 'Licence',   value: license.label },
//                   { label: 'Taille',    value: formatSize(dataset.sizeInMb) },
//                   { label: 'Exemples',  value: formatNumber(dataset.numExamples) },
//                 ].map((item, i) => (
//                   <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
//                     <span className="text-gray-500">{item.label}</span>
//                     <span className="font-medium text-gray-900 text-right">{item.value}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Contribuer */}
//             <div className="bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl p-6 text-white">
//               <h3 className="font-semibold mb-2">Contribuer</h3>
//               <p className="text-sm text-gray-300 mb-4 leading-relaxed">
//                 Aidez-nous à enrichir ce dataset en traduisant des phrases ou en enregistrant votre voix.
//               </p>
//               <Link href="/?section=articles"
//                 className="block text-center px-4 py-2.5 bg-white text-gray-900 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors">
//                 Contribuer →
//               </Link>
//             </div>
//           </div>
//         </div>
//       </div>

//     </div>
//   )
// }