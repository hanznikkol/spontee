/**
 * Brand Normalization & Saturation Utilities
 *
 * Provides conservative brand identity normalization for Spontee's Options Engine.
 *
 * Design goals:
 * - Recognize obvious branch/location suffixes on known chain formats.
 * - Preserve multi-word unique business names (e.g. "Casa Bella Restaurant").
 * - Never blindly take the first word as the canonical brand.
 * - No city-name dictionaries or large hardcoded brand lists.
 *
 * The output is used for diversity scoring only — it does NOT replace the
 * original place name in any user-facing context.
 */

/**
 * Normalizes a Google Place name to a conservative brand/chain key.
 *
 * Strategy (applied in order):
 * 1. Lowercase the full name.
 * 2. Remove typographic apostrophes (McDonald's → mcdonalds).
 * 3. Strip everything after a hard separator character (dash, pipe, em-dash)
 *    that typically denotes a branch location suffix.
 *    e.g. "Jollibee - SM City Lucena" → "jollibee"
 *    e.g. "Starbucks | Ayala" → "starbucks"
 * 4. Strip trailing branch/location tokens that commonly appear without separators.
 *    e.g. "Jollibee Branch 3" → "jollibee"
 *    e.g. "McDonald's Mall" → "mcdonalds"
 * 5. Collapse whitespace and trim.
 *
 * Conservative by design: multi-word names that don't match a separator pattern
 * are preserved in full (e.g. "Casa Bella Restaurant" stays "casa bella restaurant").
 */
export function normalizeBrand(name: string): string {
    if (!name) return "";

    return name
        .toLowerCase()
        // Remove curly/straight apostrophes so "McDonald's" → "mcdonalds"
        .replace(/[''`']/g, "")
        // Strip everything after a separator that typically marks a branch location
        // Handles: " - SM City", " | Quezon Ave", " – Branch 2", " — Main"
        .replace(/\s*[-|–—]\s*.+$/, "")
        // Strip common branch/venue-type suffixes when they appear at the end
        // with a word boundary, so we don't truncate mid-word.
        // e.g. "Jollibee Branch 3" → "jollibee", "Starbucks Mall" → "starbucks"
        .replace(/\s+\b(branch|mall|center|centre|plaza|outlet|store|shop|#\s*\d+|\d+)\b.*$/i, "")
        // Collapse whitespace and trim
        .replace(/\s+/g, " ")
        .trim();
}

/**
 * Returns a selection penalty multiplier based on how many times a brand
 * has already been selected into the final deck.
 *
 * - Count 0 → 1.00 (no penalty — first occurrence is fully preferred)
 * - Count 1 → 0.55 (strong penalty — second branch is deprioritized)
 * - Count 2 → 0.25 (very strong penalty — third branch only if no alternative)
 * - Count 3+ → 0.10 (near-block — last resort only)
 *
 * This is a SOFT signal: it shapes ordering, not eligibility.
 * Even a count-3+ brand can still appear if the candidate pool is exhausted.
 */
export function getBrandPenalty(count: number): number {
    if (count === 0) return 1.0;
    if (count === 1) return 0.55;
    if (count === 2) return 0.25;
    return 0.10;
}
