const express = require("express");
const fetch = require("node-fetch").default;
// import fetch from "node-fetch";

const app = express();
const PORT = 3000;
const stores = {}; // store connected shops in memory

// CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
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
  console.log(`✅ Store connected: ${stores[storeId].name} (ID: ${storeId})`);
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
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ BigCommerce API Error: ${response.status}`, errorText);
      return res.status(response.status).json({
        error: "BigCommerce API error",
        details: errorText,
      });
    }

    const data = await response.json();
    console.log(`✅ Fetched ${data.length} orders from store ${storeId}`);
    res.json(data);
  } catch (err) {
    console.error("❌ Backend error:", err);
    res.status(500).json({ error: "Backend error", details: err.message });
  }
});

// 4️⃣ Approve single order (update status to "Completed")
app.put("/api/:storeId/orders/:orderId/approve", async (req, res) => {
  const { storeId, orderId } = req.params;
  const store = stores[storeId];

  if (!store) return res.status(404).json({ error: "Unknown store" });

  const url = `https://api.bigcommerce.com/stores/${store.storeHash}/v2/orders/${orderId}`;

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "X-Auth-Token": store.apiToken,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ status_id: 11 }), // 11 = Completed
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Failed to approve order ${orderId}:`, errorText);
      return res.status(response.status).json({
        error: "Failed to approve order",
        details: errorText,
      });
    }

    const data = await response.json();
    console.log(`✅ Order ${orderId} approved successfully`);
    res.json({ success: true, order: data });
  } catch (err) {
    console.error("❌ Backend error:", err);
    res.status(500).json({ error: "Backend error", details: err.message });
  }
});

// 5️⃣ Bulk approve orders
app.post("/api/:storeId/orders/approve-all", async (req, res) => {
  const { storeId } = req.params;
  const { orderIds } = req.body; // array of order IDs
  const store = stores[storeId];

  if (!store) return res.status(404).json({ error: "Unknown store" });
  if (!Array.isArray(orderIds) || orderIds.length === 0) {
    return res
      .status(400)
      .json({ error: "orderIds must be a non-empty array" });
  }

  const results = { success: [], failed: [] };

  // Process all orders in parallel
  await Promise.all(
    orderIds.map(async (orderId) => {
      const url = `https://api.bigcommerce.com/stores/${store.storeHash}/v2/orders/${orderId}`;
      try {
        const response = await fetch(url, {
          method: "PUT",
          headers: {
            "X-Auth-Token": store.apiToken,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ status_id: 11 }), // 11 = Completed
        });

        if (response.ok) {
          results.success.push(orderId);
        } else {
          const errorText = await response.text();
          results.failed.push({ orderId, error: errorText });
        }
      } catch (err) {
        results.failed.push({ orderId, error: err.message });
      }
    })
  );

  console.log(
    `✅ Bulk approval: ${results.success.length} succeeded, ${results.failed.length} failed`
  );
  res.json(results);
});

// 6️⃣ Delete a store connection
app.delete("/api/stores/:storeId", (req, res) => {
  const { storeId } = req.params;
  delete stores[storeId];
  console.log(`🗑️ Store ${storeId} deleted`);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
