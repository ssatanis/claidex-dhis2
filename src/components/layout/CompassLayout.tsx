import React from 'react'
import { ClaidexLogo } from '../brand/Brand'
import { useNavigation, ViewName } from '../../context/navigation'
import { EXTERNAL_LINKS } from '../../config/constants'

const SECONDARY: { view: ViewName; label: string }[] = [
    { view: 'registries', label: 'Registries' },
    { view: 'about', label: 'About' },
    { view: 'help', label: 'Help' },
]

/**
 * Top-level app chrome: Claidex wordmark on the left, a slim secondary nav and
 * a "Return to dashboard" action on the right. The main area is rendered
 * full-bleed so feature pages can lay out their own panels.
 */
export const CompassLayout: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const { route, navigate } = useNavigation()
    const active = route.view

    return (
        <div className="compass-shell">
            <header className="cx-topbar">
                <button
                    type="button"
                    className="cx-brandbtn"
                    onClick={() => navigate('compass')}
                    aria-label="Claidex Compass home"
                >
                    <ClaidexLogo height={26} />
                </button>

                <div className="cx-topnav">
                    <nav aria-label="Sections">
                        {SECONDARY.map((item) => (
                            <button
                                key={item.view}
                                type="button"
                                className={
                                    active === item.view
                                        ? 'cx-navlink active'
                                        : 'cx-navlink'
                                }
                                onClick={() => navigate(item.view)}
                            >
                                {item.label}
                            </button>
                        ))}
                    </nav>
                    <a
                        className="cx-return"
                        href={EXTERNAL_LINKS.dashboard}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            aria-hidden="true"
                        >
                            <path
                                d="M14 4h6v6M20 4l-9 9M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        Return to dashboard
                    </a>
                </div>
            </header>

            <main className="cx-main">{children}</main>
        </div>
    )
}
