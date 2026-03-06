const autocannon = require("autocannon");

const mode = process.argv[2] || "simple";
const target = "http://localhost:3000/";

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

// const autocannon = require("autocannon");

// const env = process.argv[2] || "local";
// const target =
//   env === "prod"
//     ? "https://opencanvas.onrender.com/articles"
//     : "http://localhost:3000/articles";

// console.log(`Running benchmark on: ${target}`);

// const instance = autocannon(
//   // easy:
//   // connections: 100
//   // pipelining: 1
//   // stressed:
//   // connections: 500
//   // pipelining: 10
//   {
//     url: target,
//     connections: 100,
//     pipelining: 1,
//     duration: 10,
//   },
//   (err, result) => {
//     if (err) {
//       console.error("Benchmark failed:", err);
//     } else {
//       console.log(`\nRequests per second: ${result.requests.average}`);
//       console.log(`Average Latency: ${result.latency.average}ms`);
//     }
//   },
// );

// autocannon.track(instance, { renderProgressBar: true });
