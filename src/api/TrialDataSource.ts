/**
 * The adapter contract every registry integration implements.
 *
 * Keeping registries behind one interface means the UI never depends on a
 * specific registry's schema, and new sources (server-proxied national
 * registries, WHO ICTRP bulk data, etc.) can be added without UI changes.
 */

import type {
    TrialDetail,
    TrialFilters,
    TrialSearchResult,
    RegistrySource,
} from '../types'

export interface TrialDataSource {
    /** Registry this adapter represents. */
    readonly source: RegistrySource
    /** Whether this adapter can be queried live from the browser. */
    readonly liveQueryable: boolean

    /** Free-text / filtered search. Must respect `signal` for cancellation. */
    search(
        filters: TrialFilters,
        signal?: AbortSignal
    ): Promise<TrialSearchResult>

    /**
     * Fetch a single record by its registry-native id.
     * Returns null when the id is not found in this registry.
     */
    getById(
        registryId: string,
        signal?: AbortSignal
    ): Promise<TrialDetail | null>
}
