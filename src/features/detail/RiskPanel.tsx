import React from 'react'
import { Tag } from '@dhis2/ui'
import { LoadingState } from '../../components/common/StateViews'
import type { RiskContext, RiskSignal } from '../../types'

interface Props {
    risk: RiskContext | null
    loading: boolean
}

const LEVEL_TAG: Record<RiskSignal['level'], React.ReactNode> = {
    low: <Tag positive>Low</Tag>,
    moderate: <Tag neutral>Moderate</Tag>,
    elevated: <Tag negative>Elevated</Tag>,
    unknown: <Tag neutral>Unknown</Tag>,
}

/**
 * Risk / failure-intelligence context from the optional Claidex backend.
 * When unavailable, it shows an explicit "not connected" state - never a
 * fabricated score.
 */
export const RiskPanel: React.FC<Props> = ({ risk, loading }) => {
    if (loading) return <LoadingState label="Checking risk context…" />

    if (!risk || !risk.available) {
        return (
            <div className="unavailable" role="note">
                <p>
                    {risk?.message ??
                        'Risk context is not available for this deployment.'}
                </p>
                <p className="sub">
                    Compass never estimates or invents risk values. When a
                    Claidex Compass backend is connected, verified risk and
                    failure-intelligence signals appear here with their source.
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
