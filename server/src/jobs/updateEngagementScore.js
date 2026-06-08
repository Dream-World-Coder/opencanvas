const Post = require("../models/Post");
const Publication = require("../models/Publication");

const WEIGHTS = {
    views: 0.5,
    readCompletion: 2.5,
    shares: 4,
    likes: 2,
    dislikes: 1.5,
    randomBoost: 1,
    decay: 1.37,
};

function getAgeInHours(createdAt) {
    const now = Date.now();
    const msPerHour = 1000 * 60 * 60;
    return (now - new Date(createdAt).getTime()) / msPerHour;
}

async function processModelScores(Model, modelName) {
    // Guard: catch the export bug early with a clear message
    if (typeof Model?.find !== "function") {
        throw new Error(
            `${modelName} is not a valid Mongoose model. ` +
                `Check that its file exports the model directly (module.exports = ${modelName}), ` +
                `not as a named property (module.exports = { ${modelName} }).`,
        );
    }

    console.log(`Starting engagement score update for ${modelName}...`);

    const BATCH_SIZE = 1000;
    let bulkOps = [];
    let updatedCount = 0;
    let skippedCount = 0;

    const cursor = Model.find({}).select("_id stats createdAt").lean().cursor();

    for await (const doc of cursor) {
        try {
            const age = getAgeInHours(doc.createdAt);

            // Guard: skip documents with missing/corrupt createdAt
            if (!doc.createdAt || isNaN(age)) {
                console.warn(
                    `Skipping doc ${doc._id} (${modelName}): invalid createdAt`,
                );
                skippedCount++;
                continue;
            }

            const s = doc.stats ?? {};
            const reads = s.readsCount ?? 0;
            const sharesOrSaves = s.sharesCount ?? s.savesCount ?? 0;

            const rawScore =
                (s.viewsCount ?? 0) * WEIGHTS.views +
                reads * WEIGHTS.readCompletion +
                sharesOrSaves * WEIGHTS.shares +
                (s.likesCount ?? 0) * WEIGHTS.likes +
                Math.random() * WEIGHTS.randomBoost - // fixed: actually random now
                (s.dislikesCount ?? 0) * WEIGHTS.dislikes;

            const score = Math.max(
                0,
                rawScore / Math.pow(age + 2, WEIGHTS.decay),
            ); // clamp to 0

            bulkOps.push({
                updateOne: {
                    filter: { _id: doc._id },
                    update: { $set: { anonymousEngagementScore: score } },
                },
            });

            if (bulkOps.length >= BATCH_SIZE) {
                await Model.bulkWrite(bulkOps, { ordered: false });
                updatedCount += bulkOps.length;
                bulkOps = [];
            }
        } catch (docErr) {
            // One bad document shouldn't crash the whole job
            console.warn(
                `Skipping doc ${doc._id} (${modelName}):`,
                docErr.message,
            );
            skippedCount++;
        }
    }

    if (bulkOps.length > 0) {
        await Model.bulkWrite(bulkOps, { ordered: false });
        updatedCount += bulkOps.length;
    }

    console.log(
        `Done. Updated ${updatedCount} ${modelName} documents.` +
            (skippedCount > 0 ? ` Skipped ${skippedCount}.` : ""),
    );
}

async function updateDefaultEngagementScore() {
    // Run concurrently — they're fully independent
    await Promise.all([
        processModelScores(Post, "Post"),
        processModelScores(Publication, "Publication"),
    ]);
}

if (require.main === module) {
    const mongoose = require("mongoose");
    require("dotenv").config();

    mongoose
        .connect(process.env.MONGODB_URI_PROD)
        .then(() => updateDefaultEngagementScore())
        .then(async () => {
            await mongoose.disconnect(); // clean shutdown
            process.exit(0);
        })
        .catch((err) => {
            console.error("Migration failed:", err);
            process.exit(1);
        });
}

module.exports = updateDefaultEngagementScore;
