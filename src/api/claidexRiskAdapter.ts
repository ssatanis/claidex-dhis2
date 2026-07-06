/**
 * Claidex risk / failure-intelligence adapter.
 *
 * Calls the Claidex Compass risk endpoint for a trial and maps the response into
 * the shared RiskContext model. The endpoint reads the trial's mechanism and
 * indication and returns real historical failure records and the Mechanism Risk
 * Score from the Claidex Failure Atlas. It never fabricates values: when nothing
 * is indexed it says so explicitly.
 */

import { env } from '../config/env'
import { httpGet } from './httpClient'
import type { RiskContext } from '../types'

const riskUrl = (nctId: string): string =>
    `${env.compassApiBase.replace(/\/$/, '')}/api/compass/risk?nctId=${encodeURIComponent(
        nctId
    )}`

interface RawRiskResponse {
    available?: boolean
    summary?: string
    provenance?: string
    message?: string
    signals?: Array<{
        label?: string
        level?: 'low' | 'moderate' | 'elevated' | 'unknown'
        detail?: string
    }>
}

/** Fetch risk / failure-intelligence context for a trial by its registry id. */
export async function getRiskContext(
    registryId: string,
    signal?: AbortSignal
): Promise<RiskContext> {
    try {
        const raw = await httpGet<RawRiskResponse>(riskUrl(registryId), {
            signal,
            retries: 0,
            timeoutMs: 12000,
        })
        if (raw.available === false) {
            return {
                available: false,
                message:
                    raw.message ??
                    'Failure-intelligence is not available for this trial.',
            }
        }
        return {
            available: true,
            summary: raw.summary,
            provenance: raw.provenance ?? 'Claidex Failure Atlas',
            signals: (raw.signals ?? []).map((s) => ({
                label: s.label ?? 'Signal',
                level: s.level ?? 'unknown',
                detail: s.detail,
            })),
        }
    } catch {
        return {
            available: false,
            message: 'Failure-intelligence is temporarily unavailable.',
        }
    }
}
