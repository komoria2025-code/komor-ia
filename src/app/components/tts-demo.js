// src/app/components/tts-demo.js
'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
  Volume2, Loader2, Download, AlertCircle,
  Info, Code2, Lock, Mic, Waves,
} from 'lucide-react'

const EXAMPLES = [
  "Rongoa hakuu.",
  "Mdzadzahangu ye unandza hakuu.",
  "Esirikali ngaitaârishao mpango wa nyumeni wa uwana ne le ɓange.",
  "Tsinikiwa 17500 KMF djana 20h.",
  "Emacandjo yah'owana watiti yanɗisa djana 8h.",
  "Omsihiri wakariɓu nguo nɗahu ?",
  "Etwaɓiɓu ye ucandja owana watiti haina mfumo.",
]

// ── Avatar Anziza ──────────────────────────────────────
function AnzizaAvatar({ isSpeaking }) {
  return (
    <div className="flex flex-col items-center">
      {/* Illustration SVG — silhouette femme voilée */}
      <div className={`relative w-32 h-32 sm:w-40 sm:h-40 transition-all duration-300 ${isSpeaking ? 'scale-105' : 'scale-100'}`}>
        <svg viewBox="0 0 200 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-lg">
          {/* Fond cercle */}
          <circle cx="100" cy="100" r="95" fill="#f0f4ff" stroke="#c7d2fe" strokeWidth="2"/>

          {/* Corps / robe longue */}
          <ellipse cx="100" cy="185" rx="55" ry="40" fill="#4f46e5" opacity="0.9"/>
          <rect x="55" y="140" width="90" height="60" rx="20" fill="#4f46e5" opacity="0.9"/>

          {/* Bras */}
          <ellipse cx="55" cy="160" rx="12" ry="28" fill="#4f46e5" opacity="0.85" transform="rotate(-15 55 160)"/>
          <ellipse cx="145" cy="160" rx="12" ry="28" fill="#4f46e5" opacity="0.85" transform="rotate(15 145 160)"/>

          {/* Mains */}
          <circle cx="48" cy="183" r="9" fill="#d4a57a"/>
          <circle cx="152" cy="183" r="9" fill="#d4a57a"/>

          {/* Épaules / haut */}
          <ellipse cx="100" cy="138" rx="42" ry="18" fill="#3730a3"/>

          {/* Voile — partie qui tombe */}
          <path d="M58 95 Q40 130 45 175 Q70 165 100 168 Q130 165 155 175 Q160 130 142 95 Q120 108 100 108 Q80 108 58 95Z"
            fill="#312e81" opacity="0.95"/>

          {/* Voile — dessus tête */}
          <ellipse cx="100" cy="88" rx="48" ry="20" fill="#312e81"/>
          <path d="M52 88 Q55 60 100 55 Q145 60 148 88 Q125 78 100 78 Q75 78 52 88Z"
            fill="#312e81"/>

          {/* Visage — zone floue/ombre (pas de visage visible) */}
          <ellipse cx="100" cy="95" rx="26" ry="22" fill="#c8956c" opacity="0.3"/>
          {/* Niqab léger — couvre le visage sauf les yeux */}
          <path d="M74 88 Q74 115 100 118 Q126 115 126 88 Q113 94 100 94 Q87 94 74 88Z"
            fill="#1e1b4b" opacity="0.7"/>

          {/* Yeux visibles */}
          <ellipse cx="91"  cy="90" rx="5" ry="3.5" fill="#1a1a2e"/>
          <ellipse cx="109" cy="90" rx="5" ry="3.5" fill="#1a1a2e"/>
          {/* Reflet yeux */}
          <circle cx="93"  cy="89" r="1.5" fill="white" opacity="0.8"/>
          <circle cx="111" cy="89" r="1.5" fill="white" opacity="0.8"/>

          {/* Ondes sonores si speaking */}
          {isSpeaking && (
            <>
              <ellipse cx="100" cy="100" rx="60" ry="55" fill="none" stroke="#818cf8" strokeWidth="2" opacity="0.4">
                <animate attributeName="rx" values="60;80;60" dur="1.5s" repeatCount="indefinite"/>
                <animate attributeName="ry" values="55;75;55" dur="1.5s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.4;0;0.4" dur="1.5s" repeatCount="indefinite"/>
              </ellipse>
              <ellipse cx="100" cy="100" rx="70" ry="65" fill="none" stroke="#a5b4fc" strokeWidth="1.5" opacity="0.3">
                <animate attributeName="rx" values="70;95;70" dur="2s" repeatCount="indefinite"/>
                <animate attributeName="ry" values="65;88;65" dur="2s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite"/>
              </ellipse>
            </>
          )}
        </svg>
      </div>

      {/* Nom + info */}
      <div className="text-center mt-3">
        <h3 className="text-lg font-bold text-gray-900">Anziza</h3>
        <p className="text-xs text-indigo-600 font-medium">Voix shikomori · Shingazidja</p>
        <div className="flex items-center justify-center space-x-1.5 mt-1.5">
          <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-green-400 animate-pulse' : 'bg-gray-300'}`} />
          <span className="text-xs text-gray-500">
            {isSpeaking ? 'En train de parler...' : 'Prête à parler'}
          </span>
        </div>
      </div>
    </div>
  )
}

// ── Composant principal ────────────────────────────────
export default function TTSDemo() {
  const { data: session, status } = useSession()
  const [texte,      setTexte]      = useState('')
  const [loading,    setLoading]    = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [audioUrl,   setAudioUrl]   = useState(null)
  const [error,      setError]      = useState('')
  const [quota,      setQuota]      = useState(null)
  const audioRef = useRef(null)

  useEffect(() => {
    if (session) {
      fetch('/api/v1/tts').then(r => r.json()).then(setQuota).catch(() => {})
    }
  }, [session])

  // Détecter fin de lecture
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const handleEnd = () => setIsSpeaking(false)
    audio.addEventListener('ended', handleEnd)
    return () => audio.removeEventListener('ended', handleEnd)
  }, [audioUrl])

  const handleGenerate = async () => {
    if (!texte.trim() || !session) return
    setLoading(true)
    setError('')
    setAudioUrl(null)
    setIsSpeaking(false)

    try {
      const res = await fetch('/api/v1/tts', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ texte: texte.trim() }),
      })

      if (res.status === 429) {
        const data = await res.json()
        setError(`Limite quotidienne atteinte (${data.limit} essais/jour).`)
        setQuota(prev => ({ ...prev, remaining: 0 }))
        return
      }
      if (!res.ok) {
        const data = await res.json()
        setError(data.erreur || 'Erreur lors de la génération.')
        return
      }

      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      setAudioUrl(url)
      fetch('/api/v1/tts').then(r => r.json()).then(setQuota).catch(() => {})

      setTimeout(() => {
        audioRef.current?.play()
        setIsSpeaking(true)
      }, 100)
    } catch (e) {
      setError('Le service de synthèse vocale ne répond pas.')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (!audioUrl) return
    const a = document.createElement('a')
    a.href     = audioUrl
    a.download = `anziza-${Date.now()}.wav`
    a.click()
  }

  const remaining = quota?.remaining === 'unlimited' ? '∞' : (quota?.remaining ?? '—')
  const limit     = quota?.limit     === 'unlimited' ? '∞' : (quota?.limit     ?? 3)

  // ── Pas connecté ────────────────────────────────────
  if (status === 'loading') {
    return (
      <div className="mt-10 border-t border-gray-100 pt-10 flex justify-center py-10">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="mt-10 border-t border-gray-100 pt-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Démo interactive</h2>
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="grid md:grid-cols-2">

            {/* Avatar */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-10 flex items-center justify-center">
              <AnzizaAvatar isSpeaking={false} />
            </div>

            {/* Message connexion */}
            <div className="p-8 sm:p-10 flex flex-col justify-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center mb-5">
                <Lock className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Connectez-vous pour écouter Anziza
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Anziza est notre voix shikomori. Pour l'entendre parler en shingazidja,
                vous devez créer un compte gratuit sur Komor-IA.
              </p>
              <div className="space-y-3">
                <Link href="/login"
                  className="flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium text-sm hover:bg-indigo-700 transition-colors">
                  Se connecter
                </Link>
                <Link href="/signup"
                  className="flex items-center justify-center px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors">
                  Créer un compte gratuit
                </Link>
              </div>
              <p className="text-xs text-gray-400 mt-4 text-center">
                Gratuit · Pas de carte bancaire
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Connecté ────────────────────────────────────────
  return (
    <div className="mt-10 border-t border-gray-100 pt-10">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Démo interactive</h2>

      {/* Avertissement beta */}
      <div className="flex items-start space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl mb-6">
        <Info className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-yellow-800 leading-relaxed">
          <strong>Version bêta</strong> — La qualité varie selon les phrases.
          Les consonnes implosives (ɓ, ɗ) sont correctement transcrites dans notre corpus.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="grid md:grid-cols-5">

          {/* ── Colonne Avatar ─────────────────────── */}
          <div className="md:col-span-2 bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-100">
            <AnzizaAvatar isSpeaking={isSpeaking} />

            {/* Quota */}
            <div className="mt-6 w-full max-w-[180px]">
              <div className="bg-white/80 rounded-xl p-3 text-center border border-indigo-100">
                <p className="text-xs text-gray-500 mb-1">Essais aujourd'hui</p>
                <p className="text-2xl font-bold text-indigo-600">{remaining}</p>
                {limit !== '∞' && (
                  <>
                    <p className="text-xs text-gray-400">/ {limit}</p>
                    <div className="w-full bg-indigo-100 rounded-full h-1.5 mt-2">
                      <div
                        className="bg-indigo-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${quota ? ((quota.limit - quota.used) / quota.limit) * 100 : 100}%` }}
                      />
                    </div>
                  </>
                )}
                {limit === '∞' && (
                  <p className="text-xs text-indigo-400 mt-1">Accès illimité</p>
                )}
              </div>
            </div>
          </div>

          {/* ── Colonne Interface ───────────────────── */}
          <div className="md:col-span-3 p-6 sm:p-8 flex flex-col justify-between space-y-5">

            {/* Saisie texte */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Texte en shikomori
                <span className="text-gray-400 font-normal ml-2">({texte.length}/100)</span>
              </label>
              <textarea
                value={texte}
                onChange={e => setTexte(e.target.value.slice(0, 100))}
                placeholder="Entrez du texte en shikomori que vous voulez entendre..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-serif"
              />

              {/* Exemples */}
              <div className="mt-3">
                <p className="text-xs text-gray-400 mb-2">Exemples :</p>
                <div className="flex flex-wrap gap-2">
                  {EXAMPLES.map((ex, i) => (
                    <button key={i} onClick={() => setTexte(ex)}
                      className="text-xs px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-lg hover:bg-indigo-100 transition-colors text-indigo-700">
                      {ex}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Erreur */}
            {error && (
              <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Audio player */}
            {audioUrl && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Waves className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm font-medium text-indigo-800">Audio généré par Anziza</span>
                  </div>
                  <button onClick={handleDownload}
                    className="flex items-center space-x-1 text-xs text-indigo-600 hover:text-indigo-800 transition-colors">
                    <Download className="w-3 h-3" />
                    <span>WAV</span>
                  </button>
                </div>
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  controls
                  className="w-full"
                  onPlay={() => setIsSpeaking(true)}
                  onPause={() => setIsSpeaking(false)}
                  onEnded={() => setIsSpeaking(false)}
                />
              </div>
            )}

            {/* Bouton générer */}
            <button
              onClick={handleGenerate}
              disabled={loading || !texte.trim() || remaining === 0}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /><span>Anziza prépare sa voix...</span></>
              ) : (
                <><Volume2 className="w-4 h-4" /><span>Faire parler Anziza</span></>
              )}
            </button>

            {remaining === 0 && !loading && (
              <p className="text-center text-xs text-gray-500">
                Limite atteinte —{' '}
                <Link href="/?section=api-keys" className="text-indigo-600 hover:underline font-medium">
                  obtenez un accès API illimité
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
// // src/app/components/tts-demo.js
// 'use client'

// import { useState, useEffect, useRef } from 'react'
// import { useSession } from 'next-auth/react'
// import Link from 'next/link'
// import {
//   Volume2, Loader2, Download, AlertCircle,
//   Info, Code2,
// } from 'lucide-react'

// const EXAMPLES = [
//   'Mdzadzahangu ye unandza hakuu.',
//   'Esirikali ngaitaârishao mpango wa nyumeni wa uwana ne le ɓange.',
//   'Rongoa hakuu.',
//   'mɓaɓa wahangu hanika 12250 KMF djana 8h.',
//   'Omsihiri wakariɓu nguo nɗahu ?',
//   'Etwaɓiɓu ye ucandja owana watiti haina mfumo.',
// ]

// export default function TTSDemo() {
//   const { data: session } = useSession()
//   const [texte,    setTexte]    = useState('')
//   const [loading,  setLoading]  = useState(false)
//   const [audioUrl, setAudioUrl] = useState(null)
//   const [error,    setError]    = useState('')
//   const [quota,    setQuota]    = useState(null)
//   const audioRef = useRef(null)

//   useEffect(() => {
//     fetch('/api/v1/tts')
//       .then(r => r.json())
//       .then(setQuota)
//       .catch(() => {})
//   }, [])

//   const handleGenerate = async () => {
//     if (!texte.trim()) return
//     setLoading(true)
//     setError('')
//     setAudioUrl(null)

//     try {
//       const res = await fetch('/api/v1/tts', {
//         method:  'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body:    JSON.stringify({ texte: texte.trim() }),
//       })

//       if (res.status === 429) {
//         const data = await res.json()
//         setError(`Limite quotidienne atteinte (${data.limit} essais/jour). Revenez demain ou créez un compte développeur.`)
//         setQuota(prev => ({ ...prev, remaining: 0, used: data.limit }))
//         return
//       }

//       if (!res.ok) {
//         const data = await res.json()
//         setError(data.erreur || 'Erreur lors de la génération.')
//         return
//       }

//       const blob = await res.blob()
//       const url  = URL.createObjectURL(blob)
//       setAudioUrl(url)

//       // Rafraîchir quota
//       fetch('/api/v1/tts').then(r => r.json()).then(setQuota).catch(() => {})

//       setTimeout(() => audioRef.current?.play(), 100)
//     } catch (e) {
//       setError('Service temporairement indisponible.')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleDownload = () => {
//     if (!audioUrl) return
//     const a = document.createElement('a')
//     a.href     = audioUrl
//     a.download = `komori-tts-${Date.now()}.wav`
//     a.click()
//   }

//   const remaining = quota?.remaining ?? 3
//   const used      = quota?.used      ?? 0
//   const limit     = quota?.limit     ?? 3

//   return (
//     <div className="mt-10 border-t border-gray-100 pt-10">
//       <h2 className="text-xl font-semibold text-gray-900 mb-6">
//         Démo interactive
//       </h2>

//       <div className="grid lg:grid-cols-3 gap-6">

//         {/* Colonne principale */}
//         <div className="lg:col-span-2 space-y-4">

//           {/* Avertissement beta */}
//           <div className="flex items-start space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
//             <Info className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
//             <p className="text-sm text-yellow-800 leading-relaxed">
//               <strong>Version bêta</strong> — La qualité varie selon les phrases.
//               Les mots rares dans le corpus peuvent sonner moins naturellement.
//             </p>
//           </div>

//           {/* Saisie */}
//           <div className="bg-white rounded-2xl border border-gray-200 p-6">
//             <label className="block text-sm font-semibold text-gray-900 mb-3">
//               Texte en shikomori
//               <span className="text-gray-400 font-normal ml-2">({texte.length}/100)</span>
//             </label>

//             <textarea
//               value={texte}
//               onChange={e => setTexte(e.target.value.slice(0, 100))}
//               placeholder="Entrez du texte en shikomori (shingazidja)..."
//               rows={4}
//               className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none font-serif"
//             />

//             {/* Exemples */}
//             <div className="mt-3">
//               <p className="text-xs text-gray-400 mb-2">Exemples :</p>
//               <div className="flex flex-wrap gap-2">
//                 {EXAMPLES.map((ex, i) => (
//                   <button key={i} onClick={() => setTexte(ex)}
//                     className="text-xs px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 text-left">
//                     {ex}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* Erreur */}
//             {error && (
//               <div className="flex items-start space-x-2 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
//                 <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
//                 <p className="text-sm text-red-700">{error}</p>
//               </div>
//             )}

//             {/* Bouton */}
//             <button
//               onClick={handleGenerate}
//               disabled={loading || !texte.trim() || remaining === 0}
//               className="mt-4 w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
//             >
//               {loading ? (
//                 <><Loader2 className="w-4 h-4 animate-spin" /><span>Génération en cours...</span></>
//               ) : (
//                 <><Volume2 className="w-4 h-4" /><span>Générer l'audio</span></>
//               )}
//             </button>

//             {remaining === 0 && !loading && (
//               <p className="text-center text-xs text-gray-500 mt-2">
//                 Limite atteinte —{' '}
//                 <Link href="/signup" className="text-blue-600 hover:underline font-medium">
//                   créez un compte développeur
//                 </Link>{' '}
//                 pour un accès illimité
//               </p>
//             )}
//           </div>

//           {/* Lecteur audio */}
//           {audioUrl && (
//             <div className="bg-white rounded-2xl border border-gray-200 p-6">
//               <div className="flex items-center justify-between mb-4">
//                 <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
//                   <Volume2 className="w-4 h-4 text-green-600" />
//                   <span>Audio généré</span>
//                 </h3>
//                 <button onClick={handleDownload}
//                   className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
//                   <Download className="w-3 h-3" />
//                   <span>Télécharger WAV</span>
//                 </button>
//               </div>
//               <audio ref={audioRef} src={audioUrl} controls className="w-full" />
//             </div>
//           )}
//         </div>

//         {/* Sidebar */}
//         <div className="space-y-4">

//           {/* Quota */}
//           <div className="bg-white rounded-2xl border border-gray-200 p-5">
//             <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
//               Essais aujourd'hui
//             </p>
//             <div className="flex items-end space-x-1 mb-3">
//               <span className="text-4xl font-bold text-gray-900">{remaining}</span>
//               <span className="text-gray-400 mb-1">/ {limit}</span>
//             </div>
//             <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
//               <div
//                 className={`h-2 rounded-full transition-all ${remaining === 0 ? 'bg-red-400' : 'bg-gray-900'}`}
//                 style={{ width: `${((limit - used) / limit) * 100}%` }}
//               />
//             </div>
//             <p className="text-xs text-gray-400 text-center">Réinitialisé chaque jour à minuit</p>
//           </div>

//           {/* Accès API */}
//           <div className="bg-gray-900 rounded-2xl p-5 text-white">
//             <div className="flex items-center space-x-2 mb-3">
//               <Code2 className="w-4 h-4" />
//               <h3 className="font-semibold text-sm">Accès API</h3>
//             </div>
//             <div className="bg-black/30 rounded-xl p-3 mb-4 text-xs font-mono text-gray-300 overflow-x-auto">
//               <p className="text-gray-500">POST /api/v1/tts/api</p>
//               <p className="text-gray-500 mt-1">X-Api-Key: votre_clé</p>
//               <p className="mt-2">{`{"texte": "Bariza lewo ?"}`}</p>
//             </div>
//             {session ? (
//               <Link href="/?section=api-keys"
//                 className="block text-center px-4 py-2.5 bg-white text-gray-900 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors">
//                 Obtenir une clé API →
//               </Link>
//             ) : (
//               <Link href="/signup"
//                 className="block text-center px-4 py-2.5 bg-white text-gray-900 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors">
//                 Créer un compte gratuit →
//               </Link>
//             )}
//           </div>

//           {/* Contribuer */}
//           <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
//             <h3 className="font-semibold text-gray-900 mb-2 text-sm">Améliorer le modèle</h3>
//             <p className="text-xs text-gray-600 mb-3 leading-relaxed">
//               Contribuez au corpus vocal pour améliorer la qualité du modèle.
//             </p>
//             <Link href="/?section=voice"
//               className="block text-center px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-medium hover:bg-blue-700 transition-colors">
//               Contribuer au corpus →
//             </Link>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }