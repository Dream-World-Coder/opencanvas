import { XMLParser } from "fast-xml-parser";
import { withRetry, sleep } from "../utils/retry.js";
import { normalizeOaiPmh } from "../utils/normalize.js";
import { logger } from "../utils/logger.js";

const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    parseTagValue: true,
    // OAI-PMH always wraps repeated fields in arrays
    isArray: (name) =>
        [
            "record",
            "dc:subject",
            "dc:creator",
            "dc:identifier",
            "dc:relation",
        ].includes(name),
});

/**
 * Fetch publications from an OAI-PMH endpoint.
 * Handles resumptionTokens for large repositories.
 * Errors are caught per-record and per-batch -- continues on partial failure.
 *
 * @param {object}   institution
 * @param {{ onPaper: (p) => Promise<void>, limit: number }} opts
 * @returns {Promise<number>}
 */
export async function fetchFromOaiPmh(institution, { onPaper, limit }) {
    const config = institution.oaiPmh;
    if (!config?.enabled) {
        logger.skip(`[OAI-PMH] ${institution.slug}: disabled`);
        return 0;
    }

    const { baseUrl, metadataPrefix = "oai_dc", set } = config;
    logger.info(`[OAI-PMH] ${institution.slug}: ${baseUrl}`);

    let processed = 0;
    let resumptionToken = null;
    let isFirstRequest = true;
    let pageNum = 0;

    while (processed < limit) {
        // Build the request URL
        let url;
        if (isFirstRequest) {
            const params = new URLSearchParams({
                verb: "ListRecords",
                metadataPrefix,
            });
            if (set) params.set("set", set);
            url = `${baseUrl}?${params}`;
            isFirstRequest = false;
        } else if (resumptionToken) {
            url = `${baseUrl}?verb=ListRecords&resumptionToken=${encodeURIComponent(resumptionToken)}`;
        } else {
            break;
        }

        let xml;
        try {
            xml = await withRetry(
                async () => {
                    const res = await fetch(url, {
                        headers: { "User-Agent": "OpenCanvas/1.0" },
                        signal: AbortSignal.timeout(30_000), // OAI-PMH repos can be slow
                    });
                    if (!res.ok)
                        throw new Error(`HTTP ${res.status} ${res.statusText}`);
                    const text = await res.text();
                    if (!text.includes("<OAI-PMH"))
                        throw new Error("Response is not OAI-PMH XML");
                    return text;
                },
                {
                    retries: 3,
                    baseDelay: 3000,
                    label: `OAI-PMH ${institution.slug} page=${pageNum}`,
                },
            );
        } catch (err) {
            logger.error(
                `[OAI-PMH] ${institution.slug}: page ${pageNum} failed: ${err.message}`,
            );
            break;
        }

        let parsed;
        try {
            parsed = parser.parse(xml);
        } catch (err) {
            logger.error(
                `[OAI-PMH] ${institution.slug}: XML parse error on page ${pageNum}: ${err.message}`,
            );
            break;
        }

        const oai = parsed["OAI-PMH"];
        if (!oai) {
            logger.error(`[OAI-PMH] ${institution.slug}: no <OAI-PMH> root`);
            break;
        }

        // Check for protocol-level errors
        if (oai.error) {
            const code = oai.error["@_code"] ?? "unknown";
            const msg = oai.error["#text"] ?? JSON.stringify(oai.error);
            if (code === "noRecordsMatch") {
                logger.warn(
                    `[OAI-PMH] ${institution.slug}: no records match -- stopping`,
                );
            } else {
                logger.error(
                    `[OAI-PMH] ${institution.slug}: protocol error [${code}]: ${msg}`,
                );
            }
            break;
        }

        const listRecords = oai.ListRecords;
        if (!listRecords) {
            logger.warn(
                `[OAI-PMH] ${institution.slug}: no ListRecords element`,
            );
            break;
        }

        const records = listRecords.record ?? [];
        if (records.length === 0) break;

        for (const record of records) {
            if (processed >= limit) break;
            try {
                // Skip deleted records
                if (record.header?.["@_status"] === "deleted") continue;

                const normalized = normalizeOaiPmh(record, institution);
                if (!normalized.title || !normalized.abstract) {
                    logger.skip(
                        `[OAI-PMH] ${institution.slug}: missing title/abstract`,
                    );
                    continue;
                }

                await onPaper(normalized);
                processed++;
            } catch (err) {
                logger.error(
                    `[OAI-PMH] ${institution.slug}: record error: ${err.message}`,
                );
            }
        }

        logger.stat(
            "OAI-PMH",
            `${processed}`,
            `(${institution.slug}, page ${pageNum})`,
        );
        pageNum++;

        // Extract resumptionToken for next page
        const tokenEl = listRecords.resumptionToken;
        resumptionToken = null;
        if (tokenEl) {
            if (typeof tokenEl === "string") resumptionToken = tokenEl;
            else if (typeof tokenEl === "object") {
                resumptionToken = tokenEl["#text"] ?? tokenEl["_"] ?? null;
            }
        }

        if (!resumptionToken) break;
        await sleep(1500); // OAI-PMH repos are often slow servers
    }

    return processed;
}
