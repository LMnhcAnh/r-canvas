const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 4000;

app.use(cors()); // Allow cross-origin from frontend

let nodes = [
  { name: "Node-1", url: "http://localhost:3001", clients: 0, alive: true },
  { name: "Node-2", url: "http://localhost:3002", clients: 0, alive: true },
  { name: "Node-3", url: "http://localhost:3003", clients: 0, alive: true },
];

// 🧠 Periodically update status for each node
async function pollNodeStatus() {
  for (let node of nodes) {
    try {
      const res = await axios.get(`${node.url}/status`, { timeout: 2000 });
      node.clients = res.data.clients;
      node.alive = true;
    } catch (err) {
      node.clients = Infinity;
      node.alive = false;
      console.warn(`[WARN] ${node.name} is unreachable`);
    }
  }
}

// 🔁 Run every 5 seconds
setInterval(pollNodeStatus, 5000);

// 📡 Endpoint: Recommend best node
app.get('/get-node', async (req, res) => {
  await pollNodeStatus();

  const aliveNodes = nodes.filter(n => n.alive);
  if (aliveNodes.length === 0) {
    return res.status(503).json({ error: "No available nodes" });
  }

  const best = aliveNodes.reduce((a, b) => (a.clients < b.clients ? a : b));
  console.log(`[BALANCER] Assigned client to ${best.name}`);
  res.json({ url: best.url, name: best.name, clients: best.clients });
});

// 🧪 Debug route (optional)
app.get('/status', (req, res) => {
  res.json(nodes.map(n => ({
    name: n.name,
    clients: n.clients,
    alive: n.alive
  })));
});

app.listen(PORT, () => {
  console.log(`⚖️  Load Balancer running at http://localhost:${PORT}`);
});
