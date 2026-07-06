/**
 * Normalized clinical-trial model.
 *
 * Every registry (ClinicalTrials.gov, ISRCTN, …) has its own schema. Adapters
 * map each raw record into this shared shape so the UI stays source-agnostic.
 * Fields are intentionally nullable: real registry records are frequently
 * incomplete, and the UI must label missing data honestly rather than guess.
 */

/** Which official registry a record originated from. */
export type RegistrySource =
    | 'ClinicalTrials.gov'
    | 'ISRCTN'
    | 'WHO ICTRP'
    | 'EU CTIS'
    | 'Other'

/** Coarse recruitment/lifecycle status, normalized across registries. */
export type TrialStatus =
    | 'Recruiting'
    | 'Not yet recruiting'
    | 'Enrolling by invitation'
    | 'Active, not recruiting'
    | 'Completed'
    | 'Suspended'
    | 'Terminated'
    | 'Withdrawn'
    | 'Unknown'

/** Study phase, normalized. `N/A` covers observational / non-phased studies. */
export type TrialPhase =
    | 'Early Phase 1'
    | 'Phase 1'
    | 'Phase 1/2'
    | 'Phase 2'
    | 'Phase 2/3'
    | 'Phase 3'
    | 'Phase 4'
    | 'N/A'
    | 'Unknown'

export interface TrialLocation {
    facility?: string
    city?: string
    country?: string
    status?: string
}

export interface TrialContact {
    name?: string
    role?: string
    phone?: string
    email?: string
}

/** Compact record used in results lists. */
export interface TrialSummary {
    /** Stable id, prefixed by source, e.g. "ctgov:NCT01234567". */
    id: string
    /** Registry-native identifier, e.g. "NCT01234567" or "ISRCTN12345678". */
    registryId: string
    source: RegistrySource
    title: string
    status: TrialStatus
    phase: TrialPhase
    conditions: string[]
    interventions: string[]
    sponsor?: string
    /** Primary or first listed country. */
    country?: string
    enrollmentCount?: number
    lastUpdated?: string
    /** Canonical public URL for the record on its home registry. */
    sourceUrl: string
}

/** Full record used in the detail view. Extends the summary. */
export interface TrialDetail extends TrialSummary {
    officialTitle?: string
    briefSummary?: string
    detailedDescription?: string
    studyType?: string
    startDate?: string
    completionDate?: string
    eligibilityCriteria?: string
    sex?: string
    minimumAge?: string
    maximumAge?: string
    healthyVolunteers?: boolean
    locations: TrialLocation[]
    contacts: TrialContact[]
    secondaryIds: string[]
    /** Free-text fields the registry did not populate (for honest UI labeling). */
    missingFields: string[]
}

export interface TrialSearchResult {
    trials: TrialSummary[]
    totalCount: number
    /** Opaque cursor/token for the next page, when the source supports it. */
    nextPageToken?: string
    /** Sources that were queried and their per-source outcome. */
    sourceReports: SourceReport[]
}

/** Per-source outcome so the UI can show which registries answered. */
export interface SourceReport {
    source: RegistrySource
    ok: boolean
    count: number
    /** User-facing note when a source failed or was unreachable. */
    message?: string
}
