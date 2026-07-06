/**
 * Claidex Compass backend adapter (optional).
 *
 * Provides risk / failure-intelligence context and, optionally, richer explainer
 * generation. This adapter is deliberately conservative: if no backend is
 * configured, or the backend is unreachable or returns nothing usable, it
 * returns an explicit "not available" result. It NEVER fabricates risk values.
 *
 * The endpoint shapes below are documented assumptions (see API_CONTRACT.md) so
 * a real Claidex backend can be connected without UI changes.
 */

import { env, isClaidexBackendConfigured } from '../config/env'
import { httpGet } from './httpClient'
import type { RiskContext, BackendStatus } from '../types'

const authHeaders = (): Record<string, string> =>
    env.claidexApiToken
        ? { Authorization: `Bearer ${env.claidexApiToken}` }
        : {}

/** Shape assumed from the Claidex backend risk endpoint (see API_CONTRACT.md). */
interface RawRiskResponse {
    summary?: string
    provenance?: string
    signals?: Array<{
        label?: string
        level?: 'low' | 'moderate' | 'elevated' | 'unknown'
        detail?: string
    }>
}

export async function getBackendStatus(
    signal?: AbortSignal
): Promise<BackendStatus> {
    if (!isClaidexBackendConfigured()) {
        return {
            configured: false,
            reachable: false,
            message:
                'Claidex risk intelligence is not configured for this deployment.',
        }
    }
    try {
        await httpGet(`${env.claidexApiBaseUrl}/health`, {
            signal,
            headers: authHeaders(),
            timeoutMs: 8000,
            retries: 0,
        })
        return {
            configured: true,
            reachable: true,
            message: 'Claidex risk intelligence is connected.',
        }
    } catch {
        return {
            configured: true,
            reachable: false,
            message:
                'Claidex backend is configured but could not be reached right now.',
        }
    }
}

/**
 * Fetch risk context for a trial. Returns `available: false` (never fabricated
 * data) whenever the backend is absent, unreachable, or empty.
 */
export async function getRiskContext(
    registryId: string,
    signal?: AbortSignal
): Promise<RiskContext> {
    if (!isClaidexBackendConfigured()) {
        return {
            available: false,
            message:
                'Not connected. Configure a Claidex Compass backend to surface risk and failure-intelligence context.',
        }
    }
    try {
        const url = `${env.claidexApiBaseUrl}/risk/${encodeURIComponent(
            registryId
        )}`
        const raw = await httpGet<RawRiskResponse>(url, {
            signal,
            headers: authHeaders(),
        })
        if (!raw || (!raw.summary && (!raw.signals || raw.signals.length === 0))) {
            return {
                available: false,
                message: 'The Claidex backend returned no risk context for this trial.',
            }
        }
        return {
            available: true,
            summary: raw.summary,
            provenance: raw.provenance ?? 'Claidex Compass',
            signals: (raw.signals ?? []).map((s) => ({
                label: s.label ?? 'Signal',
                level: s.level ?? 'unknown',
                detail: s.detail,
            })),
        }
    } catch {
        return {
            available: false,
            message:
                'Could not retrieve risk context from the Claidex backend. Trial data above is unaffected.',
        }
    }
}
