import React from 'react'
import { NoticeBox, Button } from '@dhis2/ui'

interface Props {
    children: React.ReactNode
}
interface State {
    hasError: boolean
    message?: string
}

/**
 * App-level error boundary so a rendering fault in one feature degrades to a
 * recoverable message instead of a blank screen - important for field devices
 * where reloading is costly.
 */
export class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, message: error.message }
    }

    componentDidCatch(error: Error): void {
        // Log technical detail to the console only; never surface stack traces
        // or sensitive text in the UI.
        // eslint-disable-next-line no-console
        console.error('Compass render error:', error)
    }

    handleReload = (): void => {
        this.setState({ hasError: false, message: undefined })
        if (typeof window !== 'undefined') window.location.reload()
    }

    render(): React.ReactNode {
        if (this.state.hasError) {
            return (
                <div style={{ maxWidth: 560, margin: '48px auto', padding: 16 }}>
                    <NoticeBox error title="The app hit an unexpected problem">
                        You can reload to continue. If this keeps happening,
                        note what you were doing and contact your administrator.
                    </NoticeBox>
                    <div style={{ marginTop: 12 }}>
                        <Button primary onClick={this.handleReload}>
                            Reload app
                        </Button>
                    </div>
                </div>
            )
        }
        return this.props.children
    }
}
