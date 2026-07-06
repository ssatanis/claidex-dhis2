import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, type UIMessage } from 'ai'

import { compassChatUrl } from '../../config/env'
import { extractPdfTrigger } from './parsePdfTrigger'
import { generateCompassPdf } from './pdfGenerator'
import type { CompassPdfData } from './compassTypes'
import { EmptyPdf } from './EmptyPdf'
import { TrialCards } from './TrialCards'
import {
    type ChatMessage,
    type ChatStatus,
    MessageList,
} from './MessageList'
import {
    ArrowUp,
    Download,
    PanelLeftClose,
    PanelLeftOpen,
    Printer,
    RefreshCw,
    Square,
} from './icons'

const STARTER_PROMPTS = [
    'My patient has Stage 3 NSCLC with EGFR exon 19 deletion, failed 2 lines of therapy, lives in rural West Texas',
    'Looking for trials for a 54 year old with HER2 positive breast cancer after trastuzumab, ZIP 73301',
    'Patient with refractory rheumatoid arthritis, failed 3 biologics, rural Oklahoma',
    'Type 2 diabetes patient with cardiovascular risk, interested in GLP-1 or SGLT2 trials, rural Mississippi',
] as const

function assistantText(message: UIMessage | undefined): string {
    if (!message || message.role !== 'assistant') return ''
    return message.parts
        .map((part) =>
            part.type === 'text' && 'text' in part
                ? (part.text as string)
                : ''
        )
        .join('\n')
}

export const CompassPage: React.FC = () => {
    const transport = useRef(
        new DefaultChatTransport({ api: compassChatUrl() })
    ).current
    const { messages, sendMessage, status, stop, error } = useChat({
        transport,
        experimental_throttle: 50,
    })

    const [input, setInput] = useState('')
    const [pdfReady, setPdfReady] = useState(false)
    const [leftCollapsed, setLeftCollapsed] = useState(false)
    const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null)
    const [pdfData, setPdfData] = useState<CompassPdfData | null>(null)
    const [pdfError, setPdfError] = useState<string | null>(null)
    const [regenerating, setRegenerating] = useState(false)
    const [rightView, setRightView] = useState<'trials' | 'pdf'>('trials')

    const lastSignatureRef = useRef<string | null>(null)
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const busy = status === 'submitted' || status === 'streaming'

    const buildPdf = useCallback(async (data: CompassPdfData) => {
        try {
            setPdfError(null)
            const bytes = await generateCompassPdf(data)
            const blob = new Blob([bytes as BlobPart], {
                type: 'application/pdf',
            })
            const url = URL.createObjectURL(blob)
            setPdfBlobUrl((prev) => {
                if (prev) URL.revokeObjectURL(prev)
                return url
            })
            setPdfData(data)
            setPdfReady(true)
            setRightView('trials')
            setLeftCollapsed(true)
        } catch {
            setPdfError('The report could not be generated. Please try again.')
        }
    }, [])

    // Detect the PDF trigger in the latest assistant message after streaming.
    useEffect(() => {
        if (busy) return
        const last = messages[messages.length - 1]
        if (!last || last.role !== 'assistant') return
        const trigger = extractPdfTrigger(assistantText(last))
        if (!trigger) return
        const signature = JSON.stringify(trigger)
        if (signature === lastSignatureRef.current) return
        lastSignatureRef.current = signature
        void buildPdf(trigger)
    }, [messages, busy, buildPdf])

    // HIPAA: revoke the Blob URL on unmount and clear on tab unload.
    useEffect(() => {
        const clear = () => {
            setPdfBlobUrl((prev) => {
                if (prev) URL.revokeObjectURL(prev)
                return null
            })
        }
        window.addEventListener('beforeunload', clear)
        return () => {
            window.removeEventListener('beforeunload', clear)
            clear()
        }
    }, [])

    const resizeTextarea = useCallback(() => {
        const el = textareaRef.current
        if (!el) return
        el.style.height = 'auto'
        el.style.height = `${Math.min(el.scrollHeight, 160)}px`
    }, [])

    const submit = useCallback(
        (text: string) => {
            const value = text.trim()
            if (!value || busy) return
            void sendMessage({ text: value })
            setInput('')
            requestAnimationFrame(resizeTextarea)
        },
        [busy, sendMessage, resizeTextarea]
    )

    const regenerate = useCallback(() => {
        if (!pdfData) return
        setRegenerating(true)
        void buildPdf(pdfData).finally(() => setRegenerating(false))
    }, [pdfData, buildPdf])

    const printPdf = useCallback(() => {
        iframeRef.current?.contentWindow?.print()
    }, [])

    const empty = messages.length === 0

    return (
        <div className="cx-compass">
            {/* LEFT PANEL - Chat */}
            <section
                className={
                    leftCollapsed
                        ? 'cx-chatpanel cx-chatpanel-collapsed'
                        : 'cx-chatpanel'
                }
            >
                {leftCollapsed ? (
                    <div className="cx-collapsed-rail">
                        <button
                            type="button"
                            className="cx-iconbtn"
                            aria-label="Expand chat panel"
                            onClick={() => setLeftCollapsed(false)}
                        >
                            <PanelLeftOpen size={16} />
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="cx-chat-head">
                            <div>
                                <h2>Patient Navigator</h2>
                                <p>
                                    HIPAA: No patient data is stored or logged.
                                    This session is cleared when you close this
                                    tab.
                                </p>
                            </div>
                            <button
                                type="button"
                                className="cx-iconbtn cx-hide-mobile"
                                aria-label="Collapse chat panel"
                                onClick={() => setLeftCollapsed(true)}
                            >
                                <PanelLeftClose size={16} />
                            </button>
                        </div>

                        <div className="cx-chat-scroll">
                            {empty ? (
                                <div className="cx-starter">
                                    <p>
                                        Describe your patient and I will find
                                        appropriate clinical trials, with the
                                        historical failure context for each
                                        trial&apos;s mechanism. Try one of these:
                                    </p>
                                    <div className="cx-starter-list">
                                        {STARTER_PROMPTS.map((prompt) => (
                                            <button
                                                key={prompt}
                                                type="button"
                                                onClick={() => submit(prompt)}
                                                className="cx-starter-chip"
                                            >
                                                {prompt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <MessageList
                                    messages={
                                        messages as unknown as ChatMessage[]
                                    }
                                    status={status as ChatStatus}
                                />
                            )}
                            {error && (
                                <p className="cx-chat-error">
                                    Something went wrong with that response.
                                    Please try again.
                                </p>
                            )}
                        </div>

                        <div className="cx-chat-dock">
                            <div className="cx-chat-inputwrap">
                                <textarea
                                    ref={textareaRef}
                                    value={input}
                                    onChange={(e) => {
                                        setInput(e.target.value)
                                        resizeTextarea()
                                    }}
                                    onKeyDown={(e) => {
                                        if (
                                            e.key === 'Enter' &&
                                            !e.shiftKey
                                        ) {
                                            e.preventDefault()
                                            submit(input)
                                        }
                                    }}
                                    rows={1}
                                    placeholder="Describe the patient..."
                                    className="cx-chat-input"
                                />
                                {busy ? (
                                    <button
                                        type="button"
                                        className="cx-chat-send cx-chat-stop"
                                        onClick={() => stop()}
                                        aria-label="Stop"
                                    >
                                        <Square size={14} />
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        className="cx-chat-send"
                                        onClick={() => submit(input)}
                                        disabled={!input.trim()}
                                        aria-label="Send"
                                    >
                                        <ArrowUp size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </section>

            {/* RIGHT PANEL - Trial Report (cards + PDF) */}
            <section className="cx-pdfpanel">
                <div className="cx-pdf-head">
                    {pdfReady && pdfBlobUrl ? (
                        <div className="cx-viewtoggle" role="tablist">
                            <button
                                type="button"
                                role="tab"
                                aria-selected={rightView === 'trials'}
                                className={
                                    rightView === 'trials'
                                        ? 'cx-viewtab active'
                                        : 'cx-viewtab'
                                }
                                onClick={() => setRightView('trials')}
                            >
                                Trials
                            </button>
                            <button
                                type="button"
                                role="tab"
                                aria-selected={rightView === 'pdf'}
                                className={
                                    rightView === 'pdf'
                                        ? 'cx-viewtab active'
                                        : 'cx-viewtab'
                                }
                                onClick={() => setRightView('pdf')}
                            >
                                Report PDF
                            </button>
                        </div>
                    ) : (
                        <h2>Trial Report</h2>
                    )}
                    {pdfReady && pdfBlobUrl && (
                        <div className="cx-pdf-actions">
                            <button
                                type="button"
                                className="cx-ghostbtn"
                                onClick={regenerate}
                                disabled={regenerating}
                            >
                                <RefreshCw
                                    size={14}
                                    className={
                                        regenerating ? 'cx-spin' : undefined
                                    }
                                />
                                Re-generate
                            </button>
                            <button
                                type="button"
                                className="cx-ghostbtn"
                                onClick={printPdf}
                            >
                                <Printer size={14} />
                                Print
                            </button>
                            <a
                                className="cx-ghostbtn"
                                href={pdfBlobUrl}
                                download="compass-trial-report.pdf"
                            >
                                <Download size={14} />
                                Download
                            </a>
                        </div>
                    )}
                </div>
                <div className="cx-pdf-body">
                    {pdfError ? (
                        <div className="cx-pdf-error">
                            <p>{pdfError}</p>
                            {pdfData && (
                                <button
                                    type="button"
                                    className="cx-outlinebtn"
                                    onClick={regenerate}
                                >
                                    <RefreshCw size={14} />
                                    Retry
                                </button>
                            )}
                        </div>
                    ) : pdfReady && pdfBlobUrl && pdfData ? (
                        <>
                            <div
                                className="cx-cards-scroll"
                                style={{
                                    display:
                                        rightView === 'trials' ? 'block' : 'none',
                                }}
                            >
                                <TrialCards data={pdfData} />
                            </div>
                            <iframe
                                ref={iframeRef}
                                src={pdfBlobUrl}
                                title="Compass trial report"
                                className="cx-pdf-frame"
                                style={{
                                    display:
                                        rightView === 'pdf' ? 'block' : 'none',
                                }}
                            />
                        </>
                    ) : (
                        <EmptyPdf />
                    )}
                </div>
            </section>
        </div>
    )
}
