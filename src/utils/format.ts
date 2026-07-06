/** Formatting helpers. Pure, side-effect-free, and unit-tested. */

import type { TrialStatus } from '../types'

/** DHIS2 UI-aligned semantic tone for a status chip. */
export type StatusTone = 'positive' | 'neutral' | 'warning' | 'negative'

export const statusTone = (status: TrialStatus): StatusTone => {
    switch (status) {
        case 'Recruiting':
        case 'Enrolling by invitation':
            return 'positive'
        case 'Not yet recruiting':
        case 'Active, not recruiting':
        case 'Completed':
            return 'neutral'
        case 'Suspended':
            return 'warning'
        case 'Terminated':
        case 'Withdrawn':
            return 'negative'
        case 'Unknown':
        default:
            return 'neutral'
    }
}

/** Human date from an ISO-ish string; returns the input if unparseable. */
export const formatDate = (value?: string): string => {
    if (!value) return '-'
    // Registry dates may be YYYY, YYYY-MM, or YYYY-MM-DD.
    const parts = value.split('-')
    const year = parts[0]
    if (!/^\d{4}$/.test(year)) return value
    const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ]
    if (parts.length === 1) return year
    const month = Number(parts[1])
    const mName = month >= 1 && month <= 12 ? monthNames[month - 1] : ''
    if (parts.length === 2) return `${mName} ${year}`.trim()
    return `${mName} ${Number(parts[2])}, ${year}`.trim()
}

export const formatCount = (n?: number): string =>
    typeof n === 'number' && !Number.isNaN(n) ? n.toLocaleString() : '-'

/** Non-empty value or an em dash placeholder for honest "no data" display. */
export const orDash = (value?: string | null): string => {
    const v = value?.trim()
    return v && v.length > 0 ? v : '-'
}

/** Join a list into readable prose, capping length for compact display. */
export const joinList = (items: string[], max = 3): string => {
    const cleaned = items.map((i) => i.trim()).filter(Boolean)
    if (cleaned.length === 0) return '-'
    if (cleaned.length <= max) return cleaned.join(', ')
    return `${cleaned.slice(0, max).join(', ')} +${cleaned.length - max} more`
}

/** Truncate free text to a maximum length, appending an ellipsis. */
export const truncate = (text: string, max = 240): string => {
    const t = text.trim()
    return t.length <= max ? t : `${t.slice(0, max).trimEnd()}…`
}
