/** Connectivity + backend-availability status models. */

export type ConnectivityState = 'online' | 'degraded' | 'offline' | 'checking'

export interface ConnectivityStatus {
    state: ConnectivityState
    /** Round-trip latency of the last probe (ms), when measurable. */
    latencyMs?: number
    /** Timestamp (ISO) of the last successful probe. */
    lastCheckedAt?: string
    /** Human-readable summary for the badge tooltip. */
    message: string
}

/** Availability of the optional Claidex Compass backend. */
export interface BackendStatus {
    configured: boolean
    reachable: boolean
    message: string
}

/**
 * Risk / failure-intelligence context from the Claidex backend.
 * Only populated when a backend is configured AND responds. The UI must show a
 * clear "not connected" state otherwise - never a fabricated value.
 */
export interface RiskContext {
    available: boolean
    /** Qualitative summary, provided verbatim by the backend. */
    summary?: string
    /** Named signals the backend chose to surface. */
    signals?: RiskSignal[]
    /** Source/provenance string from the backend. */
    provenance?: string
    /** Present when the backend was queried but returned nothing usable. */
    message?: string
}

export interface RiskSignal {
    label: string
    /** Backend-provided qualitative level. Not computed client-side. */
    level: 'low' | 'moderate' | 'elevated' | 'unknown'
    detail?: string
}
