// server/scaler/index.js
const axios = require('axios');

const nodes = [
  { name: "Node-1", url: "http://localhost:3001/status" },
  { name: "Node-2", url: "http://localhost:3002/status" },
];

const CLIENT_THRESHOLD = 10;
const CPU_THRESHOLD = 1.5;

let nodeCount = 2;

function simulateSpawnNewNode() {
  nodeCount++;
  const port = 3000 + nodeCount;
  const name = `Node-${nodeCount}`;

  console.log(`🚀 [Auto-Scaler] Simulating spawn: ${name} (port ${port})`);

  // NOTE: In production you'd spawn real processes
  console.log(`👉 To manually spawn:`);
  console.log(`   $env:PORT=${port}; node server/collab-node/index.js`);
}

async function evaluateNodes() {
  for (const node of nodes) {
    try {
      const res = await axios.get(node.url);
      const { clients, cpuLoad } = res.data;

      console.log(`[${node.name}] Clients: ${clients}, CPU: ${cpuLoad}`);

      if (clients >= CLIENT_THRESHOLD || cpuLoad >= CPU_THRESHOLD) {
        simulateSpawnNewNode();
        break; // only simulate one at a time
      }
    } catch (err) {
      console.warn(`[${node.name}] Unreachable`);
    }
  }
}

// Check every 10s
setInterval(evaluateNodes, 10000);
console.log("🧠 Auto-Scaler running every 10 seconds...");
