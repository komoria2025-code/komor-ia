import { NextResponse } from 'next/server'
import { authenticateApiRequest } from '@/lib/api-auth' 
import { logApiUsage, estimateTokens } from '@/lib/api-logger'

/**
 * Handlers disponibles par action
 * Chaque handler doit retourner { ...data, tokens }
 */
const handlers = {
  chat: handleChat,
  summarize: handleSummarize,
  translate: handleTranslate,
  classify: handleClassify,
  complete: handleComplete,
}

/**
 * POST /api/v1/[action]
 * Route générique qui route vers le bon handler
 */
export async function POST(req, { params }) {
  const startTime = Date.now()
  const { action } = await params

  try {
    // 1. Vérifier que l'action existe
    if (!handlers[action]) {
      return NextResponse.json(
        {
          error: `Action '${action}' non reconnue`,
          available_actions: Object.keys(handlers),
        },
        { status: 404 },
      )
    }

    // 2. Authentification
    const auth = await authenticateApiRequest(req)

    if (!auth.valid) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const { user, apiKey, modele } = auth

    // 3. Parser le body
    const body = await req.json()

    // 4. Exécuter le handler correspondant
    const result = await handlers[action](body, modele, user)

    // 5. Extraire les tokens du résultat
    const tokens = result.tokens || 0
    const { tokens: _, ...responseData } = result

    // 6. Logger l'utilisation (asynchrone)
    logApiUsage({
      userId: user.id,
      apiKeyId: apiKey.id,
      modeleId: modele?.id || apiKey.modeleId,
      endpoint: `/api/v1/${action}`,
      method: 'POST',
      statusCode: 200,
      responseTime: Date.now() - startTime,
      tokens,
      metadata: {
        action,
        model: modele?.slug || 'default',
        responseTime: Date.now() - startTime,
      },
    }).catch((err) => console.error('Erreur logging:', err))

    // 7. Retourner la réponse
    return NextResponse.json({
      success: true,
      ...responseData,
      usage: {
        total_tokens: tokens,
        model: modele?.name || 'Default Model',
      },
    })
  } catch (error) {
    console.error(`Erreur API /v1/${action}:`, error)

    // Logger les erreurs aussi
    if (auth?.valid) {
      logApiUsage({
        userId: auth.user.id,
        apiKeyId: auth.apiKey.id,
        modeleId: auth.modele?.id || auth.apiKey.modeleId,
        endpoint: `/api/v1/${action}`,
        method: 'POST',
        statusCode: 500,
        responseTime: Date.now() - startTime,
        tokens: 0,
        metadata: { error: error.message },
      }).catch((err) => console.error('Erreur logging:', err))
    }

    return NextResponse.json(
      {
        error: error.message || 'Erreur serveur',
        action,
      },
      { status: error.status || 500 },
    )
  }
}

/**
 * GET /api/v1/[action]
 * Retourne les infos sur l'action
 */
export async function GET(req, { params }) {
  //   const { action } = params
  const startTime = Date.now()
  const { action } = await params

  if (!handlers[action]) {
    return NextResponse.json(
      {
        error: `Action '${action}' non trouvée`,
        available_actions: Object.keys(handlers),
      },
      { status: 404 },
    )
  }

  // Infos sur chaque endpoint
  const endpointInfo = {
    chat: {
      description: 'Chat conversationnel avec Wazir',
      method: 'POST',
      parameters: {
        prompt: {
          type: 'string',
          required: true,
          description: 'Votre message',
        },
        max_tokens: {
          type: 'integer',
          required: false,
          default: 1000,
          description: 'Nombre max de tokens',
        },
      },
      example: {
        prompt: 'Bonjour, comment ça va ?',
        max_tokens: 500,
      },
    },
    summarize: {
      description: 'Résumé automatique de texte avec Press-AI',
      method: 'POST',
      parameters: {
        text: {
          type: 'string',
          required: true,
          description: 'Texte à résumer',
        },
        max_length: {
          type: 'integer',
          required: false,
          default: 500,
          description: 'Longueur max du résumé',
        },
      },
      example: {
        text: 'Un long article de presse...',
        max_length: 200,
      },
    },
    translate: {
      description: 'Traduction de texte',
      method: 'POST',
      parameters: {
        text: {
          type: 'string',
          required: true,
          description: 'Texte à traduire',
        },
        source_lang: {
          type: 'string',
          required: false,
          default: 'fr',
          description: 'Langue source',
        },
        target_lang: {
          type: 'string',
          required: false,
          default: 'zdj',
          description: 'Langue cible',
        },
      },
      example: {
        text: 'Bonjour le monde',
        source_lang: 'fr',
        target_lang: 'zdj',
      },
    },
    classify: {
      description: 'Classification de texte par catégorie',
      method: 'POST',
      parameters: {
        text: {
          type: 'string',
          required: true,
          description: 'Texte à classifier',
        },
        categories: {
          type: 'array',
          required: false,
          description: 'Liste des catégories possibles',
        },
      },
      example: {
        text: 'Le président a annoncé...',
        categories: ['news', 'politics', 'sports'],
      },
    },
    complete: {
      description: 'Complétion de texte',
      method: 'POST',
      parameters: {
        prompt: {
          type: 'string',
          required: true,
          description: 'Début du texte',
        },
        max_tokens: {
          type: 'integer',
          required: false,
          default: 500,
          description: 'Tokens max à générer',
        },
      },
      example: {
        prompt: 'Il était une fois...',
        max_tokens: 300,
      },
    },
  }

  return NextResponse.json({
    action,
    endpoint: `/api/v1/${action}`,
    ...endpointInfo[action],
  })
}

// ============================================
// HANDLERS PAR ACTION
// ============================================

/**
 * Handler: Chat conversationnel
 */
async function handleChat(params, modele, user) {
  const { prompt, max_tokens = 1000 } = params

  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    const error = new Error(
      'Le paramètre "prompt" est requis et ne peut pas être vide',
    )
    error.status = 400
    throw error
  }

  // TODO: Remplacer par appel à votre vrai modèle
  // Exemple avec OpenAI/Mistral/etc:
  // const completion = await openai.chat.completions.create({...})

  // Simulation pour l'instant
  await new Promise((resolve) => setTimeout(resolve, 500))

  const response = `Je suis ${modele?.name || 'Wazir'}, votre assistant IA. Vous avez dit: "${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}". Comment puis-je vous aider ?`

  const promptTokens = estimateTokens(prompt)
  const completionTokens = estimateTokens(response)
  const totalTokens = promptTokens + completionTokens

  return {
    response,
    tokens: totalTokens,
    details: {
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
    },
  }
}

/**
 * Handler: Résumé de texte
 */
async function handleSummarize(params, modele, user) {
  const { text, max_length = 500 } = params

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    const error = new Error(
      'Le paramètre "text" est requis et ne peut pas être vide',
    )
    error.status = 400
    throw error
  }

  if (text.length < 100) {
    const error = new Error(
      'Le texte doit contenir au moins 100 caractères pour être résumé',
    )
    error.status = 400
    throw error
  }

  // TODO: Appeler votre modèle de résumé
  await new Promise((resolve) => setTimeout(resolve, 300))

  // Simulation simple
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0)
  const summary =
    sentences.slice(0, Math.min(3, sentences.length)).join('. ') + '.'

  const inputTokens = estimateTokens(text)
  const outputTokens = estimateTokens(summary)
  const totalTokens = inputTokens + outputTokens

  return {
    summary,
    original_length: text.length,
    summary_length: summary.length,
    compression_ratio: (summary.length / text.length).toFixed(2),
    tokens: totalTokens,
  }
}

/**
 * Handler: Traduction
 */
async function handleTranslate(params, modele, user) {
  const { text, source_lang = 'fr', target_lang = 'zdj' } = params

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    const error = new Error(
      'Le paramètre "text" est requis et ne peut pas être vide',
    )
    error.status = 400
    throw error
  }

  const supportedLangs = ['fr', 'en', 'ar', 'sw', 'zdj']
  if (
    !supportedLangs.includes(source_lang) ||
    !supportedLangs.includes(target_lang)
  ) {
    const error = new Error(`Langues supportées: ${supportedLangs.join(', ')}`)
    error.status = 400
    throw error
  }

  // TODO: Appeler votre modèle de traduction
  await new Promise((resolve) => setTimeout(resolve, 400))

  // Simulation
  const translation = `[Traduction ${source_lang} → ${target_lang}] ${text}`

  const inputTokens = estimateTokens(text)
  const outputTokens = estimateTokens(translation)
  const totalTokens = inputTokens + outputTokens

  return {
    translation,
    source_lang,
    target_lang,
    detected_lang: source_lang,
    confidence: 0.95,
    tokens: totalTokens,
  }
}

/**
 * Handler: Classification de texte
 */
async function handleClassify(params, modele, user) {
  const {
    text,
    categories = [
      'news',
      'literature',
      'education',
      'science',
      'culture',
      'other',
    ],
  } = params

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    const error = new Error(
      'Le paramètre "text" est requis et ne peut pas être vide',
    )
    error.status = 400
    throw error
  }

  // TODO: Appeler votre modèle de classification
  await new Promise((resolve) => setTimeout(resolve, 200))

  // Simulation simple basée sur des mots-clés
  let category = 'other'
  let confidence = 0.5

  const lowerText = text.toLowerCase()
  if (lowerText.includes('président') || lowerText.includes('gouvernement')) {
    category = 'news'
    confidence = 0.85
  } else if (lowerText.includes('école') || lowerText.includes('étudiant')) {
    category = 'education'
    confidence = 0.8
  } else if (
    lowerText.includes('recherche') ||
    lowerText.includes('scientifique')
  ) {
    category = 'science'
    confidence = 0.75
  }

  const tokens = estimateTokens(text)

  return {
    category,
    confidence,
    all_scores: categories.map((cat) => ({
      category: cat,
      score: cat === category ? confidence : Math.random() * 0.3,
    })),
    tokens,
  }
}

/**
 * Handler: Complétion de texte
 */
async function handleComplete(params, modele, user) {
  const { prompt, max_tokens = 500, temperature = 0.7 } = params

  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    const error = new Error(
      'Le paramètre "prompt" est requis et ne peut pas être vide',
    )
    error.status = 400
    throw error
  }

  // TODO: Appeler votre modèle de complétion
  await new Promise((resolve) => setTimeout(resolve, 600))

  const completion = ` et ils vécurent heureux pour toujours. Cette histoire montre l'importance de ${prompt.includes('foi') ? 'la foi' : 'la persévérance'} dans nos vies.`

  const promptTokens = estimateTokens(prompt)
  const completionTokens = estimateTokens(completion)
  const totalTokens = promptTokens + completionTokens

  return {
    completion: prompt + completion,
    tokens: totalTokens,
    details: {
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      temperature,
    },
  }
}
