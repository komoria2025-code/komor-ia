'use client'

/**
 * TranslatePage — système de sauvegarde refactorisé
 *
 * Stratégie d'autosave (inspirée de Google Docs) :
 *  A. Inactivité     → debounce 15 s stable (ref, jamais recréé)
 *  B. Delta > 100 c  → sauvegarde immédiate si l'utilisateur tape beaucoup d'un coup
 *  C. Fermeture      → navigator.sendBeacon() dans beforeunload
 *
 * Trois modes backend :
 *  "autosave" → upsert Translation, aucun TranslationEdit
 *  "manual"   → upsert Translation + crée TranslationEdit (bouton "Enregistrer")
 *  "submit"   → upsert Translation, progress=100, status=completed + TranslationEdit
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Save,
  Check,
  ArrowLeft,
  Languages,
  Clock,
  AlertCircle,
  Loader2,
  BookmarkCheck,
} from 'lucide-react'
import { useSession } from 'next-auth/react'

// ─── Constantes ───────────────────────────────────────────────────────────────
const AUTOSAVE_DEBOUNCE_MS = 15_000 // 15 secondes d'inactivité
const AUTOSAVE_CHAR_DELTA = 100 // sauvegarde si ±100 caractères

export default function TranslatePage({ slug, onBack }) {
  const { data: session } = useSession()

  // ── État principal ──────────────────────────────────────────────────────────
  const [article, setArticle] = useState(null)
  const [translation, setTranslation] = useState('')
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)
  const [manualSaveMsg, setManualSaveMsg] = useState(false) // "Version enregistrée."
  const [timeSpent, setTimeSpent] = useState(0)
  const [notes, setNotes] = useState('')
  const [dialecte, setDialecte] = useState('shingazidja')

  // ── Références stables (ne provoquent pas de re-render) ────────────────────
  const translationRef = useRef('') // miroir de translation pour les callbacks
  const progressRef = useRef(0) // miroir de progress
  const notesRef = useRef('') // miroir de notes
  const dialecteRef = useRef('shingazidja')
  const timeSpentRef = useRef(0) // miroir de timeSpent (le timer incrémente une ref)
  const lastSavedLengthRef = useRef(0) // longueur du texte lors de la dernière save
  const debounceTimerRef = useRef(null) // timer du debounce manuel
  const articleRef = useRef(null) // miroir de article
  const sessionRef = useRef(null) // miroir de session

  // Synchroniser les refs avec les états
  useEffect(() => {
    translationRef.current = translation
  }, [translation])
  useEffect(() => {
    progressRef.current = progress
  }, [progress])
  useEffect(() => {
    notesRef.current = notes
  }, [notes])
  useEffect(() => {
    dialecteRef.current = dialecte
  }, [dialecte])
  useEffect(() => {
    articleRef.current = article
  }, [article])
  useEffect(() => {
    sessionRef.current = session
  }, [session])

  const dialectes = [
    {
      value: 'shingazidja',
      label: 'Shingazidja',
      flag: '🇰🇲',
      desc: 'Grande Comore',
    },
    { value: 'shindzuani', label: 'Shindzuani', flag: '🇰🇲', desc: 'Anjouan' },
    { value: 'shimwali', label: 'Shimwali', flag: '🇰🇲', desc: 'Mohéli' },
    { value: 'shimaore', label: 'Shimaore', flag: '🇫🇷', desc: 'Mayotte' },
  ]

  // ── Chargement initial ──────────────────────────────────────────────────────
  useEffect(() => {
    if (slug) fetchArticle()
  }, [slug])

  // ── Timer de temps passé (incrémente uniquement la ref pour éviter les re-renders inutiles) ──
  useEffect(() => {
    const interval = setInterval(() => {
      timeSpentRef.current += 1
      // On synchronise l'état toutes les 10 secondes pour l'affichage
      if (timeSpentRef.current % 10 === 0) {
        setTimeSpent(timeSpentRef.current)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const fetchArticle = async () => {
    try {
      const res = await fetch(`/api/articles/${slug}`)
      if (res.ok) {
        const data = await res.json()
        setArticle(data.article)
        if (data.translation) {
          const t = data.translation
          setTranslation(t.translatedText)
          translationRef.current = t.translatedText
          lastSavedLengthRef.current = t.translatedText.length

          setProgress(t.progress)
          setNotes(t.notes || '')
          setDialecte(t.dialecte || 'shingazidja')

          const ts = t.timeSpent || 0
          setTimeSpent(ts)
          timeSpentRef.current = ts
        }
      }
    } catch (err) {
      console.error('Erreur chargement article :', err)
    } finally {
      setLoading(false)
    }
  }

  // ── Fonction de sauvegarde centrale ────────────────────────────────────────
  /**
   * @param {'autosave'|'manual'|'submit'} mode
   * Lit toujours les refs pour avoir les valeurs les plus fraîches,
   * même depuis beforeunload ou un timer.
   */
  const saveTranslation = useCallback(
    async (mode) => {
      if (!sessionRef.current?.user?.id || !articleRef.current) return

      setSaving(true)
      try {
        const res = await fetch(`/api/articles/${slug}/translate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode,
            translatedText: translationRef.current,
            progress: progressRef.current,
            notes: notesRef.current,
            timeSpent: timeSpentRef.current,
            dialecte: dialecteRef.current,
            // submit force progress=100 côté backend, on l'envoie quand même
            ...(mode === 'submit' ? { status: 'completed' } : {}),
          }),
        })

        if (res.ok) {
          setLastSaved(new Date())
          lastSavedLengthRef.current = translationRef.current.length

          if (mode === 'manual') {
            // Afficher "Version enregistrée." pendant 3 secondes
            setManualSaveMsg(true)
            setTimeout(() => setManualSaveMsg(false), 3000)
          }

          if (mode === 'submit') {
            setProgress(100)
            alert(
              'Traduction soumise avec succès ! Merci pour votre contribution.',
            )
            onBack()
          }
        }
      } catch (err) {
        console.error(`Erreur sauvegarde (${mode}) :`, err)
      } finally {
        setSaving(false)
      }
    },
    [slug, onBack],
  )

  // ── Autosave : debounce 15 s stable ────────────────────────────────────────
  /**
   * Planifie un autosave dans 15 s.
   * Si l'utilisateur tape à nouveau, le timer est réinitialisé.
   * Utilise une ref → jamais recréé entre les renders.
   */
  const scheduleAutosave = useCallback(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    debounceTimerRef.current = setTimeout(() => {
      saveTranslation('autosave')
    }, AUTOSAVE_DEBOUNCE_MS)
  }, [saveTranslation])

  // Nettoyage à l'unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    }
  }, [])

  // ── Cas C : sauvegarde avant fermeture ────────────────────────────────────
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      // Annuler le debounce en cours (inutile maintenant)
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)

      if (!sessionRef.current?.user?.id || !articleRef.current) return

      // navigator.sendBeacon est la méthode la plus fiable pour envoyer
      // une requête pendant beforeunload : elle est non bloquante et
      // garantie d'être envoyée même si la page se ferme immédiatement.
      const payload = JSON.stringify({
        mode: 'autosave',
        translatedText: translationRef.current,
        progress: progressRef.current,
        notes: notesRef.current,
        timeSpent: timeSpentRef.current,
        dialecte: dialecteRef.current,
      })

      const beaconSent = navigator.sendBeacon(
        `/api/articles/${slug}/translate`,
        new Blob([payload], { type: 'application/json' }),
      )

      // Fallback synchrone si sendBeacon n'est pas supporté (rare)
      if (!beaconSent) {
        fetch(`/api/articles/${slug}/translate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true, // permet à la requête de survivre à la fermeture de la page
        }).catch(() => {})
      }

      // NB : on ne définit pas e.returnValue → pas de popup "Voulez-vous quitter ?"
      // Décommentez la ligne suivante si vous souhaitez avertir l'utilisateur :
      // e.preventDefault(); e.returnValue = '';
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [slug]) // slug est stable, pas de recréation inutile

  // ── Calcul du pourcentage ──────────────────────────────────────────────────
  const calculateProgress = (text) => {
    if (!article) return 0
    const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length
    return Math.min(Math.round((words / article.estimatedWords) * 100), 100)
  }

  // ── Handler principal du textarea ─────────────────────────────────────────
  const handleTranslationChange = (e) => {
    const newText = e.target.value
    setTranslation(newText)
    translationRef.current = newText

    const newProgress = calculateProgress(newText)
    setProgress(newProgress)
    progressRef.current = newProgress

    // Cas B : delta de caractères ≥ 100
    const delta = Math.abs(newText.length - lastSavedLengthRef.current)
    if (delta >= AUTOSAVE_CHAR_DELTA) {
      // Annuler le debounce en cours et sauvegarder immédiatement
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
      saveTranslation('autosave')
      return
    }

    // Cas A : planifier l'autosave après 15 s d'inactivité
    scheduleAutosave()
  }

  // ── Sauvegarde manuelle ────────────────────────────────────────────────────
  const handleManualSave = () => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    saveTranslation('manual')
  }

  // ── Soumission finale ──────────────────────────────────────────────────────
  const handleSubmit = () => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    saveTranslation('submit')
  }

  // ── Formatage du temps ─────────────────────────────────────────────────────
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h}h ${m}m ${s}s`
  }

  // ── Rendus de chargement / erreur ─────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F3EF] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#1A1A1A] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement de l'article...</p>
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-[#F5F3EF] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-900 text-lg mb-2">Article non trouvé</p>
          <button onClick={onBack} className="text-[#1A1A1A] hover:underline">
            Retour à la liste
          </button>
        </div>
      </div>
    )
  }

  // ── Rendu principal ────────────────────────────────────────────────────────
  return (
    <div className="h-[calc(100vh-8rem)] bg-[#F5F3EF] flex flex-col -m-6">
      {/* Header fixe */}
      <header className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Gauche : retour + titre */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-medium text-[#1A1A1A] line-clamp-1">
                {article.title}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                <div className="flex items-center space-x-1">
                  <Languages className="w-4 h-4" />
                  <span>Français → Comorien</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatTime(timeSpent)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Droite : dialecte, progress, statut, boutons */}
          <div className="flex items-center space-x-4">
            {/* Sélecteur de dialecte */}
            <select
              value={dialecte}
              onChange={(e) => {
                setDialecte(e.target.value)
                dialecteRef.current = e.target.value
              }}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A1A1A] bg-white"
            >
              {dialectes.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>

            {/* Barre de progression */}
            <div className="flex items-center space-x-3">
              <div className="w-48 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-700 min-w-[3rem]">
                {progress}%
              </span>
            </div>

            {/* Statut de sauvegarde */}
            <div className="flex items-center space-x-2 text-sm text-gray-600 min-w-[9rem]">
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sauvegarde...</span>
                </>
              ) : manualSaveMsg ? (
                <>
                  <BookmarkCheck className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-700 font-medium">
                    Version enregistrée.
                  </span>
                </>
              ) : lastSaved ? (
                <>
                  <Check className="w-4 h-4 text-green-600" />
                  <span>Sauvegardé</span>
                </>
              ) : null}
            </div>

            {/* Bouton Enregistrer (version manuelle) */}
            <button
              onClick={handleManualSave}
              disabled={saving}
              className="px-4 py-2 border border-[#1A1A1A] text-[#1A1A1A] rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <BookmarkCheck className="w-4 h-4" />
              <span>Enregistrer</span>
            </button>

            {/* Bouton Soumettre */}
            <button
              onClick={handleSubmit}
              disabled={progress < 100 || saving}
              className="px-4 py-2 bg-[#1A1A1A] text-white rounded-lg hover:bg-[#2A2A2A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Soumettre</span>
            </button>
          </div>
        </div>
      </header>

      {/* Split-screen */}
      <div className="flex-1 flex overflow-hidden">
        {/* Texte original */}
        <div className="w-1/2 border-r border-gray-200 bg-white overflow-y-auto">
          <div className="p-8">
            <div className="sticky top-0 bg-white pb-4 mb-4 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Texte original (Français)
              </h2>
              <p className="text-xs text-gray-500">
                {article.estimatedWords} mots · {article.category}
              </p>
            </div>
            <div className="prose max-w-none">
              <p className="text-base leading-relaxed text-gray-800 whitespace-pre-wrap font-serif">
                {article.originalText}
              </p>
            </div>
          </div>
        </div>

        {/* Zone de traduction */}
        <div className="w-1/2 bg-[#F5F3EF] overflow-y-auto">
          <div className="p-8">
            <div className="sticky top-0 bg-[#F5F3EF] pb-4 mb-4 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Votre traduction (
                {dialectes.find((d) => d.value === dialecte)?.label ||
                  'Comorien'}
                )
              </h2>
              <p className="text-xs text-gray-500">
                Tapez ou collez votre traduction ci-dessous
              </p>
            </div>

            <textarea
              value={translation}
              onChange={handleTranslationChange}
              placeholder="Commencez à traduire ici..."
              className="w-full min-h-[600px] p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A1A1A] focus:border-transparent resize-none text-base leading-relaxed font-serif"
            />

            {/* Notes */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (optionnel)
              </label>
              <textarea
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value)
                  notesRef.current = e.target.value
                }}
                placeholder="Ajoutez des notes sur votre traduction, difficultés rencontrées, etc."
                className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A1A1A] focus:border-transparent resize-none text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
// 'use client'

// import { useState, useEffect, useCallback } from 'react'
// import {
//   Save,
//   Check,
//   ArrowLeft,
//   Languages,
//   Clock,
//   AlertCircle,
//   Loader2,
// } from 'lucide-react'
// import { useSession } from 'next-auth/react'
// import { debounce } from 'lodash'

// export default function TranslatePage({ slug, onBack }) {
//   const { data: session } = useSession()

//   const [article, setArticle] = useState(null)
//   const [translation, setTranslation] = useState('')
//   const [progress, setProgress] = useState(0)
//   const [loading, setLoading] = useState(true)
//   const [saving, setSaving] = useState(false)
//   const [lastSaved, setLastSaved] = useState(null)
//   const [timeSpent, setTimeSpent] = useState(0)
//   const [notes, setNotes] = useState('')
//   const [dialecte, setDialecte] = useState('shingazidja')

//   const dialectes = [
//     {
//       value: 'shingazidja',
//       label: 'Shingazidja',
//       flag: '🇰🇲',
//       desc: 'Grande Comore',
//     },
//     { value: 'shindzuani', label: 'Shindzuani', flag: '🇰🇲', desc: 'Anjouan' },
//     { value: 'shimwali', label: 'Shimwali', flag: '🇰🇲', desc: 'Mohéli' },
//     { value: 'shimaore', label: 'Shimaore', flag: '🇫🇷', desc: 'Mayotte' },
//   ]

//   useEffect(() => {
//     if (slug) fetchArticle()
//   }, [slug])

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setTimeSpent((prev) => prev + 1)
//     }, 1000)
//     return () => clearInterval(interval)
//   }, [])

//   const fetchArticle = async () => {
//     try {
//       const response = await fetch(`/api/articles/${slug}`)
//       if (response.ok) {
//         const data = await response.json()
//         setArticle(data.article)
//         if (data.translation) {
//           setTranslation(data.translation.translatedText)
//           setProgress(data.translation.progress)
//           setNotes(data.translation.notes || '')
//           setTimeSpent(data.translation.timeSpent || 0)
//           setDialecte(data.translation.dialecte || 'shingazidja')
//         }
//       }
//     } catch (error) {
//       console.error('Erreur:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const autoSave = useCallback(
//     debounce(async (text, prog) => {
//       if (!session?.user?.id || !article) return
//       setSaving(true)
//       try {
//         const response = await fetch(`/api/articles/${slug}/translate`, {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({
//             translatedText: text,
//             progress: prog,
//             notes: notes,
//             timeSpent: timeSpent,
//             dialecte: dialecte,
//           }),
//         })
//         if (response.ok) setLastSaved(new Date())
//       } catch (error) {
//         console.error('Erreur de sauvegarde:', error)
//       } finally {
//         setSaving(false)
//       }
//     }, 2000),
//     [slug, article, notes, timeSpent, session, dialecte],
//   )

//   const calculateProgress = (text) => {
//     if (!article) return 0
//     const originalWords = article.estimatedWords
//     const translatedWords = text.trim().split(/\s+/).length
//     return Math.min(Math.round((translatedWords / originalWords) * 100), 100)
//   }

//   const handleTranslationChange = (e) => {
//     const newText = e.target.value
//     setTranslation(newText)
//     const newProgress = calculateProgress(newText)
//     setProgress(newProgress)
//     autoSave(newText, newProgress)
//   }

//   const handleSubmit = async () => {
//     if (!session?.user?.id || !article) return
//     setSaving(true)
//     try {
//       const response = await fetch(`/api/articles/${slug}/translate`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           translatedText: translation,
//           progress: 100,
//           status: 'completed',
//           notes: notes,
//           timeSpent: timeSpent,
//           dialecte: dialecte, // ✅ Ajouté
//         }),
//       })
//       if (response.ok) {
//         alert('Traduction soumise avec succès ! Merci pour votre contribution.')
//         onBack()
//       }
//     } catch (error) {
//       console.error('Erreur:', error)
//       alert('Erreur lors de la soumission')
//     } finally {
//       setSaving(false)
//     }
//   }

//   const formatTime = (seconds) => {
//     const h = Math.floor(seconds / 3600)
//     const m = Math.floor((seconds % 3600) / 60)
//     const s = seconds % 60
//     return `${h}h ${m}m ${s}s`
//   }

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-[#F5F3EF] flex items-center justify-center">
//         <div className="text-center">
//           <Loader2 className="w-12 h-12 text-[#1A1A1A] animate-spin mx-auto mb-4" />
//           <p className="text-gray-600">Chargement de l'article...</p>
//         </div>
//       </div>
//     )
//   }

//   if (!article) {
//     return (
//       <div className="min-h-screen bg-[#F5F3EF] flex items-center justify-center">
//         <div className="text-center">
//           <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
//           <p className="text-gray-900 text-lg mb-2">Article non trouvé</p>
//           <button onClick={onBack} className="text-[#1A1A1A] hover:underline">
//             Retour à la liste
//           </button>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="h-[calc(100vh-8rem)] bg-[#F5F3EF] flex flex-col -m-6">
//       {/* Header fixe */}
//       <header className="bg-white border-b border-gray-200 p-4">
//         <div className="max-w-7xl mx-auto flex items-center justify-between">
//           <div className="flex items-center space-x-4">
//             <button
//               onClick={onBack}
//               className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//             >
//               <ArrowLeft className="w-5 h-5" />
//             </button>
//             <div>
//               <h1 className="text-lg font-medium text-[#1A1A1A] line-clamp-1">
//                 {article.title}
//               </h1>
//               <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
//                 <div className="flex items-center space-x-1">
//                   <Languages className="w-4 h-4" />
//                   <span>Français → Comorien</span>
//                 </div>
//                 <div className="flex items-center space-x-1">
//                   <Clock className="w-4 h-4" />
//                   <span>{formatTime(timeSpent)}</span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="flex items-center space-x-4">
//             {/* ✅ Sélecteur de dialecte */}
//             <div className="flex items-center space-x-2">
//               {/* <label className="text-sm font-medium text-gray-600 whitespace-nowrap">
//                 Dialecte :
//               </label> */}
//               <select
//                 value={dialecte}
//                 onChange={(e) => setDialecte(e.target.value)}
//                 className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A1A1A] bg-white"
//               >
//                 {dialectes.map((d) => (
//                   <option key={d.value} value={d.value}>
//                     {d.label}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Progress */}
//             <div className="flex items-center space-x-3">
//               <div className="w-48 bg-gray-200 rounded-full h-2">
//                 <div
//                   className="bg-green-600 h-2 rounded-full transition-all"
//                   style={{ width: `${progress}%` }}
//                 />
//               </div>
//               <span className="text-sm font-medium text-gray-700 min-w-[3rem]">
//                 {progress}%
//               </span>
//             </div>

//             {/* Statut de sauvegarde */}
//             <div className="flex items-center space-x-2 text-sm text-gray-600">
//               {saving ? (
//                 <>
//                   <Loader2 className="w-4 h-4 animate-spin" />
//                   <span>Sauvegarde...</span>
//                 </>
//               ) : lastSaved ? (
//                 <>
//                   <Check className="w-4 h-4 text-green-600" />
//                   <span>Sauvegardé</span>
//                 </>
//               ) : null}
//             </div>

//             {/* Bouton soumettre */}
//             <button
//               onClick={handleSubmit}
//               disabled={progress < 100 || saving}
//               className="px-4 py-2 bg-[#1A1A1A] text-white rounded-lg hover:bg-[#2A2A2A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
//             >
//               <Save className="w-4 h-4" />
//               <span>Soumettre</span>
//             </button>
//           </div>
//         </div>
//       </header>

//       {/* Contenu split-screen */}
//       <div className="flex-1 flex overflow-hidden">
//         {/* Panel gauche - Article original */}
//         <div className="w-1/2 border-r border-gray-200 bg-white overflow-y-auto">
//           <div className="p-8">
//             <div className="sticky top-0 bg-white pb-4 mb-4 border-b border-gray-200">
//               <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
//                 Texte original (Français)
//               </h2>
//               <p className="text-xs text-gray-500">
//                 {article.estimatedWords} mots · {article.category}
//               </p>
//             </div>
//             <div className="prose max-w-none">
//               <p className="text-base leading-relaxed text-gray-800 whitespace-pre-wrap font-serif">
//                 {article.originalText}
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Panel droit - Traduction */}
//         <div className="w-1/2 bg-[#F5F3EF] overflow-y-auto">
//           <div className="p-8">
//             <div className="sticky top-0 bg-[#F5F3EF] pb-4 mb-4 border-b border-gray-200">
//               <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
//                 Votre traduction (
//                 {dialectes.find((d) => d.value === dialecte)?.label ||
//                   'Comorien'}
//                 )
//               </h2>
//               <p className="text-xs text-gray-500">
//                 Tapez ou collez votre traduction ci-dessous
//               </p>
//             </div>

//             <textarea
//               value={translation}
//               onChange={handleTranslationChange}
//               placeholder="Commencez à traduire ici..."
//               className="w-full min-h-[600px] p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A1A1A] focus:border-transparent resize-none text-base leading-relaxed font-serif"
//             />

//             {/* Notes */}
//             <div className="mt-6">
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Notes (optionnel)
//               </label>
//               <textarea
//                 value={notes}
//                 onChange={(e) => setNotes(e.target.value)}
//                 placeholder="Ajoutez des notes sur votre traduction, difficultés rencontrées, etc."
//                 className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A1A1A] focus:border-transparent resize-none text-sm"
//               />
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }
