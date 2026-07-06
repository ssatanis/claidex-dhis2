/**
 * Registry directory model.
 *
 * Not every official registry exposes a browser-accessible API. For those, the
 * app provides accurate, official deep-links so users can continue their search
 * in the registry's own portal. This model describes each registry and how to
 * build a search link for it from a user's query.
 */

export type RegistryAccess =
    | 'liveApi' // queried directly in-app (CORS-enabled JSON/XML API)
    | 'portalLink' // no open browser API - official deep-link only
    | 'aggregator' // meta-search portal spanning multiple registries

export interface RegistryEntry {
    /** Short code, e.g. "ctgov", "ictrp", "ctri". */
    code: string
    /** Full registry name. */
    name: string
    /** Abbreviation, e.g. "CT.gov", "ICTRP". */
    abbr: string
    /** Region or country served. */
    region: string
    access: RegistryAccess
    /** Whether this registry meets WHO Primary Registry criteria. */
    whoPrimaryRegistry: boolean
    /** Official home/base URL. */
    homeUrl: string
    /**
     * Builds a search URL for a free-text term on this registry's own portal.
     * Returns the home URL when the registry has no query-string search form.
     */
    buildSearchUrl: (term: string) => string
    /** Short, factual note (e.g. coverage, access caveats). */
    note?: string
}
