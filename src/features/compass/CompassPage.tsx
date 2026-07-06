import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, type UIMessage } from 'ai'

import { compassChatUrl } from '../../config/env'
import { searchTrials, HttpError } from '../../api'
import type { TrialFilters, TrialSearchResult } from '../../types'
import { extractPdfTrigger } from './parsePdfTrigger'
import { generateCompassPdf } from './pdfGenerator'
import type { CompassPdfData } from './compassTypes'
import { EmptyPdf } from './EmptyPdf'
import { TrialCards } from './TrialCards'
import { RegistrySearch } from './RegistrySearch'
import { RegistryResults } from './RegistryResults'
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

type NavMode = 'ai' | 'registry'

export const CompassPage: React.FC = () => {
    const transport = useRef(
        new DefaultChatTransport({ api: compassChatUrl() })
    ).current
    const { messages, sendMessage, status, stop, error } = useChat({
        transport,
        experimental_throttle: 50,
    })

    const [navMode, setNavMode] = useState<NavMode>('ai')
    const [input, setInput] = useState('')
    const [pdfReady, setPdfReady] = useState(false)
    const [leftCollapsed, setLeftCollapsed] = useState(false)
    const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null)
    const [pdfData, setPdfData] = useState<CompassPdfData | null>(null)
    const [pdfError, setPdfError] = useState<string | null>(null)
    const [regenerating, setRegenerating] = useState(false)
    const [rightView, setRightView] = useState<'trials' | 'pdf'>('trials')

    // Registry-search mode (fully client-side; works without the AI backend).
    const [regResult, setRegResult] = useState<TrialSearchResult | null>(null)
    const [regLoading, setRegLoading] = useState(false)
    const [regError, setRegError] = useState<string | null>(null)
    const regAbort = useRef<AbortController | null>(null)

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

    const runRegistrySearch = useCallback(async (filters: TrialFilters) => {
        regAbort.current?.abort()
        const controller = new AbortController()
        regAbort.current = controller
        setRegLoading(true)
        setRegError(null)
        try {
            const result = await searchTrials(filters, controller.signal)
            if (controller.signal.aborted) return
            setRegResult(result)
            setRegLoading(false)
            setLeftCollapsed(false)
        } catch (e) {
            if (controller.signal.aborted) return
            setRegError(
                e instanceof HttpError
                    ? e.userMessage
                    : 'Search failed. Please try again.'
            )
            setRegLoading(false)
        }
    }, [])

    const empty = messages.length === 0

    const ModeToggle = (
        <div className="cx-modetoggle" role="tablist" aria-label="Mode">
            <button
                type="button"
                role="tab"
                aria-selected={navMode === 'ai'}
                className={navMode === 'ai' ? 'cx-modetab active' : 'cx-modetab'}
                onClick={() => setNavMode('ai')}
            >
                AI Navigator
            </button>
            <button
                type="button"
                role="tab"
                aria-selected={navMode === 'registry'}
                className={
                    navMode === 'registry' ? 'cx-modetab active' : 'cx-modetab'
                }
                onClick={() => setNavMode('registry')}
            >
                Registry search
            </button>
        </div>
    )

    return (
        <div className="cx-compass">
            {/* LEFT PANEL */}
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
                            aria-label="Expand panel"
                            onClick={() => setLeftCollapsed(false)}
                        >
                            <PanelLeftOpen size={16} />
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="cx-chat-head">
                            <div>
                                {ModeToggle}
                                <p className="cx-panel-sub">
                                    Informational support only. Do not enter
                                    patient identifiers. This session is not
                                    stored and clears when you close the tab.
                                </p>
                            </div>
                            <button
                                type="button"
                                className="cx-iconbtn cx-hide-mobile"
                                aria-label="Collapse panel"
                                onClick={() => setLeftCollapsed(true)}
                            >
                                <PanelLeftClose size={16} />
                            </button>
                        </div>

                        {navMode === 'ai' ? (
                            <>
                                <div className="cx-chat-scroll">
                                    {empty ? (
                                        <div className="cx-starter">
                                            <p>
                                                Describe your patient and the AI
                                                navigator finds appropriate
                                                clinical trials, with the
                                                historical failure context for
                                                each trial&apos;s mechanism. Try
                                                one of these:
                                            </p>
                                            <div className="cx-starter-list">
                                                {STARTER_PROMPTS.map(
                                                    (prompt) => (
                                                        <button
                                                            key={prompt}
                                                            type="button"
                                                            onClick={() =>
                                                                submit(prompt)
                                                            }
                                                            className="cx-starter-chip"
                                                        >
                                                            {prompt}
                                                        </button>
                                                    )
                                                )}
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
                                        <div className="cx-ai-fallback">
                                            <p>
                                                The AI navigator is unavailable
                                                right now. You can still find
                                                trials with Registry search,
                                                which runs in your browser.
                                            </p>
                                            <button
                                                type="button"
                                                className="cx-outlinebtn"
                                                onClick={() =>
                                                    setNavMode('registry')
                                                }
                                            >
                                                Switch to Registry search
                                            </button>
                                        </div>
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
                        ) : (
                            <div className="cx-chat-scroll">
                                <RegistrySearch
                                    onSearch={runRegistrySearch}
                                    busy={regLoading}
                                />
                            </div>
                        )}
                    </>
                )}
            </section>

            {/* RIGHT PANEL */}
            <section className="cx-pdfpanel">
                <div className="cx-pdf-head">
                    {navMode === 'ai' && pdfReady && pdfBlobUrl ? (
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
                        <h2>
                            {navMode === 'registry'
                                ? 'Trial results'
                                : 'Trial Report'}
                        </h2>
                    )}
                    {navMode === 'ai' && pdfReady && pdfBlobUrl && (
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
                    {navMode === 'ai' ? (
                        pdfError ? (
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
                                            rightView === 'trials'
                                                ? 'block'
                                                : 'none',
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
                                            rightView === 'pdf'
                                                ? 'block'
                                                : 'none',
                                    }}
                                />
                            </>
                        ) : (
                            <EmptyPdf />
                        )
                    ) : regLoading ? (
                        <div className="cx-emptypdf">
                            <span className="cx-spinner cx-spinner-dark" />
                            <p>Searching official registries...</p>
                        </div>
                    ) : regError ? (
                        <div className="cx-pdf-error">
                            <p>{regError}</p>
                        </div>
                    ) : regResult ? (
                        <RegistryResults result={regResult} />
                    ) : (
                        <div className="cx-emptypdf">
                            <p>
                                Search official registries to see matching trials
                                here.
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}
