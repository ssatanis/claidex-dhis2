import { useCallback, useEffect, useRef, useState } from 'react'
import { getTrialById, getRiskContext, HttpError } from '../api'
import type { RiskContext, TrialDetail } from '../types'

interface DetailState {
    trial: TrialDetail | null
    loading: boolean
    error: string | null
    notFound: boolean
    /** Risk context loads independently and never blocks trial rendering. */
    risk: RiskContext | null
    riskLoading: boolean
}

const INITIAL: DetailState = {
    trial: null,
    loading: true,
    error: null,
    notFound: false,
    risk: null,
    riskLoading: false,
}

/** Loads a single trial and, separately, optional Claidex risk context. */
export function useTrialDetail(registryId: string): DetailState & {
    retry: () => void
} {
    const [state, setState] = useState<DetailState>(INITIAL)
    const abortRef = useRef<AbortController | null>(null)
    const [nonce, setNonce] = useState(0)
    const retry = useCallback(() => setNonce((n) => n + 1), [])

    useEffect(() => {
        abortRef.current?.abort()
        const controller = new AbortController()
        abortRef.current = controller
        setState(INITIAL)

        getTrialById(registryId, controller.signal)
            .then((trial) => {
                if (controller.signal.aborted) return
                if (!trial) {
                    setState({
                        ...INITIAL,
                        loading: false,
                        notFound: true,
                    })
                    return
                }
                setState({
                    trial,
                    loading: false,
                    error: null,
                    notFound: false,
                    risk: null,
                    riskLoading: true,
                })

                // Risk context is best-effort and must never break the page.
                getRiskContext(trial.registryId, controller.signal)
                    .then((risk) => {
                        if (controller.signal.aborted) return
                        setState((s) => ({ ...s, risk, riskLoading: false }))
                    })
                    .catch(() => {
                        if (controller.signal.aborted) return
                        setState((s) => ({
                            ...s,
                            risk: {
                                available: false,
                                message:
                                    'Risk context is unavailable right now.',
                            },
                            riskLoading: false,
                        }))
                    })
            })
            .catch((e) => {
                if (controller.signal.aborted) return
                const message =
                    e instanceof HttpError
                        ? e.userMessage
                        : 'Could not load this trial. Please try again.'
                setState({
                    ...INITIAL,
                    loading: false,
                    error: message,
                })
            })

        return () => controller.abort()
    }, [registryId, nonce])

    return { ...state, retry }
}
