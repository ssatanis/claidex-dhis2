/**
 * Minimal fetch wrapper with timeout, conservative retries, and typed errors.
 *
 * Designed for low-resource / intermittent-connectivity environments:
 * - hard per-request timeout so the UI never hangs indefinitely
 * - a single conservative retry for transient network/5xx failures only
 * - a clear distinction between user-facing and technical error messages
 */

import { NETWORK } from '../config/constants'

export type HttpErrorKind =
    | 'timeout'
    | 'network'
    | 'http'
    | 'parse'
    | 'aborted'

export class HttpError extends Error {
    kind: HttpErrorKind
    status?: number
    /** Message safe to show end-users (no stack traces / URLs with secrets). */
    userMessage: string

    constructor(
        kind: HttpErrorKind,
        message: string,
        userMessage: string,
        status?: number
    ) {
        super(message)
        this.name = 'HttpError'
        this.kind = kind
        this.status = status
        this.userMessage = userMessage
    }
}

const sleep = (ms: number): Promise<void> =>
    new Promise((resolve) => setTimeout(resolve, ms))

interface RequestOptions {
    signal?: AbortSignal
    headers?: Record<string, string>
    timeoutMs?: number
    retries?: number
    /** 'json' | 'text' - how to parse a successful response. */
    parse?: 'json' | 'text'
}

const isTransient = (err: HttpError): boolean =>
    err.kind === 'network' ||
    err.kind === 'timeout' ||
    (err.kind === 'http' && (err.status ?? 0) >= 500)

async function once<T>(url: string, opts: RequestOptions): Promise<T> {
    const timeoutMs = opts.timeoutMs ?? NETWORK.timeoutMs
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)

    // Bridge a caller-provided abort signal into our controller.
    if (opts.signal) {
        if (opts.signal.aborted) controller.abort()
        else
            opts.signal.addEventListener('abort', () => controller.abort(), {
                once: true,
            })
    }

    let response: Response
    try {
        response = await fetch(url, {
            method: 'GET',
            headers: { Accept: 'application/json', ...(opts.headers ?? {}) },
            signal: controller.signal,
        })
    } catch (e) {
        clearTimeout(timer)
        const aborted = (e as Error)?.name === 'AbortError'
        if (aborted && opts.signal?.aborted) {
            throw new HttpError('aborted', 'Request aborted by caller', 'Cancelled.')
        }
        if (aborted) {
            throw new HttpError(
                'timeout',
                `Request timed out after ${timeoutMs}ms`,
                'The request timed out. Check your connection and try again.'
            )
        }
        throw new HttpError(
            'network',
            (e as Error)?.message ?? 'Network error',
            'Could not reach the data source. This may be a connectivity issue.'
        )
    } finally {
        clearTimeout(timer)
    }

    if (!response.ok) {
        throw new HttpError(
            'http',
            `HTTP ${response.status} for ${new URL(url).host}`,
            response.status >= 500
                ? 'The data source is temporarily unavailable. Please try again.'
                : `The data source rejected the request (status ${response.status}).`,
            response.status
        )
    }

    try {
        if (opts.parse === 'text') return (await response.text()) as unknown as T
        return (await response.json()) as T
    } catch (e) {
        throw new HttpError(
            'parse',
            (e as Error)?.message ?? 'Failed to parse response',
            'The data source returned an unexpected response.'
        )
    }
}

export async function httpGet<T>(
    url: string,
    opts: RequestOptions = {}
): Promise<T> {
    const retries = opts.retries ?? NETWORK.retries
    let lastError: HttpError | undefined

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            return await once<T>(url, opts)
        } catch (e) {
            const err =
                e instanceof HttpError
                    ? e
                    : new HttpError('network', String(e), 'Unexpected network error.')
            lastError = err
            if (err.kind === 'aborted' || !isTransient(err) || attempt === retries) {
                throw err
            }
            await sleep(NETWORK.retryBackoffMs * (attempt + 1))
        }
    }
    // Unreachable, but satisfies the type checker.
    throw lastError ?? new HttpError('network', 'Unknown error', 'Unknown error.')
}
