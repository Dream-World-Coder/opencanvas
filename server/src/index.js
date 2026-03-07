/**
 * index.js — Cluster manager
 *
 * Forks one worker per CPU core. Each worker runs the full Express app
 * independently, so all cores handle requests in parallel.
 *
 * Why this helps under stress:
 *   Node is single-threaded. Without clustering, one core does all the work
 *   while the rest of your CPU sits idle. With clustering, 4 cores = ~4x
 *   capacity for CPU-bound work (JSON serialisation, gzip, JS execution).
 *   MongoDB I/O is async either way, so that stays non-blocking.
 *
 * Cron job:
 *   Only the primary process runs the cron. Workers only serve HTTP.
 *   This prevents updateEngagementScore() from firing N times in parallel.
 *
 * In-memory cache (cacheService.js):
 *   Each worker has its own cache copy — they don't share memory.
 *   This is fine. Each worker independently caches /articles responses.
 *   The only downside is a cache miss on one worker doesn't benefit others.
 *   For a shared cache you'd need Redis, which is overkill for now.
 */

const cluster = require("cluster");
const os = require("os");
const cron = require("node-cron");
const updateEngagementScore = require("./jobs/updateEngagementScore");
require("dotenv").config();

const NUM_WORKERS = os.cpus().length;

if (cluster.isPrimary) {
  console.log(`Primary process ${process.pid} started`);
  console.log(`Forking ${NUM_WORKERS} workers (one per CPU core)...`);

  // Fork one worker per CPU core
  for (let i = 0; i < NUM_WORKERS; i++) {
    cluster.fork();
  }

  // If a worker crashes, log it and immediately replace it
  cluster.on("exit", (worker, code, signal) => {
    console.error(
      `Worker ${worker.process.pid} died (code: ${code}, signal: ${signal}). Restarting...`,
    );
    cluster.fork();
  });

  cluster.on("online", (worker) => {
    console.log(`Worker ${worker.process.pid} is online`);
  });

  // ::::: Cron runs ONLY in the primary process :::::
  // Workers don't run this — avoids N parallel writes to MongoDB every 15 min.
  cron.schedule("*/15 * * * *", () => {
    console.log("[Primary] Running scheduled engagement score update...");
    updateEngagementScore().catch((err) => {
      console.error("[Primary] Scheduled task failed:", err);
    });
  });
} else {
  // Workers just run the Express app — no cron, no cluster logic
  require("./server");
}
