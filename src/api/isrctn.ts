/**
 * ISRCTN registry adapter (BioMed Central public query API, XML).
 *
 * ISRCTN is a WHO Primary Registry. Its API is CORS-enabled, so records are
 * fetched and parsed live in the browser - all real data, nothing synthesized.
 *
 * ISRCTN's schema is richer and less normalized than CT.gov's, and it does not
 * expose clean phase/status filter parameters. This adapter is therefore a
 * best-effort SECONDARY source: it contributes real matches to the merged
 * result set for the first page, and reports its own match count. Deep
 * pagination and phase/status filtering are driven by ClinicalTrials.gov.
 *
 * XML parsing uses the browser DOMParser; in non-DOM environments the adapter
 * degrades to an honest "unavailable" source report rather than throwing.
 */

import { ENDPOINTS } from '../config/constants'
import { httpGet } from './httpClient'
import type { TrialDataSource } from './TrialDataSource'
import type {
    RegistrySource,
    TrialDetail,
    TrialFilters,
    TrialSummary,
} from '../types'

const SOURCE: RegistrySource = 'ISRCTN'

const hasDomParser = (): boolean => typeof DOMParser !== 'undefined'

/** First matching descendant text, namespace-agnostic. */
const text = (el: Element | Document, tag: string): string | undefined => {
    const nodes =
        el.getElementsByTagName(tag).length > 0
            ? el.getElementsByTagName(tag)
            : (el as Element).getElementsByTagNameNS?.('*', tag)
    const value = nodes && nodes.length > 0 ? nodes[0].textContent : undefined
    const trimmed = value?.trim()
    return trimmed || undefined
}

/** All matching descendant texts, namespace-agnostic. */
const texts = (el: Element | Document, tag: string): string[] => {
    const list =
        el.getElementsByTagName(tag).length > 0
            ? el.getElementsByTagName(tag)
            : (el as Element).getElementsByTagNameNS?.('*', tag)
    const out: string[] = []
    if (list) {
        for (let i = 0; i < list.length; i++) {
            const t = list[i].textContent?.trim()
            if (t) out.push(t)
        }
    }
    return out
}

const buildQuery = (filters: TrialFilters): string => {
    // ISRCTN id lookup takes precedence.
    const idMatch = filters.trialId.trim().match(/(\d{6,8})/)
    if (
        filters.trialId.trim().toUpperCase().startsWith('ISRCTN') &&
        idMatch
    ) {
        return `isrctn:${idMatch[1]}`
    }
    const terms = [
        filters.query,
        filters.condition,
        filters.intervention,
        filters.sponsor,
        filters.country,
    ]
        .map((t) => t.trim())
        .filter(Boolean)
    return terms.join(' ')
}

const parseTrials = (xml: string): { trials: TrialSummary[]; total: number } => {
    const doc = new DOMParser().parseFromString(xml, 'text/xml')
    if (doc.getElementsByTagName('parsererror').length > 0) {
        throw new Error('ISRCTN XML parse error')
    }

    const root = doc.documentElement
    const total = Number(root?.getAttribute('totalCount') ?? '0') || 0

    const fullTrials = doc.getElementsByTagName('fullTrial')
    const trials: TrialSummary[] = []
    for (let i = 0; i < fullTrials.length; i++) {
        const ft = fullTrials[i]
        const idNum = text(ft, 'isrctn')
        if (!idNum) continue
        const registryId = `ISRCTN${idNum}`
        const title =
            text(ft, 'title') || text(ft, 'scientificTitle') || registryId

        const conditions = texts(ft, 'condition')
        const interventions = texts(ft, 'interventionType')
        const country = texts(ft, 'country')[0]
        const sponsor = text(ft, 'sponsor')
        const enrolment = text(ft, 'targetEnrolment')

        trials.push({
            id: `isrctn:${registryId}`,
            registryId,
            source: SOURCE,
            title,
            // ISRCTN does not expose a normalized recruitment status field in
            // this API view; label as Unknown rather than guessing.
            status: 'Unknown',
            phase: 'Unknown',
            conditions,
            interventions,
            sponsor,
            country,
            enrollmentCount: enrolment ? Number(enrolment) || undefined : undefined,
            sourceUrl: `https://www.isrctn.com/${registryId}`,
        })
    }
    return { trials, total }
}

export const isrctnSource: TrialDataSource = {
    source: SOURCE,
    liveQueryable: true,

    async search(filters, signal) {
        if (!hasDomParser()) {
            return {
                trials: [],
                totalCount: 0,
                sourceReports: [
                    {
                        source: SOURCE,
                        ok: false,
                        count: 0,
                        message: 'ISRCTN requires a browser environment.',
                    },
                ],
            }
        }

        const q = buildQuery(filters)
        if (!q) {
            return { trials: [], totalCount: 0, sourceReports: [] }
        }

        const limit = Math.min(filters.pageSize || 20, 25)
        const url = `${ENDPOINTS.isrctn}/format/default?q=${encodeURIComponent(
            q
        )}&limit=${limit}`

        try {
            const xml = await httpGet<string>(url, { signal, parse: 'text' })
            const { trials, total } = parseTrials(xml)
            return {
                trials,
                totalCount: total,
                sourceReports: [{ source: SOURCE, ok: true, count: trials.length }],
            }
        } catch (e) {
            // Never let a secondary source break the merged search.
            return {
                trials: [],
                totalCount: 0,
                sourceReports: [
                    {
                        source: SOURCE,
                        ok: false,
                        count: 0,
                        message:
                            'ISRCTN could not be reached. Use the registry link to search it directly.',
                    },
                ],
            }
        }
    },

    async getById(registryId, signal) {
        if (!hasDomParser()) return null
        const idMatch = registryId.match(/(\d{6,8})/)
        if (!registryId.toUpperCase().startsWith('ISRCTN') || !idMatch) {
            return null
        }
        const url = `${ENDPOINTS.isrctn}/format/default?q=isrctn:${idMatch[1]}&limit=1`
        try {
            const xml = await httpGet<string>(url, { signal, parse: 'text' })
            const { trials } = parseTrials(xml)
            const summary = trials[0]
            if (!summary) return null
            const detail: TrialDetail = {
                ...summary,
                locations: summary.country
                    ? [{ country: summary.country }]
                    : [],
                contacts: [],
                secondaryIds: [],
                missingFields: [
                    'Normalized status',
                    'Phase',
                    'Structured eligibility criteria',
                ],
            }
            return detail
        } catch {
            return null
        }
    },
}
