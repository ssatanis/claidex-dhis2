import React from 'react'
import { Button, CircularLoader, NoticeBox } from '@dhis2/ui'

/* ------------------------------ Loading ---------------------------------- */

interface LoadingProps {
    label?: string
}

export const LoadingState: React.FC<LoadingProps> = ({
    label = 'Loading…',
}) => (
    <div className="cx-loading" role="status" aria-live="polite">
        <CircularLoader small />
        <span>{label}</span>
    </div>
)

/* --------------------------- Skeleton rows ------------------------------- */

interface SkeletonListProps {
    rows?: number
}

/** Content-shaped placeholders - friendlier than a spinner on slow links. */
export const SkeletonList: React.FC<SkeletonListProps> = ({ rows = 5 }) => (
    <div className="cx-skel" aria-hidden="true">
        {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="row">
                <div className="line title" />
                <div className="line meta" />
            </div>
        ))}
    </div>
)

/* ------------------------------- Empty ----------------------------------- */

interface EmptyProps {
    title: string
    message?: string
    action?: React.ReactNode
}

export const EmptyState: React.FC<EmptyProps> = ({
    title,
    message,
    action,
}) => (
    <div className="empty">
        <div className="mark" aria-hidden="true" />
        <h3>{title}</h3>
        {message && <p>{message}</p>}
        {action}
    </div>
)

/* ------------------------------- Error ----------------------------------- */

interface ErrorProps {
    title?: string
    message: string
    onRetry?: () => void
}

export const ErrorState: React.FC<ErrorProps> = ({
    title = 'Something went wrong',
    message,
    onRetry,
}) => (
    <div className="err">
        <NoticeBox error title={title}>
            {message}
        </NoticeBox>
        {onRetry && (
            <div className="actions">
                <Button small onClick={onRetry}>
                    Try again
                </Button>
            </div>
        )}
    </div>
)
