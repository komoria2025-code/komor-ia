// node check-railway.js
// Tester tous les endpoints possibles sur Railway

const BASE = 'https://shikimori-tts-production.up.railway.app'
const BODY  = JSON.stringify({ text: 'Bariza lewo ?' })
const HEADERS = { 'Content-Type': 'application/json' }

async function check(method, path, body = null) {
  try {
    const opts = { method, headers: HEADERS }
    if (body) opts.body = body
    const res = await fetch(`${BASE}${path}`, opts)
    const ct  = res.headers.get('content-type') || ''
    let txt = ''
    if (ct.includes('json')) txt = JSON.stringify(await res.json())
    else txt = (await res.text()).slice(0, 200)
    const icon = res.ok ? '✅' : res.status === 404 ? '❌' : '⚠️'
    console.log(`${icon} [${res.status}] ${method} ${path}`)
    console.log(`   └─ ${txt}`)
  } catch (e) {
    console.log(`💥 [ERR] ${method} ${path} — ${e.message}`)
  }
}

async function main() {
  console.log(`\n=== TEST RAILWAY: ${BASE} ===\n`)

  // Racine
  await check('GET',  '/')
  await check('GET',  '/docs')
  await check('GET',  '/openapi.json')
  await check('GET',  '/health')

  // Endpoints TTS possibles
  await check('POST', '/tts',          BODY)
  await check('POST', '/synthesize',   BODY)
  await check('POST', '/generate',     BODY)
  await check('POST', '/api/tts',      BODY)
  await check('POST', '/api/synthesize', BODY)

  // Avec "texte" au lieu de "text"
  const BODY2 = JSON.stringify({ texte: 'Bariza lewo ?' })
  await check('POST', '/tts',        BODY2)
  await check('POST', '/synthesize', BODY2)

  console.log('\n=== FIN ===\n')
}

main()