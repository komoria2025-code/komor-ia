// src/app/components/tts-demo.js
'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
  Volume2, Loader2, Download, AlertCircle,
  Info, Code2,
} from 'lucide-react'

const EXAMPLES = [
  'Mdzadzahangu ye unandza hakuu.',
  'Esirikali ngaitaârishao mpango wa nyumeni wa uwana ne le ɓange.',
  'Rongoa hakuu.',
  'mɓaɓa wahangu hanika 12250 KMF djana 8h.',
  'Omsihiri wakariɓu nguo nɗahu ?',
  'Etwaɓiɓu ye ucandja owana watiti haina mfumo.',
]

export default function TTSDemo() {
  const { data: session } = useSession()
  const [texte,    setTexte]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [audioUrl, setAudioUrl] = useState(null)
  const [error,    setError]    = useState('')
  const [quota,    setQuota]    = useState(null)
  const audioRef = useRef(null)

  useEffect(() => {
    fetch('/api/v1/tts')
      .then(r => r.json())
      .then(setQuota)
      .catch(() => {})
  }, [])

  const handleGenerate = async () => {
    if (!texte.trim()) return
    setLoading(true)
    setError('')
    setAudioUrl(null)

    try {
      const res = await fetch('/api/v1/tts', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ texte: texte.trim() }),
      })

      if (res.status === 429) {
        const data = await res.json()
        setError(`Limite quotidienne atteinte (${data.limit} essais/jour). Revenez demain ou créez un compte développeur.`)
        setQuota(prev => ({ ...prev, remaining: 0, used: data.limit }))
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

      // Rafraîchir quota
      fetch('/api/v1/tts').then(r => r.json()).then(setQuota).catch(() => {})

      setTimeout(() => audioRef.current?.play(), 100)
    } catch (e) {
      setError('Service temporairement indisponible.')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (!audioUrl) return
    const a = document.createElement('a')
    a.href     = audioUrl
    a.download = `komori-tts-${Date.now()}.wav`
    a.click()
  }

  const remaining = quota?.remaining ?? 3
  const used      = quota?.used      ?? 0
  const limit     = quota?.limit     ?? 3

  return (
    <div className="mt-10 border-t border-gray-100 pt-10">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Démo interactive
      </h2>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-4">

          {/* Avertissement beta */}
          <div className="flex items-start space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <Info className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-800 leading-relaxed">
              <strong>Version bêta</strong> — La qualité varie selon les phrases.
              Les mots rares dans le corpus peuvent sonner moins naturellement.
            </p>
          </div>

          {/* Saisie */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Texte en shikomori
              <span className="text-gray-400 font-normal ml-2">({texte.length}/100)</span>
            </label>

            <textarea
              value={texte}
              onChange={e => setTexte(e.target.value.slice(0, 100))}
              placeholder="Entrez du texte en shikomori (shingazidja)..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none font-serif"
            />

            {/* Exemples */}
            <div className="mt-3">
              <p className="text-xs text-gray-400 mb-2">Exemples :</p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLES.map((ex, i) => (
                  <button key={i} onClick={() => setTexte(ex)}
                    className="text-xs px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 text-left">
                    {ex}
                  </button>
                ))}
              </div>
            </div>

            {/* Erreur */}
            {error && (
              <div className="flex items-start space-x-2 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Bouton */}
            <button
              onClick={handleGenerate}
              disabled={loading || !texte.trim() || remaining === 0}
              className="mt-4 w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /><span>Génération en cours...</span></>
              ) : (
                <><Volume2 className="w-4 h-4" /><span>Générer l'audio</span></>
              )}
            </button>

            {remaining === 0 && !loading && (
              <p className="text-center text-xs text-gray-500 mt-2">
                Limite atteinte —{' '}
                <Link href="/signup" className="text-blue-600 hover:underline font-medium">
                  créez un compte développeur
                </Link>{' '}
                pour un accès illimité
              </p>
            )}
          </div>

          {/* Lecteur audio */}
          {audioUrl && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                  <Volume2 className="w-4 h-4 text-green-600" />
                  <span>Audio généré</span>
                </h3>
                <button onClick={handleDownload}
                  className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <Download className="w-3 h-3" />
                  <span>Télécharger WAV</span>
                </button>
              </div>
              <audio ref={audioRef} src={audioUrl} controls className="w-full" />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">

          {/* Quota */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Essais aujourd'hui
            </p>
            <div className="flex items-end space-x-1 mb-3">
              <span className="text-4xl font-bold text-gray-900">{remaining}</span>
              <span className="text-gray-400 mb-1">/ {limit}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className={`h-2 rounded-full transition-all ${remaining === 0 ? 'bg-red-400' : 'bg-gray-900'}`}
                style={{ width: `${((limit - used) / limit) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 text-center">Réinitialisé chaque jour à minuit</p>
          </div>

          {/* Accès API */}
          <div className="bg-gray-900 rounded-2xl p-5 text-white">
            <div className="flex items-center space-x-2 mb-3">
              <Code2 className="w-4 h-4" />
              <h3 className="font-semibold text-sm">Accès API</h3>
            </div>
            <div className="bg-black/30 rounded-xl p-3 mb-4 text-xs font-mono text-gray-300 overflow-x-auto">
              <p className="text-gray-500">POST /api/v1/tts/api</p>
              <p className="text-gray-500 mt-1">X-Api-Key: votre_clé</p>
              <p className="mt-2">{`{"texte": "Bariza lewo ?"}`}</p>
            </div>
            {session ? (
              <Link href="/?section=api-keys"
                className="block text-center px-4 py-2.5 bg-white text-gray-900 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors">
                Obtenir une clé API →
              </Link>
            ) : (
              <Link href="/signup"
                className="block text-center px-4 py-2.5 bg-white text-gray-900 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors">
                Créer un compte gratuit →
              </Link>
            )}
          </div>

          {/* Contribuer */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm">Améliorer le modèle</h3>
            <p className="text-xs text-gray-600 mb-3 leading-relaxed">
              Contribuez au corpus vocal pour améliorer la qualité du modèle.
            </p>
            <Link href="/?section=voice"
              className="block text-center px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-medium hover:bg-blue-700 transition-colors">
              Contribuer au corpus →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}