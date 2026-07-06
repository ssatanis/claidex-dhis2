/**
 * Search aggregator.
 *
 * Runs all enabled live registry adapters concurrently, merges their real
 * results into one list, de-duplicates, and reports each source's outcome so
 * the UI can be transparent about what was and wasn't queried.
 *
 * Pagination note: ClinicalTrials.gov is the paginated primary source (opaque
 * page tokens). Secondary sources (ISRCTN) contribute first-page matches and
 * their own match counts. On pages beyond the first, only the paginated primary
 * is queried, to avoid re-showing the same secondary results. This behaviour is
 * documented in API_CONTRACT.md and surfaced via source reports in the UI.
 */

import { clinicalTrialsGovSource } from './clinicalTrialsGov'
import { isrctnSource } from './isrctn'
import type { TrialDataSource } from './TrialDataSource'
import type {
    RegistrySource,
    SortOption,
    SourceReport,
    TrialDetail,
    TrialFilters,
    TrialSearchResult,
    TrialSummary,
} from '../types'

/** All live-queryable adapters, primary first. */
const LIVE_SOURCES: TrialDataSource[] = [clinicalTrialsGovSource, isrctnSource]
const PRIMARY = clinicalTrialsGovSource

const enabledSources = (filters: TrialFilters): TrialDataSource[] => {
    if (filters.sources.length === 0) return LIVE_SOURCES
    return LIVE_SOURCES.filter((s) => filters.sources.includes(s.source))
}

const dedupe = (trials: TrialSummary[]): TrialSummary[] => {
    const seen = new Set<string>()
    const out: TrialSummary[] = []
    for (const t of trials) {
        const key = t.registryId.toUpperCase()
        if (seen.has(key)) continue
        seen.add(key)
        out.push(t)
    }
    return out
}

const sortMerged = (
    trials: TrialSummary[],
    sort: SortOption
): TrialSummary[] => {
    const copy = [...trials]
    switch (sort) {
        case 'lastUpdatedDesc':
            return copy.sort((a, b) =>
                (b.lastUpdated ?? '').localeCompare(a.lastUpdated ?? '')
            )
        case 'lastUpdatedAsc':
            return copy.sort((a, b) =>
                (a.lastUpdated ?? '').localeCompare(b.lastUpdated ?? '')
            )
        case 'enrollmentDesc':
            return copy.sort(
                (a, b) => (b.enrollmentCount ?? 0) - (a.enrollmentCount ?? 0)
            )
        case 'relevance':
        default:
            return copy // preserve source relevance ordering (primary first)
    }
}

export async function searchTrials(
    filters: TrialFilters,
    signal?: AbortSignal
): Promise<TrialSearchResult> {
    const sources = enabledSources(filters)

    // Beyond the first page, query only the paginated primary source.
    const querySet =
        filters.page > 1
            ? sources.filter((s) => s.source === PRIMARY.source)
            : sources

    const settled = await Promise.allSettled(
        querySet.map((s) => s.search(filters, signal))
    )

    const merged: TrialSummary[] = []
    const sourceReports: SourceReport[] = []
    let totalCount = 0

    settled.forEach((res, idx) => {
        const src = querySet[idx].source as RegistrySource
        if (res.status === 'fulfilled') {
            merged.push(...res.value.trials)
            totalCount += res.value.totalCount
            sourceReports.push(...res.value.sourceReports)
        } else {
            sourceReports.push({
                source: src,
                ok: false,
                count: 0,
                message: 'This registry could not be reached.',
            })
        }
    })

    const trials = sortMerged(dedupe(merged), filters.sort)

    return {
        trials,
        totalCount,
        sourceReports,
    }
}

/**
 * Resolve a single trial by registry-native id. Tries the adapter whose id
 * format matches; NCT ids go to CT.gov, ISRCTN ids to ISRCTN.
 */
export async function getTrialById(
    registryId: string,
    signal?: AbortSignal
): Promise<TrialDetail | null> {
    const id = registryId.trim()
    const ordered = id.toUpperCase().startsWith('ISRCTN')
        ? [isrctnSource, clinicalTrialsGovSource]
        : [clinicalTrialsGovSource, isrctnSource]

    for (const source of ordered) {
        const detail = await source.getById(id, signal)
        if (detail) return detail
    }
    return null
}
