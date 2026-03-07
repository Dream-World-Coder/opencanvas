const autocannon = require("autocannon");

const mode = process.argv[2] || "simple";

const target = "http://localhost:3000/articles"; // feed data
// const target = "http://localhost:3000/"; // basic small json

const isStressed = mode === "stressed";
const connections = isStressed ? 500 : 100;
const pipelining = isStressed ? 10 : 1;

console.log(`Running ${mode.toUpperCase()} benchmark on: ${target}`);
console.log(`Connections: ${connections} | Pipelining: ${pipelining}\n`);

const instance = autocannon(
  {
    url: target,
    connections,
    pipelining,
    duration: 10,
  },
  (err, result) => {
    if (err) {
      console.error("Benchmark failed:", err);
    } else {
      console.log(`\nRequests per second: ${result.requests.average}`);
      console.log(`Average Latency: ${result.latency.average}ms`);
    }
  },
);

autocannon.track(instance, { renderProgressBar: true });
