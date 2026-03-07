/**
 * index.js :: cluster manager
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

  // forking one worker per cpu core
  for (let i = 0; i < NUM_WORKERS; i++) {
    cluster.fork();
  }

  // in case a worker crashes -> log && replace it
  cluster.on("exit", (worker, code, signal) => {
    console.error(
      `Worker ${worker.process.pid} died (code: ${code}, signal: ${signal}). Restarting...`,
    );
    cluster.fork();
  });

  cluster.on("online", (worker) => {
    console.log(`Worker ${worker.process.pid} is online`);
  });

  // only in main process
  cron.schedule("*/15 * * * *", () => {
    console.log("[Primary] Running scheduled engagement score update...");
    updateEngagementScore().catch((err) => {
      console.error("[Primary] Scheduled task failed:", err);
    });
  });
} else {
  // workers just run the express aap
  require("./server");
}
