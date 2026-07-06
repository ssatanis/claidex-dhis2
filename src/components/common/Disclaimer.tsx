import React from 'react'
import { NoticeBox } from '@dhis2/ui'

interface DisclaimerProps {
    /** 'inline' is compact for panels; 'block' is a prominent standalone box. */
    variant?: 'inline' | 'block'
    title?: string
}

/**
 * The app's standing safety statement. Compass is decision *support*, not a
 * diagnostic or treatment tool. Shown on the overview, in the detail view, and
 * alongside every generated explainer.
 */
export const Disclaimer: React.FC<DisclaimerProps> = ({
    variant = 'inline',
    title = 'Informational support only',
}) => {
    const message =
        'Compass helps you find and understand registered clinical trials using public registry data. It does not diagnose, recommend treatment, or confirm eligibility, and it does not replace professional clinical judgement or the official registry record. Always verify details with the source registry and a qualified clinician.'

    if (variant === 'block') {
        return <NoticeBox title={title}>{message}</NoticeBox>
    }

    return (
        <div className="disclaimer" role="note">
            <strong>{title}.</strong> {message}
        </div>
    )
}
