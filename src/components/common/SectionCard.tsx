import React from 'react'

interface SectionCardProps {
    title?: string
    subtitle?: string
    actions?: React.ReactNode
    children: React.ReactNode
    /** Remove inner padding when the child manages its own (e.g. tables). */
    flush?: boolean
}

/** A calm, bordered content container used across pages. */
export const SectionCard: React.FC<SectionCardProps> = ({
    title,
    subtitle,
    actions,
    children,
    flush = false,
}) => (
    <section className="card">
        {(title || actions) && (
            <header className="head">
                <div>
                    {title && <h2>{title}</h2>}
                    {subtitle && <p>{subtitle}</p>}
                </div>
                {actions && <div className="actions">{actions}</div>}
            </header>
        )}
        <div className={flush ? 'body flush' : 'body'}>{children}</div>
    </section>
)
