import { withRetry, sleep } from "../utils/retry.js";
import { normalizeSemanticScholar } from "../utils/normalize.js";
import { logger } from "../utils/logger.js";

const BASE_URL = "https://api.semanticscholar.org/graph/v1/paper/search";
const FIELDS = [
    "title",
    "abstract",
    "authors.name",
    "authors.affiliations",
    "year",
    "publicationDate",
    "externalIds",
    "openAccessPdf",
    "url",
    "fieldsOfStudy",
].join(",");
// Without an API key: 100 req / 5 min. With key (free): 1 req/s.
const DELAY_MS = process.env.S2_API_KEY ? 1100 : 3500;
const PER_BATCH = 100;

/**
 * @param {object}   institution
 * @param {{ onPaper: (p) => Promise<void>, limit: number }} opts
 * @returns {Promise<number>}
 */
export async function fetchFromSemanticScholar(
    institution,
    { onPaper, limit },
) {
    const config = institution.semanticScholar;
    if (!config?.enabled) {
        logger.skip(`[S2] ${institution.slug}: disabled`);
        return 0;
    }

    logger.info(`[S2] ${institution.slug}: query="${config.query}"`);

    let processed = 0;
    let offset = 0;

    while (processed < limit) {
        const batchSize = Math.min(PER_BATCH, limit - processed);
        const params = new URLSearchParams({
            query: config.query,
            fields: FIELDS,
            offset: String(offset),
            limit: String(batchSize),
        });

        let data;
        try {
            data = await withRetry(
                async () => {
                    const headers = { "User-Agent": "OpenCanvas/1.0" };
                    if (process.env.S2_API_KEY)
                        headers["x-api-key"] = process.env.S2_API_KEY;

                    const res = await fetch(`${BASE_URL}?${params}`, {
                        headers,
                    });

                    if (res.status === 429) {
                        // Back off aggressively on rate limit
                        await sleep(10_000);
                        throw new Error("S2 rate limited (429)");
                    }
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);
                    return res.json();
                },
                {
                    retries: 4,
                    baseDelay: 4000,
                    label: `S2 ${institution.slug} offset=${offset}`,
                },
            );
        } catch (err) {
            logger.error(`[S2] ${institution.slug}: ${err.message}`);
            break;
        }

        const papers = data.data ?? [];
        if (papers.length === 0) break;

        for (const paper of papers) {
            try {
                const normalized = normalizeSemanticScholar(
                    paper,
                    institution.slug,
                );
                if (!normalized.title || !normalized.abstract) {
                    logger.skip(
                        `[S2] ${institution.slug}: no title/abstract -- skipping`,
                    );
                    continue;
                }
                await onPaper(normalized);
                processed++;
            } catch (err) {
                logger.error(
                    `[S2] ${institution.slug}: error processing ${paper.paperId}: ${err.message}`,
                );
            }
        }

        logger.stat("S2", `${processed}`, `(${institution.slug})`);

        if (!data.next || papers.length < batchSize) break;
        offset += batchSize;

        await sleep(DELAY_MS);
    }

    return processed;
}
