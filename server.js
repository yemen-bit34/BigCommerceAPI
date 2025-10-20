const express = require("express");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
require("dotenv").config();

const app = express();
const PORT = 3000;
const stores = {}; // store connected shops in memory

// CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.use(express.json());

// 1️⃣ Connect store
app.post("/api/connect", (req, res) => {
  const { storeHash, apiToken, name } = req.body;
  if (!storeHash || !apiToken)
    return res.status(400).json({ error: "Missing storeHash or apiToken" });

  const storeId = Date.now().toString();
  stores[storeId] = { storeHash, apiToken, name: name || `Store ${storeId}` };
  res.json({ success: true, storeId, name: stores[storeId].name });
});

// 2️⃣ List stores
app.get("/api/stores", (req, res) => {
  const list = Object.entries(stores).map(([id, s]) => ({
    storeId: id,
    name: s.name,
  }));
  res.json(list);
});

// 3️⃣ Fetch orders for a specific store
app.get("/api/:storeId/orders", async (req, res) => {
  const { storeId } = req.params;
  const store = stores[storeId];
  if (!store) return res.status(404).json({ error: "Unknown store" });

  const url = `https://api.bigcommerce.com/stores/${store.storeHash}/v2/orders`;

  try {
    const response = await fetch(url, {
      headers: {
        "X-Auth-Token": store.apiToken,
        Accept: "application/json",
      },
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Backend error", details: err.message });
  }
});

// 4️⃣ Delete a store connection
app.delete("/api/stores/:storeId", (req, res) => {
  const { storeId } = req.params;
  delete stores[storeId];
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
