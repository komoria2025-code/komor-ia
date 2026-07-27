// src/app/models/[slug]/layout.js
export async function generateMetadata({ params }) {
  const { slug } = await params

  const res  = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/models/${slug}`)
  const data = await res.json()
  const model = data?.model

  return {
    title:       model ? `${model.name} — Komor-IA` : 'Modèle — Komor-IA',
    description: model?.description?.slice(0, 160) || 'Modèle IA développé par Komor-IA',
  }
}

export default function ModelLayout({ children }) {
  return children
}