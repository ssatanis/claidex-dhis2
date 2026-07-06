/**
 * Text sanitization for registry-sourced free text.
 *
 * Registry descriptions are plain text but can contain stray HTML entities,
 * excessive whitespace, or control characters. We render them as text (never
 * dangerouslySetInnerHTML), and additionally normalize here for clean display,
 * copy, and print output.
 */

const ENTITIES: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&nbsp;': ' ',
}

export const decodeEntities = (text: string): string =>
    text.replace(/&(amp|lt|gt|quot|#39|apos|nbsp);/g, (m) => ENTITIES[m] ?? m)

/** Collapse whitespace, strip control chars, decode common entities. */
export const cleanText = (text?: string): string => {
    if (!text) return ''
    return decodeEntities(text)
        // Strip control characters (keeping tab/newline). Intentional range.
        // eslint-disable-next-line no-control-regex
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
        .replace(/\r\n/g, '\n')
        .replace(/[ \t]+/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
}

/** Split free text into paragraphs on blank lines. */
export const toParagraphs = (text?: string): string[] => {
    const cleaned = cleanText(text)
    if (!cleaned) return []
    return cleaned
        .split(/\n{2,}/)
        .map((p) => p.replace(/\n/g, ' ').trim())
        .filter(Boolean)
}
