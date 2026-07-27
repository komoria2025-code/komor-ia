// Script de vérification TTS — à lancer dans le terminal
// node check-tts.js

const BASE_URL = 'http://localhost:3000'

async function check(label, url, options = {}) {
  try {
    const res = await fetch(url, options)
    const contentType = res.headers.get('content-type') || ''
    let body = ''
    if (contentType.includes('application/json')) {
      body = JSON.stringify(await res.json())
    } else {
      body = `[${contentType}] ${res.headers.get('content-length') || '?'} bytes`
    }
    const icon = res.ok ? '✅' : '❌'
    console.log(`${icon} [${res.status}] ${label}`)
    console.log(`   └─ ${body.slice(0, 120)}`)
  } catch (e) {
    console.log(`❌ [ERR] ${label}`)
    console.log(`   └─ ${e.message}`)
  }
}

async function main() {
  console.log('\n=== VÉRIFICATION ROUTES TTS ===\n')

  // 1. GET quota
  await check(
    'GET /api/v1/tts (quota)',
    `${BASE_URL}/api/v1/tts`
  )

  // 2. POST /api/v1/tts (public)
  await check(
    'POST /api/v1/tts (demo publique)',
    `${BASE_URL}/api/v1/tts`,
    {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ texte: 'Bariza lewo ?' }),
    }
  )

  // 3. POST /api/generer-audio (proxy Railway)
  await check(
    'POST /api/generer-audio (proxy Railway)',
    `${BASE_URL}/api/generer-audio`,
    {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ texte: 'Bariza lewo ?' }),
    }
  )

  // 4. Tester Railway directement
  await check(
    'POST Railway direct (modèle TTS)',
    'https://shikimori-tts-production.up.railway.app/synthesize',
    {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ text: 'Bariza lewo ?' }),
    }
  )

  console.log('\n=== FIN ===\n')
}

main()