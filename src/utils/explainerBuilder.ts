/**
 * Deterministic explainer builder.
 *
 * Produces patient-friendly, clinician-oriented, and printable-handout
 * explanations STRICTLY from a trial's real registry fields. It restates
 * existing facts in plainer language and adds standard, generic discussion
 * prompts. It never introduces clinical claims, recommendations, eligibility
 * judgements, or numbers that are not present in the source record.
 *
 * When a Claidex backend is connected it may supersede this with richer text;
 * this module guarantees a safe, non-fabricated baseline that works offline.
 */

import type {
    Explainer,
    ExplainerAudience,
    ExplainerSection,
    TrialDetail,
    TrialPhase,
    TrialStatus,
} from '../types'
import { formatDate, joinList, orDash } from './format'
import { toParagraphs, cleanText } from './sanitize'

/* --------------------------- plain-language maps -------------------------- */

const PHASE_PLAIN: Record<TrialPhase, string> = {
    'Early Phase 1':
        'a very early study, looking mainly at safety and how the body handles the treatment in a small group.',
    'Phase 1':
        'an early-stage study that focuses mainly on safety and the right dose, usually in a small number of people.',
    'Phase 1/2':
        'an early study that combines first safety checks with an early look at whether the treatment works.',
    'Phase 2':
        'a study that looks at whether the treatment works and continues to check its safety.',
    'Phase 2/3':
        'a study that looks at how well the treatment works while also comparing it in a larger group.',
    'Phase 3':
        'a larger study comparing the treatment against current standard care to confirm benefit and monitor side effects.',
    'Phase 4':
        'a study of a treatment already in use, gathering more information on long-term safety and effectiveness.',
    'N/A':
        'a study that is not organised into treatment phases - often an observational study that follows people without assigning a treatment for research purposes.',
    Unknown: 'a study whose phase is not stated in the registry record.',
}

const STATUS_PLAIN: Record<TrialStatus, string> = {
    Recruiting: 'currently looking for participants.',
    'Not yet recruiting': 'not yet open, but expected to look for participants.',
    'Enrolling by invitation':
        'enrolling only people who were specifically invited.',
    'Active, not recruiting':
        'ongoing, but no longer accepting new participants.',
    Completed: 'finished; it is no longer enrolling.',
    Suspended: 'paused for now.',
    Terminated: 'stopped before completion.',
    Withdrawn: 'withdrawn before enrolling participants.',
    Unknown: 'of an unclear status in the registry record.',
}

/* ------------------------------ shared parts ------------------------------ */

const overviewParagraph = (t: TrialDetail): string => {
    const what = t.interventions.length
        ? `It is studying ${joinList(t.interventions, 4)}.`
        : 'The specific treatments being studied are not listed in the registry record.'
    const cond = t.conditions.length
        ? `The study focuses on ${joinList(t.conditions, 4)}.`
        : 'The condition under study is not listed in the registry record.'
    return `This is ${PHASE_PLAIN[t.phase]} ${cond} ${what} According to the registry, the study is ${STATUS_PLAIN[t.status]}`
}

const whereParagraph = (t: TrialDetail): string | undefined => {
    const countries = Array.from(
        new Set(t.locations.map((l) => l.country).filter(Boolean) as string[])
    )
    if (countries.length === 0) return undefined
    return `Study locations are listed in: ${joinList(countries, 6)}.`
}

const timelineParagraph = (t: TrialDetail): string | undefined => {
    if (!t.startDate && !t.completionDate) return undefined
    const start = t.startDate ? `started around ${formatDate(t.startDate)}` : ''
    const end = t.completionDate
        ? `with an expected completion around ${formatDate(t.completionDate)}`
        : ''
    return `The study ${[start, end].filter(Boolean).join(' ')}.`.replace(
        ' .',
        '.'
    )
}

const eligibilityParagraphs = (t: TrialDetail): string[] => {
    const facts: string[] = []
    if (t.sex && t.sex.toUpperCase() !== 'ALL')
        facts.push(`eligibility is limited to: ${t.sex.toLowerCase()}`)
    if (t.minimumAge) facts.push(`minimum age ${t.minimumAge}`)
    if (t.maximumAge) facts.push(`maximum age ${t.maximumAge}`)
    if (typeof t.healthyVolunteers === 'boolean')
        facts.push(
            t.healthyVolunteers
                ? 'healthy volunteers may be accepted'
                : 'healthy volunteers are not accepted'
        )
    const out: string[] = []
    if (facts.length)
        out.push(
            `The registry lists these participation details: ${facts.join(
                '; '
            )}.`
        )
    return out
}

const STANDARD_QUESTIONS = [
    'Is this study a suitable option to consider for my situation, and why or why not?',
    'What would taking part actually involve - visits, tests, time, and travel?',
    'What are the possible benefits and the known risks or side effects?',
    'What happens to my usual care if I take part, and what if I choose not to?',
    'Who do I contact with questions, and can I stop taking part at any time?',
]

const provenanceNote = (t: TrialDetail): string =>
    `Source: ${t.source} record ${t.registryId}. This summary restates information from that public registry record; it is informational support only and does not replace professional medical advice.`

/* ------------------------------ audiences -------------------------------- */

const patientExplainer = (t: TrialDetail): ExplainerSection[] => {
    const sections: ExplainerSection[] = [
        {
            heading: 'What this study is about',
            paragraphs: [overviewParagraph(t)],
        },
    ]
    const where = whereParagraph(t)
    const when = timelineParagraph(t)
    const wherewhen = [where, when].filter(Boolean) as string[]
    if (wherewhen.length)
        sections.push({ heading: 'Where and when', paragraphs: wherewhen })

    const elig = eligibilityParagraphs(t)
    if (elig.length)
        sections.push({ heading: 'Who it is for', paragraphs: elig })

    if (t.briefSummary) {
        sections.push({
            heading: 'In the study team’s words',
            paragraphs: toParagraphs(t.briefSummary),
        })
    }
    return sections
}

const clinicianExplainer = (t: TrialDetail): ExplainerSection[] => {
    const design: string[] = []
    design.push(
        `${t.source} ${t.registryId}. Phase: ${t.phase}. Status: ${
            t.status
        }. Study type: ${orDash(t.studyType)}.`
    )
    if (t.sponsor) design.push(`Lead sponsor: ${t.sponsor}.`)
    if (t.conditions.length)
        design.push(`Conditions: ${t.conditions.join(', ')}.`)
    if (t.interventions.length)
        design.push(`Interventions: ${t.interventions.join(', ')}.`)
    if (typeof t.enrollmentCount === 'number')
        design.push(`Planned/actual enrollment: ${t.enrollmentCount}.`)

    const sections: ExplainerSection[] = [
        { heading: 'Design at a glance', paragraphs: design },
    ]

    if (t.eligibilityCriteria) {
        sections.push({
            heading: 'Eligibility (verbatim from registry)',
            paragraphs: toParagraphs(t.eligibilityCriteria),
        })
    }
    if (t.detailedDescription || t.briefSummary) {
        sections.push({
            heading: 'Description',
            paragraphs: toParagraphs(
                t.detailedDescription || t.briefSummary || ''
            ),
        })
    }
    if (t.locations.length) {
        const locs = t.locations
            .slice(0, 12)
            .map((l) =>
                [l.facility, l.city, l.country].filter(Boolean).join(', ')
            )
            .filter(Boolean)
        if (locs.length)
            sections.push({ heading: 'Sites', paragraphs: locs })
    }
    return sections
}

const handoutExplainer = (t: TrialDetail): ExplainerSection[] => {
    // A compact, printable version combining the plainest patient content.
    const sections: ExplainerSection[] = [
        {
            heading: t.title,
            paragraphs: [
                `${t.source} identifier: ${t.registryId}`,
                overviewParagraph(t),
            ],
        },
    ]
    const where = whereParagraph(t)
    if (where) sections.push({ heading: 'Where', paragraphs: [where] })
    const elig = eligibilityParagraphs(t)
    if (elig.length)
        sections.push({ heading: 'Who it is for', paragraphs: elig })
    return sections
}

/* -------------------------------- builder -------------------------------- */

export function buildExplainer(
    trial: TrialDetail,
    audience: ExplainerAudience
): Explainer {
    let sections: ExplainerSection[]
    let title: string

    switch (audience) {
        case 'clinician':
            sections = clinicianExplainer(trial)
            title = `Clinician summary - ${trial.registryId}`
            break
        case 'handout':
            sections = handoutExplainer(trial)
            title = `Visit handout - ${trial.registryId}`
            break
        case 'patient':
        default:
            sections = patientExplainer(trial)
            title = `Plain-language summary - ${trial.registryId}`
            break
    }

    // Always append provenance so copied/printed output stays attributable.
    sections.push({
        heading: 'About this summary',
        paragraphs: [provenanceNote(trial)],
    })

    return {
        audience,
        title,
        sections,
        questionsToAsk: STANDARD_QUESTIONS,
        generatedBy: 'deterministic',
        omittedForMissingData: trial.missingFields,
    }
}

/** Render an explainer to plain text for copy / print. */
export function explainerToText(explainer: Explainer): string {
    const lines: string[] = [explainer.title, '']
    for (const section of explainer.sections) {
        lines.push(section.heading.toUpperCase())
        for (const p of section.paragraphs) lines.push(cleanText(p))
        lines.push('')
    }
    if (explainer.questionsToAsk.length) {
        lines.push('QUESTIONS YOU MIGHT ASK')
        explainer.questionsToAsk.forEach((q) => lines.push(`- ${q}`))
        lines.push('')
    }
    return lines.join('\n').trim()
}
