// src/app/api/v1/tts/api/route.js
// Route pour développeurs — authentification par clé API, pas de limite quotidienne
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

const TTS_MAX_CHARS = 300

export async function POST(req) {
  const start = Date.now()
  let stage = 'authentification'

  try {
    // ── Vérifier la clé API ──────────────────────────────
    const apiKeyHeader = req.headers.get('x-api-key') || req.headers.get('authorization')?.replace('Bearer ', '')

    if (!apiKeyHeader) {
      return NextResponse.json(
        { erreur: 'Clé API manquante. Ajoutez X-Api-Key dans vos headers.' },
        { status: 401 }
      )
    }

    stage = 'lecture de la clé API'
    const apiKey = await prisma.apiKey.findUnique({
      where:   { key: apiKeyHeader },
      include: { user: true, modele: true },
    })

    if (!apiKey || !apiKey.isActive) {
      return NextResponse.json(
        { erreur: 'Clé API invalide ou désactivée.' },
        { status: 401 }
      )
    }

    // Vérifier expiration
    if (apiKey.expiresAt && new Date() > apiKey.expiresAt) {
      return NextResponse.json(
        { erreur: 'Clé API expirée.' },
        { status: 401 }
      )
    }

    // Vérifier rate limit de la clé
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    stage = 'vérification du quota'
    const dailyUsage = await prisma.usageLog.count({
      where: {
        apiKeyId:  apiKey.id,
        createdAt: { gte: today },
        statusCode: { lt: 400 },
      },
    })

    if (dailyUsage >= apiKey.rateLimit) {
      return NextResponse.json(
        { erreur: `Limite de requêtes atteinte (${apiKey.rateLimit}/jour).` },
        { status: 429 }
      )
    }

    // ── Valider le texte ─────────────────────────────────
    stage = 'lecture du corps de la requête'
    const body  = await req.json()
    const { texte } = body

    if (!texte || typeof texte !== 'string' || texte.trim().length === 0) {
      return NextResponse.json({ erreur: 'Texte manquant.' }, { status: 400 })
    }
    if (texte.length > TTS_MAX_CHARS) {
      return NextResponse.json(
        { erreur: `Texte trop long (max ${TTS_MAX_CHARS} caractères).` },
        { status: 400 }
      )
    }

    // ── Appeler le service TTS ──────────────────────────
    const ttsUrl =
      process.env.TTS_SERVER_URL ||
      'https://shikimori-tts-production.up.railway.app'
    const internalSecret = process.env.TTS_INTERNAL_SECRET
    if (!internalSecret) {
      console.error('TTS_INTERNAL_SECRET n\'est pas configuré.')
      return NextResponse.json(
        { erreur: 'Service temporairement indisponible.' },
        { status: 503 },
      )
    }
    stage = 'appel du service TTS'
    const ttsRes = await fetch(`${ttsUrl}/generer-audio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Secret': internalSecret,
      },
      body: JSON.stringify({ texte: texte.trim() }),
      signal: AbortSignal.timeout(60_000),
    })

    const responseTime = Date.now() - start
    const statusCode   = ttsRes.ok ? 200 : ttsRes.status

    // ── Logger + mettre à jour lastUsed ─────────────────
    stage = 'enregistrement de l’utilisation'
    await Promise.all([
      prisma.usageLog.create({
        data: {
          userId:       apiKey.userId,
          apiKeyId:     apiKey.id,
          endpoint:     '/api/v1/tts/api',
          method:       'POST',
          statusCode,
          responseTime,
          metadata:     { chars: texte.trim().length, source: 'api_key' },
        },
      }),
      prisma.apiKey.update({
        where: { id: apiKey.id },
        data:  { lastUsed: new Date() },
      }),
    ])

    if (!ttsRes.ok) {
      return NextResponse.json(
        { erreur: 'Impossible de générer l\'audio pour le moment.' },
        { status: 502 }
      )
    }

    const audioBuffer = await ttsRes.arrayBuffer()

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type':          'audio/wav',
        'Cache-Control':         'no-store',
        'X-RateLimit-Limit':     String(apiKey.rateLimit),
        'X-RateLimit-Remaining': String(apiKey.rateLimit - dailyUsage - 1),
      },
    })
  } catch (error) {
    console.error('Erreur TTS API:', {
      stage,
      name: error instanceof Error ? error.name : 'UnknownError',
      message: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json(
      { erreur: 'Service temporairement indisponible.' },
      { status: 503 }
    )
  }
}