import { useCallback, useEffect, useRef, useState } from 'react'
import { probeConnectivity } from '../api'
import type { ConnectivityStatus } from '../types'

const INITIAL: ConnectivityStatus = {
    state: 'checking',
    message: 'Checking connectivity…',
}

/**
 * Tracks reachability of the primary data source. Re-probes on an interval and
 * when the browser fires online/offline events. Cheap enough for low-resource
 * devices (one tiny GET per interval).
 */
export function useConnectivity(intervalMs = 60000): {
    status: ConnectivityStatus
    refresh: () => void
} {
    const [status, setStatus] = useState<ConnectivityStatus>(INITIAL)
    const abortRef = useRef<AbortController | null>(null)

    const run = useCallback(async () => {
        abortRef.current?.abort()
        const controller = new AbortController()
        abortRef.current = controller
        setStatus((s) => ({ ...s, state: 'checking' }))
        const next = await probeConnectivity(controller.signal)
        if (!controller.signal.aborted) setStatus(next)
    }, [])

    useEffect(() => {
        run()
        const id = setInterval(run, intervalMs)
        const onChange = () => run()
        window.addEventListener('online', onChange)
        window.addEventListener('offline', onChange)
        return () => {
            clearInterval(id)
            window.removeEventListener('online', onChange)
            window.removeEventListener('offline', onChange)
            abortRef.current?.abort()
        }
    }, [run, intervalMs])

    return { status, refresh: run }
}
