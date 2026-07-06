import { buildExplainer, explainerToText } from '../utils/explainerBuilder'
import type { TrialDetail } from '../types'

const trial: TrialDetail = {
    id: 'ctgov:NCT00000000',
    registryId: 'NCT00000000',
    source: 'ClinicalTrials.gov',
    title: 'A study of Example Drug in Adults with Condition X',
    status: 'Recruiting',
    phase: 'Phase 3',
    conditions: ['Condition X'],
    interventions: ['Example Drug'],
    sponsor: 'Example University',
    country: 'Kenya',
    enrollmentCount: 240,
    lastUpdated: '2024-05',
    sourceUrl: 'https://clinicaltrials.gov/study/NCT00000000',
    officialTitle: 'A Randomized Phase 3 Study of Example Drug',
    briefSummary: 'This study tests Example Drug against standard care.',
    studyType: 'Interventional',
    startDate: '2024-01',
    completionDate: '2025-12',
    eligibilityCriteria: 'Adults aged 18+ with Condition X.',
    sex: 'ALL',
    minimumAge: '18 Years',
    locations: [{ facility: 'Site A', city: 'Nairobi', country: 'Kenya' }],
    contacts: [],
    secondaryIds: [],
    missingFields: [],
}

describe('buildExplainer', () => {
    it('produces a patient explainer strictly from real fields', () => {
        const ex = buildExplainer(trial, 'patient')
        expect(ex.audience).toBe('patient')
        expect(ex.generatedBy).toBe('deterministic')
        const text = explainerToText(ex).toLowerCase()
        // Real field values appear...
        expect(text).toContain('condition x')
        expect(text).toContain('example drug')
        // ...and provenance is always attached.
        expect(text).toContain('nct00000000')
        expect(ex.questionsToAsk.length).toBeGreaterThan(0)
    })

    it('never invents interventions when the field is empty', () => {
        const sparse: TrialDetail = {
            ...trial,
            interventions: [],
            conditions: [],
            briefSummary: undefined,
            missingFields: ['Interventions'],
        }
        const ex = buildExplainer(sparse, 'patient')
        const text = explainerToText(ex).toLowerCase()
        expect(text).toContain('not listed in the registry record')
        expect(ex.omittedForMissingData).toContain('Interventions')
    })

    it('builds a clinician summary with design facts', () => {
        const ex = buildExplainer(trial, 'clinician')
        const text = explainerToText(ex)
        expect(text).toContain('Phase: Phase 3')
        expect(text).toContain('Example University')
    })
})
