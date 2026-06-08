import mongoose from "mongoose";
import "dotenv/config";
import { connectDb, disconnectDb } from "./scraper/utils/db.js";
import { logger } from "./scraper/utils/logger.js";

async function main() {
    try {
        await connectDb();
        logger.info("Scanning for invalid createdAt fields...");

        const Publication = mongoose.model("Publication");

        // Use native MongoDB driver to bypass Mongoose schema casting errors
        const docs = await Publication.collection.find({}).toArray();
        let fixedCount = 0;

        for (const doc of docs) {
            // Check if createdAt is missing, not a Date object, or an invalid Date
            const isInvalidDate =
                !doc.createdAt ||
                !(doc.createdAt instanceof Date) ||
                isNaN(doc.createdAt.valueOf());

            if (isInvalidDate) {
                logger.info(`Fixing doc ${doc._id}: invalid createdAt`);

                // Fallback to the timestamp embedded in the MongoDB ObjectId
                const accurateDate = doc._id.getTimestamp();

                await Publication.collection.updateOne(
                    { _id: doc._id },
                    {
                        $set: {
                            createdAt: accurateDate,
                            updatedAt: accurateDate,
                        },
                    },
                );
                fixedCount++;
            }
        }

        logger.info(`Execution finished. Fixed ${fixedCount} documents.`);
    } catch (error) {
        logger.error("Fatal error:", error);
        process.exitCode = 1;
    } finally {
        await disconnectDb();
        process.exit();
    }
}

main();
