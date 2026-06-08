const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const authorSchema = new Schema(
    { name: String, affiliation: String },
    { _id: false },
);

const statsSchema = new Schema(
    {
        viewsCount: { type: Number, default: 0 },
        likesCount: { type: Number, default: 0 },
        dislikesCount: { type: Number, default: 0 },
        savesCount: { type: Number, default: 0 },
        commentsCount: { type: Number, default: 0 },
    },
    { _id: false },
);

const publicationSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        abstract: {
            type: String,
            default: "",
        },
        pdfUrl: String,
        externalUrl: String,
        authors: [authorSchema],
        institution: {
            type: String,
            required: true,
            index: true,
        },
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
        arxivId: {
            type: String,
            unique: true,
            sparse: true,
            index: true,
        },
        doi: {
            type: String,
            unique: true,
            sparse: true,
            index: true,
        },
        categories: [String],
        publishedAt: {
            type: Date,
            index: true,
        },
        stats: {
            type: statsSchema,
            default: () => ({}),
        },
        anonymousEngagementScore: {
            type: Number,
            default: 0,
            index: true,
        },
    },
    { timestamps: true }, // Replaces the static createdAt field
);

// Dedup indexes
publicationSchema.index({ title: 1, institution: 1 });

const Publication = mongoose.model("Publication", publicationSchema);
module.exports = Publication;
