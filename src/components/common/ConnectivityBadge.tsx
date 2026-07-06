import React from 'react'
import { useConnectivity } from '../../hooks/useConnectivity'
import type { ConnectivityState } from '../../types'

const DOT_COLOR: Record<ConnectivityState, string> = {
    online: '#4caf50',
    degraded: '#ffb300',
    offline: '#ff5252',
    checking: '#b0bec5',
}

const LABEL: Record<ConnectivityState, string> = {
    online: 'Connected',
    degraded: 'Slow connection',
    offline: 'Offline',
    checking: 'Checking…',
}

/** Compact status pill for the app header. Click to re-probe. */
export const ConnectivityBadge: React.FC = () => {
    const { status, refresh } = useConnectivity()
    return (
        <button
            type="button"
            className="badge"
            onClick={refresh}
            title={`${status.message}${
                status.latencyMs ? ` (${status.latencyMs} ms)` : ''
            } - click to re-check`}
            aria-label={`Connectivity: ${LABEL[status.state]}. ${status.message}`}
        >
            <span
                className="dot"
                style={{ background: DOT_COLOR[status.state] }}
            />
            <span className="text">{LABEL[status.state]}</span>
        </button>
    )
}
