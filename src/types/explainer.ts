/**
 * Explainer models.
 *
 * Explainers are produced deterministically from a trial's real registry fields
 * (see utils/explainerBuilder). They restate existing facts in plain language;
 * they never introduce clinical claims that are not present in the source
 * record. An optional Claidex backend may later provide richer generation.
 */

export type ExplainerAudience = 'patient' | 'clinician' | 'handout'

export interface ExplainerSection {
    heading: string
    /** Plain-text paragraphs. Rendered verbatim; safe to copy/print. */
    paragraphs: string[]
}

export interface Explainer {
    audience: ExplainerAudience
    title: string
    sections: ExplainerSection[]
    /** Generic, non-personalized prompts the reader may raise with a clinician. */
    questionsToAsk: string[]
    /** How this explainer was produced, for provenance labeling. */
    generatedBy: 'deterministic' | 'claidex-backend'
    /** Fields that were unavailable in the source and thus omitted. */
    omittedForMissingData: string[]
}
