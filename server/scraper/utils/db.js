import mongoose from "mongoose";
import { logger } from "./logger.js";

// Mirrors server/src/models/Publication.js

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
        institution: { type: String, required: true, index: true },
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
        publishedAt: { type: Date, index: true },
        stats: { type: statsSchema, default: () => ({}) },
        anonymousEngagementScore: { type: Number, default: 0, index: true },
    },
    { timestamps: true },
);

// Dedup indexes -- sparse so null values don't conflict
publicationSchema.index({ arxivId: 1 }, { unique: true, sparse: true });
publicationSchema.index({ doi: 1 }, { unique: true, sparse: true });
// Fallback dedup for papers with neither arxivId nor doi
publicationSchema.index({ title: 1, institution: 1 });

// Model singleton

let Publication = null;

export async function connectDb() {
    const uri = process.env.MONGODB_URI_PROD ?? process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI is not set in environment");

    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10_000 });
    Publication =
        mongoose.models.Publication ??
        mongoose.model("Publication", publicationSchema);
    logger.success(`MongoDB connected (${mongoose.connection.host})`);
}

export async function disconnectDb() {
    await mongoose.disconnect();
    logger.info("MongoDB disconnected");
}

/**
 * Upsert a normalized publication into MongoDB.
 * Dedup priority: arxivId > doi > title+institution.
 * Stats and engagementScore are never overwritten on existing docs.
 *
 * Returns { isNew: boolean }
 */
export async function upsertPublication(data) {
    if (!Publication)
        throw new Error("DB not connected -- call connectDb() first");

    // Build the best available dedup filter
    let filter;
    if (data.arxivId) {
        filter = { arxivId: data.arxivId };
    } else if (data.doi) {
        filter = { doi: data.doi };
    } else {
        // Weak dedup: title + institution. Normalise title for comparison.
        filter = {
            title: data.title,
            institution: data.institution,
        };
    }

    // Separate fields that should only be set on insert vs always updated
    const { stats, anonymousEngagementScore, ...upsertFields } = data;

    const update = {
        // Always refresh metadata in case the source updated it
        $set: upsertFields,
        // Only set stats / score when creating a new document
        $setOnInsert: {
            stats: {
                viewsCount: 0,
                likesCount: 0,
                dislikesCount: 0,
                savesCount: 0,
                commentsCount: 0,
            },
            anonymousEngagementScore: 0,
        },
    };

    // We need to know if it was inserted or updated -- use updateOne + check
    const result = await Publication.updateOne(filter, update, {
        upsert: true,
        setDefaultsOnInsert: true,
    });

    return { isNew: result.upsertedCount > 0 };
}
