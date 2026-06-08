// ─── Helpers ────────────────────────────────────────────────────────────────

function clean(str) {
    if (!str) return "";
    return String(str).replace(/\s+/g, " ").trim();
}

function toArray(val) {
    if (!val) return [];
    return Array.isArray(val) ? val : [val];
}

function extractArxivId(str) {
    if (!str) return null;
    const m = String(str).match(/(\d{4}\.\d{4,5}(?:v\d+)?)/);
    return m ? m[1] : null;
}

function cleanDoi(str) {
    if (!str) return null;
    return (
        String(str)
            .replace(/^https?:\/\/doi\.org\//i, "")
            .trim() || null
    );
}

/**
 * OpenAlex stores abstracts as an inverted index:
 * { "word": [position, ...], ... }
 * Reconstruct into a plain string.
 */
function reconstructAbstract(invertedIndex) {
    if (!invertedIndex || typeof invertedIndex !== "object") return "";
    const words = [];
    for (const [word, positions] of Object.entries(invertedIndex)) {
        for (const pos of positions) words[pos] = word;
    }
    return words.filter(Boolean).join(" ");
}

// ─── Normalizers ─────────────────────────────────────────────────────────────

/**
 * Normalize an arXiv Atom feed entry (parsed by fast-xml-parser).
 */
export function normalizeArxiv(entry, institutionSlug) {
    const rawAuthors = toArray(entry.author);
    const authors = rawAuthors.map((a) => ({
        name: clean(a.name),
        affiliation: clean(
            a["arxiv:affiliation"]?.["#text"] ?? a["arxiv:affiliation"] ?? "",
        ),
    }));

    const links = toArray(entry.link);
    const pdfLink = links.find((l) => l["@_title"] === "pdf");
    const altLink = links.find((l) => l["@_rel"] === "alternate");
    const rawId = clean(entry.id);
    const arxivId = extractArxivId(rawId);

    const categories = toArray(entry.category)
        .map((c) => c["@_term"])
        .filter(Boolean);

    return {
        title: clean(entry.title),
        abstract: clean(entry.summary),
        pdfUrl: pdfLink?.["@_href"] ?? rawId.replace("/abs/", "/pdf/") ?? null,
        externalUrl: altLink?.["@_href"] ?? rawId ?? null,
        authors,
        institution: institutionSlug,
        source: "arxiv",
        arxivId,
        doi: cleanDoi(entry["arxiv:doi"]?.["#text"] ?? entry["arxiv:doi"]),
        categories,
        publishedAt: entry.published ? new Date(entry.published) : new Date(),
    };
}

/**
 * Normalize an OpenAlex work object.
 */
export function normalizeOpenAlex(work, institutionSlug) {
    const abstract = work.abstract
        ? clean(work.abstract)
        : reconstructAbstract(work.abstract_inverted_index);

    const authors = toArray(work.authorships).map((a) => ({
        name: clean(a.author?.display_name),
        affiliation: clean(a.institutions?.[0]?.display_name ?? ""),
    }));

    const concepts = toArray(work.concepts)
        .slice(0, 6)
        .map((c) => c.display_name)
        .filter(Boolean);
    const topics = toArray(work.topics)
        .slice(0, 4)
        .map((t) => t.display_name)
        .filter(Boolean);
    const categories = [...new Set([...concepts, ...topics])].slice(0, 6);

    const doi = cleanDoi(work.doi);
    const arxivId = extractArxivId(work.ids?.arxiv);

    return {
        title: clean(work.title),
        abstract,
        pdfUrl: work.open_access?.oa_url ?? null,
        externalUrl: doi ? `https://doi.org/${doi}` : (work.id ?? null),
        authors,
        institution: institutionSlug,
        source: "openalex",
        arxivId,
        doi,
        categories,
        publishedAt: work.publication_date
            ? new Date(work.publication_date)
            : new Date(),
    };
}

/**
 * Normalize a Semantic Scholar paper object.
 */
export function normalizeSemanticScholar(paper, institutionSlug) {
    const authors = toArray(paper.authors).map((a) => ({
        name: clean(a.name),
        affiliation: clean(toArray(a.affiliations)[0] ?? ""),
    }));

    return {
        title: clean(paper.title),
        abstract: clean(paper.abstract),
        pdfUrl: paper.openAccessPdf?.url ?? null,
        externalUrl:
            paper.url ??
            `https://www.semanticscholar.org/paper/${paper.paperId}`,
        authors,
        institution: institutionSlug,
        source: "semantic_scholar",
        arxivId: paper.externalIds?.ArXiv ?? null,
        doi: cleanDoi(paper.externalIds?.DOI),
        categories: toArray(paper.fieldsOfStudy).slice(0, 6),
        publishedAt: paper.publicationDate
            ? new Date(paper.publicationDate)
            : new Date(),
    };
}

/**
 * Normalize a CrossRef work item.
 */
export function normalizeCrossRef(item, institutionSlug) {
    const authors = toArray(item.author).map((a) => ({
        name: clean(`${a.given ?? ""} ${a.family ?? ""}`),
        affiliation: clean(toArray(a.affiliation)[0]?.name ?? ""),
    }));

    const dateParts = item.published?.["date-parts"]?.[0] ?? [];
    const publishedAt = dateParts.length
        ? new Date(dateParts[0], (dateParts[1] ?? 1) - 1, dateParts[2] ?? 1)
        : new Date();

    const rawTitle = toArray(item.title)[0] ?? "";
    const rawAbstract = item.abstract
        ? item.abstract.replace(/<[^>]+>/g, "")
        : "";

    const pdfLink = toArray(item.link).find(
        (l) => l["content-type"] === "application/pdf",
    );

    return {
        title: clean(rawTitle),
        abstract: clean(rawAbstract),
        pdfUrl: pdfLink?.URL ?? null,
        externalUrl:
            item.URL ?? (item.DOI ? `https://doi.org/${item.DOI}` : null),
        authors,
        institution: institutionSlug,
        source: "crossref",
        arxivId: null,
        doi: cleanDoi(item.DOI),
        categories: toArray(item.subject).slice(0, 6),
        publishedAt,
    };
}

/**
 * Normalize an OAI-PMH record with oai_dc metadata.
 */
export function normalizeOaiPmh(record, institution) {
    const meta = record.metadata?.["oai_dc:dc"] ?? record.metadata?.dc ?? {};

    function get(key) {
        const v = meta[`dc:${key}`] ?? meta[key];
        if (!v) return "";
        return clean(Array.isArray(v) ? v[0] : v);
    }
    function getAll(key) {
        const v = meta[`dc:${key}`] ?? meta[key];
        if (!v) return [];
        return toArray(v)
            .map((x) => clean(x))
            .filter(Boolean);
    }

    const identifiers = getAll("identifier");
    const urlId = identifiers.find((i) => /^https?:\/\//i.test(i)) ?? null;
    const doiRaw =
        identifiers.find((i) => i.startsWith("10.") || i.includes("doi.org")) ??
        null;
    const doi = cleanDoi(doiRaw);

    const authorStrings = getAll("creator");
    const authors = authorStrings.map((name) => ({
        name,
        affiliation: institution.displayName,
    }));

    return {
        title: get("title"),
        abstract: get("description"),
        pdfUrl: urlId,
        externalUrl: urlId,
        authors,
        institution: institution.slug,
        source: "oai_pmh",
        arxivId: extractArxivId(urlId),
        doi,
        categories: getAll("subject").slice(0, 6),
        publishedAt: get("date") ? new Date(get("date")) : new Date(),
    };
}
