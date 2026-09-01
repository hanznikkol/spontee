import { ExplanationContext } from '../result.types'

/**
 * Deterministic explanation fallback based strictly on available vote and preference facts.
 */
export function getDeterministicExplanation(context: ExplanationContext): string {
  const { recommendation, room } = context
  const { goVotes } = recommendation
  const { participantCount, preferences } = room

  if (participantCount > 0 && goVotes === participantCount) {
    if (preferences?.category) {
      return `Everyone in your group agreed on ${recommendation.name}, making it the unanimous choice for ${preferences.category}.`
    }
    return `Everyone in your group agreed on ${recommendation.name}, making it the clear unanimous choice.`
  }

  if (goVotes > participantCount / 2) {
    if (preferences?.category) {
      return `Most of your group chose ${recommendation.name}, making it the top ${preferences.category} pick.`
    }
    return `Most of your group chose ${recommendation.name}, giving it the strongest support in your session.`
  }

  if (goVotes > 0) {
    return `Your group leaned toward ${recommendation.name}, making it the strongest choice from the places you considered.`
  }

  return 'This was the strongest choice from your group.'
}

/**
 * Validates that an explanation is concise, clean plain text without AI meta-commentary.
 */
export function validateExplanation(text: unknown): text is string {
  if (typeof text !== 'string') return false
  const trimmed = text.trim()

  // Length constraints (15 to 45 words, 15 to 250 characters)
  if (trimmed.length < 15 || trimmed.length > 250) return false

  const words = trimmed.split(/\s+/)
  if (words.length < 3 || words.length > 45) return false

  const lower = trimmed.toLowerCase()
  const forbiddenPhrases = [
    'as an ai',
    'language model',
    'algorithm',
    'llama',
    'gemma',
    'gamma',
    'i cannot',
    "i can't",
    'here is an explanation',
    "here's an explanation",
    'based on the comprehensive analysis',
    'weighted preference',
  ]

  for (const phrase of forbiddenPhrases) {
    if (lower.includes(phrase)) return false
  }

  return true
}

/**
 * Cleans quotation marks, asterisks, and excessive whitespace from model output.
 */
export function cleanExplanation(text: string): string {
  return text
    .replace(/^["'“”]+|["'“”]+$/g, '')
    .replace(/\*+/g, '')
    .replace(/^[-•*]\s*/, '')
    .trim()
}

/**
 * Calls the inference route with a safe timeout and immediate deterministic fallback on any failure.
 */
export async function fetchResultExplanation(
  context: ExplanationContext
): Promise<string> {
  const fallback = getDeterministicExplanation(context)

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000)

    const res = await fetch('/api/room/explanation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(context),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!res.ok) {
      return fallback
    }

    const data = await res.json()
    const rawText = data?.explanation

    if (rawText && typeof rawText === 'string') {
      const cleaned = cleanExplanation(rawText)
      if (validateExplanation(cleaned)) {
        return cleaned
      }
    }

    return fallback
  } catch {
    return fallback
  }
}
