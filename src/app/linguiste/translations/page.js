'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  CheckCircle,
  XCircle,
  Eye,
  Edit3,
  Save,
  User,
  Calendar,
  Clock,
  Star,
  FileText,
  X,
  AlertCircle,
} from 'lucide-react'

function TranslationsContent() {
  const searchParams = useSearchParams()
  const articleFilter = searchParams.get('article')

  const [translations, setTranslations] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('completed')
  const [selected, setSelected] = useState(null)
  const [mode, setMode] = useState(null) // 'view' | 'edit' | 'reject'
  const [editedText, setEditedText] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [quality, setQuality] = useState(5)
  const [saving, setSaving] = useState(false)

  const dialecteConfig = {
    shingazidja: { label: 'Shingazidja', color: 'bg-blue-100 text-blue-700' },
    shindzuani: { label: 'Shindzuani', color: 'bg-green-100 text-green-700' },
    shimwali: { label: 'Shimwali', color: 'bg-purple-100 text-purple-700' },
    shimaore: { label: 'Shimaore', color: 'bg-orange-100 text-orange-700' },
  }

  const statusConfig = {
    completed: { label: 'Terminée', color: 'bg-orange-100 text-orange-700' },
    verified: { label: 'Vérifiée', color: 'bg-green-100 text-green-700' },
    in_progress: { label: 'En cours', color: 'bg-blue-100 text-blue-700' },
    pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700' },
  }

  useEffect(() => {
    fetchTranslations()
  }, [filterStatus, articleFilter])

  const fetchTranslations = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterStatus !== 'all') params.append('status', filterStatus)
      if (articleFilter) params.append('articleId', articleFilter)

      const res = await fetch(`/api/linguiste/translations?${params}`)
      const data = await res.json()
      setTranslations(data.translations || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }
  const handleValidateDirect = async (translation) => {
    setSaving(true)
    try {
      const res = await fetch(
        `/api/linguiste/translations/${translation.id}/validate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quality: 5, correctedText: null }),
        },
      )
      if (res.ok) {
        fetchTranslations()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const openModal = (translation, modalMode) => {
    setSelected(translation)
    setMode(modalMode)
    setEditedText(translation.translatedText)
    setQuality(translation.quality || 5)
    setRejectReason('')
  }

  const closeModal = () => {
    setSelected(null)
    setMode(null)
    setEditedText('')
    setRejectReason('')
  }

  const handleValidate = async (correctedText = null) => {
    setSaving(true)
    try {
      const res = await fetch(
        `/api/linguiste/translations/${selected.id}/validate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quality, correctedText }),
        },
      )
      if (res.ok) {
        closeModal()
        fetchTranslations()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) return alert('Veuillez indiquer une raison')
    setSaving(true)
    try {
      const res = await fetch(
        `/api/linguiste/translations/${selected.id}/reject`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: rejectReason }),
        },
      )
      if (res.ok) {
        closeModal()
        fetchTranslations()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    return `${h}h ${m}m`
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Validation des traductions
        </h1>
        <p className="text-gray-600 mt-2">
          {translations.length} traduction(s) — vous pouvez valider, corriger ou
          rejeter
        </p>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-wrap gap-3">
        {[
          { value: 'completed', label: '⏳ À valider' },
          { value: 'verified', label: '✅ Vérifiées' },
          { value: 'in_progress', label: '🔄 En cours' },
          { value: 'all', label: '📋 Toutes' },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilterStatus(opt.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === opt.value
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Liste */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : translations.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">
            Aucune traduction à afficher
          </h3>
        </div>
      ) : (
        <div className="space-y-4">
          {translations.map((t) => {
            const s = statusConfig[t.status] || statusConfig.in_progress
            return (
              <div
                key={t.id}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                {/* Top */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center flex-wrap gap-2 mb-2">
                      <FileText className="w-5 h-5 text-indigo-400" />
                      <h3 className="font-semibold text-gray-900">
                        {t.article.title}
                      </h3>
                      {/* Badge statut */}
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.color}`}
                      >
                        {s.label}
                      </span>
                      {/* ✅ Badge dialecte */}
                      {t.dialecte && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            dialecteConfig[t.dialecte]?.color ||
                            'bg-gray-100 text-gray-700'
                          }`}
                        >
                          🗣️ {dialecteConfig[t.dialecte]?.label || t.dialecte}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{t.user.name || t.user.email}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(t.updatedAt).toLocaleDateString('fr-FR')}
                        </span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(t.timeSpent)}</span>
                      </span>
                      <span className="font-medium text-indigo-600">
                        {t.progress}%
                      </span>
                    </div>
                  </div>
                  {t.quality && (
                    <div className="flex items-center space-x-1 text-yellow-500">
                      <Star className="w-5 h-5 fill-current" />
                      <span className="font-bold">{t.quality}/5</span>
                    </div>
                  )}
                </div>

                {/* Extrait */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-700 line-clamp-2 font-serif">
                    {t.translatedText}
                  </p>
                </div>

                {/* Notes */}
                {t.notes && (
                  <div className="flex items-start space-x-2 mb-4 text-sm text-gray-600">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-orange-400" />
                    <p>{t.notes}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => openModal(t, 'view')}
                    className="flex items-center space-x-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Voir</span>
                  </button>

                  {t.status === 'completed' && (
                    <>
                      <button
                        onClick={() => openModal(t, 'edit')}
                        className="flex items-center space-x-1 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>Corriger & Valider</span>
                      </button>
                      {/* <button
                        onClick={() => {
                          setSelected(t)
                          handleValidate()
                        }}
                        className="flex items-center space-x-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Valider</span>
                      </button> */}
                      <button
                        onClick={() => {
                          setSelected(t)
                          // Attendre que selected soit mis à jour via une fonction directe
                          handleValidateDirect(t)
                        }}
                        className="flex items-center space-x-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Valider</span>
                      </button>
                      <button
                        onClick={() => openModal(t, 'reject')}
                        className="flex items-center space-x-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Rejeter</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ===== MODAL ===== */}
      {selected && mode && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-5xl my-8 overflow-hidden shadow-2xl">
            {/* Header modal */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {mode === 'view' && 'Lecture de la traduction'}
                  {mode === 'edit' && 'Corriger & Valider'}
                  {mode === 'reject' && 'Rejeter la traduction'}
                </h2>
                <p className="text-sm text-gray-500">
                  {selected.article.title}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              {/* ✅ Infos traducteur + dialecte */}
              <div className="flex items-center space-x-4 mb-6 p-4 bg-indigo-50 rounded-xl">
                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {selected.user.name || selected.user.email}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selected.progress}% • {formatTime(selected.timeSpent)}{' '}
                    passées
                  </p>
                  {/* ✅ Badge dialecte dans le modal */}
                  {selected.dialecte && (
                    <span
                      className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                        dialecteConfig[selected.dialecte]?.color ||
                        'bg-gray-100 text-gray-700'
                      }`}
                    >
                      🗣️{' '}
                      {dialecteConfig[selected.dialecte]?.label ||
                        selected.dialecte}
                    </span>
                  )}
                </div>
              </div>

              {/* Comparaison côte à côte */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                    <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                    <span>Texte original (Français)</span>
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4 max-h-80 overflow-y-auto border border-gray-200">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap font-serif leading-relaxed">
                      {selected.article.originalText}
                    </p>
                  </div>
                </div>

                <div>
                  {/* ✅ Titre dynamique avec dialecte */}
                  <h3 className="font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                    <span>
                      {mode === 'edit'
                        ? 'Traduction (modifiable)'
                        : `Traduction (${dialecteConfig[selected.dialecte]?.label || 'Comorien'})`}
                    </span>
                  </h3>

                  {mode === 'edit' ? (
                    <textarea
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                      rows={12}
                      className="w-full p-4 border-2 border-indigo-300 rounded-xl text-sm font-serif leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    />
                  ) : (
                    <div className="bg-indigo-50 rounded-xl p-4 max-h-80 overflow-y-auto border border-indigo-200">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap font-serif leading-relaxed">
                        {selected.translatedText}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* MODE EDIT : qualité + boutons */}
              {mode === 'edit' && (
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center space-x-4 mb-6">
                    <label className="text-sm font-semibold text-gray-700">
                      Qualité :
                    </label>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((r) => (
                        <button
                          key={r}
                          onClick={() => setQuality(r)}
                          className={`w-10 h-10 rounded-lg font-bold text-sm transition-colors ${
                            quality === r
                              ? 'bg-yellow-400 text-white'
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-yellow-50'
                          }`}
                        >
                          {r}★
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleValidate(editedText)}
                      disabled={saving}
                      className="flex-1 flex items-center justify-center space-x-2 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold disabled:opacity-50"
                    >
                      <Save className="w-5 h-5" />
                      <span>
                        {saving ? 'Validation...' : 'Valider avec corrections'}
                      </span>
                    </button>
                    <button
                      onClick={closeModal}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              {/* MODE REJECT */}
              {mode === 'reject' && (
                <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                  <label className="block text-sm font-semibold text-red-800 mb-3">
                    Raison du rejet *
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={4}
                    placeholder="Expliquez pourquoi cette traduction est rejetée..."
                    className="w-full px-4 py-3 border border-red-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  />
                  <div className="flex space-x-4 mt-4">
                    <button
                      onClick={handleReject}
                      disabled={saving || !rejectReason.trim()}
                      className="flex-1 flex items-center justify-center space-x-2 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold disabled:opacity-50"
                    >
                      <XCircle className="w-5 h-5" />
                      <span>{saving ? 'Rejet...' : 'Confirmer le rejet'}</span>
                    </button>
                    <button
                      onClick={closeModal}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function LinguisteTranslations() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <TranslationsContent />
    </Suspense>
  )
}

// 'use client'

// import { useState, useEffect, Suspense } from 'react'
// import { useSearchParams } from 'next/navigation'
// import {
//   CheckCircle,
//   XCircle,
//   Eye,
//   Edit3,
//   Save,
//   User,
//   Calendar,
//   Clock,
//   Star,
//   FileText,
//   X,
//   AlertCircle,
// } from 'lucide-react'

// function TranslationsContent() {
//   const searchParams = useSearchParams()
//   const articleFilter = searchParams.get('article')

//   const [translations, setTranslations] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [filterStatus, setFilterStatus] = useState('completed')
//   const [selected, setSelected] = useState(null)
//   const [mode, setMode] = useState(null) // 'view' | 'edit' | 'reject'
//   const [editedText, setEditedText] = useState('')
//   const [rejectReason, setRejectReason] = useState('')
//   const [quality, setQuality] = useState(5)
//   const [saving, setSaving] = useState(false)

//   useEffect(() => {
//     fetchTranslations()
//   }, [filterStatus, articleFilter])

//   const fetchTranslations = async () => {
//     setLoading(true)
//     try {
//       const params = new URLSearchParams()
//       if (filterStatus !== 'all') params.append('status', filterStatus)
//       if (articleFilter) params.append('articleId', articleFilter)

//       const res = await fetch(`/api/linguiste/translations?${params}`)
//       const data = await res.json()
//       setTranslations(data.translations || [])
//     } catch (e) {
//       console.error(e)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const openModal = (translation, modalMode) => {
//     setSelected(translation)
//     setMode(modalMode)
//     setEditedText(translation.translatedText)
//     setQuality(translation.quality || 5)
//     setRejectReason('')
//   }

//   const closeModal = () => {
//     setSelected(null)
//     setMode(null)
//     setEditedText('')
//     setRejectReason('')
//   }

//   const handleValidate = async (correctedText = null) => {
//     setSaving(true)
//     try {
//       const res = await fetch(
//         `/api/linguiste/translations/${selected.id}/validate`,
//         {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({
//             quality,
//             correctedText,
//           }),
//         },
//       )
//       if (res.ok) {
//         closeModal()
//         fetchTranslations()
//       }
//     } catch (e) {
//       console.error(e)
//     } finally {
//       setSaving(false)
//     }
//   }

//   const handleReject = async () => {
//     if (!rejectReason.trim()) return alert('Veuillez indiquer une raison')
//     setSaving(true)
//     try {
//       const res = await fetch(
//         `/api/linguiste/translations/${selected.id}/reject`,
//         {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ reason: rejectReason }),
//         },
//       )
//       if (res.ok) {
//         closeModal()
//         fetchTranslations()
//       }
//     } catch (e) {
//       console.error(e)
//     } finally {
//       setSaving(false)
//     }
//   }

//   const formatTime = (seconds) => {
//     const h = Math.floor(seconds / 3600)
//     const m = Math.floor((seconds % 3600) / 60)
//     return `${h}h ${m}m`
//   }

//   const statusConfig = {
//     completed: { label: 'Terminée', color: 'bg-orange-100 text-orange-700' },
//     verified: { label: 'Vérifiée', color: 'bg-green-100 text-green-700' },
//     in_progress: { label: 'En cours', color: 'bg-blue-100 text-blue-700' },
//     pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700' },
//   }

//   return (
//     <div>
//       {/* Header */}
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold text-gray-900">
//           Validation des traductions
//         </h1>
//         <p className="text-gray-600 mt-2">
//           {translations.length} traduction(s) — vous pouvez valider, corriger ou
//           rejeter
//         </p>
//       </div>

//       {/* Filtres */}
//       <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-wrap gap-3">
//         {[
//           { value: 'completed', label: '⏳ À valider' },
//           { value: 'verified', label: '✅ Vérifiées' },
//           { value: 'in_progress', label: '🔄 En cours' },
//           { value: 'all', label: '📋 Toutes' },
//         ].map((opt) => (
//           <button
//             key={opt.value}
//             onClick={() => setFilterStatus(opt.value)}
//             className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
//               filterStatus === opt.value
//                 ? 'bg-indigo-600 text-white'
//                 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//             }`}
//           >
//             {opt.label}
//           </button>
//         ))}
//       </div>

//       {/* Liste */}
//       {loading ? (
//         <div className="flex justify-center py-12">
//           <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
//         </div>
//       ) : translations.length === 0 ? (
//         <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
//           <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
//           <h3 className="text-lg font-medium text-gray-900">
//             Aucune traduction à afficher
//           </h3>
//         </div>
//       ) : (
//         <div className="space-y-4">
//           {translations.map((t) => {
//             const s = statusConfig[t.status] || statusConfig.in_progress
//             return (
//               <div
//                 key={t.id}
//                 className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
//               >
//                 {/* Top */}
//                 <div className="flex items-start justify-between mb-4">
//                   <div className="flex-1">
//                     <div className="flex items-center space-x-2 mb-2">
//                       <FileText className="w-5 h-5 text-indigo-400" />
//                       <h3 className="font-semibold text-gray-900">
//                         {t.article.title}
//                       </h3>
//                       <span
//                         className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.color}`}
//                       >
//                         {s.label}
//                       </span>
//                     </div>
//                     <div className="flex items-center space-x-4 text-sm text-gray-500">
//                       <span className="flex items-center space-x-1">
//                         <User className="w-4 h-4" />
//                         <span>{t.user.name || t.user.email}</span>
//                       </span>
//                       <span className="flex items-center space-x-1">
//                         <Calendar className="w-4 h-4" />
//                         <span>
//                           {new Date(t.updatedAt).toLocaleDateString('fr-FR')}
//                         </span>
//                       </span>
//                       <span className="flex items-center space-x-1">
//                         <Clock className="w-4 h-4" />
//                         <span>{formatTime(t.timeSpent)}</span>
//                       </span>
//                       <span className="font-medium text-indigo-600">
//                         {t.progress}%
//                       </span>
//                     </div>
//                   </div>
//                   {t.quality && (
//                     <div className="flex items-center space-x-1 text-yellow-500">
//                       <Star className="w-5 h-5 fill-current" />
//                       <span className="font-bold">{t.quality}/5</span>
//                     </div>
//                   )}
//                 </div>

//                 {/* Extrait */}
//                 <div className="bg-gray-50 rounded-lg p-4 mb-4">
//                   <p className="text-sm text-gray-700 line-clamp-2 font-serif">
//                     {t.translatedText}
//                   </p>
//                 </div>

//                 {/* Notes */}
//                 {t.notes && (
//                   <div className="flex items-start space-x-2 mb-4 text-sm text-gray-600">
//                     <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-orange-400" />
//                     <p>{t.notes}</p>
//                   </div>
//                 )}

//                 {/* Actions */}
//                 <div className="flex items-center space-x-3">
//                   <button
//                     onClick={() => openModal(t, 'view')}
//                     className="flex items-center space-x-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
//                   >
//                     <Eye className="w-4 h-4" />
//                     <span>Voir</span>
//                   </button>

//                   {t.status === 'completed' && (
//                     <>
//                       <button
//                         onClick={() => openModal(t, 'edit')}
//                         className="flex items-center space-x-1 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium"
//                       >
//                         <Edit3 className="w-4 h-4" />
//                         <span>Corriger & Valider</span>
//                       </button>
//                       <button
//                         onClick={() => handleValidate()}
//                         className="flex items-center space-x-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
//                       >
//                         <CheckCircle className="w-4 h-4" />
//                         <span>Valider</span>
//                       </button>
//                       <button
//                         onClick={() => openModal(t, 'reject')}
//                         className="flex items-center space-x-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
//                       >
//                         <XCircle className="w-4 h-4" />
//                         <span>Rejeter</span>
//                       </button>
//                     </>
//                   )}
//                 </div>
//               </div>
//             )
//           })}
//         </div>
//       )}

//       {/* ===== MODAL ===== */}
//       {selected && mode && (
//         <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
//           <div className="bg-white rounded-2xl w-full max-w-5xl my-8 overflow-hidden shadow-2xl">
//             {/* Header modal */}
//             <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
//               <div>
//                 <h2 className="text-xl font-bold text-gray-900">
//                   {mode === 'view' && 'Lecture de la traduction'}
//                   {mode === 'edit' && 'Corriger & Valider'}
//                   {mode === 'reject' && 'Rejeter la traduction'}
//                 </h2>
//                 <p className="text-sm text-gray-500">
//                   {selected.article.title}
//                 </p>
//               </div>
//               <button
//                 onClick={closeModal}
//                 className="p-2 hover:bg-gray-100 rounded-lg"
//               >
//                 <X className="w-5 h-5 text-gray-500" />
//               </button>
//             </div>

//             <div className="p-6">
//               {/* Infos traducteur */}
//               <div className="flex items-center space-x-4 mb-6 p-4 bg-indigo-50 rounded-xl">
//                 <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
//                   <User className="w-5 h-5 text-white" />
//                 </div>
//                 <div>
//                   <p className="font-semibold text-gray-900">
//                     {selected.user.name || selected.user.email}
//                   </p>
//                   <p className="text-sm text-gray-600">
//                     {selected.progress}% • {formatTime(selected.timeSpent)}{' '}
//                     passées
//                   </p>
//                 </div>
//               </div>

//               {/* Comparaison côte à côte */}
//               <div className="grid md:grid-cols-2 gap-6 mb-6">
//                 <div>
//                   <h3 className="font-semibold text-gray-700 mb-3 flex items-center space-x-2">
//                     <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
//                     <span>Texte original (Français)</span>
//                   </h3>
//                   <div className="bg-gray-50 rounded-xl p-4 max-h-80 overflow-y-auto border border-gray-200">
//                     <p className="text-sm text-gray-900 whitespace-pre-wrap font-serif leading-relaxed">
//                       {selected.article.originalText}
//                     </p>
//                   </div>
//                 </div>

//                 <div>
//                   <h3 className="font-semibold text-gray-700 mb-3 flex items-center space-x-2">
//                     <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
//                     <span>
//                       {mode === 'edit'
//                         ? 'Traduction (modifiable)'
//                         : 'Traduction (Comorien)'}
//                     </span>
//                   </h3>

//                   {mode === 'edit' ? (
//                     <textarea
//                       value={editedText}
//                       onChange={(e) => setEditedText(e.target.value)}
//                       rows={12}
//                       className="w-full p-4 border-2 border-indigo-300 rounded-xl text-sm font-serif leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
//                     />
//                   ) : (
//                     <div className="bg-indigo-50 rounded-xl p-4 max-h-80 overflow-y-auto border border-indigo-200">
//                       <p className="text-sm text-gray-900 whitespace-pre-wrap font-serif leading-relaxed">
//                         {selected.translatedText}
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* MODE VIEW : rien de plus */}

//               {/* MODE EDIT : qualité + boutons */}
//               {mode === 'edit' && (
//                 <div className="bg-gray-50 rounded-xl p-6">
//                   <div className="flex items-center space-x-4 mb-6">
//                     <label className="text-sm font-semibold text-gray-700">
//                       Qualité :
//                     </label>
//                     <div className="flex space-x-2">
//                       {[1, 2, 3, 4, 5].map((r) => (
//                         <button
//                           key={r}
//                           onClick={() => setQuality(r)}
//                           className={`w-10 h-10 rounded-lg font-bold text-sm transition-colors ${
//                             quality === r
//                               ? 'bg-yellow-400 text-white'
//                               : 'bg-white border border-gray-300 text-gray-700 hover:bg-yellow-50'
//                           }`}
//                         >
//                           {r}★
//                         </button>
//                       ))}
//                     </div>
//                   </div>
//                   <div className="flex space-x-4">
//                     <button
//                       onClick={() => handleValidate(editedText)}
//                       disabled={saving}
//                       className="flex-1 flex items-center justify-center space-x-2 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold disabled:opacity-50"
//                     >
//                       <Save className="w-5 h-5" />
//                       <span>
//                         {saving ? 'Validation...' : 'Valider avec corrections'}
//                       </span>
//                     </button>
//                     <button
//                       onClick={closeModal}
//                       className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
//                     >
//                       Annuler
//                     </button>
//                   </div>
//                 </div>
//               )}

//               {/* MODE REJECT */}
//               {mode === 'reject' && (
//                 <div className="bg-red-50 rounded-xl p-6 border border-red-200">
//                   <label className="block text-sm font-semibold text-red-800 mb-3">
//                     Raison du rejet *
//                   </label>
//                   <textarea
//                     value={rejectReason}
//                     onChange={(e) => setRejectReason(e.target.value)}
//                     rows={4}
//                     placeholder="Expliquez pourquoi cette traduction est rejetée..."
//                     className="w-full px-4 py-3 border border-red-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
//                   />
//                   <div className="flex space-x-4 mt-4">
//                     <button
//                       onClick={handleReject}
//                       disabled={saving || !rejectReason.trim()}
//                       className="flex-1 flex items-center justify-center space-x-2 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold disabled:opacity-50"
//                     >
//                       <XCircle className="w-5 h-5" />
//                       <span>{saving ? 'Rejet...' : 'Confirmer le rejet'}</span>
//                     </button>
//                     <button
//                       onClick={closeModal}
//                       className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
//                     >
//                       Annuler
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

// export default function LinguisteTranslations() {
//   return (
//     <Suspense
//       fallback={
//         <div className="flex justify-center py-12">
//           <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
//         </div>
//       }
//     >
//       <TranslationsContent />
//     </Suspense>
//   )
// }
