import React from 'react'
import { ExternalLink } from './icons'
import type { CompassPdfData, CompassPdfTrial } from './compassTypes'

/**
 * Map a 0-100 Mechanism Risk Score to a qualitative band. MRS is a historical
 * support score: low means high failure risk, high means strong support.
 */
function mrsBand(score: number): { label: string; tone: string } {
    if (score <= 45) return { label: 'High historical risk', tone: 'cx-mrs-high' }
    if (score <= 65) return { label: 'Moderate risk', tone: 'cx-mrs-mid' }
    return { label: 'Strong historical support', tone: 'cx-mrs-low' }
}

const nctUrl = (nctId: string): string =>
    `https://clinicaltrials.gov/study/${encodeURIComponent(nctId.trim())}`

/** "PHASE4" -> "Phase 4", "PHASE1/PHASE2" -> "Phase 1/2", else "Phase N/A". */
function formatPhase(phase?: string): string {
    if (!phase || /^n\/?a$/i.test(phase.trim())) return 'Phase N/A'
    const cleaned = phase.replace(/phase/gi, '').replace(/\s+/g, '').trim()
    return cleaned ? `Phase ${cleaned}` : 'Phase N/A'
}

const TrialCard: React.FC<{ trial: CompassPdfTrial; index: number }> = ({
    trial,
    index,
}) => {
    const reasons = trial.qualificationReasons?.filter(Boolean) ?? []
    const site = trial.nearestSite
    const siteText = site
        ? [site.city, site.state].filter(Boolean).join(', ') ||
          'Location not listed'
        : 'Location not listed'
    const mrs = typeof trial.claidexMRS === 'number' ? trial.claidexMRS : null
    const band = mrs != null ? mrsBand(mrs) : null
    const contact = [trial.contactName, trial.contactEmail, trial.contactPhone]
        .filter(Boolean)
        .join('  ·  ')

    return (
        <article className="cx-tc">
            <div className="cx-tc-top">
                <span className="cx-tc-num">{index + 1}</span>
                <span className="cx-tc-phase">{formatPhase(trial.phase)}</span>
                {band && (
                    <span className={`cx-tc-mrs ${band.tone}`}>
                        MRS {mrs}/100 · {band.label}
                    </span>
                )}
                <a
                    className="cx-tc-nct"
                    href={nctUrl(trial.nctId)}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {trial.nctId}
                    <ExternalLink size={12} />
                </a>
            </div>

            <h3 className="cx-tc-title">{trial.title || trial.nctId}</h3>
            <p className="cx-tc-sponsor">
                {trial.sponsor || 'Sponsor not listed'}
            </p>

            {reasons.length > 0 && (
                <div className="cx-tc-sec">
                    <span className="cx-tc-label">Why this patient may qualify</span>
                    <ul className="cx-tc-reasons">
                        {reasons.map((r, i) => (
                            <li key={i}>{r}</li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="cx-tc-grid">
                <div>
                    <span className="cx-tc-label">Nearest site</span>
                    <p className="cx-tc-val">
                        {siteText}
                        {site?.distanceMiles != null
                            ? ` · ${site.distanceMiles} mi`
                            : ''}
                    </p>
                </div>
                <div>
                    <span className="cx-tc-label">Access</span>
                    <p className="cx-tc-val">
                        {[
                            trial.telehealth ? 'Telehealth' : null,
                            trial.homeDelivery ? 'Home delivery' : null,
                        ]
                            .filter(Boolean)
                            .join(', ') || 'Not listed'}
                    </p>
                </div>
            </div>

            {(band || trial.claidexContext) && (
                <div className="cx-tc-sec">
                    <span className="cx-tc-label">
                        Mechanism failure history (Claidex)
                    </span>
                    <p className="cx-tc-val">
                        {trial.claidexContext ||
                            'No prior failure data recorded for this target.'}
                    </p>
                </div>
            )}

            {contact && (
                <div className="cx-tc-contact">
                    <span className="cx-tc-label">Contact</span>
                    <span className="cx-tc-val">{contact}</span>
                </div>
            )}
        </article>
    )
}

export const TrialCards: React.FC<{ data: CompassPdfData }> = ({ data }) => {
    const trials = Array.isArray(data.trials) ? data.trials : []
    const p = data.patient

    const chips = [
        p?.condition,
        [p?.age, p?.sex].filter(Boolean).join(' / ') || null,
        p?.location,
        ...(p?.biomarkers ?? []),
    ].filter(Boolean) as string[]

    return (
        <div className="cx-tcards">
            <div className="cx-tcards-summary">
                <div className="cx-tcards-count">
                    {trials.length} matching {trials.length === 1 ? 'trial' : 'trials'}
                </div>
                {chips.length > 0 && (
                    <div className="cx-tcards-chips">
                        {chips.map((c, i) => (
                            <span key={i} className="cx-tcards-chip">
                                {c}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {trials.length === 0 ? (
                <p className="cx-tcards-none">
                    No matching trials were returned for this profile.
                </p>
            ) : (
                <div className="cx-tcards-list">
                    {trials.map((t, i) => (
                        <TrialCard key={t.nctId || i} trial={t} index={i} />
                    ))}
                </div>
            )}
        </div>
    )
}
