// app/api/generer-audio/route.ts
//
// Route API Next.js qui sert de proxy entre le site et le serveur TTS
// hébergé sur Railway. Le navigateur appelle cette route (jamais Railway
// directement), ce qui évite d'exposer l'URL réelle du serveur et permet
// un contrôle supplémentaire côté site (validation, logs, etc.).

import { NextRequest, NextResponse } from "next/server";

// URL du serveur TTS -- à définir dans les variables d'environnement Vercel
// (Project Settings > Environment Variables), PAS en dur ici.
const TTS_SERVER_URL = process.env.TTS_SERVER_URL; // ex: https://shikimori-tts-production.up.railway.app

const LONGUEUR_MAX_TEXTE = 300;

export async function POST(request: NextRequest) {
  if (!TTS_SERVER_URL) {
    console.error("TTS_SERVER_URL n'est pas défini dans les variables d'environnement.");
    return NextResponse.json(
      { erreur: "Service temporairement indisponible." },
      { status: 500 }
    );
  }

  const internalSecret = process.env.TTS_INTERNAL_SECRET;
  if (!internalSecret) {
    console.error("TTS_INTERNAL_SECRET n'est pas défini.");
    return NextResponse.json(
      { erreur: "Service temporairement indisponible." },
      { status: 503 }
    );
  }

  let texte: string;
  try {
    const body = await request.json();
    texte = body.texte;
  } catch {
    return NextResponse.json({ erreur: "Corps de requête invalide." }, { status: 400 });
  }

  if (!texte || typeof texte !== "string" || texte.trim().length === 0) {
    return NextResponse.json({ erreur: "Texte manquant." }, { status: 400 });
  }

  if (texte.length > LONGUEUR_MAX_TEXTE) {
    return NextResponse.json(
      { erreur: `Texte trop long (max ${LONGUEUR_MAX_TEXTE} caractères).` },
      { status: 400 }
    );
  }

  try {
    const reponse = await fetch(`${TTS_SERVER_URL}/generer-audio`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Secret": internalSecret,
      },
      body: JSON.stringify({ texte: texte.trim() }),
      // Évite d'attendre indéfiniment si le serveur TTS ne répond pas
      signal: AbortSignal.timeout(30_000), // 30s max
    });

    if (!reponse.ok) {
      // Le serveur TTS a renvoyé une erreur (ex: limite de débit atteinte)
      const detail = await reponse.text();
      console.error("Erreur du serveur TTS:", reponse.status, detail);
      return NextResponse.json(
        { erreur: "Impossible de générer l'audio pour le moment." },
        { status: reponse.status === 429 ? 429 : 502 }
      );
    }

    const audioBuffer = await reponse.arrayBuffer();

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/wav",
        "Cache-Control": "no-store",
      },
    });
  } catch (erreur) {
    console.error("Erreur lors de l'appel au serveur TTS:", erreur);
    return NextResponse.json(
      { erreur: "Le service de génération audio ne répond pas." },
      { status: 504 }
    );
  }
}
