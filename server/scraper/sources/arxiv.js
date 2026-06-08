import { XMLParser } from "fast-xml-parser";
import { withRetry, sleep } from "../utils/retry.js";
import { normalizeArxiv } from "../utils/normalize.js";
import { logger } from "../utils/logger.js";

// arXiv asks for at least 3s between requests in their usage policy
const REQUEST_DELAY_MS = 3500;
const PER_BATCH = 50;
const BASE_URL = "https://export.arxiv.org/api/query";

const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    parseTagValue: true,
    isArray: (name) => ["entry", "category", "link", "author"].includes(name),
});

/**
 * Build an arXiv search query for a given institution config.
 * Strategy: search abstract/affiliation field for the institution name,
 * optionally filtered to specific arXiv categories.
 */
function buildQuery(config) {
    const affPart = `ti:"${config.affiliationQuery}" OR abs:"${config.affiliationQuery}"`;
    if (!config.categories?.length) return affPart;
    const catPart = config.categories.map((c) => `cat:${c}.*`).join(" OR ");
    return `(${affPart}) AND (${catPart})`;
}

/**
 * @param {object}   institution  Full institution config entry
 * @param {{ onPaper: (p) => Promise<void>, limit: number }} opts
 * @returns {Promise<number>} Number of papers successfully processed
 */
export async function fetchFromArxiv(institution, { onPaper, limit }) {
    const config = institution.arxiv;
    if (!config?.enabled) {
        logger.skip(`[arXiv] ${institution.slug}: disabled`);
        return 0;
    }

    const searchQuery = buildQuery(config);
    logger.info(
        `[arXiv] ${institution.slug}: query="${searchQuery.slice(0, 80)}..."`,
    );

    let processed = 0;
    let start = 0;
    let total = Infinity;

    while (processed < limit) {
        const batchSize = Math.min(PER_BATCH, limit - processed);
        const url =
            `${BASE_URL}?search_query=${encodeURIComponent(searchQuery)}` +
            `&start=${start}&max_results=${batchSize}` +
            `&sortBy=submittedDate&sortOrder=descending`;

        let xml;
        try {
            xml = await withRetry(
                async () => {
                    const res = await fetch(url, {
                        headers: {
                            "User-Agent":
                                "OpenCanvas/1.0 (research aggregator; github.com/Dream-World-Coder/opencanvas)",
                        },
                    });
                    if (!res.ok)
                        throw new Error(`HTTP ${res.status} ${res.statusText}`);
                    return res.text();
                },
                {
                    retries: 4,
                    baseDelay: 3000,
                    label: `arXiv ${institution.slug} start=${start}`,
                },
            );
        } catch (err) {
            logger.error(
                `[arXiv] ${institution.slug}: batch start=${start} failed after retries: ${err.message}`,
            );
            break; // stop this source, don't crash
        }

        let feed;
        try {
            feed = parser.parse(xml)?.feed;
        } catch (err) {
            logger.error(
                `[arXiv] ${institution.slug}: XML parse error: ${err.message}`,
            );
            break;
        }

        if (!feed) {
            logger.warn(
                `[arXiv] ${institution.slug}: empty feed at start=${start}`,
            );
            break;
        }

        const serverTotal = parseInt(
            feed["opensearch:totalResults"] ?? "0",
            10,
        );
        if (total === Infinity) {
            total = serverTotal;
            logger.info(`[arXiv] ${institution.slug}: ${total} total results`);
        }

        const entries = feed.entry ?? [];
        if (entries.length === 0) break;

        for (const entry of entries) {
            try {
                const normalized = normalizeArxiv(entry, institution.slug);

                if (!normalized.title || !normalized.abstract) {
                    logger.skip(
                        `[arXiv] ${institution.slug}: no title/abstract -- skipping`,
                    );
                    continue;
                }

                await onPaper(normalized);
                processed++;
            } catch (err) {
                logger.error(
                    `[arXiv] ${institution.slug}: error normalizing entry: ${err.message}`,
                );
                // Continue to next entry
            }
        }

        logger.stat(
            "arXiv",
            `${processed}`,
            `(${institution.slug}, offset ${start + entries.length}/${Math.min(total, limit)})`,
        );

        start += batchSize;
        if (start >= Math.min(total, limit)) break;

        // Respect arXiv's rate limit
        await sleep(REQUEST_DELAY_MS);
    }

    return processed;
}
