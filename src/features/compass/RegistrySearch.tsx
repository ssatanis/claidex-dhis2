import React, { useState } from 'react'
import { ArrowUp } from './icons'
import type {
    RegistrySource,
    TrialFilters,
    TrialPhase,
    TrialStatus,
} from '../../types'
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

const PHASES: TrialPhase[] = [
    'Early Phase 1',
    'Phase 1',
    'Phase 2',
    'Phase 3',
    'Phase 4',
    'N/A',
]

const STATUSES: TrialStatus[] = [
    'Recruiting',
    'Not yet recruiting',
    'Enrolling by invitation',
    'Active, not recruiting',
    'Completed',
    'Terminated',
]

const SOURCES: RegistrySource[] = ['ClinicalTrials.gov', 'ISRCTN']

/**
 * Client-side registry search. Runs entirely against ClinicalTrials.gov and
 * ISRCTN so the app stays fully functional without any external service. Only
 * search terms leave the browser, and only to the public registries.
 */
export const RegistrySearch: React.FC<Props> = ({ onSearch, busy }) => {
    const [query, setQuery] = useState('')
    const [condition, setCondition] = useState('')
    const [intervention, setIntervention] = useState('')
    const [sponsor, setSponsor] = useState('')
    const [trialId, setTrialId] = useState('')
    const [country, setCountry] = useState('')
    const [phases, setPhases] = useState<TrialPhase[]>([])
    const [statuses, setStatuses] = useState<TrialStatus[]>([])
    const [sources, setSources] = useState<RegistrySource[]>([])
    const [showFilters, setShowFilters] = useState(false)

    const toggle = <T,>(list: T[], value: T, set: (v: T[]) => void) =>
        set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value])

    const buildFilters = (q: string): TrialFilters => ({
        ...DEFAULT_FILTERS,
        query: q.trim(),
        condition: condition.trim(),
        intervention: intervention.trim(),
        sponsor: sponsor.trim(),
        trialId: trialId.trim(),
        country: country.trim(),
        phases,
        statuses,
        sources,
    })

    const anyInput = (q: string): boolean =>
        Boolean(
            q.trim() ||
                condition.trim() ||
                intervention.trim() ||
                sponsor.trim() ||
                trialId.trim() ||
                country.trim()
        )

    const run = (q: string) => {
        if (!anyInput(q)) return
        onSearch(buildFilters(q))
    }

    const reset = () => {
        setQuery('')
        setCondition('')
        setIntervention('')
        setSponsor('')
        setTrialId('')
        setCountry('')
        setPhases([])
        setStatuses([])
        setSources([])
    }

    const field = (
        label: string,
        value: string,
        set: (v: string) => void,
        placeholder: string
    ) => (
        <label className="cx-regsearch-label">
            {label}
            <input
                type="text"
                className="cx-regsearch-input"
                placeholder={placeholder}
                value={value}
                onChange={(e) => set(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') run(query)
                }}
            />
        </label>
    )

    return (
        <div className="cx-regsearch">
            <p className="cx-regsearch-intro">
                Search official registries directly. Enter a condition, drug,
                sponsor, or trial ID.
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
                            onSearch({ ...buildFilters(ex) })
                        }}
                    >
                        {ex}
                    </button>
                ))}
            </div>

            <button
                type="button"
                className="cx-regsearch-toggle"
                aria-expanded={showFilters}
                onClick={() => setShowFilters((s) => !s)}
            >
                {showFilters ? 'Hide filters' : 'Refine with filters'}
            </button>

            {showFilters && (
                <div className="cx-regsearch-panel">
                    <div className="cx-regsearch-fields">
                        {field(
                            'Condition or disease',
                            condition,
                            setCondition,
                            'e.g. hypertension'
                        )}
                        {field(
                            'Intervention',
                            intervention,
                            setIntervention,
                            'drug, device, procedure'
                        )}
                        {field('Sponsor', sponsor, setSponsor, 'organization')}
                        {field(
                            'Trial ID',
                            trialId,
                            setTrialId,
                            'NCT or ISRCTN id'
                        )}
                        {field('Country', country, setCountry, 'e.g. Kenya')}
                    </div>

                    <div className="cx-regsearch-group">
                        <span className="cx-regsearch-glabel">Phase</span>
                        <div className="cx-regsearch-chips">
                            {PHASES.map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    className={
                                        phases.includes(p)
                                            ? 'cx-togchip on'
                                            : 'cx-togchip'
                                    }
                                    onClick={() =>
                                        toggle(phases, p, setPhases)
                                    }
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="cx-regsearch-group">
                        <span className="cx-regsearch-glabel">
                            Recruitment status
                        </span>
                        <div className="cx-regsearch-chips">
                            {STATUSES.map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    className={
                                        statuses.includes(s)
                                            ? 'cx-togchip on'
                                            : 'cx-togchip'
                                    }
                                    onClick={() =>
                                        toggle(statuses, s, setStatuses)
                                    }
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="cx-regsearch-group">
                        <span className="cx-regsearch-glabel">Registries</span>
                        <div className="cx-regsearch-chips">
                            {SOURCES.map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    className={
                                        sources.includes(s)
                                            ? 'cx-togchip on'
                                            : 'cx-togchip'
                                    }
                                    onClick={() =>
                                        toggle(sources, s, setSources)
                                    }
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        type="button"
                        className="cx-regsearch-reset"
                        onClick={reset}
                    >
                        Reset filters
                    </button>
                </div>
            )}

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
                        disabled={busy || !anyInput(query)}
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
