import { ExplanationContext } from '../result.types'

/**
 * Deterministic explanation fallback based strictly on available vote and preference facts.
 */
export function getDeterministicExplanation(context: ExplanationContext): string {
  const { recommendation, room, winnerReason } = context
  const { goVotes } = recommendation
  const { participantCount } = room

  if (winnerReason === 'highest_rating') {
    return 'Highest-rated among your top picks.'
  }

  if (winnerReason === 'most_reviews') {
    return 'Strongest option among your top picks based on rating and reviews.'
  }

  if (winnerReason === 'stable_tiebreak') {
    return 'One of several equally strong matches.'
  }

  if (winnerReason === 'shared_go' || (participantCount > 0 && goVotes === participantCount)) {
    if (participantCount === 2) {
      return 'You both picked this.'
    }
    return `All ${participantCount} participants agreed on this pick!`
  }

  if (goVotes > 0) {
    return 'Top pick with the strongest support from your group.'
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
