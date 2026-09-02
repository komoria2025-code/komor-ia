'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Hand,
  Heart,
  Minus,
  Plus,
  RotateCcw,
  Users,
} from 'lucide-react'

const initialView = { scale: 1, x: 0, y: 0 }

export default function ContributorsPage() {
  const [contributors, setContributors] = useState([])
  const [totals, setTotals] = useState({ translations: 0, recordings: 0 })
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState(initialView)
  const dragRef = useRef(null)

  useEffect(() => {
    fetch('/api/contributors')
      .then((response) => response.json())
      .then((data) => {
        setContributors(data.contributors || [])
        setTotals(data.totals || { translations: 0, recordings: 0 })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const changeZoom = (amount) => {
    setView((current) => ({
      ...current,
      scale: Math.min(2.8, Math.max(0.65, Number((current.scale + amount).toFixed(2)))),
    }))
  }

  const handleWheel = (event) => {
    event.preventDefault()
    changeZoom(event.deltaY > 0 ? -0.08 : 0.08)
  }

  const handlePointerDown = (event) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = {
      x: event.clientX,
      y: event.clientY,
      viewX: view.x,
      viewY: view.y,
    }
  }

  const handlePointerMove = (event) => {
    if (!dragRef.current) return
    const drag = dragRef.current
    setView((current) => ({
      ...current,
      x: drag.viewX + event.clientX - drag.x,
      y: drag.viewY + event.clientY - drag.y,
    }))
  }

  const handlePointerUp = () => {
    dragRef.current = null
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#e7e2d8] text-[#292824]">
      <section className="relative border-b border-[#b7afa2] bg-[#d8d0c3] px-5 pb-12 pt-14 sm:px-8 sm:pt-20">
        <div className="mx-auto max-w-6xl">
          <Link href="/about" className="mb-12 inline-flex items-center gap-2 text-sm font-medium text-[#5d594f] transition-colors hover:text-[#171715]">
            <ArrowLeft className="h-4 w-4" /> À propos de Komor-IA
          </Link>
          <div className="max-w-3xl">
            <p className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-[#806b50]"><Heart className="h-4 w-4 fill-current" /> Mémoire collective</p>
            <h1 className="font-serif text-4xl font-bold leading-tight sm:text-6xl">La plaque des bâtisseurs</h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-[#5d594f] sm:text-lg">Chaque nom gravé ici appartient à celles et ceux qui ont donné une voix aux langues comoriennes : une traduction, une phrase, un paragraphe, un article ou un enregistrement.</p>
          </div>
          <div className="mt-9 flex flex-wrap gap-x-8 gap-y-3 text-sm text-[#655f55]">
            <span className="flex items-center gap-2"><Users className="h-4 w-4" /> {contributors.length} nom{contributors.length === 1 ? '' : 's'} gravé{contributors.length === 1 ? '' : 's'}</span>
            {/* <span>{totals.translations} traduction{totals.translations === 1 ? '' : 's'}</span> */}
            <span>traduction{totals.translations === 1 ? '' : 's'}</span>
            {/* <span>{totals.recordings} enregistrement{totals.recordings === 1 ? '' : 's'}</span> */}
            <span>enregistrement{totals.recordings === 1 ? '' : 's'}</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-8 sm:py-16">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#806b50]">Archives vivantes</p><h2 className="mt-1 font-serif text-2xl font-bold">Les noms sont classés par ordre alphabétique</h2></div>
          <div className="flex items-center gap-1 rounded-lg border border-[#b7afa2] bg-[#eee9e0] p-1 shadow-sm" aria-label="Commandes de la plaque">
            <button type="button" title="Réduire" aria-label="Réduire" onClick={() => changeZoom(-0.15)} className="rounded-md p-2 hover:bg-white"><Minus className="h-4 w-4" /></button>
            <span className="min-w-14 text-center text-xs font-semibold tabular-nums">{Math.round(view.scale * 100)}%</span>
            <button type="button" title="Agrandir" aria-label="Agrandir" onClick={() => changeZoom(0.15)} className="rounded-md p-2 hover:bg-white"><Plus className="h-4 w-4" /></button>
            <button type="button" title="Réinitialiser la vue" aria-label="Réinitialiser la vue" onClick={() => setView(initialView)} className="rounded-md p-2 hover:bg-white"><RotateCcw className="h-4 w-4" /></button>
          </div>
        </div>

        <div onWheel={handleWheel} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp} className="relative h-[min(70vh,720px)] min-h-[500px] cursor-grab touch-none select-none overflow-hidden rounded-sm border-[12px] border-[#8d877c] bg-[#aaa49a] shadow-[0_24px_50px_rgba(45,41,33,0.28)] active:cursor-grabbing">
          <div className="pointer-events-none absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full bg-[#302f2b]/75 px-3 py-1.5 text-xs text-[#eee9e0] backdrop-blur-sm"><Hand className="h-3.5 w-3.5" /> Glisser pour explorer</div>
          <div className="absolute left-1/2 top-1/2 w-[min(92%,900px)] -translate-x-1/2 -translate-y-1/2 rounded-[3px] border-[3px] border-[#7e7970] p-5 shadow-[inset_0_0_0_2px_rgba(220,216,205,0.22),inset_0_0_38px_rgba(44,41,35,0.2),0_12px_20px_rgba(50,45,38,0.35)] transition-transform duration-100 sm:p-10" style={{ transform: `translate(calc(-50% + ${view.x}px), calc(-50% + ${view.y}px)) scale(${view.scale})`, backgroundColor: '#aaa59b', backgroundImage: 'radial-gradient(rgba(255,255,255,.12) 0.8px, transparent 0.8px), radial-gradient(rgba(50,45,38,.11) 0.7px, transparent 0.7px)', backgroundPosition: '0 0, 11px 13px', backgroundSize: '17px 19px, 23px 21px' }}>
            <div className="border-2 border-[#777269]/80 px-4 py-8 text-center sm:px-10 sm:py-12">
              <p className="text-[10px] font-bold uppercase tracking-[0.38em] text-[#514d46] sm:text-xs">Komor-IA · 2025 — ∞</p>
              <h3 className="mt-4 font-serif text-3xl font-bold uppercase tracking-[0.11em] text-[#4b4842] [text-shadow:1px_1px_0_#c4c0b6,-1px_-1px_1px_#5e5a53] sm:text-5xl">Merci</h3>
              <p className="mx-auto mt-3 max-w-xl font-serif text-sm italic text-[#57534c] [text-shadow:1px_1px_0_#c5c1b8] sm:text-base">À toutes les voix qui font grandir notre mémoire.</p>
              <div className="my-8 h-px bg-[#777269]/70" />
              {loading ? <p className="py-10 font-serif text-sm italic text-[#5c5851]">La plaque se prépare...</p> : contributors.length === 0 ? <p className="py-10 font-serif text-sm italic text-[#5c5851]">Les premiers noms seront bientôt gravés.</p> : <div className="grid grid-cols-1 gap-x-10 gap-y-3 text-left sm:grid-cols-2">{contributors.map((contributor) => <div key={contributor.id} className="border-b border-[#777269]/40 pb-2 font-serif text-[15px] font-bold tracking-wide text-[#514d48] [text-shadow:1px_1px_0_#c8c4bb,-0.5px_-0.5px_0_#625e56] sm:text-base">{contributor.name}</div>)}</div>}
              <div className="my-8 h-px bg-[#777269]/70" />
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5a554d]">Pour les langues · par la communauté</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}