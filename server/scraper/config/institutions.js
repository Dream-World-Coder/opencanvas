/**
 * Master institution list.
 *
 * Each entry drives BOTH the scraper and the frontend navigation.
 * Sources are tried in the order defined in index.js (openalex → arxiv → oai_pmh → s2 → crossref).
 *
 * openalex.rorId   -- https://ror.org/<id>  (look up at https://ror.org)
 * arxiv.affiliationQuery -- string used in arXiv full-text search
 * arxiv.categories -- arXiv category prefixes to filter by (reduces noise)
 * oaiPmh.baseUrl   -- OAI-PMH endpoint; set enabled:false if unreliable
 * semanticScholar.query -- free-text query for S2 paper search
 * crossref.affiliationQuery -- affiliation string for CrossRef
 */

export const institutions = [
    // ── United States ──────────────────────────────────────────────────────

    {
        slug: "mit",
        displayName: "Massachusetts Institute of Technology",
        shortName: "MIT",
        country: "USA",
        color: "#A31F34",
        website: "https://www.mit.edu",
        openalex: { rorId: "https://ror.org/042nb2s44" },
        arxiv: {
            enabled: true,
            affiliationQuery: "Massachusetts Institute of Technology",
            categories: ["cs", "math", "physics", "eess", "stat", "quant-ph"],
        },
        oaiPmh: {
            enabled: true,
            baseUrl: "https://dspace.mit.edu/oai/request",
            metadataPrefix: "oai_dc",
        },
        semanticScholar: {
            enabled: true,
            query: "MIT Massachusetts Institute of Technology",
        },
        crossref: {
            enabled: true,
            affiliationQuery: "Massachusetts Institute of Technology",
        },
    },

    {
        slug: "stanford",
        displayName: "Stanford University",
        shortName: "Stanford",
        country: "USA",
        color: "#8C1515",
        website: "https://www.stanford.edu",
        openalex: { rorId: "https://ror.org/00f54p054" },
        arxiv: {
            enabled: true,
            affiliationQuery: "Stanford University",
            categories: ["cs", "math", "physics", "eess", "stat", "q-bio"],
        },
        oaiPmh: { enabled: false },
        semanticScholar: { enabled: true, query: "Stanford University" },
        crossref: { enabled: true, affiliationQuery: "Stanford University" },
    },

    {
        slug: "cmu",
        displayName: "Carnegie Mellon University",
        shortName: "CMU",
        country: "USA",
        color: "#C41230",
        website: "https://www.cmu.edu",
        openalex: { rorId: "https://ror.org/05x2bcf33" },
        arxiv: {
            enabled: true,
            affiliationQuery: "Carnegie Mellon University",
            categories: ["cs", "math", "stat", "eess"],
        },
        oaiPmh: { enabled: false },
        semanticScholar: { enabled: true, query: "Carnegie Mellon University" },
        crossref: {
            enabled: true,
            affiliationQuery: "Carnegie Mellon University",
        },
    },

    {
        slug: "berkeley",
        displayName: "UC Berkeley",
        shortName: "Berkeley",
        country: "USA",
        color: "#003262",
        website: "https://www.berkeley.edu",
        openalex: { rorId: "https://ror.org/01an7q238" },
        arxiv: {
            enabled: true,
            affiliationQuery: "University of California Berkeley",
            categories: ["cs", "math", "physics", "eess", "stat"],
        },
        oaiPmh: { enabled: false },
        semanticScholar: { enabled: true, query: "UC Berkeley" },
        crossref: {
            enabled: true,
            affiliationQuery: "University of California, Berkeley",
        },
    },

    {
        slug: "caltech",
        displayName: "California Institute of Technology",
        shortName: "Caltech",
        country: "USA",
        color: "#FF6C0C",
        website: "https://www.caltech.edu",
        openalex: { rorId: "https://ror.org/05dxps055" },
        arxiv: {
            enabled: true,
            affiliationQuery: "California Institute of Technology",
            categories: ["cs", "math", "physics", "astro-ph", "quant-ph"],
        },
        oaiPmh: { enabled: false },
        semanticScholar: {
            enabled: true,
            query: "Caltech California Institute of Technology",
        },
        crossref: {
            enabled: true,
            affiliationQuery: "California Institute of Technology",
        },
    },

    {
        slug: "princeton",
        displayName: "Princeton University",
        shortName: "Princeton",
        country: "USA",
        color: "#FF8F00",
        website: "https://www.princeton.edu",
        openalex: { rorId: "https://ror.org/00hx57361" },
        arxiv: {
            enabled: true,
            affiliationQuery: "Princeton University",
            categories: ["cs", "math", "physics", "econ", "stat"],
        },
        oaiPmh: { enabled: false },
        semanticScholar: { enabled: true, query: "Princeton University" },
        crossref: { enabled: true, affiliationQuery: "Princeton University" },
    },

    {
        slug: "cornell",
        displayName: "Cornell University",
        shortName: "Cornell",
        country: "USA",
        color: "#B31B1B",
        website: "https://www.cornell.edu",
        openalex: { rorId: "https://ror.org/05bnh6r87" },
        arxiv: {
            enabled: true,
            affiliationQuery: "Cornell University",
            categories: ["cs", "math", "physics", "stat", "econ"],
        },
        oaiPmh: { enabled: false },
        semanticScholar: { enabled: true, query: "Cornell University" },
        crossref: { enabled: true, affiliationQuery: "Cornell University" },
    },

    {
        slug: "gatech",
        displayName: "Georgia Institute of Technology",
        shortName: "Georgia Tech",
        country: "USA",
        color: "#003057",
        website: "https://www.gatech.edu",
        openalex: { rorId: "https://ror.org/01zkghx44" },
        arxiv: {
            enabled: true,
            affiliationQuery: "Georgia Institute of Technology",
            categories: ["cs", "math", "eess"],
        },
        oaiPmh: { enabled: false },
        semanticScholar: { enabled: true, query: "Georgia Tech" },
        crossref: {
            enabled: true,
            affiliationQuery: "Georgia Institute of Technology",
        },
    },

    {
        slug: "uw",
        displayName: "University of Washington",
        shortName: "UW",
        country: "USA",
        color: "#4B2E83",
        website: "https://www.washington.edu",
        openalex: { rorId: "https://ror.org/00cvxb145" },
        arxiv: {
            enabled: true,
            affiliationQuery: "University of Washington",
            categories: ["cs", "math", "stat", "eess", "q-bio"],
        },
        oaiPmh: { enabled: false },
        semanticScholar: {
            enabled: true,
            query: "University of Washington Seattle",
        },
        crossref: {
            enabled: true,
            affiliationQuery: "University of Washington",
        },
    },

    // ── India ──────────────────────────────────────────────────────────────

    {
        slug: "iit-bombay",
        displayName: "Indian Institute of Technology Bombay",
        shortName: "IIT Bombay",
        country: "India",
        color: "#003087",
        website: "https://www.iitb.ac.in",
        openalex: { rorId: "https://ror.org/02g7axp89" },
        arxiv: {
            enabled: true,
            affiliationQuery: "Indian Institute of Technology Bombay",
            categories: ["cs", "math", "eess", "physics"],
        },
        oaiPmh: {
            enabled: true,
            baseUrl: "https://dspace.library.iitb.ac.in/oai/request",
            metadataPrefix: "oai_dc",
        },
        semanticScholar: { enabled: true, query: "IIT Bombay" },
        crossref: { enabled: false, affiliationQuery: "IIT Bombay" },
    },

    {
        slug: "iit-delhi",
        displayName: "Indian Institute of Technology Delhi",
        shortName: "IIT Delhi",
        country: "India",
        color: "#0033A0",
        website: "https://home.iitd.ac.in",
        openalex: { rorId: "https://ror.org/04t1yfb53" },
        arxiv: {
            enabled: true,
            affiliationQuery: "Indian Institute of Technology Delhi",
            categories: ["cs", "math", "eess", "physics"],
        },
        oaiPmh: { enabled: false },
        semanticScholar: { enabled: true, query: "IIT Delhi" },
        crossref: { enabled: false, affiliationQuery: "IIT Delhi" },
    },

    {
        slug: "iit-madras",
        displayName: "Indian Institute of Technology Madras",
        shortName: "IIT Madras",
        country: "India",
        color: "#A00000",
        website: "https://www.iitm.ac.in",
        openalex: { rorId: "https://ror.org/04dq7ek83" },
        arxiv: {
            enabled: true,
            affiliationQuery: "Indian Institute of Technology Madras",
            categories: ["cs", "math", "eess"],
        },
        oaiPmh: { enabled: false },
        semanticScholar: { enabled: true, query: "IIT Madras" },
        crossref: { enabled: false, affiliationQuery: "IIT Madras" },
    },

    {
        slug: "iisc",
        displayName: "Indian Institute of Science",
        shortName: "IISc",
        country: "India",
        color: "#002147",
        website: "https://www.iisc.ac.in",
        openalex: { rorId: "https://ror.org/00xntqd68" },
        arxiv: {
            enabled: true,
            affiliationQuery: "Indian Institute of Science",
            categories: ["cs", "math", "physics", "eess"],
        },
        oaiPmh: { enabled: false },
        semanticScholar: {
            enabled: true,
            query: "IISc Bangalore Indian Institute of Science",
        },
        crossref: {
            enabled: false,
            affiliationQuery: "Indian Institute of Science",
        },
    },

    {
        slug: "cmi",
        displayName: "Chennai Mathematical Institute",
        shortName: "CMI",
        country: "India",
        color: "#8B0000",
        website: "https://www.cmi.ac.in",
        openalex: { rorId: null }, // small institute -- skip OpenAlex
        arxiv: {
            enabled: true,
            affiliationQuery: "Chennai Mathematical Institute",
            categories: ["math", "cs", "math-ph"],
        },
        oaiPmh: { enabled: false },
        semanticScholar: {
            enabled: true,
            query: "Chennai Mathematical Institute",
        },
        crossref: {
            enabled: false,
            affiliationQuery: "Chennai Mathematical Institute",
        },
    },

    // ── Europe ─────────────────────────────────────────────────────────────

    {
        slug: "eth-zurich",
        displayName: "ETH Zurich",
        shortName: "ETH",
        country: "Switzerland",
        color: "#215732",
        website: "https://ethz.ch",
        openalex: { rorId: "https://ror.org/05a28rw58" },
        arxiv: {
            enabled: true,
            affiliationQuery: "ETH Zurich",
            categories: ["cs", "math", "physics", "eess"],
        },
        oaiPmh: {
            enabled: true,
            baseUrl: "https://www.research-collection.ethz.ch/oai/request",
            metadataPrefix: "oai_dc",
        },
        semanticScholar: { enabled: true, query: "ETH Zurich" },
        crossref: { enabled: true, affiliationQuery: "ETH Zurich" },
    },

    {
        slug: "oxford",
        displayName: "University of Oxford",
        shortName: "Oxford",
        country: "UK",
        color: "#002147",
        website: "https://www.ox.ac.uk",
        openalex: { rorId: "https://ror.org/052gg0110" },
        arxiv: {
            enabled: true,
            affiliationQuery: "University of Oxford",
            categories: ["cs", "math", "physics", "q-bio", "stat"],
        },
        oaiPmh: {
            enabled: true,
            baseUrl: "https://ora.ox.ac.uk/oai",
            metadataPrefix: "oai_dc",
        },
        semanticScholar: { enabled: true, query: "University of Oxford" },
        crossref: { enabled: true, affiliationQuery: "University of Oxford" },
    },

    {
        slug: "cambridge",
        displayName: "University of Cambridge",
        shortName: "Cambridge",
        country: "UK",
        color: "#003E74",
        website: "https://www.cam.ac.uk",
        openalex: { rorId: "https://ror.org/013meh722" },
        arxiv: {
            enabled: true,
            affiliationQuery: "University of Cambridge",
            categories: ["cs", "math", "physics", "astro-ph", "q-bio"],
        },
        oaiPmh: { enabled: false },
        semanticScholar: { enabled: true, query: "University of Cambridge" },
        crossref: {
            enabled: true,
            affiliationQuery: "University of Cambridge",
        },
    },

    {
        slug: "tum",
        displayName: "Technical University of Munich",
        shortName: "TU Munich",
        country: "Germany",
        color: "#0065BD",
        website: "https://www.tum.de",
        openalex: { rorId: "https://ror.org/02kkvpp62" },
        arxiv: {
            enabled: true,
            affiliationQuery: "Technical University of Munich",
            categories: ["cs", "math", "eess", "physics"],
        },
        oaiPmh: { enabled: false },
        semanticScholar: {
            enabled: true,
            query: "TU Munich Technical University",
        },
        crossref: {
            enabled: true,
            affiliationQuery: "Technical University of Munich",
        },
    },

    {
        slug: "epfl",
        displayName: "EPFL",
        shortName: "EPFL",
        country: "Switzerland",
        color: "#FF0000",
        website: "https://www.epfl.ch",
        openalex: { rorId: "https://ror.org/02s376052" },
        arxiv: {
            enabled: true,
            affiliationQuery: "EPFL",
            categories: ["cs", "math", "eess", "physics"],
        },
        oaiPmh: {
            enabled: true,
            baseUrl: "https://infoscience.epfl.ch/oai2d",
            metadataPrefix: "oai_dc",
        },
        semanticScholar: { enabled: true, query: "EPFL Lausanne" },
        crossref: { enabled: true, affiliationQuery: "EPFL" },
    },

    // ── Canada ─────────────────────────────────────────────────────────────

    {
        slug: "utoronto",
        displayName: "University of Toronto",
        shortName: "UofT",
        country: "Canada",
        color: "#002A5C",
        website: "https://www.utoronto.ca",
        openalex: { rorId: "https://ror.org/03dbr7087" },
        arxiv: {
            enabled: true,
            affiliationQuery: "University of Toronto",
            categories: ["cs", "math", "physics", "stat", "q-bio"],
        },
        oaiPmh: { enabled: false },
        semanticScholar: { enabled: true, query: "University of Toronto" },
        crossref: { enabled: true, affiliationQuery: "University of Toronto" },
    },

    // ── Asia / Pacific ─────────────────────────────────────────────────────

    {
        slug: "nus",
        displayName: "National University of Singapore",
        shortName: "NUS",
        country: "Singapore",
        color: "#003D7C",
        website: "https://www.nus.edu.sg",
        openalex: { rorId: "https://ror.org/01tgyzw49" },
        arxiv: {
            enabled: true,
            affiliationQuery: "National University of Singapore",
            categories: ["cs", "math", "eess", "physics"],
        },
        oaiPmh: { enabled: false },
        semanticScholar: {
            enabled: true,
            query: "NUS National University of Singapore",
        },
        crossref: {
            enabled: true,
            affiliationQuery: "National University of Singapore",
        },
    },

    {
        slug: "tsinghua",
        displayName: "Tsinghua University",
        shortName: "Tsinghua",
        country: "China",
        color: "#660874",
        website: "https://www.tsinghua.edu.cn",
        openalex: { rorId: "https://ror.org/03py81522" },
        arxiv: {
            enabled: true,
            affiliationQuery: "Tsinghua University",
            categories: ["cs", "math", "eess", "physics"],
        },
        oaiPmh: { enabled: false },
        semanticScholar: {
            enabled: true,
            query: "Tsinghua University Beijing",
        },
        crossref: { enabled: true, affiliationQuery: "Tsinghua University" },
    },
];

// Fast lookup by slug -- used by the scraper CLI and the Express router
export const institutionBySlug = Object.fromEntries(
    institutions.map((i) => [i.slug, i]),
);
