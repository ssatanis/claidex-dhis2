/**
 * Lightweight connectivity probe against the primary live data source.
 * Used by the connectivity badge and offline banners.
 */

import { NETWORK } from '../config/constants'
import { httpGet } from './httpClient'
import type { ConnectivityStatus } from '../types'

export async function probeConnectivity(
    signal?: AbortSignal
): Promise<ConnectivityStatus> {
    // Fast-path: the browser reports it is offline.
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        return {
            state: 'offline',
            lastCheckedAt: nowIso(),
            message: 'Your device appears to be offline.',
        }
    }

    const started = Date.now()
    try {
        await httpGet(NETWORK.connectivityProbeUrl, {
            signal,
            timeoutMs: 8000,
            retries: 0,
        })
        const latencyMs = Date.now() - started
        return {
            state: latencyMs > 4000 ? 'degraded' : 'online',
            latencyMs,
            lastCheckedAt: nowIso(),
            message:
                latencyMs > 4000
                    ? 'Connected, but the network is slow.'
                    : 'Connected to ClinicalTrials.gov.',
        }
    } catch {
        return {
            state: 'offline',
            lastCheckedAt: nowIso(),
            message:
                'Could not reach ClinicalTrials.gov. Registry links may still open in a browser.',
        }
    }
}

const nowIso = (): string => new Date().toISOString()
