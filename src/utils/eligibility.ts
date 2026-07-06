/**
 * Parses registry eligibility text into clean blocks for display.
 *
 * Registry eligibility criteria come as a single string with backslash-escaped
 * markdown, "Inclusion Criteria" / "Exclusion Criteria" headings, and bullet
 * items separated by "* " both inline and on new lines. This turns that into
 * structured headings, lists, and paragraphs.
 */

export interface CriteriaBlock {
    type: 'heading' | 'list' | 'para'
    text?: string
    items?: string[]
}

const HEADING = /\n?\s*(Inclusion Criteria:?|Exclusion Criteria:?)\s*\n?/gi

function pushBody(blocks: CriteriaBlock[], body: string): void {
    // Strip a leading bullet marker, then split inline / newline bullets on
    // whitespace-asterisk-whitespace (so footnote markers like "doses*" stay).
    const b = body.trim().replace(/^\*\s+/, '')
    if (!b) return
    const items = b
        .split(/\s\*\s+/)
        .map((s) => s.trim())
        .filter(Boolean)
    if (items.length > 1) blocks.push({ type: 'list', items })
    else blocks.push({ type: 'para', text: b })
}

export function parseCriteria(raw?: string): CriteriaBlock[] {
    const text = (raw ?? '')
        .replace(/\\([*_~`])/g, '$1') // unescape \* \_ etc.
        .replace(/\r\n/g, '\n')
        .trim()
    if (!text) return []

    const blocks: CriteriaBlock[] = []
    const parts = text.split(HEADING)
    if (parts.length === 1) {
        pushBody(blocks, parts[0])
        return blocks
    }
    pushBody(blocks, parts[0])
    for (let i = 1; i < parts.length; i += 2) {
        blocks.push({ type: 'heading', text: parts[i].replace(/:$/, '').trim() })
        pushBody(blocks, parts[i + 1] ?? '')
    }
    return blocks
}
