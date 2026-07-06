import { useCallback, useState } from 'react'

interface CopyState {
    copied: boolean
    copy: (text: string) => Promise<boolean>
    error: boolean
}

/** Clipboard copy with a transient "copied" flag and graceful fallback. */
export function useCopyToClipboard(resetMs = 2000): CopyState {
    const [copied, setCopied] = useState(false)
    const [error, setError] = useState(false)

    const copy = useCallback(
        async (text: string): Promise<boolean> => {
            setError(false)
            try {
                if (navigator?.clipboard?.writeText) {
                    await navigator.clipboard.writeText(text)
                } else {
                    // Fallback for older / restricted environments.
                    const el = document.createElement('textarea')
                    el.value = text
                    el.style.position = 'fixed'
                    el.style.opacity = '0'
                    document.body.appendChild(el)
                    el.select()
                    document.execCommand('copy')
                    document.body.removeChild(el)
                }
                setCopied(true)
                setTimeout(() => setCopied(false), resetMs)
                return true
            } catch {
                setError(true)
                return false
            }
        },
        [resetMs]
    )

    return { copied, copy, error }
}
