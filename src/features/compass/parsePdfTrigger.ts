// Compass PDF trigger parsing (ported verbatim from the Claidex app).
//
// The model ends each synthesis response with a JSON object:
//   {"__compass_pdf_trigger": true, "patient": {...}, "trials": [...], ...}
// Because that object is nested, a naive regex cannot reliably capture it. We
// scan from the marker and match balanced braces (skipping braces inside
// strings) to extract exactly one well-formed JSON object.

import type { CompassPdfData } from './compassTypes'

const MARKER = '"__compass_pdf_trigger"'

function findTriggerSpan(text: string): [number, number] | null {
    const markerIdx = text.indexOf(MARKER)
    if (markerIdx === -1) return null
    let start = markerIdx
    while (start >= 0 && text[start] !== '{') start--
    if (start < 0) return null

    let depth = 0
    let inString = false
    let escaped = false
    for (let i = start; i < text.length; i++) {
        const ch = text[i]
        if (inString) {
            if (escaped) escaped = false
            else if (ch === '\\') escaped = true
            else if (ch === '"') inString = false
            continue
        }
        if (ch === '"') inString = true
        else if (ch === '{') depth++
        else if (ch === '}') {
            depth--
            if (depth === 0) return [start, i + 1]
        }
    }
    return null
}

/** Extract and validate the PDF trigger payload from assistant text, or null. */
export function extractPdfTrigger(text: string): CompassPdfData | null {
    const span = findTriggerSpan(text)
    if (!span) return null
    try {
        const parsed = JSON.parse(
            text.slice(span[0], span[1])
        ) as Partial<CompassPdfData>
        if (
            parsed.__compass_pdf_trigger !== true ||
            !parsed.patient ||
            !Array.isArray(parsed.trials)
        ) {
            return null
        }
        return parsed as CompassPdfData
    } catch {
        return null
    }
}

/** Remove the trigger JSON block from text so it is never shown to the user. */
export function stripPdfTrigger(text: string): string {
    const span = findTriggerSpan(text)
    if (!span) return text
    return (text.slice(0, span[0]) + text.slice(span[1]))
        .replace(/```json\s*```/g, '')
        .trim()
}
