import React, { useEffect, useRef, useState } from 'react'
import { Check, ChevronRight, Copy, FileText } from './icons'
import { ThinkingBlock } from './ThinkingBlock'
import { Markdown } from './Markdown'
import { extractPdfTrigger, stripPdfTrigger } from './parsePdfTrigger'

interface MessagePart {
    type: string
    text?: string
    state?: string
    toolName?: string
}
export interface ChatMessage {
    id: string
    role: string
    parts: MessagePart[]
}

export type ChatStatus = 'submitted' | 'streaming' | 'ready' | 'error'

const partText = (part: MessagePart): string =>
    typeof part.text === 'string' ? part.text : ''

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
    const [copied, setCopied] = useState(false)
    return (
        <button
            type="button"
            className="cx-copybtn"
            onClick={() => {
                void navigator.clipboard
                    .writeText(stripPdfTrigger(text))
                    .then(() => {
                        setCopied(true)
                        setTimeout(() => setCopied(false), 1500)
                    })
            }}
        >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Copied' : 'Copy'}
        </button>
    )
}

const AnalysisFold: React.FC<{
    markdown: string
    trialCount: number
    condition: string
}> = ({ markdown, trialCount, condition }) => {
    const [open, setOpen] = useState(false)
    return (
        <div className="cx-bubble cx-bubble-assistant">
            <div className="cx-fold-head">
                <FileText size={16} className="cx-fold-icon" />
                <p>
                    Report generated
                    {condition ? ` for ${condition}` : ''}. {trialCount} trial
                    {trialCount === 1 ? '' : 's'}. View it in the panel on the
                    right.
                </p>
            </div>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="cx-fold-toggle"
            >
                <ChevronRight
                    size={14}
                    className={open ? 'cx-chev cx-chev-open' : 'cx-chev'}
                />
                {open ? 'Hide full analysis' : 'Show full analysis'}
            </button>
            {open && (
                <div className="cx-fold-body">
                    <Markdown text={markdown} />
                    <div className="cx-bubble-actions">
                        <CopyButton text={markdown} />
                    </div>
                </div>
            )}
        </div>
    )
}

export const MessageList: React.FC<{
    messages: ChatMessage[]
    status: ChatStatus
}> = ({ messages, status }) => {
    const endRef = useRef<HTMLDivElement>(null)
    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }, [messages, status])

    const busy = status === 'submitted' || status === 'streaming'

    return (
        <div className="cx-messages">
            {messages.map((message, index) => {
                const isUser = message.role === 'user'
                const isLast = index === messages.length - 1
                const fullText = message.parts
                    .filter((p) => p.type === 'text')
                    .map(partText)
                    .join('\n')
                const reasoningText = message.parts
                    .filter((p) => p.type === 'reasoning')
                    .map(partText)
                    .join('\n')
                    .trim()
                const visibleText = stripPdfTrigger(fullText).trim()
                const showThinking = !isUser && isLast && busy && !visibleText

                if (isUser) {
                    return (
                        <div key={message.id} className="cx-row-user">
                            <div className="cx-bubble-user">{fullText}</div>
                        </div>
                    )
                }

                const trigger = extractPdfTrigger(fullText)

                return (
                    <div key={message.id} className="cx-row-assistant">
                        {(showThinking || reasoningText) && (
                            <ThinkingBlock
                                active={showThinking}
                                reasoning={reasoningText}
                            />
                        )}
                        {trigger ? (
                            <AnalysisFold
                                markdown={fullText}
                                trialCount={trigger.trials.length}
                                condition={trigger.patient?.condition ?? ''}
                            />
                        ) : (
                            visibleText && (
                                <div className="cx-bubble cx-bubble-assistant">
                                    <Markdown text={fullText} />
                                    <div className="cx-bubble-actions">
                                        <CopyButton text={fullText} />
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                )
            })}
            <div ref={endRef} />
        </div>
    )
}
