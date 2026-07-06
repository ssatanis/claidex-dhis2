// Compass PDF data contract. Mirrors the shape the Claidex Compass model emits
// in its `__compass_pdf_trigger` block, parsed on the client and consumed by the
// pdf-lib generator. Kept in sync with the Claidex app's lib/compass/types.

export interface CompassPatientProfile {
    condition: string
    age: string
    sex: string
    location: string
    biomarkers: string[]
    priorTreatments: string[]
    /** Optional name, only ever used for the PDF, never sent to any API. */
    name?: string
}

export interface CompassPdfTrialSite {
    name: string
    city: string
    state: string
    distanceMiles: number | null
}

export interface CompassPdfTrial {
    nctId: string
    title: string
    phase: string
    sponsor: string
    qualificationReasons: string[]
    nearestSite: CompassPdfTrialSite | null
    telehealth: boolean
    homeDelivery: boolean
    contactName: string
    contactEmail: string
    contactPhone: string
    claidexMRS: number | null
    claidexContext: string
    drugName: string
}

/** The exact JSON shape the model emits to trigger PDF generation. */
export interface CompassPdfData {
    __compass_pdf_trigger: true
    patient: CompassPatientProfile
    trials: CompassPdfTrial[]
    generatedAt: string
}
