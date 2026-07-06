import React, { useState } from 'react'
import { InputField, Tag } from '@dhis2/ui'
import { SectionCard } from '../../components/common/SectionCard'
import { REGISTRIES } from '../../api'
import type { RegistryAccess, RegistryEntry } from '../../types'

const ACCESS_LABEL: Record<RegistryAccess, React.ReactNode> = {
    liveApi: <Tag positive>Queried live in-app</Tag>,
    portalLink: <Tag neutral>Official portal link</Tag>,
    aggregator: <Tag neutral>Global aggregator</Tag>,
}

const RegistryRow: React.FC<{ entry: RegistryEntry; term: string }> = ({
    entry,
    term,
}) => {
    const url = term.trim() ? entry.buildSearchUrl(term) : entry.homeUrl
    return (
        <li className="row">
            <div className="main">
                <div className="titleline">
                    <a href={url} target="_blank" rel="noopener noreferrer">
                        {entry.name}
                    </a>
                    <span className="abbr">{entry.abbr}</span>
                    {entry.whoPrimaryRegistry && <Tag neutral>WHO primary</Tag>}
                </div>
                <div className="meta">
                    <span className="region">{entry.region}</span>
                    {entry.note && <span className="note">{entry.note}</span>}
                </div>
            </div>
            <div className="side">{ACCESS_LABEL[entry.access]}</div>
        </li>
    )
}

export const RegistryDirectoryPage: React.FC = () => {
    const [term, setTerm] = useState('')

    const live = REGISTRIES.filter((r) => r.access === 'liveApi')
    const others = REGISTRIES.filter((r) => r.access !== 'liveApi')

    return (
        <div className="page cx-registries">
            <SectionCard
                title="Official trial registries"
                subtitle="Compass queries CORS-enabled registries live and links you to every other WHO primary registry’s own portal. Enter a term to deep-link your search where supported."
            >
                <div className="search">
                    <InputField
                        label="Search term for registry links"
                        placeholder="e.g. tuberculosis"
                        value={term}
                        onChange={({ value }) => setTerm(value ?? '')}
                        dense
                    />
                </div>
            </SectionCard>

            <SectionCard flush title="Queried live in this app">
                <ul className="list">
                    {live.map((r) => (
                        <RegistryRow key={r.code} entry={r} term={term} />
                    ))}
                </ul>
            </SectionCard>

            <SectionCard
                flush
                title="Other official registries & portals"
                subtitle="These have no open browser API, so Compass links to their official search rather than importing their records."
            >
                <ul className="list">
                    {others.map((r) => (
                        <RegistryRow key={r.code} entry={r} term={term} />
                    ))}
                </ul>
            </SectionCard>
        </div>
    )
}
