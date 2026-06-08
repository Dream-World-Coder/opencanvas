/**
 * backup.js  --  Export all Publications from MongoDB to a local JSON file.
 *
 * Usage:
 *   node backup.js                        # saves to ./backup_<timestamp>.json
 *   node backup.js -o my_backup.json      # custom output file
 *
 * Requires the same .env as the scraper (MONGODB_URI / MONGODB_URI_PROD).
 *
 * Restore later with:
 *   node backup.js --restore backup_2026-06-08T07-44-17.json
 */

import "dotenv/config";
import { parseArgs } from "node:util";
import { writeFileSync, readFileSync } from "node:fs";
import mongoose from "mongoose";

//  Schema (mirrors db.js)

const authorSchema = new mongoose.Schema(
    { name: String, affiliation: String },
    { _id: false },
);

const statsSchema = new mongoose.Schema(
    {
        viewsCount: { type: Number, default: 0 },
        likesCount: { type: Number, default: 0 },
        dislikesCount: { type: Number, default: 0 },
        savesCount: { type: Number, default: 0 },
        commentsCount: { type: Number, default: 0 },
    },
    { _id: false },
);

const publicationSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        abstract: { type: String, default: "" },
        pdfUrl: String,
        externalUrl: String,
        authors: [authorSchema],
        institution: { type: String, required: true },
        source: {
            type: String,
            enum: [
                "arxiv",
                "openalex",
                "semantic_scholar",
                "crossref",
                "oai_pmh",
                "web",
            ],
        },
        arxivId: { type: String, default: null },
        doi: { type: String, default: null },
        categories: [String],
        publishedAt: { type: Date },
        stats: { type: statsSchema, default: () => ({}) },
        anonymousEngagementScore: { type: Number, default: 0 },
    },
    { timestamps: true },
);

//  CLI

const { values: args } = parseArgs({
    options: {
        output: { type: "string", short: "o", default: "" },
        restore: { type: "string", short: "r", default: "" },
    },
    strict: false,
});

//  Helpers

function timestamp() {
    return new Date().toISOString().replace(/:/g, "-").slice(0, 19);
}

function log(msg) {
    console.log(`[backup] ${msg}`);
}
function ok(msg) {
    console.log(`[OK]     ${msg}`);
}
function err(msg) {
    console.error(`[ERR]    ${msg}`);
}

//  Connect

async function connect() {
    const uri = process.env.MONGODB_URI_PROD ?? process.env.MONGODB_URI;
    if (!uri) {
        err("MONGODB_URI is not set in environment");
        process.exit(1);
    }
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10_000 });
    ok(`Connected to MongoDB at ${mongoose.connection.host}`);
    return (
        mongoose.models.Publication ??
        mongoose.model("Publication", publicationSchema)
    );
}

//  BACKUP

async function runBackup(Publication) {
    const outFile = args.output || `backup_${timestamp()}.json`;

    log("Fetching all documents...");
    // .lean() returns plain JS objects instead of Mongoose docs -- faster & smaller
    const docs = await Publication.find({}).lean();

    if (docs.length === 0) {
        log("No documents found in the collection.");
    }

    const payload = {
        exportedAt: new Date().toISOString(),
        totalDocs: docs.length,
        collection: "publications",
        documents: docs,
    };

    writeFileSync(outFile, JSON.stringify(payload, null, 2), "utf8");

    ok(`Exported ${docs.length} documents → ${outFile}`);
    log(
        `File size: ${(Buffer.byteLength(JSON.stringify(payload)) / 1024).toFixed(1)} KB`,
    );

    // Print a quick breakdown by institution
    const byInstitution = {};
    for (const doc of docs) {
        byInstitution[doc.institution] =
            (byInstitution[doc.institution] ?? 0) + 1;
    }
    console.log("\n  Documents by institution:");
    for (const [inst, count] of Object.entries(byInstitution).sort(
        (a, b) => b[1] - a[1],
    )) {
        console.log(`    ${inst.padEnd(20)} ${count}`);
    }
    console.log("");
}

//  RESTORE

async function runRestore(Publication, filePath) {
    log(`Reading backup file: ${filePath}`);
    let payload;
    try {
        payload = JSON.parse(readFileSync(filePath, "utf8"));
    } catch (e) {
        err(`Failed to read/parse file: ${e.message}`);
        process.exit(1);
    }

    const docs = payload.documents ?? [];
    log(
        `Found ${docs.length} documents in backup (exported at ${payload.exportedAt})`,
    );

    let inserted = 0;
    let updated = 0;
    let failed = 0;

    for (const doc of docs) {
        try {
            let filter;
            if (doc.arxivId) {
                filter = { arxivId: doc.arxivId };
            } else if (doc.doi) {
                filter = { doi: doc.doi };
            } else {
                filter = { title: doc.title, institution: doc.institution };
            }

            // 1. Validate and safely parse the createdAt date
            let validCreatedAt = new Date(doc.createdAt);
            if (isNaN(validCreatedAt.valueOf())) {
                log(
                    `Skipping invalid createdAt in backup for ${doc._id}. Falling back to ObjectId timestamp.`,
                );
                validCreatedAt = new mongoose.Types.ObjectId(
                    doc._id,
                ).getTimestamp();
            }

            let validUpdatedAt = new Date(doc.updatedAt);
            if (isNaN(validUpdatedAt.valueOf()))
                validUpdatedAt = validCreatedAt;

            // 2. Destructure to remove old fields
            const { createdAt, updatedAt, __v, ...fields } = doc;

            // 3. Explicitly set the validated timestamps
            const result = await Publication.updateOne(
                filter,
                {
                    $setOnInsert: {
                        ...fields,
                        createdAt: validCreatedAt,
                        updatedAt: validUpdatedAt,
                    },
                },
                { upsert: true, timestamps: false },
            );

            if (result.upsertedCount > 0) inserted++;
            else updated++;
        } catch (e) {
            err(`Failed to restore "${doc.title?.slice(0, 60)}": ${e.message}`);
            failed++;
        }
    }

    ok(
        `Restore complete: ${inserted} inserted, ${updated} already existed, ${failed} failed`,
    );
}

//  Main

async function main() {
    const Publication = await connect();

    if (args.restore) {
        await runRestore(Publication, args.restore);
    } else {
        await runBackup(Publication);
    }

    await mongoose.disconnect();
    log("Disconnected.");
}

main().catch((e) => {
    err(`Unhandled error: ${e.message}`);
    console.error(e.stack);
    process.exit(1);
});
