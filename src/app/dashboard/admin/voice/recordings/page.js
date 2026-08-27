'use client'

import { useState, useEffect } from 'react'
import {
  CheckCircle,
  XCircle,
  Play,
  Pause,
  User,
  Calendar,
  Clock,
  Mic,
  Users,
  FileText,
  Timer,
  MapPin,
  BarChart3,
} from 'lucide-react'

const emptyStats = {
  total: 0,
  duration: 0,
  contributors: 0,
  phrases: 0,
  nativeSpeakers: 0,
  completion: {},
  breakdowns: {},
}

const formatDuration = (seconds) => {
  if (!seconds) return '0 min'
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.round(seconds % 60)
  return `${minutes} min ${remainingSeconds}s`
}

export default function AdminVoiceRecordings() {
  const [recordings, setRecordings] = useState([])
  const [stats, setStats] = useState(emptyStats)
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('pending')
  const [playingId, setPlayingId] = useState(null)
  const [rejectModal, setRejectModal] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchRecordings()
  }, [filterStatus])

  const fetchRecordings = async () => {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/admin/voice/recordings?status=${filterStatus}`,
      )
      const data = await res.json()
      setRecordings(data.recordings || [])
      setStats(data.stats || emptyStats)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (id, action, reason = '') => {
    setSaving(true)
    try {
      await fetch(`/api/admin/voice/recordings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, rejectReason: reason }),
      })
      setRejectModal(null)
      setRejectReason('')
      fetchRecordings()
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const metaLabels = {
    homme: 'Homme',
    femme: 'Femme',
    autre: 'Autre',
    moins18: '< 18 ans',
    age18_25: '18-25',
    age26_35: '26-35',
    age36_50: '36-50',
    plus50: '> 50',
    shingazidja: 'Shingazidja',
    shindzuani: 'Shindzuani',
    shimwali: 'Shimwali',
    shimaore: 'Shimaore',
    urbain: 'Urbain',
    rural: 'Rural',
    grande_comore: 'Grande Comore',
    anjouan: 'Anjouan',
    moheli: 'Mohéli',
    mayotte: 'Mayotte',
    diaspora: 'Diaspora',
    non_renseigne: 'Non renseigné',
  }

  const renderBreakdown = (title, field, color) => {
    const items = stats.breakdowns?.[field] || []
    const max = Math.max(...items.map((item) => item.count), 1)

    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-900">{title}</h3>
        {items.length === 0 ? (
          <p className="text-sm text-gray-400">Aucune donnée</p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.value}>
                <div className="mb-1 flex justify-between gap-3 text-xs text-gray-600">
                  <span>{metaLabels[item.value] || item.value}</span>
                  <span className="font-semibold text-gray-900">{item.count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-full rounded-full ${color}`}
                    style={{ width: `${(item.count / max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Enregistrements vocaux
        </h1>
        <p className="text-gray-600 mt-1">
          {recordings.length} enregistrement(s)
        </p>
      </div>

      {/* Statistiques de la sélection courante */}
      <section className="mb-6">
        <div className="mb-3 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            Statistiques des contributions
          </h2>
        </div>
        <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
          {[
            { label: 'Enregistrements', value: stats.total, icon: Mic },
            { label: 'Contributeurs', value: stats.contributors, icon: Users },
            { label: 'Phrases couvertes', value: stats.phrases, icon: FileText },
            { label: 'Durée cumulée', value: formatDuration(stats.duration), icon: Timer },
            {
              label: 'Locuteurs natifs',
              value: `${stats.nativeSpeakers}/${stats.total}`,
              icon: Users,
            },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-xl border border-gray-200 bg-white p-4">
              <Icon className="mb-2 h-5 w-5 text-blue-600" />
              <p className="text-xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>
        <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4">
          <div className="mb-2 flex justify-between text-sm">
            <span className="font-medium text-gray-700">Métadonnées renseignées</span>
            <span className="text-gray-500">
              {stats.total
                ? `${Math.round(((stats.completion?.trancheAge || 0) / stats.total) * 100)} % pour l’âge`
                : 'Aucune contribution'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs text-gray-600 md:grid-cols-4">
            {[
              ['Âge', stats.completion?.trancheAge],
              ['Genre', stats.completion?.genre],
              ['Île', stats.completion?.ile],
              ['Zone', stats.completion?.zone],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded bg-gray-50 px-3 py-2">
                <span>{label}</span>
                <strong className="text-gray-900">{value || 0}/{stats.total}</strong>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          {renderBreakdown('Âges', 'trancheAge', 'bg-purple-500')}
          {renderBreakdown('Genres', 'genre', 'bg-blue-500')}
          {renderBreakdown('Îles', 'ile', 'bg-green-500')}
          {renderBreakdown('Zones', 'zone', 'bg-orange-500')}
          {renderBreakdown('Dialectes', 'dialecte', 'bg-yellow-500')}
        </div>
      </section>

      {/* Filtres */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex gap-3">
        {[
          { value: 'pending', label: '⏳ En attente' },
          { value: 'validated', label: '✅ Validés' },
          { value: 'rejected', label: '❌ Rejetés' },
          { value: 'all', label: '📋 Tous' },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilterStatus(opt.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === opt.value
                ? 'bg-blue-600 text-white'
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
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : recordings.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Mic className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Aucun enregistrement</p>
        </div>
      ) : (
        <div className="space-y-4">
          {recordings.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-xl border border-gray-200 p-6"
            >
              {/* Phrase */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="font-serif text-lg text-gray-900">
                  {r.phrase?.text}
                </p>
                <p className="text-xs text-gray-500 mt-1 capitalize">
                  {r.phrase?.dialecte}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Infos contributeur */}
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>{r.user?.name || r.user?.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(r.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>{r.duration?.toFixed(1)}s</span>
                  </div>
                </div>

                {/* Métadonnées */}
                <div className="flex flex-wrap gap-2">
                  {r.genre && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {metaLabels[r.genre]}
                    </span>
                  )}
                  {r.trancheAge && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                      {metaLabels[r.trancheAge]}
                    </span>
                  )}
                  {r.ile && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      {metaLabels[r.ile]}
                    </span>
                  )}
                  {r.zone && (
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                      {metaLabels[r.zone]}
                    </span>
                  )}
                  {r.nativeSpeaker && (
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                      Natif
                    </span>
                  )}
                </div>
              </div>

              {/* Audio */}
              <audio src={r.audioUrl} controls className="w-full mb-4" />

              {/* Actions */}
              {r.status === 'pending' && (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleAction(r.id, 'validate')}
                    disabled={saving}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Valider</span>
                  </button>
                  <button
                    onClick={() => setRejectModal(r.id)}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Rejeter</span>
                  </button>
                </div>
              )}

              {r.status === 'rejected' && r.rejectReason && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                  Raison : {r.rejectReason}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal rejet */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Raison du rejet
            </h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              placeholder="Qualité insuffisante, bruit de fond, mauvaise prononciation..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none mb-4"
            />
            <div className="flex space-x-3">
              <button
                onClick={() =>
                  handleAction(rejectModal, 'reject', rejectReason)
                }
                disabled={saving || !rejectReason.trim()}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
              >
                {saving ? 'Rejet...' : 'Confirmer le rejet'}
              </button>
              <button
                onClick={() => {
                  setRejectModal(null)
                  setRejectReason('')
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
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
