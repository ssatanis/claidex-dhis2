import React, { useState } from 'react'
import { ArrowUp } from './icons'
import type { TrialFilters } from '../../types'
import { DEFAULT_FILTERS } from '../../types'

interface Props {
    onSearch: (filters: TrialFilters) => void
    busy: boolean
}

const EXAMPLES = [
    'Type 2 diabetes',
    'Non-small cell lung cancer',
    'Breast cancer HER2',
    'Tuberculosis',
    'Rheumatoid arthritis',
]

/**
 * Client-side registry search. Runs entirely in the browser against
 * ClinicalTrials.gov and ISRCTN, so the app stays fully functional even when the
 * AI navigator service is unreachable. Only search terms leave the browser, and
 * only to the public registries.
 */
export const RegistrySearch: React.FC<Props> = ({ onSearch, busy }) => {
    const [query, setQuery] = useState('')
    const [country, setCountry] = useState('')
    const [recruitingOnly, setRecruitingOnly] = useState(false)

    const run = (q: string) => {
        const value = q.trim()
        if (!value && !country.trim()) return
        onSearch({
            ...DEFAULT_FILTERS,
            query: value,
            country: country.trim(),
            statuses: recruitingOnly ? ['Recruiting'] : [],
        })
    }

    return (
        <div className="cx-regsearch">
            <p className="cx-regsearch-intro">
                Search official registries directly. Enter a condition, drug,
                sponsor, or trial ID. This runs in your browser against
                ClinicalTrials.gov and ISRCTN.
            </p>

            <div className="cx-regsearch-examples">
                {EXAMPLES.map((ex) => (
                    <button
                        key={ex}
                        type="button"
                        className="cx-regsearch-chip"
                        disabled={busy}
                        onClick={() => {
                            setQuery(ex)
                            run(ex)
                        }}
                    >
                        {ex}
                    </button>
                ))}
            </div>

            <div className="cx-regsearch-fields">
                <label className="cx-regsearch-label">
                    Country (optional)
                    <input
                        type="text"
                        className="cx-regsearch-input"
                        placeholder="e.g. Kenya"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                    />
                </label>
                <label className="cx-regsearch-check">
                    <input
                        type="checkbox"
                        checked={recruitingOnly}
                        onChange={(e) => setRecruitingOnly(e.target.checked)}
                    />
                    Recruiting only
                </label>
            </div>

            <div className="cx-regsearch-dock">
                <div className="cx-chat-inputwrap">
                    <input
                        type="text"
                        className="cx-chat-input"
                        placeholder="Condition, drug, sponsor, or trial ID"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') run(query)
                        }}
                    />
                    <button
                        type="button"
                        className="cx-chat-send"
                        onClick={() => run(query)}
                        disabled={busy || (!query.trim() && !country.trim())}
                        aria-label="Search registries"
                    >
                        {busy ? (
                            <span className="cx-spinner" aria-hidden="true" />
                        ) : (
                            <ArrowUp size={16} />
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
