/** Search inputs, filters, and sort options shared by the search feature. */

import type { RegistrySource, TrialPhase, TrialStatus } from './trial'

export type SortOption =
    | 'relevance'
    | 'lastUpdatedDesc'
    | 'lastUpdatedAsc'
    | 'enrollmentDesc'

export interface TrialFilters {
    /** Free-text query (title, condition, intervention, sponsor terms). */
    query: string
    /** Condition / disease term. */
    condition: string
    /** Registry-native identifier lookup, e.g. an NCT id. */
    trialId: string
    sponsor: string
    intervention: string
    /** Empty array = any phase. */
    phases: TrialPhase[]
    /** Empty array = any status. */
    statuses: TrialStatus[]
    /** Country name or ISO term as accepted by the source registries. */
    country: string
    /** Which registries to query. Empty = all available. */
    sources: RegistrySource[]
    sort: SortOption
    page: number
    pageSize: number
}

export const DEFAULT_FILTERS: TrialFilters = {
    query: '',
    condition: '',
    trialId: '',
    sponsor: '',
    intervention: '',
    phases: [],
    statuses: [],
    country: '',
    sources: [],
    sort: 'relevance',
    page: 1,
    pageSize: 20,
}

/** True when the user has entered no meaningful search criteria. */
export const isEmptyQuery = (f: TrialFilters): boolean =>
    !f.query.trim() &&
    !f.condition.trim() &&
    !f.trialId.trim() &&
    !f.sponsor.trim() &&
    !f.intervention.trim() &&
    !f.country.trim()
