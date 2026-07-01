// src/app/components/gamification-widget.js
'use client'

import { useState, useEffect } from 'react'
import { Zap, Flame, ChevronRight } from 'lucide-react'

export default function GamificationWidget({ isOpen, onProfileClick }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/gamification')
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false)) // ✅ ajouter
  }, [])

  if (loading || !data || !data.level) return null
  if (!data) return null

  const { points, totalPoints, level, streak } = data

  // ── Version réduite (sidebar fermée) ──────────────────
  if (!isOpen) {
    return (
      <button
        onClick={onProfileClick}
        className="w-full flex items-center justify-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
        title={`Niveau ${level.level} — ${totalPoints} pts`}
      >
        <div className="relative">
          <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">{level.level}</span>
          </div>
          {streak > 0 && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <Flame className="w-2.5 h-2.5 text-white" />
            </div>
          )}
        </div>
      </button>
    )
  }

  // ── Version complète (sidebar ouverte) ────────────────
  return (
    <button
      onClick={onProfileClick}
      className="w-full text-left p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 hover:border-gray-300 transition-all group"
    >
      {/* Niveau + streak */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">{level.level}</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-900">{level.name}</p>
            <p className="text-xs text-gray-500">{totalPoints} pts</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          {streak > 0 && (
            <div className="flex items-center space-x-0.5 bg-red-50 px-1.5 py-0.5 rounded">
              <Flame className="w-3 h-3 text-red-500" />
              <span className="text-xs font-bold text-red-600">{streak}</span>
            </div>
          )}
          <ChevronRight className="w-3 h-3 text-gray-400 group-hover:text-gray-600" />
        </div>
      </div>

      {/* Barre de progression */}
      {level.next && (
        <div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-1.5 rounded-full transition-all"
              style={{ width: `${level.progressToNext}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {level.next.min - totalPoints} pts → {level.next.name}
          </p>
        </div>
      )}
    </button>
  )
}
