/**
 * Minimal in-app navigation.
 *
 * A dependency-free view switcher (no external router) keeps the bundle small
 * for low-resource deployments and avoids base-path quirks when the app runs
 * inside the DHIS2 shell iframe. Deep-linking to a trial is modelled as a view
 * plus params rather than a URL route.
 */

import React, {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react'

export type ViewName =
    | 'compass'
    | 'detail'
    | 'registries'
    | 'about'
    | 'help'

export interface Route {
    view: ViewName
    params?: {
        trialId?: string
        source?: string
    }
}

interface NavContextValue {
    route: Route
    navigate: (view: ViewName, params?: Route['params']) => void
    openTrial: (trialId: string, source?: string) => void
    back: () => void
    canGoBack: boolean
}

const NavContext = createContext<NavContextValue | undefined>(undefined)

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [stack, setStack] = useState<Route[]>([{ view: 'compass' }])

    const navigate = useCallback(
        (view: ViewName, params?: Route['params']) => {
            setStack((prev) => [...prev, { view, params }])
            if (typeof window !== 'undefined') window.scrollTo({ top: 0 })
        },
        []
    )

    const openTrial = useCallback(
        (trialId: string, source?: string) => {
            navigate('detail', { trialId, source })
        },
        [navigate]
    )

    const back = useCallback(() => {
        setStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev))
        if (typeof window !== 'undefined') window.scrollTo({ top: 0 })
    }, [])

    const value = useMemo<NavContextValue>(
        () => ({
            route: stack[stack.length - 1],
            navigate,
            openTrial,
            back,
            canGoBack: stack.length > 1,
        }),
        [stack, navigate, openTrial, back]
    )

    return <NavContext.Provider value={value}>{children}</NavContext.Provider>
}

export const useNavigation = (): NavContextValue => {
    const ctx = useContext(NavContext)
    if (!ctx)
        throw new Error('useNavigation must be used within a NavigationProvider')
    return ctx
}
