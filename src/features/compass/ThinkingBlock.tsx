import React, { useEffect, useState } from 'react'
import { Brain, ChevronRight } from './icons'

const PHASES: ReadonlyArray<{ after: number; label: string }> = [
    { after: 0, label: 'Analyzing patient profile' },
    { after: 2000, label: 'Searching ClinicalTrials.gov' },
    { after: 5000, label: 'Querying Claidex failure records' },
    { after: 10000, label: 'Calculating distances and logistics' },
]

export interface ThinkingBlockProps {
    active: boolean
    reasoning?: string
}

const Dot: React.FC<{ delay: string }> = ({ delay }) => (
    <span
        className="cx-dot"
        style={{ animationDelay: delay }}
        aria-hidden="true"
    />
)

/** "Thinking" indicator shown while the assistant works. */
export const ThinkingBlock: React.FC<ThinkingBlockProps> = ({
    active,
    reasoning,
}) => {
    const [elapsed, setElapsed] = useState(0)
    const [open, setOpen] = useState(false)

    useEffect(() => {
        if (!active) return
        const start = Date.now()
        const id = setInterval(() => setElapsed(Date.now() - start), 500)
        return () => clearInterval(id)
    }, [active])

    const phase =
        [...PHASES].reverse().find((p) => elapsed >= p.after) ?? PHASES[0]
    const hasReasoning = Boolean(reasoning?.trim())

    return (
        <div
            className={active ? 'cx-thinking' : 'cx-thinking cx-thinking-off'}
            aria-live="polite"
        >
            <button
                type="button"
                onClick={() => hasReasoning && setOpen((v) => !v)}
                className="cx-thinking-row"
                style={{ cursor: hasReasoning ? 'pointer' : 'default' }}
            >
                <Brain size={14} className="cx-brain" />
                <span className="cx-thinking-label">{phase.label}</span>
                <span className="cx-dots" aria-hidden="true">
                    <Dot delay="0ms" />
                    <Dot delay="150ms" />
                    <Dot delay="300ms" />
                </span>
                {hasReasoning && (
                    <ChevronRight
                        size={14}
                        className={open ? 'cx-chev cx-chev-open' : 'cx-chev'}
                    />
                )}
            </button>
            {hasReasoning && open && (
                <div className="cx-reasoning">{reasoning}</div>
            )}
        </div>
    )
}
