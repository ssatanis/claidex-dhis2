import React from 'react'

/**
 * Inline icon set (Lucide paths, ISC-licensed) so the app needs no icon
 * dependency. Each icon inherits color via currentColor and sizes to `size`.
 */
type IconProps = { size?: number; className?: string }

const base = (size: number): React.SVGProps<SVGSVGElement> => ({
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
})

export const ArrowUp: React.FC<IconProps> = ({ size = 16, className }) => (
    <svg {...base(size)} className={className}>
        <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
)
export const Download: React.FC<IconProps> = ({ size = 16, className }) => (
    <svg {...base(size)} className={className}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
    </svg>
)
export const ExternalLink: React.FC<IconProps> = ({ size = 16, className }) => (
    <svg {...base(size)} className={className}>
        <path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
)
export const PanelLeftClose: React.FC<IconProps> = ({ size = 16, className }) => (
    <svg {...base(size)} className={className}>
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M9 3v18M16 15l-3-3 3-3" />
    </svg>
)
export const PanelLeftOpen: React.FC<IconProps> = ({ size = 16, className }) => (
    <svg {...base(size)} className={className}>
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M9 3v18M14 9l3 3-3 3" />
    </svg>
)
export const Printer: React.FC<IconProps> = ({ size = 16, className }) => (
    <svg {...base(size)} className={className}>
        <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
        <rect width="12" height="8" x="6" y="14" />
    </svg>
)
export const RefreshCw: React.FC<IconProps> = ({ size = 16, className }) => (
    <svg {...base(size)} className={className}>
        <path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5" />
    </svg>
)
export const Square: React.FC<IconProps> = ({ size = 16, className }) => (
    <svg {...base(size)} className={className}>
        <rect width="18" height="18" x="3" y="3" rx="2" />
    </svg>
)
export const Check: React.FC<IconProps> = ({ size = 16, className }) => (
    <svg {...base(size)} className={className}>
        <path d="M20 6 9 17l-5-5" />
    </svg>
)
export const ChevronRight: React.FC<IconProps> = ({ size = 16, className }) => (
    <svg {...base(size)} className={className}>
        <path d="m9 18 6-6-6-6" />
    </svg>
)
export const Copy: React.FC<IconProps> = ({ size = 16, className }) => (
    <svg {...base(size)} className={className}>
        <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
)
export const FileText: React.FC<IconProps> = ({ size = 16, className }) => (
    <svg {...base(size)} className={className}>
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z" />
        <path d="M14 2v5h5M16 13H8M16 17H8M10 9H8" />
    </svg>
)
export const Brain: React.FC<IconProps> = ({ size = 16, className }) => (
    <svg {...base(size)} className={className}>
        <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
        <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
    </svg>
)
