import React, { useMemo } from 'react'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { stripPdfTrigger } from './parsePdfTrigger'

marked.setOptions({ gfm: true, breaks: true })

/**
 * Renders assistant markdown safely: strips any PDF-trigger JSON, converts
 * markdown to HTML with marked, and sanitizes with DOMPurify before injecting.
 */
export const Markdown: React.FC<{ text: string }> = ({ text }) => {
    const html = useMemo(() => {
        const clean = stripPdfTrigger(text)
        const raw = marked.parse(clean, { async: false }) as string
        return DOMPurify.sanitize(raw, {
            ALLOWED_TAGS: [
                'p', 'br', 'strong', 'em', 'code', 'pre', 'ul', 'ol', 'li',
                'h1', 'h2', 'h3', 'h4', 'blockquote', 'a', 'hr', 'table',
                'thead', 'tbody', 'tr', 'th', 'td', 'span',
            ],
            ALLOWED_ATTR: ['href', 'target', 'rel'],
        })
    }, [text])

    return (
        <div
            className="cx-md"
            // Sanitized above with DOMPurify; safe to inject.
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: html }}
        />
    )
}
