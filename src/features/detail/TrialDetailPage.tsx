import React from 'react'
import { Button, Tag } from '@dhis2/ui'
import { SectionCard } from '../../components/common/SectionCard'
import {
    ErrorState,
    LoadingState,
    EmptyState,
} from '../../components/common/StateViews'
import { Disclaimer } from '../../components/common/Disclaimer'
import { Provenance, MissingDataNote } from '../../components/common/Provenance'
import { RiskPanel } from './RiskPanel'
import { ExplainerPanel } from './ExplainerPanel'
import { useTrialDetail } from '../../hooks/useTrialDetail'
import { useNavigation } from '../../context/navigation'
import { statusTone, formatDate, formatCount, orDash } from '../../utils/format'
import { toParagraphs } from '../../utils/sanitize'
import type { TrialDetail } from '../../types'

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({
    label,
    children,
}) => (
    <div className="field">
        <dt>{label}</dt>
        <dd>{children}</dd>
    </div>
)

const DetailBody: React.FC<{
    trial: TrialDetail
    risk: TrialDetailRisk
    riskLoading: boolean
}> = ({ trial, risk, riskLoading }) => {
    const tone = statusTone(trial.status)
    const summaryParas = toParagraphs(trial.briefSummary)
    const eligibilityParas = toParagraphs(trial.eligibilityCriteria)

    return (
        <div className="detail">
            <SectionCard>
                <div className="head">
                    <div className="titles">
                        <h1>{trial.title}</h1>
                        {trial.officialTitle &&
                            trial.officialTitle !== trial.title && (
                                <p className="official">{trial.officialTitle}</p>
                            )}
                        <Provenance
                            source={trial.source}
                            registryId={trial.registryId}
                            sourceUrl={trial.sourceUrl}
                        />
                    </div>
                    <Tag
                        positive={tone === 'positive'}
                        neutral={tone === 'neutral'}
                        negative={tone === 'negative'}
                    >
                        {trial.status}
                    </Tag>
                </div>

                <dl className="facts">
                    <Field label="Phase">{trial.phase}</Field>
                    <Field label="Study type">{orDash(trial.studyType)}</Field>
                    <Field label="Enrollment">
                        {formatCount(trial.enrollmentCount)}
                    </Field>
                    <Field label="Start">{formatDate(trial.startDate)}</Field>
                    <Field label="Completion">
                        {formatDate(trial.completionDate)}
                    </Field>
                    <Field label="Last updated">
                        {formatDate(trial.lastUpdated)}
                    </Field>
                    <Field label="Sponsor">{orDash(trial.sponsor)}</Field>
                    <Field label="Sex">{orDash(trial.sex)}</Field>
                    <Field label="Age range">
                        {trial.minimumAge || trial.maximumAge
                            ? `${orDash(trial.minimumAge)} to ${orDash(
                                  trial.maximumAge
                              )}`
                            : '-'}
                    </Field>
                </dl>

                {trial.conditions.length > 0 && (
                    <div className="chips">
                        <span className="chips-label">Conditions</span>
                        {trial.conditions.map((c) => (
                            <Tag key={c} neutral>
                                {c}
                            </Tag>
                        ))}
                    </div>
                )}
                {trial.interventions.length > 0 && (
                    <div className="chips">
                        <span className="chips-label">Interventions</span>
                        {trial.interventions.map((i) => (
                            <Tag key={i} neutral>
                                {i}
                            </Tag>
                        ))}
                    </div>
                )}

                {trial.missingFields.length > 0 && (
                    <div className="missing-wrap">
                        <MissingDataNote fields={trial.missingFields} />
                    </div>
                )}
            </SectionCard>

            <div className="two-col">
                <div className="col-main">
                    {summaryParas.length > 0 && (
                        <SectionCard title="Summary">
                            {summaryParas.map((p, i) => (
                                <p className="prose" key={i}>
                                    {p}
                                </p>
                            ))}
                        </SectionCard>
                    )}

                    {eligibilityParas.length > 0 && (
                        <SectionCard title="Eligibility (from registry)">
                            {eligibilityParas.map((p, i) => (
                                <p className="prose mono" key={i}>
                                    {p}
                                </p>
                            ))}
                        </SectionCard>
                    )}

                    {trial.locations.length > 0 && (
                        <SectionCard
                            title={`Study locations (${trial.locations.length})`}
                        >
                            <ul className="locs">
                                {trial.locations.slice(0, 25).map((l, i) => (
                                    <li key={i}>
                                        <span className="loc-main">
                                            {[l.facility, l.city, l.country]
                                                .filter(Boolean)
                                                .join(', ') || '-'}
                                        </span>
                                        {l.status && (
                                            <span className="loc-status">
                                                {l.status}
                                            </span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                            {trial.locations.length > 25 && (
                                <p className="more">
                                    +{trial.locations.length - 25} more sites -
                                    view the full list on the source registry.
                                </p>
                            )}
                        </SectionCard>
                    )}

                    <SectionCard title="Explain this trial">
                        <ExplainerPanel trial={trial} />
                    </SectionCard>
                </div>

                <div className="col-side">
                    <SectionCard title="Risk & failure intelligence">
                        <RiskPanel risk={risk} loading={riskLoading} />
                    </SectionCard>

                    <SectionCard title="Source">
                        <p className="prose">
                            This record is maintained by {trial.source}. Always
                            confirm details against the official record.
                        </p>
                        <a
                            className="srclink"
                            href={trial.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Open on {trial.source} ↗
                        </a>
                    </SectionCard>

                    <Disclaimer />
                </div>
            </div>
        </div>
    )
}

type TrialDetailRisk = ReturnType<typeof useTrialDetail>['risk']

export const TrialDetailPage: React.FC = () => {
    const { route, back } = useNavigation()
    const registryId = route.params?.trialId ?? ''
    const { trial, loading, error, notFound, risk, riskLoading, retry } =
        useTrialDetail(registryId)

    return (
        <div className="wrap cx-detailwrap">
            <div className="back">
                <Button small secondary onClick={back}>
                    ← Back to results
                </Button>
            </div>

            {loading && (
                <SectionCard>
                    <LoadingState label="Loading trial…" />
                </SectionCard>
            )}

            {!loading && error && (
                <SectionCard>
                    <ErrorState message={error} onRetry={retry} />
                </SectionCard>
            )}

            {!loading && notFound && (
                <SectionCard>
                    <EmptyState
                        title="Trial not found"
                        message={`No record for "${registryId}" was found in the live-queried registries. It may exist in another registry - try the Registries page.`}
                    />
                </SectionCard>
            )}

            {!loading && trial && (
                <DetailBody
                    trial={trial}
                    risk={risk}
                    riskLoading={riskLoading}
                />
            )}
        </div>
    )
}
