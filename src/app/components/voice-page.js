'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import {
  Mic,
  Play,
  Square,
  Upload,
  RotateCcw,
  CheckCircle,
  Clock,
  XCircle,
  ChevronDown,
  Volume2,
  AlertCircle,
  Loader2,
  Trash2,
} from 'lucide-react'

const dialectes = [
  {
    value: 'shingazidja',
    label: 'Shingazidja',
    flag: '🇰🇲',
    desc: 'Grande Comore',
  },
  { value: 'shindzuani', label: 'Shindzuani', flag: '🇰🇲', desc: 'Anjouan' },
  { value: 'shimwali', label: 'Shimwali', flag: '🇰🇲', desc: 'Mohéli' },
  { value: 'shimaore', label: 'Shimaore', flag: '🇰🇲', desc: 'Mayotte' },
]

const tranchesAge = [
  { value: 'moins18', label: 'Moins de 18 ans' },
  { value: 'age18_25', label: '18 – 25 ans' },
  { value: 'age26_35', label: '26 – 35 ans' },
  { value: 'age36_50', label: '36 – 50 ans' },
  { value: 'plus50', label: 'Plus de 50 ans' },
]

const iles = [
  { value: 'grande_comore', label: 'Grande Comore' },
  { value: 'anjouan', label: 'Anjouan' },
  { value: 'moheli', label: 'Mohéli' },
  { value: 'mayotte', label: 'Mayotte' },
  { value: 'diaspora', label: 'Diaspora' },
]

const statusConfig = {
  pending: {
    label: 'En attente',
    color: 'bg-yellow-100 text-yellow-700',
    icon: Clock,
  },
  validated: {
    label: 'Validé',
    color: 'bg-green-100 text-green-700',
    icon: CheckCircle,
  },
  rejected: {
    label: 'Rejeté',
    color: 'bg-red-100 text-red-700',
    icon: XCircle,
  },
}

const fmt = (s) =>
  `${Math.floor(s / 60)
    .toString()
    .padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

export default function VoicePage() {
  const { data: session } = useSession()

  const [phrase, setPhrase] = useState(null)
  const [loadingPhrase, setLoadingPhrase] = useState(true)
  const [recording, setRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState(null)
  const [audioUrl, setAudioUrl] = useState(null)
  const [duration, setDuration] = useState(0)
  const [timer, setTimer] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [dialecte, setDialecte] = useState('shingazidja')
  const [myRecordings, setMyRecordings] = useState([])
  const [showHistory, setShowHistory] = useState(false)
  const [meta, setMeta] = useState({
    genre: '',
    trancheAge: '',
    zone: 'urbain',
    ile: 'grande_comore',
    nativeSpeaker: true,
  })

  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)
  const audioRef = useRef(null)
  // ✅ Ref synchrone pour éviter le bug de closure sur `recording`
  const isRecordingRef = useRef(false)

  useEffect(() => {
    fetchPhrase()
    fetchMyRecordings()
  }, [dialecte])

  const fetchPhrase = async () => {
    setLoadingPhrase(true)
    setAudioBlob(null)
    setAudioUrl(null)
    setError('')
    try {
      const res = await fetch(`/api/voice/phrases?dialecte=${dialecte}`)
      const data = await res.json()
      setPhrase(data.phrase || null)
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingPhrase(false)
    }
  }

  const fetchMyRecordings = async () => {
    try {
      const res = await fetch('/api/voice/recordings')
      const data = await res.json()
      setMyRecordings(data.recordings || [])
    } catch (e) {
      console.error(e)
    }
  }

  // ✅ startRecording corrigé : timeslice 250ms + isRecordingRef
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      })
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        setDuration(elapsed)
        stream.getTracks().forEach((t) => t.stop())
      }

      // ✅ timeslice 250ms : les données arrivent régulièrement, pas seulement au stop
      mediaRecorder.start(250)
      setRecording(true)
      isRecordingRef.current = true // ✅ ref synchrone, pas de stale closure
      setTimer(0)

      let elapsed = 0
      timerRef.current = setInterval(() => {
        elapsed += 1
        setTimer(elapsed)
        if (elapsed >= 30) {
          stopRecording()
        }
      }, 1000)
    } catch (err) {
      setError("Impossible d'accéder au microphone. Vérifiez les permissions.")
    }
  }

  // ✅ stopRecording corrigé : utilise isRecordingRef au lieu du state `recording`
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecordingRef.current) {
      mediaRecorderRef.current.stop()
      setRecording(false)
      isRecordingRef.current = false // ✅ reset ref
      clearInterval(timerRef.current)
    }
  }

  const resetRecording = () => {
    setAudioBlob(null)
    setAudioUrl(null)
    setDuration(0)
    setTimer(0)
    setError('')
  }

  const handleSubmit = async () => {
    if (!audioBlob || !phrase) return
    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', audioBlob, 'recording.webm')

      const uploadRes = await fetch('/api/admin/upload/audio', {
        method: 'POST',
        body: formData,
      })
      if (!uploadRes.ok) throw new Error('Upload audio échoué')
      const { url, publicId, duration: dur } = await uploadRes.json()

      const submitRes = await fetch('/api/voice/recordings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phraseId: phrase.id,
          audioUrl: url,
          publicId,
          duration: dur || duration,
          dialecte,
          genre: meta.genre || null,
          trancheAge: meta.trancheAge || null,
          zone: meta.zone || null,
          ile: meta.ile || null,
          nativeSpeaker: meta.nativeSpeaker,
        }),
      })

      if (!submitRes.ok) {
        const data = await submitRes.json()
        throw new Error(data.message || 'Soumission échouée')
      }

      setSubmitted(true)
      fetchMyRecordings()

      setTimeout(() => {
        setSubmitted(false)
        resetRecording()
        fetchPhrase()
      }, 3000)
    } catch (err) {
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteRecording = async (recordingId) => {
    if (!confirm('Supprimer cet enregistrement et pouvoir recommencer ?'))
      return
    try {
      const res = await fetch(`/api/voice/recordings?id=${recordingId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        fetchMyRecordings()
        fetchPhrase()
      } else {
        const data = await res.json()
        alert(data.message)
      }
    } catch (e) {
      console.error(e)
      alert('Erreur lors de la suppression')
    }
  }
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mic className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Connexion requise
        </h2>
        <p className="text-gray-600 mb-8">
          Vous devez être connecté pour contribuer au corpus vocal shikomori.
        </p>
        <div className="flex flex-col space-y-3">
          
            <a href="/login"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Se connecter
          </a>
          
           <a href="/signup"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Créer un compte gratuitement
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Enregistrement vocal
        </h1>
        <p className="text-gray-600 mt-1">
          Lisez les phrases à voix haute pour contribuer à notre corpus vocal
          shikomori.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Votre dialecte
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {dialectes.map((d) => (
            <button
              key={d.value}
              onClick={() => setDialecte(d.value)}
              className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all text-sm ${
                dialecte === d.value
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <span className="text-xl mb-1">{d.flag}</span>
              <span className="font-medium">{d.label}</span>
              <span className="text-xs text-gray-500">{d.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Phrase à lire</h2>
          <button
            onClick={fetchPhrase}
            className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Autre phrase</span>
          </button>
        </div>

        {loadingPhrase ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : phrase ? (
          <div>
            <div className="bg-gray-50 rounded-xl p-6 mb-4">
              <p className="text-2xl font-serif text-gray-900 leading-relaxed text-center">
                {phrase.text}
              </p>
              {phrase.translation && (
                <p className="text-sm text-gray-500 text-center mt-3 italic">
                  {phrase.translation}
                </p>
              )}
            </div>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>
                Dialecte : <strong>{phrase.dialecte}</strong>
              </span>
              <span>{phrase.recordingCount}/3 enregistrements</span>
              <div className="flex items-center space-x-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${i < phrase.difficulty ? 'bg-orange-400' : 'bg-gray-200'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Volume2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Aucune phrase disponible pour ce dialecte.</p>
            <p className="text-sm mt-1">
              Revenez bientôt ou changez de dialecte.
            </p>
          </div>
        )}
      </div>

      {phrase && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-6">
            Votre enregistrement
          </h2>

          {submitted ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Merci pour votre contribution !
              </h3>
              <p className="text-gray-600">
                Votre enregistrement est en attente de validation.
              </p>
            </div>
          ) : (
            <>
              {recording && (
                <div className="flex items-center justify-center mb-6">
                  <div className="flex items-center space-x-3 bg-red-50 px-6 py-3 rounded-full">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-red-600 font-mono text-xl font-bold">
                      {fmt(timer)}
                    </span>
                    <span className="text-red-400 text-sm">max 30s</span>
                  </div>
                </div>
              )}

              <div className="flex justify-center mb-6">
                {!audioBlob ? (
                  <button
                    onClick={recording ? stopRecording : startRecording}
                    className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-lg ${
                      recording
                        ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {recording ? (
                      <Square className="w-10 h-10 text-white" />
                    ) : (
                      <Mic className="w-10 h-10 text-white" />
                    )}
                  </button>
                ) : (
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={resetRecording}
                      className="w-14 h-14 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                      title="Recommencer"
                    >
                      <RotateCcw className="w-6 h-6 text-gray-700" />
                    </button>
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {fmt(duration)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <p className="text-center text-sm text-gray-500 mb-6">
                {!audioBlob &&
                  !recording &&
                  "Cliquez pour démarrer l'enregistrement"}
                {recording && 'Cliquez pour arrêter'}
                {audioBlob && 'Enregistrement prêt — réécouter ou soumettre'}
              </p>

              {audioUrl && (
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-3 flex items-center space-x-2">
                    <Play className="w-4 h-4" />
                    <span>Réécouter votre enregistrement</span>
                  </p>
                  <audio
                    ref={audioRef}
                    src={audioUrl}
                    controls
                    className="w-full"
                  />
                </div>
              )}

              {error && (
                <div className="flex items-start space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {audioBlob && (
                <button
                  onClick={handleSubmit}
                  disabled={uploading}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Upload en cours...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      <span>Soumettre l'enregistrement</span>
                    </>
                  )}
                </button>
              )}
            </>
          )}
        </div>
      )}

      {phrase && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Vos informations</h2>
          <p className="text-sm text-gray-500 mb-4">
            Ces informations enrichissent le corpus et sont anonymisées.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Genre
              </label>
              <select
                value={meta.genre}
                onChange={(e) => setMeta({ ...meta, genre: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Non renseigné</option>
                <option value="homme">Homme</option>
                <option value="femme">Femme</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tranche d'âge
              </label>
              <select
                value={meta.trancheAge}
                onChange={(e) =>
                  setMeta({ ...meta, trancheAge: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Non renseigné</option>
                {tranchesAge.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Île d'origine
              </label>
              <select
                value={meta.ile}
                onChange={(e) => setMeta({ ...meta, ile: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {iles.map((i) => (
                  <option key={i.value} value={i.value}>
                    {i.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zone
              </label>
              <select
                value={meta.zone}
                onChange={(e) => setMeta({ ...meta, zone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="urbain">Urbain</option>
                <option value="rural">Rural</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-3">
            <input
              type="checkbox"
              id="native"
              checked={meta.nativeSpeaker}
              onChange={(e) =>
                setMeta({ ...meta, nativeSpeaker: e.target.checked })
              }
              className="w-4 h-4 text-blue-600 rounded"
            />
            <label htmlFor="native" className="text-sm text-gray-700">
              Je suis locuteur natif de ce dialecte
            </label>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <h2 className="font-semibold text-gray-900">Mes contributions</h2>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
              {myRecordings.length}
            </span>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform ${showHistory ? 'rotate-180' : ''}`}
          />
        </button>

        {showHistory && (
          <div className="border-t border-gray-200 divide-y divide-gray-100">
            {myRecordings.length === 0 ? (
              <p className="text-center text-gray-500 py-8 text-sm">
                Aucune contribution pour le moment
              </p>
            ) : (
              myRecordings.map((r) => {
                const s = statusConfig[r.status]
                const Icon = s.icon
                return (
                  <div key={r.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">
                          {r.phrase?.text}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 capitalize">
                          {r.phrase?.dialecte} •{' '}
                          {fmt(Math.round(r.duration || 0))}
                        </p>
                        {r.rejectReason && (
                          <p className="text-xs text-red-600 mt-1 bg-red-50 px-2 py-1 rounded">
                            ❌ Raison : {r.rejectReason}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                        <span
                          className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${s.color}`}
                        >
                          <Icon className="w-3 h-3" />
                          <span>{s.label}</span>
                        </span>
                        {r.status === 'rejected' && (
                          <button
                            onClick={() => handleDeleteRecording(r.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer et recommencer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}
// 'use client'

// import { useState, useEffect, useRef } from 'react'
// import { useSession } from 'next-auth/react'
// import {
//   Mic,
//   Play,
//   Square,
//   Upload,
//   RotateCcw,
//   CheckCircle,
//   Clock,
//   XCircle,
//   ChevronDown,
//   Volume2,
//   AlertCircle,
//   Loader2,
//   Trash2,
// } from 'lucide-react'

// const dialectes = [
//   {
//     value: 'shingazidja',
//     label: 'Shingazidja',
//     flag: '🇰🇲',
//     desc: 'Grande Comore',
//   },
//   { value: 'shindzuani', label: 'Shindzuani', flag: '🇰🇲', desc: 'Anjouan' },
//   { value: 'shimwali', label: 'Shimwali', flag: '🇰🇲', desc: 'Mohéli' },
//   { value: 'shimaore', label: 'Shimaore', flag: '🇫🇷', desc: 'Mayotte' },
// ]

// const tranchesAge = [
//   { value: 'moins18', label: 'Moins de 18 ans' },
//   { value: 'age18_25', label: '18 – 25 ans' },
//   { value: 'age26_35', label: '26 – 35 ans' },
//   { value: 'age36_50', label: '36 – 50 ans' },
//   { value: 'plus50', label: 'Plus de 50 ans' },
// ]

// const iles = [
//   { value: 'grande_comore', label: 'Grande Comore' },
//   { value: 'anjouan', label: 'Anjouan' },
//   { value: 'moheli', label: 'Mohéli' },
//   { value: 'mayotte', label: 'Mayotte' },
//   { value: 'diaspora', label: 'Diaspora' },
// ]

// const statusConfig = {
//   pending: {
//     label: 'En attente',
//     color: 'bg-yellow-100 text-yellow-700',
//     icon: Clock,
//   },
//   validated: {
//     label: 'Validé',
//     color: 'bg-green-100 text-green-700',
//     icon: CheckCircle,
//   },
//   rejected: {
//     label: 'Rejeté',
//     color: 'bg-red-100 text-red-700',
//     icon: XCircle,
//   },
// }

// // ✅ Formatage durée
// const fmt = (s) =>
//   `${Math.floor(s / 60)
//     .toString()
//     .padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

// export default function VoicePage() {
//   const { data: session } = useSession()

//   const [phrase, setPhrase] = useState(null)
//   const [loadingPhrase, setLoadingPhrase] = useState(true)
//   const [recording, setRecording] = useState(false)
//   const [audioBlob, setAudioBlob] = useState(null)
//   const [audioUrl, setAudioUrl] = useState(null)
//   const [duration, setDuration] = useState(0)
//   const [timer, setTimer] = useState(0)
//   const [uploading, setUploading] = useState(false)
//   const [submitted, setSubmitted] = useState(false)
//   const [error, setError] = useState('')
//   const [dialecte, setDialecte] = useState('shingazidja')
//   const [myRecordings, setMyRecordings] = useState([])
//   const [showHistory, setShowHistory] = useState(false)
//   const [meta, setMeta] = useState({
//     genre: '',
//     trancheAge: '',
//     zone: 'urbain',
//     ile: 'grande_comore',
//     nativeSpeaker: true,
//   })

//   const mediaRecorderRef = useRef(null)
//   const chunksRef = useRef([])
//   const timerRef = useRef(null)
//   const audioRef = useRef(null)

//   useEffect(() => {
//     fetchPhrase()
//     fetchMyRecordings()
//   }, [dialecte])

//   // ── Charger phrase ──────────────────────────────
//   const fetchPhrase = async () => {
//     setLoadingPhrase(true)
//     setAudioBlob(null)
//     setAudioUrl(null)
//     setError('')
//     try {
//       const res = await fetch(`/api/voice/phrases?dialecte=${dialecte}`)
//       const data = await res.json()
//       setPhrase(data.phrase || null)
//     } catch (e) {
//       console.error(e)
//     } finally {
//       setLoadingPhrase(false)
//     }
//   }

//   // ── Charger mes contributions ───────────────────
//   const fetchMyRecordings = async () => {
//     try {
//       const res = await fetch('/api/voice/recordings')
//       const data = await res.json()
//       setMyRecordings(data.recordings || [])
//     } catch (e) {
//       console.error(e)
//     }
//   }

//   // ── Enregistrement ──────────────────────────────
//   const startRecording = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
//       const mediaRecorder = new MediaRecorder(stream, {
//         mimeType: 'audio/webm',
//       })
//       mediaRecorderRef.current = mediaRecorder
//       chunksRef.current = []

//       mediaRecorder.ondataavailable = (e) => {
//         if (e.data.size > 0) chunksRef.current.push(e.data)
//       }

//       mediaRecorder.onstop = () => {
//         const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
//         setAudioBlob(blob)
//         setAudioUrl(URL.createObjectURL(blob))
//         setDuration(timer)
//         stream.getTracks().forEach((t) => t.stop())
//       }

//       mediaRecorder.start()
//       setRecording(true)
//       setTimer(0)

//       timerRef.current = setInterval(() => {
//         setTimer((t) => {
//           if (t >= 30) {
//             stopRecording()
//             return t
//           }
//           return t + 1
//         })
//       }, 1000)
//     } catch (err) {
//       setError("Impossible d'accéder au microphone. Vérifiez les permissions.")
//     }
//   }

//   const stopRecording = () => {
//     if (mediaRecorderRef.current && recording) {
//       mediaRecorderRef.current.stop()
//       setRecording(false)
//       clearInterval(timerRef.current)
//     }
//   }

//   const resetRecording = () => {
//     setAudioBlob(null)
//     setAudioUrl(null)
//     setDuration(0)
//     setTimer(0)
//     setError('')
//   }

//   // ── Soumettre ───────────────────────────────────
//   const handleSubmit = async () => {
//     if (!audioBlob || !phrase) return
//     setUploading(true)
//     setError('')

//     try {
//       const formData = new FormData()
//       formData.append('file', audioBlob, 'recording.webm')

//       const uploadRes = await fetch('/api/admin/upload/audio', {
//         method: 'POST',
//         body: formData,
//       })
//       if (!uploadRes.ok) throw new Error('Upload audio échoué')
//       const { url, publicId, duration: dur } = await uploadRes.json()

//       const submitRes = await fetch('/api/voice/recordings', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           phraseId: phrase.id,
//           audioUrl: url,
//           publicId,
//           duration: dur || duration,
//           dialecte,
//           genre: meta.genre || null,
//           trancheAge: meta.trancheAge || null,
//           zone: meta.zone || null,
//           ile: meta.ile || null,
//           nativeSpeaker: meta.nativeSpeaker,
//         }),
//       })

//       if (!submitRes.ok) {
//         const data = await submitRes.json()
//         throw new Error(data.message || 'Soumission échouée')
//       }

//       setSubmitted(true)
//       fetchMyRecordings()

//       setTimeout(() => {
//         setSubmitted(false)
//         resetRecording()
//         fetchPhrase()
//       }, 3000)
//     } catch (err) {
//       setError(err.message || 'Une erreur est survenue')
//     } finally {
//       setUploading(false)
//     }
//   }

//   // ✅ Supprimer un enregistrement rejeté
//   const handleDeleteRecording = async (recordingId) => {
//     if (!confirm('Supprimer cet enregistrement et pouvoir recommencer ?'))
//       return
//     try {
//       const res = await fetch(`/api/voice/recordings?id=${recordingId}`, {
//         method: 'DELETE',
//       })
//       if (res.ok) {
//         fetchMyRecordings() // ✅ nom correct
//         fetchPhrase() // ✅ la phrase redevient disponible
//       } else {
//         const data = await res.json()
//         alert(data.message)
//       }
//     } catch (e) {
//       console.error(e)
//       alert('Erreur lors de la suppression')
//     }
//   }

//   // ────────────────────────────────────────────────
//   return (
//     <div className="max-w-3xl mx-auto space-y-6">
//       {/* Header */}
//       <div>
//         <h1 className="text-2xl font-bold text-gray-900">
//           Enregistrement vocal
//         </h1>
//         <p className="text-gray-600 mt-1">
//           Lisez les phrases à voix haute pour contribuer à notre corpus vocal
//           shikomori.
//         </p>
//       </div>

//       {/* Sélecteur dialecte */}
//       <div className="bg-white rounded-xl border border-gray-200 p-4">
//         <label className="block text-sm font-medium text-gray-700 mb-3">
//           Votre dialecte
//         </label>
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
//           {dialectes.map((d) => (
//             <button
//               key={d.value}
//               onClick={() => setDialecte(d.value)}
//               className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all text-sm ${
//                 dialecte === d.value
//                   ? 'border-blue-600 bg-blue-50 text-blue-700'
//                   : 'border-gray-200 hover:border-gray-300 text-gray-700'
//               }`}
//             >
//               <span className="text-xl mb-1">{d.flag}</span>
//               <span className="font-medium">{d.label}</span>
//               <span className="text-xs text-gray-500">{d.desc}</span>
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Phrase à lire */}
//       <div className="bg-white rounded-xl border border-gray-200 p-6">
//         <div className="flex items-center justify-between mb-4">
//           <h2 className="font-semibold text-gray-900">Phrase à lire</h2>
//           <button
//             onClick={fetchPhrase}
//             className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
//           >
//             <RotateCcw className="w-4 h-4" />
//             <span>Autre phrase</span>
//           </button>
//         </div>

//         {loadingPhrase ? (
//           <div className="flex items-center justify-center py-8">
//             <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
//           </div>
//         ) : phrase ? (
//           <div>
//             <div className="bg-gray-50 rounded-xl p-6 mb-4">
//               <p className="text-2xl font-serif text-gray-900 leading-relaxed text-center">
//                 {phrase.text}
//               </p>
//               {phrase.translation && (
//                 <p className="text-sm text-gray-500 text-center mt-3 italic">
//                   {phrase.translation}
//                 </p>
//               )}
//             </div>
//             <div className="flex items-center justify-between text-sm text-gray-500">
//               <span>
//                 Dialecte : <strong>{phrase.dialecte}</strong>
//               </span>
//               <span>{phrase.recordingCount}/3 enregistrements</span>
//               <div className="flex items-center space-x-1">
//                 {Array.from({ length: 3 }).map((_, i) => (
//                   <div
//                     key={i}
//                     className={`w-2 h-2 rounded-full ${i < phrase.difficulty ? 'bg-orange-400' : 'bg-gray-200'}`}
//                   />
//                 ))}
//               </div>
//             </div>
//           </div>
//         ) : (
//           <div className="text-center py-8 text-gray-500">
//             <Volume2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
//             <p>Aucune phrase disponible pour ce dialecte.</p>
//             <p className="text-sm mt-1">
//               Revenez bientôt ou changez de dialecte.
//             </p>
//           </div>
//         )}
//       </div>

//       {/* Enregistreur */}
//       {phrase && (
//         <div className="bg-white rounded-xl border border-gray-200 p-6">
//           <h2 className="font-semibold text-gray-900 mb-6">
//             Votre enregistrement
//           </h2>

//           {submitted ? (
//             <div className="text-center py-8">
//               <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
//               <h3 className="text-xl font-bold text-gray-900 mb-2">
//                 Merci pour votre contribution !
//               </h3>
//               <p className="text-gray-600">
//                 Votre enregistrement est en attente de validation.
//               </p>
//             </div>
//           ) : (
//             <>
//               {/* Timer */}
//               {recording && (
//                 <div className="flex items-center justify-center mb-6">
//                   <div className="flex items-center space-x-3 bg-red-50 px-6 py-3 rounded-full">
//                     <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
//                     <span className="text-red-600 font-mono text-xl font-bold">
//                       {fmt(timer)}
//                     </span>
//                     <span className="text-red-400 text-sm">max 30s</span>
//                   </div>
//                 </div>
//               )}

//               {/* Bouton principal */}
//               <div className="flex justify-center mb-6">
//                 {!audioBlob ? (
//                   <button
//                     onClick={recording ? stopRecording : startRecording}
//                     className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-lg ${
//                       recording
//                         ? 'bg-red-500 hover:bg-red-600 animate-pulse'
//                         : 'bg-blue-600 hover:bg-blue-700'
//                     }`}
//                   >
//                     {recording ? (
//                       <Square className="w-10 h-10 text-white" />
//                     ) : (
//                       <Mic className="w-10 h-10 text-white" />
//                     )}
//                   </button>
//                 ) : (
//                   <div className="flex items-center space-x-4">
//                     <button
//                       onClick={resetRecording}
//                       className="w-14 h-14 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
//                       title="Recommencer"
//                     >
//                       <RotateCcw className="w-6 h-6 text-gray-700" />
//                     </button>
//                     <div className="text-center">
//                       <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
//                         <CheckCircle className="w-8 h-8 text-green-600" />
//                       </div>
//                       <p className="text-xs text-gray-500 mt-1">
//                         {fmt(duration)}
//                       </p>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               <p className="text-center text-sm text-gray-500 mb-6">
//                 {!audioBlob &&
//                   !recording &&
//                   "Cliquez pour démarrer l'enregistrement"}
//                 {recording && 'Cliquez pour arrêter'}
//                 {audioBlob && 'Enregistrement prêt — réécouter ou soumettre'}
//               </p>

//               {/* Lecteur audio */}
//               {audioUrl && (
//                 <div className="bg-gray-50 rounded-xl p-4 mb-6">
//                   <p className="text-sm font-medium text-gray-700 mb-3 flex items-center space-x-2">
//                     <Play className="w-4 h-4" />
//                     <span>Réécouter votre enregistrement</span>
//                   </p>
//                   <audio
//                     ref={audioRef}
//                     src={audioUrl}
//                     controls
//                     className="w-full"
//                   />
//                 </div>
//               )}

//               {/* Erreur */}
//               {error && (
//                 <div className="flex items-start space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
//                   <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
//                   <p className="text-sm text-red-800">{error}</p>
//                 </div>
//               )}

//               {/* Bouton soumettre */}
//               {audioBlob && (
//                 <button
//                   onClick={handleSubmit}
//                   disabled={uploading}
//                   className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
//                 >
//                   {uploading ? (
//                     <>
//                       <Loader2 className="w-5 h-5 animate-spin" />
//                       <span>Upload en cours...</span>
//                     </>
//                   ) : (
//                     <>
//                       <Upload className="w-5 h-5" />
//                       <span>Soumettre l'enregistrement</span>
//                     </>
//                   )}
//                 </button>
//               )}
//             </>
//           )}
//         </div>
//       )}

//       {/* Métadonnées */}
//       {phrase && (
//         <div className="bg-white rounded-xl border border-gray-200 p-6">
//           <h2 className="font-semibold text-gray-900 mb-4">Vos informations</h2>
//           <p className="text-sm text-gray-500 mb-4">
//             Ces informations enrichissent le corpus et sont anonymisées.
//           </p>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Genre
//               </label>
//               <select
//                 value={meta.genre}
//                 onChange={(e) => setMeta({ ...meta, genre: e.target.value })}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="">Non renseigné</option>
//                 <option value="homme">Homme</option>
//                 <option value="femme">Femme</option>
//                 <option value="autre">Autre</option>
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Tranche d'âge
//               </label>
//               <select
//                 value={meta.trancheAge}
//                 onChange={(e) =>
//                   setMeta({ ...meta, trancheAge: e.target.value })
//                 }
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="">Non renseigné</option>
//                 {tranchesAge.map((t) => (
//                   <option key={t.value} value={t.value}>
//                     {t.label}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Île d'origine
//               </label>
//               <select
//                 value={meta.ile}
//                 onChange={(e) => setMeta({ ...meta, ile: e.target.value })}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 {iles.map((i) => (
//                   <option key={i.value} value={i.value}>
//                     {i.label}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Zone
//               </label>
//               <select
//                 value={meta.zone}
//                 onChange={(e) => setMeta({ ...meta, zone: e.target.value })}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="urbain">Urbain</option>
//                 <option value="rural">Rural</option>
//               </select>
//             </div>
//           </div>
//           <div className="mt-4 flex items-center space-x-3">
//             <input
//               type="checkbox"
//               id="native"
//               checked={meta.nativeSpeaker}
//               onChange={(e) =>
//                 setMeta({ ...meta, nativeSpeaker: e.target.checked })
//               }
//               className="w-4 h-4 text-blue-600 rounded"
//             />
//             <label htmlFor="native" className="text-sm text-gray-700">
//               Je suis locuteur natif de ce dialecte
//             </label>
//           </div>
//         </div>
//       )}

//       {/* Mes contributions */}
//       <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
//         <button
//           onClick={() => setShowHistory(!showHistory)}
//           className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
//         >
//           <div className="flex items-center space-x-2">
//             <h2 className="font-semibold text-gray-900">Mes contributions</h2>
//             <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
//               {myRecordings.length}
//             </span>
//           </div>
//           <ChevronDown
//             className={`w-5 h-5 text-gray-400 transition-transform ${showHistory ? 'rotate-180' : ''}`}
//           />
//         </button>

//         {showHistory && (
//           <div className="border-t border-gray-200 divide-y divide-gray-100">
//             {myRecordings.length === 0 ? (
//               <p className="text-center text-gray-500 py-8 text-sm">
//                 Aucune contribution pour le moment
//               </p>
//             ) : (
//               myRecordings.map((r) => {
//                 const s = statusConfig[r.status]
//                 const Icon = s.icon
//                 return (
//                   <div key={r.id} className="px-6 py-4">
//                     <div className="flex items-center justify-between">
//                       <div className="flex-1 min-w-0">
//                         <p className="text-sm font-medium text-gray-900 line-clamp-1">
//                           {r.phrase?.text}
//                         </p>
//                         <p className="text-xs text-gray-500 mt-0.5 capitalize">
//                           {r.phrase?.dialecte} •{' '}
//                           {fmt(Math.round(r.duration || 0))}
//                         </p>
//                         {/* ✅ Raison du rejet */}
//                         {r.rejectReason && (
//                           <p className="text-xs text-red-600 mt-1 bg-red-50 px-2 py-1 rounded">
//                             ❌ Raison : {r.rejectReason}
//                           </p>
//                         )}
//                       </div>

//                       <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
//                         <span
//                           className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${s.color}`}
//                         >
//                           <Icon className="w-3 h-3" />
//                           <span>{s.label}</span>
//                         </span>

//                         {/* ✅ Bouton supprimer si rejeté */}
//                         {r.status === 'rejected' && (
//                           <button
//                             onClick={() => handleDeleteRecording(r.id)}
//                             className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
//                             title="Supprimer et recommencer"
//                           >
//                             <Trash2 className="w-4 h-4" />
//                           </button>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 )
//               })
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }
