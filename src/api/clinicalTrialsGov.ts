/**
 * ClinicalTrials.gov API v2 adapter.
 *
 * Public NIH/NLM registry, no API key, CORS-enabled, ~200-country coverage.
 * This is the app's primary live data source. All data returned here is real,
 * fetched directly from clinicaltrials.gov - nothing is synthesized.
 *
 * API reference: https://clinicaltrials.gov/data-api/api
 */

import { ENDPOINTS, PAGING } from '../config/constants'
import { httpGet, HttpError } from './httpClient'
import type { TrialDataSource } from './TrialDataSource'
import type {
    RegistrySource,
    TrialDetail,
    TrialFilters,
    TrialLocation,
    TrialPhase,
    TrialStatus,
    TrialSummary,
} from '../types'

const SOURCE: RegistrySource = 'ClinicalTrials.gov'

/* ----------------------------- enum mapping ------------------------------ */

const STATUS_FROM_API: Record<string, TrialStatus> = {
    RECRUITING: 'Recruiting',
    NOT_YET_RECRUITING: 'Not yet recruiting',
    ENROLLING_BY_INVITATION: 'Enrolling by invitation',
    ACTIVE_NOT_RECRUITING: 'Active, not recruiting',
    COMPLETED: 'Completed',
    SUSPENDED: 'Suspended',
    TERMINATED: 'Terminated',
    WITHDRAWN: 'Withdrawn',
    UNKNOWN: 'Unknown',
}

const STATUS_TO_API: Partial<Record<TrialStatus, string>> = {
    Recruiting: 'RECRUITING',
    'Not yet recruiting': 'NOT_YET_RECRUITING',
    'Enrolling by invitation': 'ENROLLING_BY_INVITATION',
    'Active, not recruiting': 'ACTIVE_NOT_RECRUITING',
    Completed: 'COMPLETED',
    Suspended: 'SUSPENDED',
    Terminated: 'TERMINATED',
    Withdrawn: 'WITHDRAWN',
    Unknown: 'UNKNOWN',
}

const PHASE_FROM_API: Record<string, TrialPhase> = {
    EARLY_PHASE1: 'Early Phase 1',
    PHASE1: 'Phase 1',
    PHASE2: 'Phase 2',
    PHASE3: 'Phase 3',
    PHASE4: 'Phase 4',
    NA: 'N/A',
}

const PHASE_TO_API: Partial<Record<TrialPhase, string>> = {
    'Early Phase 1': 'EARLY_PHASE1',
    'Phase 1': 'PHASE1',
    'Phase 2': 'PHASE2',
    'Phase 3': 'PHASE3',
    'Phase 4': 'PHASE4',
    'N/A': 'NA',
}

const mapStatus = (raw?: string): TrialStatus =>
    (raw && STATUS_FROM_API[raw]) || 'Unknown'

const mapPhases = (raw?: string[]): TrialPhase => {
    if (!raw || raw.length === 0) return 'N/A'
    if (raw.length === 1) return PHASE_FROM_API[raw[0]] ?? 'Unknown'
    // Combined designations, e.g. PHASE1 + PHASE2.
    const set = new Set(raw)
    if (set.has('PHASE1') && set.has('PHASE2')) return 'Phase 1/2'
    if (set.has('PHASE2') && set.has('PHASE3')) return 'Phase 2/3'
    return PHASE_FROM_API[raw[0]] ?? 'Unknown'
}

/* ------------------------------- raw types ------------------------------- */
/* Only the fields we consume are typed; the API returns much more. */

interface RawStudy {
    protocolSection?: {
        identificationModule?: {
            nctId?: string
            briefTitle?: string
            officialTitle?: string
            orgStudyIdInfo?: { id?: string }
            secondaryIdInfos?: Array<{ id?: string }>
            organization?: { fullName?: string }
        }
        statusModule?: {
            overallStatus?: string
            startDateStruct?: { date?: string }
            completionDateStruct?: { date?: string }
            lastUpdatePostDateStruct?: { date?: string }
        }
        sponsorCollaboratorsModule?: {
            leadSponsor?: { name?: string }
        }
        descriptionModule?: {
            briefSummary?: string
            detailedDescription?: string
        }
        conditionsModule?: { conditions?: string[] }
        designModule?: {
            studyType?: string
            phases?: string[]
            enrollmentInfo?: { count?: number }
        }
        armsInterventionsModule?: {
            interventions?: Array<{ name?: string; type?: string }>
        }
        eligibilityModule?: {
            eligibilityCriteria?: string
            sex?: string
            minimumAge?: string
            maximumAge?: string
            healthyVolunteers?: boolean
        }
        contactsLocationsModule?: {
            locations?: Array<{
                facility?: string
                city?: string
                country?: string
                status?: string
            }>
            centralContacts?: Array<{
                name?: string
                role?: string
                phone?: string
                email?: string
            }>
        }
    }
}

interface RawSearchResponse {
    totalCount?: number
    studies?: RawStudy[]
    nextPageToken?: string
}

/* ------------------------------- mapping --------------------------------- */

const publicUrl = (nctId: string): string =>
    `https://clinicaltrials.gov/study/${nctId}`

const toSummary = (study: RawStudy): TrialSummary | null => {
    const p = study.protocolSection
    const nctId = p?.identificationModule?.nctId
    if (!nctId) return null

    const conditions = p?.conditionsModule?.conditions ?? []
    const interventions = (p?.armsInterventionsModule?.interventions ?? [])
        .map((i) => i.name?.trim())
        .filter((n): n is string => Boolean(n))
    const firstCountry = p?.contactsLocationsModule?.locations?.find(
        (l) => l.country
    )?.country

    return {
        id: `ctgov:${nctId}`,
        registryId: nctId,
        source: SOURCE,
        title:
            p?.identificationModule?.briefTitle?.trim() ||
            p?.identificationModule?.officialTitle?.trim() ||
            nctId,
        status: mapStatus(p?.statusModule?.overallStatus),
        phase: mapPhases(p?.designModule?.phases),
        conditions,
        interventions,
        sponsor: p?.sponsorCollaboratorsModule?.leadSponsor?.name?.trim(),
        country: firstCountry,
        enrollmentCount: p?.designModule?.enrollmentInfo?.count,
        lastUpdated: p?.statusModule?.lastUpdatePostDateStruct?.date,
        sourceUrl: publicUrl(nctId),
    }
}

const toDetail = (study: RawStudy): TrialDetail | null => {
    const summary = toSummary(study)
    if (!summary) return null
    const p = study.protocolSection

    const locations: TrialLocation[] = (
        p?.contactsLocationsModule?.locations ?? []
    ).map((l) => ({
        facility: l.facility,
        city: l.city,
        country: l.country,
        status: l.status,
    }))

    const contacts = (p?.contactsLocationsModule?.centralContacts ?? []).map(
        (c) => ({
            name: c.name,
            role: c.role,
            phone: c.phone,
            email: c.email,
        })
    )

    const secondaryIds = [
        p?.identificationModule?.orgStudyIdInfo?.id,
        ...(p?.identificationModule?.secondaryIdInfos ?? []).map((s) => s.id),
    ].filter((id): id is string => Boolean(id))

    const elig = p?.eligibilityModule
    const detail: TrialDetail = {
        ...summary,
        officialTitle: p?.identificationModule?.officialTitle?.trim(),
        briefSummary: p?.descriptionModule?.briefSummary?.trim(),
        detailedDescription: p?.descriptionModule?.detailedDescription?.trim(),
        studyType: p?.designModule?.studyType,
        startDate: p?.statusModule?.startDateStruct?.date,
        completionDate: p?.statusModule?.completionDateStruct?.date,
        eligibilityCriteria: elig?.eligibilityCriteria?.trim(),
        sex: elig?.sex,
        minimumAge: elig?.minimumAge,
        maximumAge: elig?.maximumAge,
        healthyVolunteers: elig?.healthyVolunteers,
        locations,
        contacts,
        secondaryIds,
        missingFields: [],
    }

    // Record which meaningful fields the registry did not populate, so the UI
    // can label absence honestly rather than implying completeness.
    const missing: string[] = []
    if (!detail.briefSummary) missing.push('Brief summary')
    if (!detail.eligibilityCriteria) missing.push('Eligibility criteria')
    if (detail.interventions.length === 0) missing.push('Interventions')
    if (locations.length === 0) missing.push('Study locations')
    if (!detail.sponsor) missing.push('Sponsor')
    detail.missingFields = missing

    return detail
}

/* ------------------------------ query build ------------------------------ */

const SEARCH_FIELDS = [
    'IdentificationModule',
    'StatusModule',
    'SponsorCollaboratorsModule',
    'ConditionsModule',
    'DesignModule',
    'ArmsInterventionsModule',
    'ContactsLocationsModule',
].join(',')

const buildAdvancedFilter = (filters: TrialFilters): string | undefined => {
    const clauses: string[] = []

    const apiStatuses = filters.statuses
        .map((s) => STATUS_TO_API[s])
        .filter((v): v is string => Boolean(v))
    if (apiStatuses.length > 0) {
        clauses.push(`AREA[OverallStatus](${apiStatuses.join(' OR ')})`)
    }

    const apiPhases = filters.phases
        .map((ph) => PHASE_TO_API[ph])
        .filter((v): v is string => Boolean(v))
    if (apiPhases.length > 0) {
        clauses.push(`AREA[Phase](${apiPhases.join(' OR ')})`)
    }

    return clauses.length ? clauses.join(' AND ') : undefined
}

const buildSort = (filters: TrialFilters): string | undefined => {
    switch (filters.sort) {
        case 'lastUpdatedDesc':
            return 'LastUpdatePostDate:desc'
        case 'lastUpdatedAsc':
            return 'LastUpdatePostDate:asc'
        case 'enrollmentDesc':
            return 'EnrollmentCount:desc'
        case 'relevance':
        default:
            return undefined // API default is relevance when a query is present
    }
}

/* ------------------------------- adapter --------------------------------- */

/**
 * Cursor cache: CT.gov v2 pages via opaque `nextPageToken`, not offsets. The UI
 * exposes page numbers, so we remember the token for each next page within a
 * single search session keyed by the query signature.
 */
const tokenCache = new Map<string, string>()

const querySignature = (filters: TrialFilters): string =>
    JSON.stringify({
        q: filters.query,
        c: filters.condition,
        i: filters.intervention,
        s: filters.sponsor,
        id: filters.trialId,
        co: filters.country,
        ph: filters.phases,
        st: filters.statuses,
        so: filters.sort,
        ps: filters.pageSize,
    })

export const clinicalTrialsGovSource: TrialDataSource = {
    source: SOURCE,
    liveQueryable: true,

    async search(filters, signal) {
        const pageSize = Math.min(
            filters.pageSize || PAGING.defaultPageSize,
            PAGING.maxPageSize
        )
        const params = new URLSearchParams()
        params.set('format', 'json')
        params.set('countTotal', 'true')
        params.set('pageSize', String(pageSize))
        params.set('fields', SEARCH_FIELDS)

        if (filters.query.trim()) params.set('query.term', filters.query.trim())
        if (filters.condition.trim())
            params.set('query.cond', filters.condition.trim())
        if (filters.intervention.trim())
            params.set('query.intr', filters.intervention.trim())
        if (filters.sponsor.trim())
            params.set('query.spons', filters.sponsor.trim())
        if (filters.trialId.trim()) params.set('query.id', filters.trialId.trim())
        if (filters.country.trim())
            params.set('query.locn', filters.country.trim())

        const advanced = buildAdvancedFilter(filters)
        if (advanced) params.set('filter.advanced', advanced)
        const sort = buildSort(filters)
        if (sort) params.set('sort', sort)

        // Resolve the page token for the requested page number.
        const sig = querySignature(filters)
        if (filters.page > 1) {
            const token = tokenCache.get(`${sig}#${filters.page}`)
            if (token) params.set('pageToken', token)
        }

        const url = `${ENDPOINTS.clinicalTrialsGov}/studies?${params.toString()}`
        const data = await httpGet<RawSearchResponse>(url, { signal })

        const trials = (data.studies ?? [])
            .map(toSummary)
            .filter((t): t is TrialSummary => t !== null)

        // Cache the token that fetches the NEXT page for this query.
        if (data.nextPageToken) {
            tokenCache.set(`${sig}#${filters.page + 1}`, data.nextPageToken)
        }

        return {
            trials,
            totalCount: data.totalCount ?? trials.length,
            nextPageToken: data.nextPageToken,
            sourceReports: [
                { source: SOURCE, ok: true, count: trials.length },
            ],
        }
    },

    async getById(registryId, signal) {
        const id = registryId.trim().toUpperCase()
        if (!/^NCT\d{8}$/.test(id)) {
            // Not an NCT id - this registry cannot resolve it.
            return null
        }
        const url = `${ENDPOINTS.clinicalTrialsGov}/studies/${id}?format=json`
        try {
            const study = await httpGet<RawStudy>(url, { signal })
            return toDetail(study)
        } catch (e) {
            if (e instanceof HttpError && e.status === 404) return null
            throw e
        }
    },
}
