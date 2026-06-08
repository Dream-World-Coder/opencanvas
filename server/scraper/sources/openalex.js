import { withRetry, sleep } from "../utils/retry.js";
import { normalizeOpenAlex } from "../utils/normalize.js";
import { logger } from "../utils/logger.js";

const BASE_URL = "https://api.openalex.org/works";
const PER_PAGE = 50;
// Adding an email to requests puts you in OpenAlex's "polite pool" with higher limits
const MAILTO =
    process.env.OPENALEX_MAILTO ?? "opencanvas-scraper@opencanvas.app";

const FIELDS = [
    "id",
    "title",
    "abstract_inverted_index",
    "doi",
    "authorships",
    "publication_date",
    "concepts",
    "topics",
    "ids",
    "open_access",
    "primary_location",
].join(",");

/**
 * @param {object}   institution  Full institution config entry
 * @param {{ onPaper: (p) => Promise<void>, limit: number }} opts
 * @returns {Promise<number>}
 */
export async function fetchFromOpenAlex(institution, { onPaper, limit }) {
    const config = institution.openalex;
    if (!config?.rorId) {
        logger.skip(`[OpenAlex] ${institution.slug}: no ROR ID configured`);
        return 0;
    }

    const rorId = config.rorId.replace("https://ror.org/", "");
    logger.info(`[OpenAlex] ${institution.slug}: ROR=${rorId}`);

    let processed = 0;
    let cursor = "*";

    while (processed < limit) {
        const pageSize = Math.min(PER_PAGE, limit - processed);
        const params = new URLSearchParams({
            filter: `institutions.ror:${rorId},is_paratext:false`,
            select: FIELDS,
            "per-page": String(pageSize),
            cursor,
            mailto: MAILTO,
            sort: "publication_date:desc",
        });

        let data;
        try {
            data = await withRetry(
                async () => {
                    const res = await fetch(`${BASE_URL}?${params}`, {
                        headers: { "User-Agent": "OpenCanvas/1.0" },
                    });
                    if (res.status === 403)
                        throw new Error("OpenAlex 403 -- check filter syntax");
                    if (res.status === 429)
                        throw new Error("OpenAlex rate limited");
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);
                    return res.json();
                },
                {
                    retries: 4,
                    baseDelay: 1500,
                    label: `OpenAlex ${institution.slug}`,
                },
            );
        } catch (err) {
            logger.error(`[OpenAlex] ${institution.slug}: ${err.message}`);
            break;
        }

        const works = data.results ?? [];
        if (works.length === 0) break;

        for (const work of works) {
            try {
                const normalized = normalizeOpenAlex(work, institution.slug);
                if (!normalized.title) {
                    logger.skip(
                        `[OpenAlex] ${institution.slug}: no title -- skipping`,
                    );
                    continue;
                }
                await onPaper(normalized);
                processed++;
            } catch (err) {
                logger.error(
                    `[OpenAlex] ${institution.slug}: error processing work ${work.id}: ${err.message}`,
                );
            }
        }

        logger.stat("OpenAlex", `${processed}`, `(${institution.slug})`);

        cursor = data.meta?.next_cursor;
        if (!cursor || works.length < pageSize) break;

        // Polite pool still has rate limits
        await sleep(500);
    }

    return processed;
}
