// src/app/api/v1/tts/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'  
import prisma from '@/lib/prisma'

const TTS_MAX_CHARS = 300

// ✅ Limites quotidiennes par rôle
const LIMITS_BY_ROLE = {
  admin:       Infinity,
  developer:   50,
  linguiste:   30,
  translator:  20,
  journaliste: 10,
  user:        3,
  anonymous:   3, // non connecté → par IP
}

function getClientIp(req) {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return req.headers.get('x-real-ip') || 'unknown'
}

// ── GET — quota restant ────────────────────────────────
export async function GET(req) {
  const session = await getServerSession(authOptions)
  const role    = session?.user?.role || 'anonymous'
  const limit   = LIMITS_BY_ROLE[role] ?? 3

  if (limit === Infinity) {
    return NextResponse.json({
      limit:     'unlimited',
      used:      0,
      remaining: 'unlimited',
      role,
    })
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const whereClause = session?.user?.id
    ? { endpoint: '/api/v1/tts', userId: parseInt(session.user.id), createdAt: { gte: today }, statusCode: { lt: 400 } }
    : { endpoint: '/api/v1/tts', ipAddress: getClientIp(req),       createdAt: { gte: today }, statusCode: { lt: 400 } }

  const used = await prisma.usageLog.count({ where: whereClause })

  return NextResponse.json({
    limit,
    used,
    remaining: Math.max(0, limit - used),
    role,
    resetAt: new Date(today.getTime() + 86400000).toISOString(),
  })
}

// ── POST — générer l'audio ────────────────────────────
export async function POST(req) {
  const start   = Date.now()
  const session = await getServerSession(authOptions)
  const ip      = getClientIp(req)

  const role  = session?.user?.role || 'anonymous'
  const limit = LIMITS_BY_ROLE[role] ?? 3

  // ── Vérifier la limite (sauf admin) ─────────────────
  let usageCount = 0
  if (limit !== Infinity) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const whereClause = session?.user?.id
      ? { endpoint: '/api/v1/tts', userId: parseInt(session.user.id), createdAt: { gte: today }, statusCode: { lt: 400 } }
      : { endpoint: '/api/v1/tts', ipAddress: ip,                      createdAt: { gte: today }, statusCode: { lt: 400 } }

    usageCount = await prisma.usageLog.count({ where: whereClause })

    if (usageCount >= limit) {
      return NextResponse.json(
        {
          erreur:    `Limite quotidienne atteinte (${limit} essais/jour).`,
          limit,
          used:      usageCount,
          remaining: 0,
          role,
        },
        { status: 429 }
      )
    }
  }

  // ── Valider le texte ─────────────────────────────────
  let texte
  try {
    const body = await req.json()
    texte = body.texte
  } catch {
    return NextResponse.json({ erreur: 'Corps de requête invalide.' }, { status: 400 })
  }

  if (!texte || typeof texte !== 'string' || texte.trim().length === 0) {
    return NextResponse.json({ erreur: 'Texte manquant.' }, { status: 400 })
  }
  if (texte.length > TTS_MAX_CHARS) {
    return NextResponse.json(
      { erreur: `Texte trop long (max ${TTS_MAX_CHARS} caractères).` },
      { status: 400 }
    )
  }

  // ── Appeler Railway ──────────────────────────────────
  const TTS_URL = process.env.TTS_SERVER_URL || 'https://shikimori-tts-production.up.railway.app'

  let ttsRes
  try {
    ttsRes = await fetch(`${TTS_URL}/generer-audio`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ texte: texte.trim() }),
      signal:  AbortSignal.timeout(35_000),
    })
  } catch (error) {
    console.error('Erreur Railway:', error)
    return NextResponse.json(
      { erreur: 'Le service de synthèse vocale ne répond pas.' },
      { status: 504 }
    )
  }

  const responseTime = Date.now() - start
  const statusCode   = ttsRes.ok ? 200 : ttsRes.status

  // ── Logger ───────────────────────────────────────────
  await prisma.usageLog.create({
    data: {
      endpoint:     '/api/v1/tts',
      method:       'POST',
      statusCode,
      responseTime,
      userId:       session?.user?.id ? parseInt(session.user.id) : null,
      ipAddress:    ip,
      metadata:     { chars: texte.trim().length, role, source: 'public' },
    },
  })

  if (!ttsRes.ok) {
    const errBody = await ttsRes.text()
    console.error('Erreur Railway:', statusCode, errBody)
    return NextResponse.json(
      { erreur: 'Impossible de générer l\'audio pour le moment.' },
      { status: ttsRes.status === 429 ? 429 : 502 }
    )
  }

  const audioBuffer = await ttsRes.arrayBuffer()

  return new NextResponse(audioBuffer, {
    status: 200,
    headers: {
      'Content-Type':          'audio/wav',
      'Cache-Control':         'no-store',
      'X-RateLimit-Limit':     limit === Infinity ? 'unlimited' : String(limit),
      'X-RateLimit-Remaining': limit === Infinity ? 'unlimited' : String(Math.max(0, limit - usageCount - 1)),
      'X-RateLimit-Role':      role,
    },
  })
}