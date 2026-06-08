import { withRetry, sleep } from "../utils/retry.js";
import { normalizeCrossRef } from "../utils/normalize.js";
import { logger } from "../utils/logger.js";

const BASE_URL = "https://api.crossref.org/works";
const PER_PAGE = 50;
// CrossRef polite pool requires a mailto in requests
const MAILTO =
    process.env.CROSSREF_MAILTO ?? "opencanvas-scraper@opencanvas.app";

const SELECT_FIELDS = [
    "DOI",
    "title",
    "author",
    "abstract",
    "published",
    "URL",
    "subject",
    "link",
    "type",
].join(",");

/**
 * CrossRef is useful as a fallback for papers with DOIs that aren't on arXiv.
 * Note: many CrossRef records lack abstracts -- we skip those.
 *
 * @param {object}   institution
 * @param {{ onPaper: (p) => Promise<void>, limit: number }} opts
 * @returns {Promise<number>}
 */
export async function fetchFromCrossRef(institution, { onPaper, limit }) {
    const config = institution.crossref;
    if (!config?.enabled) {
        logger.skip(`[CrossRef] ${institution.slug}: disabled`);
        return 0;
    }

    logger.info(
        `[CrossRef] ${institution.slug}: query="${config.affiliationQuery}"`,
    );

    let processed = 0;
    let offset = 0;

    while (processed < limit) {
        const batchSize = Math.min(PER_PAGE, limit - processed);
        const params = new URLSearchParams({
            "query.affiliation": config.affiliationQuery,
            rows: String(batchSize),
            offset: String(offset),
            select: SELECT_FIELDS,
            sort: "published",
            order: "desc",
            mailto: MAILTO,
        });

        let data;
        try {
            data = await withRetry(
                async () => {
                    const res = await fetch(`${BASE_URL}?${params}`, {
                        headers: {
                            "User-Agent": `OpenCanvas/1.0 (mailto:${MAILTO})`,
                            Accept: "application/json",
                        },
                    });
                    if (res.status === 429) {
                        await sleep(10_000);
                        throw new Error("CrossRef rate limited");
                    }
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);
                    return res.json();
                },
                {
                    retries: 4,
                    baseDelay: 2000,
                    label: `CrossRef ${institution.slug} offset=${offset}`,
                },
            );
        } catch (err) {
            logger.error(`[CrossRef] ${institution.slug}: ${err.message}`);
            break;
        }

        const items = data.message?.items ?? [];
        if (items.length === 0) break;

        let skipped = 0;
        for (const item of items) {
            try {
                // CrossRef has massive volume of records without abstracts -- not useful for us
                if (!item.abstract) {
                    skipped++;
                    continue;
                }
                // Also skip non-research types
                const type = item.type ?? "";
                if (
                    ["component", "reference-entry", "book-track"].includes(
                        type,
                    )
                ) {
                    skipped++;
                    continue;
                }

                const normalized = normalizeCrossRef(item, institution.slug);
                if (!normalized.title) {
                    skipped++;
                    continue;
                }

                await onPaper(normalized);
                processed++;
            } catch (err) {
                logger.error(
                    `[CrossRef] ${institution.slug}: error processing ${item.DOI}: ${err.message}`,
                );
            }
        }

        if (skipped > 0) {
            logger.skip(
                `[CrossRef] ${institution.slug}: skipped ${skipped} records without abstracts`,
            );
        }

        logger.stat("CrossRef", `${processed}`, `(${institution.slug})`);

        if (items.length < batchSize) break;
        offset += batchSize;

        await sleep(1000);
    }

    return processed;
}
