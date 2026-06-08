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

// ─── CLI args ────────────────────────────────────────────────────────────────

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

// ─── Source registry ─────────────────────────────────────────────────────────
// Priority order: OpenAlex (best structured data) → arXiv → OAI-PMH (institutional repos)
// → Semantic Scholar → CrossRef (fallback, many records lack abstracts)

const ALL_SOURCES = [
    { name: "openalex", fn: fetchFromOpenAlex },
    { name: "arxiv", fn: fetchFromArxiv },
    { name: "oai_pmh", fn: fetchFromOaiPmh },
    { name: "s2", fn: fetchFromSemanticScholar },
    { name: "crossref", fn: fetchFromCrossRef },
];

const enabledSources = SRC_ARG
    ? ALL_SOURCES.filter((s) =>
          SRC_ARG.split(",")
              .map((x) => x.trim())
              .includes(s.name),
      )
    : ALL_SOURCES;

// ─── Per-paper callback ───────────────────────────────────────────────────────

/** Called immediately after each paper is successfully normalized. */
async function onPaper(normalized) {
    if (!normalized.title) return;

    const preview = normalized.title.slice(0, 70);

    if (DRY_RUN) {
        logger.info(`[DRY RUN] "${preview}"`);
        return;
    }

    try {
        const { isNew } = await upsertPublication(normalized);
        if (isNew) {
            logger.success(`Inserted: "${preview}"`);
        } else {
            logger.info(`Updated:  "${preview}"`);
        }
    } catch (err) {
        // Duplicate key errors are expected and fine -- just means we've seen this paper before
        if (err.code === 11000) {
            logger.skip(`Duplicate: "${preview}"`);
        } else {
            logger.error(`DB write failed for "${preview}": ${err.message}`);
            // Don't rethrow -- one bad write shouldn't crash the whole batch
        }
    }
}

// ─── Institution runner ───────────────────────────────────────────────────────

async function runInstitution(institution) {
    logger.section(
        `${institution.displayName}  [${institution.slug}]  (${institution.country})`,
    );

    const results = {};

    for (const source of enabledSources) {
        logger.info(`Trying source: ${source.name}`);

        try {
            const count = await source.fn(institution, {
                onPaper: (p) => onPaper(p),
                limit: LIMIT,
            });
            results[source.name] = { ok: true, count };
            logger.success(`${source.name}: wrote ${count} papers`);
        } catch (err) {
            // Unhandled error from a source -- log and move on
            results[source.name] = { ok: false, error: err.message };
            logger.error(`${source.name}: uncaught error: ${err.message}`);
        }

        // Brief cooldown between sources
        await sleep(1500);
    }

    // Summary for this institution
    const total = Object.values(results).reduce(
        (s, r) => s + (r.count ?? 0),
        0,
    );
    const failed = Object.entries(results)
        .filter(([, r]) => !r.ok)
        .map(([n]) => n);

    logger.stat("Institution total", total, `papers (${institution.slug})`);
    if (failed.length) {
        logger.warn(
            `Failed sources for ${institution.slug}: ${failed.join(", ")}`,
        );
    }

    return total;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

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

    let grandTotal = 0;
    let succeeded = 0;
    let failedInsts = [];

    for (const institution of targets) {
        try {
            const count = await runInstitution(institution);
            grandTotal += count;
            succeeded++;
        } catch (err) {
            // Institution-level failure -- log and continue to the next
            logger.error(`Fatal error for ${institution.slug}: ${err.message}`);
            failedInsts.push(institution.slug);
        }

        // Cooldown between institutions to be polite to APIs
        if (targets.indexOf(institution) < targets.length - 1) {
            logger.info("Cooling down before next institution...");
            await sleep(3000);
        }
    }

    // ── Final summary ─────────────────────────────────────────────────────
    logger.section("Scrape Complete");
    logger.stat("Total papers written", grandTotal);
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
