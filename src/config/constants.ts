/**
 * App-wide constants: identity, data-source endpoints, and tunables.
 * Kept free of secrets. External endpoints here are all public registries.
 */

export const APP_NAME = 'Compass Clinical Trial Navigator'
export const APP_SHORT_NAME = 'Compass'
export const APP_VERSION = '1.0.0'
export const APP_VENDOR = 'Claidex'

/** Public, CORS-enabled registry endpoints queried directly from the browser. */
export const ENDPOINTS = {
    /** ClinicalTrials.gov API v2 (NIH/NLM). Public, no key, global coverage. */
    clinicalTrialsGov: 'https://clinicaltrials.gov/api/v2',
    /** ISRCTN public query API (BioMed Central). Returns XML. */
    isrctn: 'https://www.isrctn.com/api/query',
} as const

/** Conservative network defaults tuned for low-bandwidth environments. */
export const NETWORK = {
    /** Per-request timeout (ms). */
    timeoutMs: 20000,
    /** Number of retry attempts for transient failures (network/5xx only). */
    retries: 1,
    /** Base backoff between retries (ms). */
    retryBackoffMs: 800,
    /** Lightweight connectivity probe target (HEAD/GET). */
    connectivityProbeUrl:
        'https://clinicaltrials.gov/api/v2/studies?pageSize=1&fields=NCTId',
} as const

/** Result paging. Small page size keeps payloads light on slow connections. */
export const PAGING = {
    defaultPageSize: 20,
    pageSizeOptions: [10, 20, 50],
    maxPageSize: 100,
} as const

/** External documentation and source-of-truth links surfaced in the UI. */
export const EXTERNAL_LINKS = {
    clinicalTrialsGov: 'https://clinicaltrials.gov',
    whoIctrp: 'https://trialsearch.who.int',
    ctisEu: 'https://euclinicaltrials.eu/ctis-public',
    dhis2AppHub: 'https://apps.dhis2.org',
    sourceRepo: 'https://github.com/ssatanis/claidex-dhis2',
    /** Claidex dashboard the "Return to dashboard" action links to. */
    dashboard: 'https://app.claidex.com',
} as const
