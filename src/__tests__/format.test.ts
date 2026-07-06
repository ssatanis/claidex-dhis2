import {
    statusTone,
    formatDate,
    formatCount,
    orDash,
    joinList,
    truncate,
} from '../utils/format'

describe('format utilities', () => {
    it('maps status to a semantic tone', () => {
        expect(statusTone('Recruiting')).toBe('positive')
        expect(statusTone('Completed')).toBe('neutral')
        expect(statusTone('Terminated')).toBe('negative')
        expect(statusTone('Suspended')).toBe('warning')
        expect(statusTone('Unknown')).toBe('neutral')
    })

    it('formats partial registry dates', () => {
        expect(formatDate('2024')).toBe('2024')
        expect(formatDate('2024-05')).toBe('May 2024')
        expect(formatDate('2024-05-09')).toBe('May 9, 2024')
        expect(formatDate(undefined)).toBe('-')
    })

    it('formats counts with a dash fallback', () => {
        expect(formatCount(1234)).toBe('1,234')
        expect(formatCount(undefined)).toBe('-')
        expect(formatCount(NaN)).toBe('-')
    })

    it('returns a dash for empty values', () => {
        expect(orDash('  ')).toBe('-')
        expect(orDash('x')).toBe('x')
    })

    it('joins and caps lists', () => {
        expect(joinList([])).toBe('-')
        expect(joinList(['a', 'b'])).toBe('a, b')
        expect(joinList(['a', 'b', 'c', 'd'], 2)).toBe('a, b +2 more')
    })

    it('truncates long text', () => {
        expect(truncate('short', 20)).toBe('short')
        expect(truncate('abcdefghij', 5)).toBe('abcde…')
    })
})
