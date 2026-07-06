import React from 'react'
import { SectionCard } from '../../components/common/SectionCard'
import { Disclaimer } from '../../components/common/Disclaimer'
import {
    APP_NAME,
    APP_VERSION,
    APP_VENDOR,
    EXTERNAL_LINKS,
} from '../../config/constants'
import { isClaidexBackendConfigured } from '../../config/env'

const ExternalLink: React.FC<{ href: string; children: React.ReactNode }> = ({
    href,
    children,
}) => (
    <a href={href} target="_blank" rel="noopener noreferrer">
        {children} ↗
    </a>
)

export const AboutPage: React.FC = () => (
    <div className="page cx-about">
        <SectionCard title="About Compass">
            <p className="p">
                {APP_NAME} is a DHIS2 application that helps clinicians,
                coordinators, and public-health teams search official clinical
                trial registries, read structured trial detail, and produce
                clear, plain-language explanations to support safer
                trial-navigation conversations. It is maintained by {APP_VENDOR}.
            </p>
            <p className="p">
                Compass is informational decision support. It does not diagnose,
                recommend treatment, or determine eligibility, and it does not
                replace the official registry record or professional clinical
                judgement.
            </p>
            <div className="ver">Version {APP_VERSION}</div>
        </SectionCard>

        <SectionCard title="Data sources">
            <p className="p">
                Trial data is fetched live from public registries and shown as
                returned - Compass does not fabricate or cache trial records:
            </p>
            <ul className="list">
                <li>
                    <ExternalLink href={EXTERNAL_LINKS.clinicalTrialsGov}>
                        ClinicalTrials.gov (NIH/NLM) API v2
                    </ExternalLink>{' '}
                    - primary live source, global coverage.
                </li>
                <li>
                    <ExternalLink href="https://www.isrctn.com">
                        ISRCTN registry
                    </ExternalLink>{' '}
                    - WHO primary registry, queried live where reachable.
                </li>
                <li>
                    <ExternalLink href={EXTERNAL_LINKS.whoIctrp}>
                        WHO ICTRP
                    </ExternalLink>{' '}
                    and other WHO primary registries - linked via their official
                    portals (no open browser API).
                </li>
            </ul>
        </SectionCard>

        <SectionCard title="Technical requirements">
            <ul className="list">
                <li>DHIS2 core version 2.40 or later.</li>
                <li>
                    A modern browser (last two versions of Chrome, Firefox,
                    Edge, or Safari).
                </li>
                <li>
                    Outbound HTTPS access from the user’s browser to
                    clinicaltrials.gov and isrctn.com for live search. Registry
                    portal links open in a new tab.
                </li>
                <li>
                    No server-side component is required. The app is a static
                    bundle served by DHIS2.
                </li>
            </ul>
        </SectionCard>

        <SectionCard title="External services">
            <p className="p">
                The app makes browser requests directly to the public registries
                listed above. Search terms you type are sent to those registries
                to return results - the same as using their websites.
            </p>
            <p className="p">
                An optional {APP_VENDOR} Compass backend can add risk and
                failure-intelligence context and richer explainer generation. It
                is{' '}
                <strong>
                    {isClaidexBackendConfigured()
                        ? 'configured'
                        : 'not configured'}
                </strong>{' '}
                for this deployment. When it is not configured, no data is sent
                to {APP_VENDOR} and risk context is shown as unavailable rather
                than estimated. See the privacy and data-flow documentation for
                details.
            </p>
        </SectionCard>

        <SectionCard title="Privacy">
            <ul className="list">
                <li>
                    Compass stores no patient-identifiable information. It has no
                    database and writes no trial data to the DHIS2 datastore.
                </li>
                <li>
                    Only the search terms you enter leave the browser, and only
                    to the registries needed to answer the search.
                </li>
                <li>
                    Generated explainers are produced in the browser from the
                    trial’s public registry fields.
                </li>
            </ul>
        </SectionCard>

        <SectionCard title="Support & source">
            <ul className="list">
                <li>
                    Source code:{' '}
                    <ExternalLink href={EXTERNAL_LINKS.sourceRepo}>
                        {EXTERNAL_LINKS.sourceRepo.replace('https://', '')}
                    </ExternalLink>
                </li>
                <li>
                    For deployment questions, contact your DHIS2 administrator or
                    the {APP_VENDOR} team via the repository.
                </li>
                <li>Licensed under BSD-3-Clause (open source).</li>
            </ul>
        </SectionCard>

        <Disclaimer variant="block" />
    </div>
)
