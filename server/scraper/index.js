/**
 * OpenCanvas Publication Scraper
 *
 * Usage:
 *   node index.js                          # scrape all institutions, all sources
 *   node index.js -i mit                   # one institution
 *   node index.js -i mit -s arxiv          # one institution, one source
 *   node index.js -l 25                    # limit per source per institution
 *   node index.js --dry-run                # print what would be written, no DB writes
 *   node index.js --sources openalex,arxiv # only specific sources
 *
 * Sources are tried in priority order. A failure in one source does NOT stop
 * the others. Papers are written to MongoDB immediately as they come in.
 */

import "dotenv/config";
import { parseArgs } from "node:util";

import { connectDb, disconnectDb, upsertPublication } from "./utils/db.js";
import { logger } from "./utils/logger.js";
import { sleep } from "./utils/retry.js";
import { institutions, institutionBySlug } from "./config/institutions.js";

import { fetchFromOpenAlex } from "./sources/openalex.js";
import { fetchFromArxiv } from "./sources/arxiv.js";
import { fetchFromOaiPmh } from "./sources/oai_pmh.js";
import { fetchFromSemanticScholar } from "./sources/semantic_scholar.js";
import { fetchFromCrossRef } from "./sources/crossref.js";

// CLI args

const { values: args } = parseArgs({
    options: {
        institution: { type: "string", short: "i", default: "" },
        sources: { type: "string", short: "s", default: "" },
        limit: { type: "string", short: "l", default: "100" },
        "dry-run": { type: "boolean", short: "d", default: false },
    },
    strict: false,
});

const LIMIT = Math.max(1, parseInt(args.limit, 10) || 100);
const DRY_RUN = args["dry-run"];
const INST_ARG = args.institution?.trim();
const SRC_ARG = args.sources?.trim();

// Source registry
// Priority order: OpenAlex (best structured data) → arXiv → OAI-PMH (institutional repos)
// → Semantic Scholar → CrossRef (fallback, many records lack abstracts)

const ALL_SOURCES = [
    { name: "openalex", fn: fetchFromOpenAlex },
    { name: "arxiv", fn: fetchFromArxiv },
    { name: "oai_pmh", fn: fetchFromOaiPmh },
    { name: "s2", fn: fetchFromSemanticScholar },
    // { name: "crossref", fn: fetchFromCrossRef },
];

const enabledSources = SRC_ARG
    ? ALL_SOURCES.filter((s) =>
          SRC_ARG.split(",")
              .map((x) => x.trim())
              .includes(s.name),
      )
    : ALL_SOURCES;

// Per-paper callback

/** Called immediately after each paper is successfully normalized. */
async function onPaper(normalized) {
    if (!normalized.title) return "skip";

    const preview = normalized.title.slice(0, 70);

    if (DRY_RUN) {
        logger.info(`[DRY RUN] "${preview}"`);
        return "dry";
    }

    try {
        const { isNew } = await upsertPublication(normalized);
        if (isNew) {
            logger.success(`Inserted: "${preview}"`);
            return "inserted";
        } else {
            logger.info(`Updated:  "${preview}"`);
            return "updated";
        }
    } catch (err) {
        if (err.code === 11000) {
            logger.skip(`Duplicate: "${preview}"`);
            return "duplicate";
        } else {
            logger.error(`DB write failed for "${preview}": ${err.message}`);
            return "error";
        }
    }
}

// Institution runner
async function runInstitution(institution) {
    logger.section(
        `${institution.displayName}  [${institution.slug}]  (${institution.country})`,
    );

    const results = {};

    // Real DB counters for this institution
    const dbCounts = { inserted: 0, updated: 0, duplicate: 0, error: 0 };

    for (const source of enabledSources) {
        logger.info(`Trying source: ${source.name}`);

        const sourceDbCounts = {
            inserted: 0,
            updated: 0,
            duplicate: 0,
            error: 0,
        };

        try {
            const attempted = await source.fn(institution, {
                onPaper: async (p) => {
                    const result = await onPaper(p);
                    if (result in sourceDbCounts) sourceDbCounts[result]++;
                    if (result in dbCounts) dbCounts[result]++;
                },
                limit: LIMIT,
            });

            results[source.name] = { ok: true, attempted, ...sourceDbCounts };

            logger.success(
                `${source.name}: attempted=${attempted} | ` +
                    `inserted=${sourceDbCounts.inserted} updated=${sourceDbCounts.updated} ` +
                    `dupes=${sourceDbCounts.duplicate} errors=${sourceDbCounts.error}`,
            );
        } catch (err) {
            results[source.name] = { ok: false, error: err.message };
            logger.error(`${source.name}: uncaught error: ${err.message}`);
        }

        await sleep(1500);
    }

    // Summary
    logger.stat(
        "Institution DB summary",
        `inserted=${dbCounts.inserted} updated=${dbCounts.updated} dupes=${dbCounts.duplicate} errors=${dbCounts.error}`,
        `(${institution.slug})`,
    );

    return dbCounts;
}

async function main() {
    logger.section("OpenCanvas Scraper  v1.0");

    if (DRY_RUN) logger.warn("DRY RUN -- nothing will be written to MongoDB");
    if (enabledSources.length < ALL_SOURCES.length) {
        logger.info(
            `Sources filter: ${enabledSources.map((s) => s.name).join(", ")}`,
        );
    }
    logger.info(`Limit per source per institution: ${LIMIT}`);

    // Resolve target institutions
    let targets;
    if (INST_ARG) {
        const inst = institutionBySlug[INST_ARG];
        if (!inst) {
            logger.error(`Unknown institution slug: "${INST_ARG}"`);
            logger.info(
                `Available slugs:\n  ${institutions.map((i) => i.slug).join("\n  ")}`,
            );
            process.exit(1);
        }
        targets = [inst];
    } else {
        targets = institutions;
    }

    logger.info(
        `Institutions to scrape: ${targets.map((i) => i.slug).join(", ")}`,
    );

    if (!DRY_RUN) {
        await connectDb();
    }

    let grandTotal = { inserted: 0, updated: 0, duplicate: 0, error: 0 };
    let succeeded = 0;
    let failedInsts = [];

    for (const institution of targets) {
        try {
            const counts = await runInstitution(institution);
            grandTotal.inserted += counts.inserted;
            grandTotal.updated += counts.updated;
            grandTotal.duplicate += counts.duplicate;
            grandTotal.error += counts.error;
            succeeded++;
        } catch (err) {
            logger.error(`Fatal error for ${institution.slug}: ${err.message}`);
            failedInsts.push(institution.slug);
        }

        // Cooldown between institutions to be polite to APIs
        if (targets.indexOf(institution) < targets.length - 1) {
            logger.info("Cooling down before next institution...");
            await sleep(3000);
        }
    }

    // Final summary
    logger.section("Scrape Complete");
    logger.stat("Inserted (new)", grandTotal.inserted);
    logger.stat("Updated (existed)", grandTotal.updated);
    logger.stat("Duplicates skipped", grandTotal.duplicate);
    logger.stat("DB errors", grandTotal.error);
    logger.stat("Institutions succeeded", `${succeeded} / ${targets.length}`);

    if (failedInsts.length) {
        logger.warn(
            `Institutions with fatal errors: ${failedInsts.join(", ")}`,
        );
    }

    if (!DRY_RUN) {
        await disconnectDb();
    }
}

main().catch((err) => {
    logger.error(`Unhandled top-level error: ${err.message}`);
    console.error(err.stack);
    process.exit(1);
});
