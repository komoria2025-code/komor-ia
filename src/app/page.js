'use client'

import { Suspense } from 'react'
import Dashboard from './components/dashboard-complete'

export default function Home() {
  return (
    <main className="flex min-h-screen bg-gray-50">
      <Suspense fallback={null}>
        <Dashboard />
      </Suspense>
    </main>
  )
}
