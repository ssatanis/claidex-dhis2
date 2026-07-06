import React from 'react'
import { Tag } from '@dhis2/ui'
import type { RegistrySource } from '../../types'

interface ProvenanceProps {
    source: RegistrySource
    registryId?: string
    sourceUrl?: string
}

/** Source attribution shown on results and detail, with a link to the record. */
export const Provenance: React.FC<ProvenanceProps> = ({
    source,
    registryId,
    sourceUrl,
}) => (
    <span className="prov">
        <Tag neutral>{source}</Tag>
        {registryId && <span className="id">{registryId}</span>}
        {sourceUrl && (
            <a href={sourceUrl} target="_blank" rel="noopener noreferrer">
                View source ↗
            </a>
        )}
    </span>
)

interface UncertaintyProps {
    fields: string[]
}

/** Honest labeling of fields the registry did not provide. */
export const MissingDataNote: React.FC<UncertaintyProps> = ({ fields }) => {
    if (fields.length === 0) return null
    return (
        <div className="missing" role="note">
            <strong>Not provided by the registry:</strong> {fields.join(', ')}.
        </div>
    )
}
