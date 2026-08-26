'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Crown, MapPin, Mic2, Sparkles, Trophy } from 'lucide-react'

export default function MastersPage() {
  const [masters, setMasters] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/masters')
      .then((response) => response.json())
      .then((data) => setMasters(data.masters || []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="min-h-screen bg-[#f7f8fa] px-4 py-10 sm:px-8 lg:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-2xl bg-[#111827] px-6 py-10 text-white shadow-xl sm:px-10">
          <div className="relative z-10 max-w-2xl"><div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-orange-300"><Crown className="h-4 w-4" /> Komor-IA</div><h1 className="mt-4 text-3xl font-bold sm:text-5xl">Maîtres du shikomori</h1><p className="mt-4 text-sm leading-6 text-slate-300 sm:text-base">Des femmes et des hommes qui donnent de leur temps pour préserver, transmettre et enrichir la langue comorienne.</p></div>
          <Sparkles className="absolute -right-4 -top-5 h-44 w-44 text-orange-400/15" />
        </div>
        {loading ? <p className="mt-10 text-gray-500">Chargement...</p> : masters.length === 0 ? <div className="mt-8 rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">Les premiers maîtres seront bientôt présentés ici.</div> : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {masters.map((master) => (
              <Link href={`/maitres/${master.slug}`} key={master.id} className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-orange-100 text-xl font-bold text-orange-700">
                    {master.image ? <img src={master.image} alt="" className="h-full w-full object-cover" /> : master.name[0]}
                  </div>
                  <div className="min-w-0"><h2 className="truncate font-semibold text-gray-900 group-hover:text-orange-700">{master.name}</h2><p className="flex items-center gap-1 text-sm text-orange-700"><Crown className="h-3.5 w-3.5" /> Maître du shikomori</p>{master.profil?.location && <p className="mt-1 flex items-center gap-1 truncate text-xs text-gray-400"><MapPin className="h-3 w-3" /> {master.profil.location}</p>}</div>
                </div>
                {master.profil?.bio && <p className="mt-4 line-clamp-3 text-sm text-gray-600">{master.profil.bio}</p>}
                <div className="mt-5 grid grid-cols-2 gap-2 border-t border-gray-100 pt-4"><div><p className="text-lg font-bold text-gray-900">{master.totalPoints}</p><p className="text-xs text-gray-500">points</p></div><div className="flex items-start gap-1"><Mic2 className="mt-1 h-4 w-4 text-blue-500" /><div><p className="text-sm font-semibold text-gray-900">{master.translations}</p><p className="text-xs text-gray-500">traductions validées</p></div></div></div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}