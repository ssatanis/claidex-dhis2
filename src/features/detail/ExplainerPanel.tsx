import React, { useMemo, useState } from 'react'
import { Button, ButtonStrip } from '@dhis2/ui'
import type { ExplainerAudience, TrialDetail } from '../../types'
import { buildExplainer, explainerToText } from '../../utils/explainerBuilder'
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard'
import { MissingDataNote } from '../../components/common/Provenance'

interface Props {
    trial: TrialDetail
}

const TABS: { value: ExplainerAudience; label: string }[] = [
    { value: 'patient', label: 'Plain-language' },
    { value: 'clinician', label: 'Clinician' },
    { value: 'handout', label: 'Visit handout' },
]

export const ExplainerPanel: React.FC<Props> = ({ trial }) => {
    const [audience, setAudience] = useState<ExplainerAudience>('patient')
    const { copied, copy, error } = useCopyToClipboard()

    const explainer = useMemo(
        () => buildExplainer(trial, audience),
        [trial, audience]
    )

    const asText = useMemo(() => explainerToText(explainer), [explainer])

    const handlePrint = () => {
        const w = window.open('', '_blank', 'noopener,noreferrer,width=760')
        if (!w) return
        const escaped = asText
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
        w.document.write(
            `<html><head><title>${trial.registryId} - ${audience} summary</title>` +
                `<style>body{font:14px/1.6 -apple-system,Segoe UI,Roboto,sans-serif;max-width:640px;margin:32px auto;padding:0 16px;color:#1a2a3a;white-space:pre-wrap;}</style>` +
                `</head><body>${escaped}</body></html>`
        )
        w.document.close()
        w.focus()
        w.print()
    }

    return (
        <div className="ex">
            <div className="tabs" role="tablist" aria-label="Summary audience">
                {TABS.map((t) => (
                    <button
                        key={t.value}
                        role="tab"
                        aria-selected={audience === t.value}
                        className={audience === t.value ? 'tab active' : 'tab'}
                        onClick={() => setAudience(t.value)}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            <div className="content">
                {explainer.sections.map((section, i) => (
                    <div className="section" key={i}>
                        <h4>{section.heading}</h4>
                        {section.paragraphs.map((p, j) => (
                            <p key={j}>{p}</p>
                        ))}
                    </div>
                ))}

                <div className="section">
                    <h4>Questions you might ask</h4>
                    <ul>
                        {explainer.questionsToAsk.map((q, i) => (
                            <li key={i}>{q}</li>
                        ))}
                    </ul>
                </div>

                {explainer.omittedForMissingData.length > 0 && (
                    <MissingDataNote fields={explainer.omittedForMissingData} />
                )}
            </div>

            <div className="foot">
                <ButtonStrip>
                    <Button small onClick={() => copy(asText)}>
                        {copied ? 'Copied ✓' : 'Copy summary'}
                    </Button>
                    <Button small onClick={handlePrint}>
                        Print handout
                    </Button>
                </ButtonStrip>
                {error && (
                    <span className="cperr">
                        Copy is blocked in this browser. Select and copy the text
                        manually.
                    </span>
                )}
            </div>
        </div>
    )
}
