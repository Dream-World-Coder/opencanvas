const autocannon = require("autocannon");

const env = process.argv[2] || "local";
const target =
  env === "prod"
    ? "https://opencanvas.onrender.com/articles"
    : "http://localhost:3000/articles";

console.log(`Running benchmark on: ${target}`);

const instance = autocannon(
  // easy:
  // connections: 100
  // pipelining: 1
  // stressed:
  // connections: 500
  // pipelining: 10
  {
    url: target,
    connections: 500,
    pipelining: 10,
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
