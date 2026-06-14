const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
const Publication = require("../models/Publication");

const MONGO_URI = "mongodb://127.0.0.1:27017/opencanvas_test";
const TOTAL_PUBLICATIONS = 1_00_000;
const BATCH_SIZE = 10_000;
const POOL_SIZE = 1_000;

async function seedPublications() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to DB.");

        console.log("Generating static content pool...");
        const contentPool = Array.from({ length: POOL_SIZE }).map(() => {
            return {
                abstract: faker.lorem.paragraph(),
                pdfUrl: faker.internet.url(),
                externalUrl: faker.internet.url(),
                categories: faker.helpers.arrayElements(
                    [
                        "Physics",
                        "Computer Science",
                        "Mathematics",
                        "Biology",
                        "Quantum Computing",
                    ],
                    { min: 1, max: 3 },
                ),
                source: faker.helpers.arrayElement([
                    "arxiv",
                    "openalex",
                    "semantic_scholar",
                    "crossref",
                    "oai_pmh",
                    "web",
                ]),
                publishedAt: faker.date.past({ years: 5 }),
            };
        });

        let inserted = 0;
        const totalBatches = TOTAL_PUBLICATIONS / BATCH_SIZE;

        for (let i = 0; i < totalBatches; i++) {
            const batch = [];

            for (let j = 0; j < BATCH_SIZE; j++) {
                const base = contentPool[Math.floor(Math.random() * POOL_SIZE)];

                // Dynamic arrays and nested schemas per publication
                const authors = Array.from({
                    length: Math.floor(Math.random() * 3) + 1,
                }).map(() => ({
                    name: faker.person.fullName(),
                    affiliation: faker.company.name() + " University",
                }));

                // Unique dynamic fields to prevent unique constraint index violations
                const uniqueId = faker.string.alphanumeric(10);
                const arxivId =
                    base.source === "arxiv"
                        ? `arXiv:${faker.number.int({ min: 10, max: 99 })}${faker.number.int({ min: 10, max: 99 })}.${faker.number.int({ min: 1000, max: 9999 })}`
                        : undefined;
                const doi = `10.${faker.number.int({ min: 1000, max: 9999 })}/${uniqueId}`;

                batch.push({
                    ...base,
                    // Appending unique tokens to titles to ensure uniqueness if required by limits
                    title:
                        faker.lorem.sentence({ min: 4, max: 10 }) +
                        ` (${uniqueId})`,
                    institution: faker.company.name() + " Institute",
                    authors,
                    arxivId,
                    doi,
                    stats: {
                        viewsCount: Math.floor(Math.random() * 10000),
                        likesCount: Math.floor(Math.random() * 1000),
                        dislikesCount: Math.floor(Math.random() * 100),
                        savesCount: Math.floor(Math.random() * 500),
                        commentsCount: Math.floor(Math.random() * 50),
                    },
                    anonymousEngagementScore: Math.floor(Math.random() * 100),
                });
            }

            // ordered: false skips errors if a single document clashes, continuing the chunk
            await Publication.insertMany(batch, { ordered: false });
            inserted += BATCH_SIZE;
            console.log(`Inserted ${inserted} / ${TOTAL_PUBLICATIONS}`);
        }

        console.log("Seeding complete successfully.");
        process.exit(0);
    } catch (err) {
        console.error("Seeding failed:", err);
        process.exit(1);
    }
}

seedPublications();
