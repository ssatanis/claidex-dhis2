import React from 'react'
import logoLight from '../../assets/logo-light.png'

/**
 * Claidex wordmark, rendered from the official logo asset (same image the
 * Claidex app uses). Sized by height; width scales to the logo aspect ratio.
 */
export const ClaidexLogo: React.FC<{ height?: number }> = ({ height = 30 }) => (
    <img
        src={logoLight}
        alt="Claidex"
        height={height}
        style={{ height, width: 'auto', display: 'block', objectFit: 'contain' }}
    />
)
