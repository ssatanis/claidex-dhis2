import React from 'react'
import './styles/app.css'
import { NavigationProvider, useNavigation } from './context/navigation'
import { ErrorBoundary } from './components/ErrorBoundary'
import { CompassLayout } from './components/layout/CompassLayout'
import { CompassPage } from './features/compass/CompassPage'
import { TrialDetailPage } from './features/detail/TrialDetailPage'
import { RegistryDirectoryPage } from './features/registries/RegistryDirectoryPage'
import { AboutPage } from './features/about/AboutPage'
import { HelpPage } from './features/about/HelpPage'

const Scroll: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="cx-scroll">
        <div className="cx-scroll-inner">{children}</div>
    </div>
)

const CurrentView: React.FC = () => {
    const { route } = useNavigation()
    switch (route.view) {
        case 'detail':
            return (
                <Scroll>
                    <TrialDetailPage />
                </Scroll>
            )
        case 'registries':
            return (
                <Scroll>
                    <RegistryDirectoryPage />
                </Scroll>
            )
        case 'about':
            return (
                <Scroll>
                    <AboutPage />
                </Scroll>
            )
        case 'help':
            return (
                <Scroll>
                    <HelpPage />
                </Scroll>
            )
        case 'compass':
        default:
            return <CompassPage />
    }
}

/**
 * App root. The DHIS2 Application Platform wraps this component with the App
 * Runtime provider (using d2.config.js), so no manual <Provider> is needed here.
 */
const App: React.FC = () => (
    <ErrorBoundary>
        <NavigationProvider>
            <CompassLayout>
                <CurrentView />
            </CompassLayout>
        </NavigationProvider>
    </ErrorBoundary>
)

export default App
