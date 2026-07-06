/**
 * Environment / runtime configuration.
 *
 * The DHIS2 App Platform inlines `process.env.REACT_APP_*` values at build time.
 * All Claidex-backend configuration is optional: the app is fully functional
 * against public registries without any of it. When the backend is unset, the
 * app degrades honestly (no fabricated risk data) rather than failing.
 */

const readEnv = (key: string): string | undefined => {
    // Guard access so the app never throws in environments without process.env.
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
        return String(process.env[key]).trim() || undefined
    }
    return undefined
}

export const env = {
    /** Optional Claidex Compass backend base URL (risk intelligence, generation). */
    claidexApiBaseUrl: readEnv('REACT_APP_CLAIDEX_API_BASE_URL'),
    /** Optional bearer token for the Claidex backend. */
    claidexApiToken: readEnv('REACT_APP_CLAIDEX_API_TOKEN'),
    /**
     * Base URL of the Claidex Compass API that powers the AI navigator
     * (streaming chat + tool calls). Defaults to the hosted Claidex app.
     * Point it at a local Claidex instance for development.
     */
    compassApiBase:
        readEnv('REACT_APP_COMPASS_API_BASE') || 'https://app.claidex.com',
}

/** Absolute URL of the streaming Compass chat endpoint. */
export const compassChatUrl = (): string =>
    `${env.compassApiBase.replace(/\/$/, '')}/api/compass/chat`

/** True when a Claidex Compass backend has been configured for this deployment. */
export const isClaidexBackendConfigured = (): boolean =>
    Boolean(env.claidexApiBaseUrl)
