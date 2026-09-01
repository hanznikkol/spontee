import { NextRequest, NextResponse } from 'next/server'
import { ExplanationContext } from '@/lib/room/result/result.types'
import { getDeterministicExplanation, validateExplanation, cleanExplanation,} from '@/lib/room/result/service/result-explanation.service'

export async function POST(req: NextRequest) {
  try {
    const context = (await req.json()) as ExplanationContext

    if (!context?.recommendation?.name) {
      return NextResponse.json(
        { error: 'Invalid explanation context.' },
        { status: 400 }
      )
    }

    const fallback = getDeterministicExplanation(context)

    const groqApiKey = process.env.GROQ_API_KEY

    // If GROQ_API_KEY is not configured, immediately return deterministic fallback
    if (!groqApiKey) {
      return NextResponse.json({
        explanation: fallback,
        source: 'deterministic',
      })
    }

    const apiUrl = 'https://api.groq.com/openai/v1/chat/completions'
    const modelName = 'llama-3.1-8b-instant'
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${groqApiKey}`,
    }

    const systemPrompt = `You are explaining an existing recommendation for a group decision in Spontee.
      Do not calculate, modify, or question the result.
      Use ONLY the facts provided in the input. Never invent information, preferences, ratings, votes, distance, popularity, or reasons that are not present in the input.
      Do not mention algorithms, AI, models, or data processing.
      Write exactly ONE short, natural, friendly explanation sentence (15 to 30 words).
      Do not use markdown, emojis, headings, bullet points, or quotes.`

    const userPrompt = `Explain why this place won using only these facts:
      - Winning Place: "${context.recommendation.name}" (${context.recommendation.goVotes} Go votes out of ${context.room.participantCount} participants)
      ${context.room.preferences?.category ? `- Room Category: ${context.room.preferences.category}` : ''}
      ${context.room.preferences?.budget ? `- Budget: ${context.room.preferences.budget}` : ''}
      ${context.room.preferences?.location ? `- Location: ${context.room.preferences.location}` : ''}
      ${context.recommendation.rating ? `- Rating: ${context.recommendation.rating} stars` : ''}
      ${context.alternatives?.length ? `- Runner-ups: ${context.alternatives.map((a) => `${a.name} (${a.goVotes} Go)`).join(', ')}` : ''}`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 2500)

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 60,
        temperature: 0.3,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      return NextResponse.json({
        explanation: fallback,
        source: 'fallback_error',
      })
    }

    const data = await response.json()
    const generatedText = data?.choices?.[0]?.message?.content

    if (generatedText && typeof generatedText === 'string') {
      const cleaned = cleanExplanation(generatedText)
      if (validateExplanation(cleaned)) {
        return NextResponse.json({
          explanation: cleaned,
          source: 'llama_8b',
        })
      }
    }

    return NextResponse.json({
      explanation: fallback,
      source: 'fallback_invalid',
    })
  } catch {
    // Return deterministic fallback on any error or timeout
    return NextResponse.json({
      explanation: 'This was the strongest choice from your group.',
      source: 'fallback_exception',
    })
  }
}
