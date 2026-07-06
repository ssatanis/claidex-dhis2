/**
 * Directory of official clinical-trial registries.
 *
 * Data source policy: this app only queries registries live when they expose a
 * public, browser-accessible (CORS-enabled) API - currently ClinicalTrials.gov
 * and ISRCTN. The remaining WHO Primary Registries and major portals have no
 * open browser API, so the app never invents their records. Instead it provides
 * accurate official links so users can continue a search in the registry's own
 * portal.
 *
 * `buildSearchUrl` returns a working term-search URL ONLY where the registry's
 * public search accepts a documented query parameter; otherwise it returns the
 * registry home page, so links are always valid (never broken deep-links).
 *
 * The registry list and WHO-primary designations follow the WHO ICTRP network
 * of primary registries. URLs are official registry domains.
 */

import type { RegistryEntry } from '../types'

const enc = (t: string): string => encodeURIComponent(t.trim())

export const REGISTRIES: RegistryEntry[] = [
    {
        code: 'ictrp',
        name: 'WHO International Clinical Trials Registry Platform',
        abbr: 'WHO ICTRP',
        region: 'Global (aggregator)',
        access: 'aggregator',
        whoPrimaryRegistry: false,
        homeUrl: 'https://trialsearch.who.int',
        buildSearchUrl: () => 'https://trialsearch.who.int',
        note: 'Global search portal spanning ClinicalTrials.gov and the WHO primary registries network. No open browser API; use the portal directly.',
    },
    {
        code: 'ctgov',
        name: 'ClinicalTrials.gov',
        abbr: 'CT.gov',
        region: 'Global (US NIH/NLM)',
        access: 'liveApi',
        whoPrimaryRegistry: true,
        homeUrl: 'https://clinicaltrials.gov',
        buildSearchUrl: (t) => `https://clinicaltrials.gov/search?term=${enc(t)}`,
        note: 'Largest public registry; queried live in this app with global coverage.',
    },
    {
        code: 'isrctn',
        name: 'ISRCTN Registry',
        abbr: 'ISRCTN',
        region: 'UK-based, international',
        access: 'liveApi',
        whoPrimaryRegistry: true,
        homeUrl: 'https://www.isrctn.com',
        buildSearchUrl: (t) => `https://www.isrctn.com/search?q=${enc(t)}`,
        note: 'WHO primary registry; queried live in this app.',
    },
    {
        code: 'ctis',
        name: 'Clinical Trials Information System (EU/EEA)',
        abbr: 'EU CTIS',
        region: 'European Union / EEA',
        access: 'portalLink',
        whoPrimaryRegistry: true,
        homeUrl: 'https://euclinicaltrials.eu/ctis-public',
        buildSearchUrl: () => 'https://euclinicaltrials.eu/ctis-public/search',
        note: 'Current public portal for EU/EEA trials under the Clinical Trials Regulation.',
    },
    {
        code: 'euctr',
        name: 'EU Clinical Trials Register (legacy)',
        abbr: 'EU-CTR',
        region: 'European Union (legacy)',
        access: 'portalLink',
        whoPrimaryRegistry: true,
        homeUrl: 'https://www.clinicaltrialsregister.eu',
        buildSearchUrl: (t) =>
            `https://www.clinicaltrialsregister.eu/ctr-search/search?query=${enc(t)}`,
        note: 'Legacy EU register; still relevant for older records.',
    },
    {
        code: 'anzctr',
        name: 'Australian New Zealand Clinical Trials Registry',
        abbr: 'ANZCTR',
        region: 'Australia / New Zealand',
        access: 'portalLink',
        whoPrimaryRegistry: true,
        homeUrl: 'https://www.anzctr.org.au',
        buildSearchUrl: (t) =>
            `https://www.anzctr.org.au/TrialSearch.aspx?searchTxt=${enc(t)}&isBasic=True`,
    },
    {
        code: 'ctri',
        name: 'Clinical Trials Registry - India',
        abbr: 'CTRI',
        region: 'India',
        access: 'portalLink',
        whoPrimaryRegistry: true,
        homeUrl: 'https://ctri.nic.in',
        buildSearchUrl: () => 'https://ctri.nic.in',
    },
    {
        code: 'chictr',
        name: 'Chinese Clinical Trial Registry',
        abbr: 'ChiCTR',
        region: 'China',
        access: 'portalLink',
        whoPrimaryRegistry: true,
        homeUrl: 'https://www.chictr.org.cn',
        buildSearchUrl: () => 'https://www.chictr.org.cn/searchprojEN.html',
    },
    {
        code: 'cris',
        name: 'Clinical Research Information Service',
        abbr: 'CRiS',
        region: 'Republic of Korea',
        access: 'portalLink',
        whoPrimaryRegistry: true,
        homeUrl: 'https://cris.nih.go.kr',
        buildSearchUrl: () => 'https://cris.nih.go.kr',
    },
    {
        code: 'jrct',
        name: 'Japan Registry of Clinical Trials',
        abbr: 'jRCT',
        region: 'Japan',
        access: 'portalLink',
        whoPrimaryRegistry: true,
        homeUrl: 'https://jrct.niph.go.jp',
        buildSearchUrl: () => 'https://jrct.niph.go.jp/en/search',
    },
    {
        code: 'drks',
        name: 'German Clinical Trials Register',
        abbr: 'DRKS',
        region: 'Germany',
        access: 'portalLink',
        whoPrimaryRegistry: true,
        homeUrl: 'https://drks.de',
        buildSearchUrl: () => 'https://drks.de/search/en',
    },
    {
        code: 'irct',
        name: 'Iranian Registry of Clinical Trials',
        abbr: 'IRCT',
        region: 'Iran',
        access: 'portalLink',
        whoPrimaryRegistry: true,
        homeUrl: 'https://irct.behdasht.gov.ir',
        buildSearchUrl: () => 'https://irct.behdasht.gov.ir',
    },
    {
        code: 'tctr',
        name: 'Thai Clinical Trials Registry',
        abbr: 'TCTR',
        region: 'Thailand',
        access: 'portalLink',
        whoPrimaryRegistry: true,
        homeUrl: 'https://www.thaiclinicaltrials.org',
        buildSearchUrl: () => 'https://www.thaiclinicaltrials.org',
    },
    {
        code: 'pactr',
        name: 'Pan African Clinical Trial Registry',
        abbr: 'PACTR',
        region: 'Africa (regional)',
        access: 'portalLink',
        whoPrimaryRegistry: true,
        homeUrl: 'https://pactr.samrc.ac.za',
        buildSearchUrl: () => 'https://pactr.samrc.ac.za',
    },
    {
        code: 'rebec',
        name: 'Brazilian Registry of Clinical Trials',
        abbr: 'ReBec',
        region: 'Brazil',
        access: 'portalLink',
        whoPrimaryRegistry: true,
        homeUrl: 'https://ensaiosclinicos.gov.br',
        buildSearchUrl: () => 'https://ensaiosclinicos.gov.br',
    },
    {
        code: 'rpcec',
        name: 'Cuban Public Registry of Clinical Trials',
        abbr: 'RPCEC',
        region: 'Cuba',
        access: 'portalLink',
        whoPrimaryRegistry: true,
        homeUrl: 'https://rpcec.sld.cu',
        buildSearchUrl: () => 'https://rpcec.sld.cu/en',
    },
    {
        code: 'repec',
        name: 'Peruvian Clinical Trial Registry',
        abbr: 'REPEC',
        region: 'Peru',
        access: 'portalLink',
        whoPrimaryRegistry: true,
        homeUrl: 'https://ensayosclinicos-repec.ins.gob.pe',
        buildSearchUrl: () => 'https://ensayosclinicos-repec.ins.gob.pe',
    },
    {
        code: 'slctr',
        name: 'Sri Lanka Clinical Trials Registry',
        abbr: 'SLCTR',
        region: 'Sri Lanka',
        access: 'portalLink',
        whoPrimaryRegistry: true,
        homeUrl: 'https://slctr.lk',
        buildSearchUrl: () => 'https://slctr.lk/trials',
    },
    {
        code: 'lbctr',
        name: 'Lebanese Clinical Trials Registry',
        abbr: 'LBCTR',
        region: 'Lebanon',
        access: 'portalLink',
        whoPrimaryRegistry: true,
        homeUrl: 'https://lbctr.emro.who.int',
        buildSearchUrl: () => 'https://lbctr.emro.who.int',
    },
    {
        code: 'itmctr',
        name: 'International Traditional Medicine Clinical Trial Registry',
        abbr: 'ITMCTR',
        region: 'International (traditional medicine)',
        access: 'portalLink',
        whoPrimaryRegistry: true,
        homeUrl: 'https://itmctr.ccebtcm.org.cn',
        buildSearchUrl: () => 'https://itmctr.ccebtcm.org.cn',
    },
]

/** WHO Primary Registries only (excludes aggregators/portals like ICTRP). */
export const whoPrimaryRegistries = (): RegistryEntry[] =>
    REGISTRIES.filter((r) => r.whoPrimaryRegistry)

/** Registries queried live in-app. */
export const liveRegistries = (): RegistryEntry[] =>
    REGISTRIES.filter((r) => r.access === 'liveApi')

export const getRegistry = (code: string): RegistryEntry | undefined =>
    REGISTRIES.find((r) => r.code === code)
