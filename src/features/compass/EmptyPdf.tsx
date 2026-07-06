import React from 'react'

/** Right-panel empty state: an inline compass rose and helper text. */
export const EmptyPdf: React.FC = () => (
    <div className="cx-emptypdf">
        <svg
            viewBox="0 0 120 120"
            className="cx-rose"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            role="img"
            aria-label="Compass rose"
        >
            <circle cx="60" cy="60" r="52" strokeOpacity="0.4" />
            <circle cx="60" cy="60" r="40" strokeOpacity="0.25" />
            <polygon
                points="60,12 66,60 60,66 54,60"
                fill="currentColor"
                fillOpacity="0.55"
                stroke="none"
            />
            <polygon
                points="60,108 54,60 60,54 66,60"
                fill="currentColor"
                fillOpacity="0.2"
                stroke="none"
            />
            <polygon
                points="108,60 60,66 54,60 60,54"
                fill="currentColor"
                fillOpacity="0.2"
                stroke="none"
            />
            <polygon
                points="12,60 60,54 66,60 60,66"
                fill="currentColor"
                fillOpacity="0.35"
                stroke="none"
            />
            <circle cx="60" cy="60" r="4" fill="currentColor" stroke="none" />
        </svg>
        <p>Complete the patient profile in the chat to generate a trial report.</p>
    </div>
)
