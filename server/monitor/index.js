// server/monitor/index.js
const axios = require('axios');

const nodes = [
  { name: "Node-1", url: "http://localhost:3001/status" },
  { name: "Node-2", url: "http://localhost:3002/status" },
];

function logStatus(name, data) {
  console.log(`[${name}] Clients: ${data.clients} | Mem: ${data.memoryMB} MB | CPU: ${data.cpuLoad}`);
}

function logOffline(name) {
  console.warn(`[${name}] ❌ OFFLINE or UNRESPONSIVE`);
}

async function checkNodes() {
  for (const node of nodes) {
    try {
      const res = await axios.get(node.url, { timeout: 2000 });
      logStatus(node.name, res.data);
    } catch (err) {
      logOffline(node.name);
    }
  }
}

// Poll every 5 seconds
setInterval(checkNodes, 5000);

console.log("🔍 Monitor started. Watching nodes every 5 seconds...");
