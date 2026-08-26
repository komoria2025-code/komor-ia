'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ArrowLeft, Crown, ExternalLink, Flame, MapPin, Mic2, Trophy, Zap } from 'lucide-react'

export default function MasterPage({ params }) {
  const [master, setMaster] = useState(null)
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    Promise.resolve(params).then(({ id }) => fetch(`/api/masters/${id}`))
      .then((response) => { if (!response.ok) throw new Error('missing'); return response.json() })
      .then((data) => setMaster(data.master))
      .catch(() => setMissing(true))
  }, [params])

  if (missing) return <main className="p-10 text-center"><p>Maître non trouvé.</p><Link href="/maitres" className="mt-4 inline-block text-orange-600">Voir l’annuaire</Link></main>
  if (!master) return <main className="p-10 text-center text-gray-500">Chargement...</main>

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <Link href="/maitres" className="inline-flex items-center gap-2 text-sm font-medium text-orange-600"><ArrowLeft className="h-4 w-4" /> Tous les maîtres</Link>
        <section className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="h-28 bg-[#111827] sm:h-36" />
          <div className="px-6 pb-8 sm:px-10">
          <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left">
            <div className="-mt-12 flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-orange-100 text-3xl font-bold text-orange-700 shadow-md sm:-mt-12">
              {master.image ? <img src={master.image} alt="" className="h-full w-full object-cover" /> : master.name[0]}
            </div>
            <div className="mt-4 sm:ml-5 sm:mt-0"><p className="flex items-center justify-center gap-1 text-sm font-semibold uppercase tracking-wider text-orange-600 sm:justify-start"><Crown className="h-4 w-4" /> Maître du shikomori</p><h1 className="mt-1 text-3xl font-bold text-gray-900">{master.name}</h1>{master.profil?.location && <p className="mt-1 flex items-center justify-center gap-1 text-sm text-gray-500 sm:justify-start"><MapPin className="h-4 w-4" /> {master.profil.location}</p>}{master.profil?.website && <a href={master.profil.website} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm text-orange-600 hover:underline">Visiter le site <ExternalLink className="h-3.5 w-3.5" /></a>}</div>
          </div>
          {master.profil?.bio && (
            <article className="prose-custom mt-8 max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h2: ({ children }) => <h2 className="mb-3 mt-6 text-xl font-semibold text-gray-900">{children}</h2>,
                  h3: ({ children }) => <h3 className="mb-2 mt-5 text-lg font-semibold text-gray-900">{children}</h3>,
                  p: ({ children }) => <p className="mb-4 leading-7 text-gray-700">{children}</p>,
                  ul: ({ children }) => <ul className="mb-4 list-disc space-y-1 pl-5 text-gray-700">{children}</ul>,
                  ol: ({ children }) => <ol className="mb-4 list-decimal space-y-1 pl-5 text-gray-700">{children}</ol>,
                  a: ({ children, href }) => <a href={href} target="_blank" rel="noreferrer" className="text-orange-600 underline">{children}</a>,
                }}
              >
                {master.profil.bio}
              </ReactMarkdown>
            </article>
          )}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat icon={Zap} label="Points totaux" value={master.totalPoints} />
            <Stat icon={Trophy} label="Traductions validées" value={master.translations} />
            <Stat icon={Mic2} label="Contributions vocales" value={master.voiceRecordings} />
            <Stat icon={Flame} label="Points externes reconnus" value={master.externalPoints} />
          </div>
          <p className="mt-6 text-sm text-gray-500">Niveau {master.level.level} · {master.level.name} · Record de série : {master.maxStreak} jours</p>
          </div>
        </section>
      </div>
    </main>
  )
}

function Stat({ icon: Icon, label, value }) {
  return <div className="rounded-lg bg-gray-50 p-3"><Icon className="h-4 w-4 text-orange-500" /><p className="mt-2 text-xl font-bold text-gray-900">{value}</p><p className="mt-1 text-xs text-gray-500">{label}</p></div>
}