import React from 'react'
import { Button } from '@dhis2/ui'
import { SectionCard } from '../../components/common/SectionCard'
import { useNavigation } from '../../context/navigation'

const STEPS = [
    {
        n: '1',
        title: 'Describe the patient',
        body: 'In the Patient Navigator, type a plain-language description or a condition. You can use one of the example prompts to start. No patient data is stored or logged.',
    },
    {
        n: '2',
        title: 'Refine if you want to',
        body: 'Open the filters to narrow by condition, intervention, sponsor, country, phase, recruitment status, and registry. Each text field suggests real options as you type.',
    },
    {
        n: '3',
        title: 'Read the trial report',
        body: 'The Trial Report lists matching studies from official registries with status, phase, conditions, sponsor, and location. Select any study to open its full structured detail.',
    },
    {
        n: '4',
        title: 'Add summaries and export',
        body: 'Edit the plain-language and clinician summaries, then download a clean PDF report that includes the patient profile, your summaries, and the matched trials.',
    },
    {
        n: '5',
        title: 'Go wider',
        body: 'If a trial is likely registered outside the live sources, open Registries to jump straight into any WHO primary registry with your term.',
    },
]

export const HelpPage: React.FC = () => {
    const { navigate } = useNavigation()
    return (
        <div className="page cx-help">
            <SectionCard
                title="How to use Compass"
                subtitle="A short walkthrough of the workflow. No training required."
            >
                <ol className="steps">
                    {STEPS.map((s) => (
                        <li key={s.n}>
                            <span className="num">{s.n}</span>
                            <div>
                                <h3>{s.title}</h3>
                                <p>{s.body}</p>
                            </div>
                        </li>
                    ))}
                </ol>
                <div className="cta">
                    <Button primary onClick={() => navigate('compass')}>
                        Open the navigator
                    </Button>
                </div>
            </SectionCard>

            <SectionCard title="Good to know">
                <ul className="notes">
                    <li>
                        Compass works on modest devices and slow links. Results
                        stream in, so you can start reading before everything
                        loads.
                    </li>
                    <li>
                        When data is missing, Compass says so rather than
                        guessing. Always confirm details against the official
                        registry record.
                    </li>
                    <li>
                        Compass is decision support only. It does not decide
                        eligibility or recommend a trial.
                    </li>
                </ul>
            </SectionCard>
        </div>
    )
}
