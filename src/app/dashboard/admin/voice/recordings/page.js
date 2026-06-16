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
} from 'lucide-react'

export default function AdminVoiceRecordings() {
  const [recordings, setRecordings] = useState([])
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
    urbain: 'Urbain',
    rural: 'Rural',
    grande_comore: 'Grande Comore',
    anjouan: 'Anjouan',
    moheli: 'Mohéli',
    mayotte: 'Mayotte',
    diaspora: 'Diaspora',
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
