import React from 'react'
import { Tag } from '@dhis2/ui'
import { ExternalLink } from './icons'
import { useNavigation } from '../../context/navigation'
import { statusTone, joinList, orDash, formatCount } from '../../utils/format'
import type { TrialSearchResult, TrialSummary } from '../../types'

const StatusTag: React.FC<{ trial: TrialSummary }> = ({ trial }) => {
    const tone = statusTone(trial.status)
    return (
        <Tag
            positive={tone === 'positive'}
            neutral={tone === 'neutral'}
            negative={tone === 'negative'}
        >
            {trial.status}
        </Tag>
    )
}

const Card: React.FC<{ trial: TrialSummary; index: number }> = ({
    trial,
    index,
}) => {
    const { openTrial } = useNavigation()
    return (
        <article className="cx-tc">
            <div className="cx-tc-top">
                <span className="cx-tc-num">{index + 1}</span>
                <StatusTag trial={trial} />
                <span className="cx-tc-phase">{trial.phase}</span>
                <a
                    className="cx-tc-nct"
                    href={trial.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {trial.registryId}
                    <ExternalLink size={12} />
                </a>
            </div>
            <button
                type="button"
                className="cx-tc-titlebtn"
                onClick={() => openTrial(trial.registryId, trial.source)}
            >
                {trial.title}
            </button>
            <div className="cx-tc-grid">
                <div>
                    <span className="cx-tc-label">Conditions</span>
                    <p className="cx-tc-val">{joinList(trial.conditions, 3)}</p>
                </div>
                <div>
                    <span className="cx-tc-label">Sponsor</span>
                    <p className="cx-tc-val">{orDash(trial.sponsor)}</p>
                </div>
                <div>
                    <span className="cx-tc-label">Location</span>
                    <p className="cx-tc-val">{orDash(trial.country)}</p>
                </div>
                <div>
                    <span className="cx-tc-label">Registry</span>
                    <p className="cx-tc-val">{trial.source}</p>
                </div>
            </div>
            <div className="cx-tc-actions">
                <button
                    type="button"
                    className="cx-linkbtn"
                    onClick={() => openTrial(trial.registryId, trial.source)}
                >
                    View details
                </button>
                <a
                    className="cx-linkbtn"
                    href={trial.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Open registry record
                </a>
            </div>
        </article>
    )
}

export const RegistryResults: React.FC<{ result: TrialSearchResult }> = ({
    result,
}) => {
    const failed = result.sourceReports.filter((r) => !r.ok)
    return (
        <div className="cx-tcards cx-cards-scroll">
            <div className="cx-tcards-summary">
                <p className="cx-tcards-count">
                    {formatCount(result.totalCount)} matching{' '}
                    {result.totalCount === 1 ? 'trial' : 'trials'}
                </p>
                <div className="cx-tcards-chips">
                    {result.sourceReports.map((r) => (
                        <span key={r.source} className="cx-tcards-chip">
                            {r.source}: {r.ok ? formatCount(r.count) : 'unavailable'}
                        </span>
                    ))}
                </div>
            </div>
            {failed.length > 0 && (
                <p className="cx-regnote">
                    {failed
                        .map((r) => r.message)
                        .filter(Boolean)
                        .join(' ')}
                </p>
            )}
            {result.trials.length === 0 ? (
                <p className="cx-tcards-none">
                    No trials matched. Try broadening the terms or removing a
                    filter.
                </p>
            ) : (
                <div className="cx-tcards-list">
                    {result.trials.map((t, i) => (
                        <Card key={t.id} trial={t} index={i} />
                    ))}
                </div>
            )}
        </div>
    )
}
