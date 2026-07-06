/**
 * DHIS2 Application Platform configuration.
 *
 * These values are the single source of truth for the app's identity and are
 * surfaced in the DHIS2 app menu and in the App Hub listing. Keep them aligned
 * with package.json, README.md, and the in-app About page.
 *
 * App Hub note: after the FIRST manual upload to the DHIS2 App Hub, copy the
 * App Hub-assigned application id into the `id` field below. It is required for
 * automated republishing via `d2-app-scripts publish` (see RELEASE.md).
 */
const config = {
    type: 'app',

    // Machine name - lowercase, hyphenated. Do not change once published.
    name: 'compass-clinical-trial-navigator',

    // Human-facing title shown in the DHIS2 app menu and App Hub.
    title: 'Compass Clinical Trial Navigator',

    description:
        'Describe a patient in plain language and Compass finds matching clinical trials from official public registries, presents a structured trial report, and exports a clean PDF. Informational decision support only, not a diagnostic or treatment tool.',

    author: {
        name: 'Claidex',
        email: '',
    },

    // Minimum DHIS2 core version this app is verified against.
    minDHIS2Version: '40',

    // App Hub application id. Populate AFTER the first manual App Hub upload to
    // enable CI/CD republishing (see .github/workflows/apphub-release.yml).
    // id: 'PASTE_APP_HUB_ID_HERE',

    entryPoints: {
        app: './src/App.tsx',
    },
}

module.exports = config
