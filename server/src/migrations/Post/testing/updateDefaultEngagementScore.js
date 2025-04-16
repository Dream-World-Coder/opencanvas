const mongoose = require("mongoose");
const Post = require("../../models/Post");

const WEIGHTS = {
    shares: 4,
    readCompletion: 2.5,
    likes: 2,
    randomBoost: 1,
    views: 0.5,
    decay: 1.37,
    dislikes: 1.5,
};

function getTimeSinceCreation(createdAt) {
    const createdTime = new Date(createdAt).getTime(); // timestamp in ms
    const currentTime = Date.now(); // current timestamp in ms
    const timeDifference = currentTime - createdTime; // in ms
    const daysSinceCreation = timeDifference / (1000 * 60 * 60 * 24); // convert to days
    return daysSinceCreation;
}

function getT(createdAt, modifiedAt) {
    return (
        (getTimeSinceCreation(createdAt) + getTimeSinceCreation(modifiedAt)) / 2
    );
}

async function updateDefaultEngagementScore() {
    try {
        await mongoose.connect(
            process.env.MONGODB_URI || "mongodb://localhost:27017/opencanvas",
        );
        console.log("Connected to MongoDB");

        const posts = await Post.find({});
        console.log(`Found ${posts.length} posts to update`);

        for (const post of posts) {
            const T = getT(post.createdAt, post.modifiedAt);
            const calculatedEngagementScore =
                ((post.totalViews || 0) * WEIGHTS["views"] +
                    (post.totalCompleteReads || 0) * WEIGHTS["readCompletion"] +
                    (post.totalShares || 0) * WEIGHTS["shares"] +
                    (post.totalLikes || 0) * WEIGHTS["likes"] +
                    WEIGHTS["randomBoost"] -
                    (post.totalDislikes || 0) * WEIGHTS["dislikes"]) /
                Math.pow(T + 2, WEIGHTS["decay"]);

            post.anonymousEngageMentScore = calculatedEngagementScore;
            await post.save();
        }

        console.log(
            "anonymousEngageMentScore updated successfully for all posts.",
        );
    } catch (error) {
        console.error("Error during migration:", error);
        throw error;
    } finally {
        await mongoose.connection.close();
        console.log("Database connection closed");
    }
}

updateDefaultEngagementScore().catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
});

module.exports = updateDefaultEngagementScore;

/*
const mongoose = require("mongoose");
const Post = require("../../models/Post");

const WEIGHTS = {
    shares: 4,
    readCompletion: 2.5,
    likes: 2,
    randomBoost: 1,
    views: 0.5,
    decay: 1.37,
    dislikes: 1.5,
};

async function updateDefaultEngagementScore() {
    try {
        await mongoose.connect(
            process.env.MONGODB_URI || "mongodb://localhost:27017/opencanvas",
            { useNewUrlParser: true, useUnifiedTopology: true }
        );
        console.log("Connected to MongoDB");

        const result = await Post.updateMany(
            {},
            [
                {
                    $set: {
                        anonymousEngageMentScore: {
                            $divide: [
                                {
                                    $add: [
                                        { $multiply: [{ $ifNull: ["$totalViews", 0] }, WEIGHTS["views"]] },
                                        { $multiply: [{ $ifNull: ["$totalCompleteReads", 0] }, WEIGHTS["readCompletion"]] },
                                        { $multiply: [{ $ifNull: ["$totalShares", 0] }, WEIGHTS["shares"]] },
                                        { $multiply: [{ $ifNull: ["$totalLikes", 0] }, WEIGHTS["likes"]] },
                                        WEIGHTS["randomBoost"],
                                        { $multiply: [{ $ifNull: ["$totalDislikes", 0] }, -WEIGHTS["dislikes"]] }
                                    ]
                                },
                                {
                                    $pow: [
                                        { $add: [
                                            { $divide: [
                                                { $subtract: [new Date(), "$createdAt"] },
                                                1000 * 60 * 60 * 24
                                            ] },
                                            { $divide: [
                                                { $subtract: [new Date(), "$modifiedAt"] },
                                                1000 * 60 * 60 * 24
                                            ] }
                                        ] }, // Average days
                                        WEIGHTS["decay"]
                                    ]
                                }
                            ]
                        }
                    }
                }
            ]
        );

        console.log(`Updated ${result.modifiedCount} posts successfully!`);
    } catch (error) {
        console.error("Error during migration:", error);
        throw error;
    } finally {
        await mongoose.connection.close();
        console.log("Database connection closed");
    }
}

updateDefaultEngagementScore().catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
});
*/
