import React from 'react'
import { Tag } from '@dhis2/ui'
import { LoadingState } from '../../components/common/StateViews'
import type { RiskContext, RiskSignal } from '../../types'

interface Props {
    risk: RiskContext | null
    loading: boolean
}

const LEVEL_TAG: Record<RiskSignal['level'], React.ReactNode> = {
    low: <Tag positive>Lower risk</Tag>,
    moderate: <Tag neutral>Moderate</Tag>,
    elevated: <Tag negative>Elevated</Tag>,
    unknown: <Tag neutral>Not scored</Tag>,
}

/**
 * Risk / failure-intelligence for a trial, from the Claidex Failure Atlas.
 * Shows real historical failure records and the Mechanism Risk Score. When
 * nothing is indexed it says so plainly. It never estimates or invents values.
 */
export const RiskPanel: React.FC<Props> = ({ risk, loading }) => {
    if (loading) return <LoadingState label="Checking failure intelligence…" />

    if (!risk || !risk.available) {
        return (
            <div className="unavailable" role="note">
                <p>
                    {risk?.message ??
                        'Failure-intelligence is not available for this trial.'}
                </p>
            </div>
        )
    }

    return (
        <div className="risk">
            {risk.summary && <p className="summary">{risk.summary}</p>}
            {risk.signals && risk.signals.length > 0 && (
                <ul className="signals">
                    {risk.signals.map((s, i) => (
                        <li key={i}>
                            <span className="lbl">{s.label}</span>
                            {LEVEL_TAG[s.level]}
                            {s.detail && (
                                <span className="detail">{s.detail}</span>
                            )}
                        </li>
                    ))}
                </ul>
            )}
            {risk.provenance && <p className="prov">Source: {risk.provenance}</p>}
        </div>
    )
}
