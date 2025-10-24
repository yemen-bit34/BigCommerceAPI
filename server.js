/**
 * server.js
 * Production-ready Express backend for BigCommerce API proxy + small persistence
 *
 * - Reads PORT from process.env.PORT (default 3000)
 * - Adds basic request logging, Helmet CSP, CORS
 * - Graceful shutdown and error handlers
 * - Persists connected stores to ./stores.json (simple file-backed store)
 * - Routes:
 *    POST   /api/connect                      -> connect a store (storeHash, apiToken, name)
 *    GET    /api/stores                       -> list stores
 *    DELETE /api/stores/:storeId              -> remove a store
 *    GET    /api/stores/:storeId/orders       -> fetch orders from BigCommerce
 *    PUT    /api/stores/:storeId/orders/:orderId/approve -> approve single order
 *    POST   /api/stores/:storeId/orders/approve-all     -> approve many orders
 *    GET    /health                           -> health check
 */

const fs = require("fs");
const path = require("path");
const express = require("express");
const fetch = require("node-fetch").default;
const helmet = require("helmet");
const morgan = require("morgan");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "stores.json");

let stores = {};

// Simple file-backed persistence
function loadStores() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf8");
      stores = JSON.parse(raw) || {};
      console.log(
        `Loaded ${Object.keys(stores).length} store(s) from stores.json`
      );
    }
  } catch (err) {
    console.error("Failed to load stores.json:", err);
    stores = {};
  }
}

function saveStores() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(stores, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to write stores.json:", err);
  }
}

// Load existing stores at startup
loadStores();

// Middleware
app.use(morgan("combined")); // request logging
app.use(express.json());

// Security headers via helmet with a reasonable CSP for this app
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.bigcommerce.com"],
      imgSrc: ["'self'", "data:"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // adjust if you remove inline scripts
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  })
);

// CORS: If you plan to serve frontend from different origin, adjust accordingly.
// For now allow same-origin + simple cross-origin requests if needed.
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", process.env.CORS_ORIGIN || "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// Health endpoint for load balancers / uptime checks
app.get("/health", (req, res) =>
  res.json({ status: "ok", timestamp: Date.now() })
);

// Root route
app.get("/", (req, res) => {
  res.send("Backend API running");
});

// 1️⃣ Connect a new store
// Expects body: { storeHash, apiToken, name? }
app.post("/api/connect", (req, res) => {
  const { storeHash, apiToken, name } = req.body;
  if (!storeHash || !apiToken) {
    return res.status(400).json({ error: "Missing storeHash or apiToken" });
  }

  const storeId = Date.now().toString(); // simple unique id
  stores[storeId] = { storeHash, apiToken, name: name || `Store ${storeId}` };
  saveStores();

  console.log(`✅ Store connected: ${stores[storeId].name} (ID: ${storeId})`);
  res.json({ success: true, storeId, name: stores[storeId].name });
});

// 2️⃣ List stores
app.get("/api/stores", (req, res) => {
  const list = Object.entries(stores).map(([id, s]) => ({
    id,
    name: s.name,
  }));
  res.json(list);
});

// 3️⃣ Delete a store connection
app.delete("/api/stores/:storeId", (req, res) => {
  const { storeId } = req.params;
  if (!stores[storeId])
    return res.status(404).json({ error: "Store not found" });

  console.log(`🗑️ Deleting store ${storeId} (${stores[storeId].name})`);
  delete stores[storeId];
  saveStores();
  res.json({ success: true });
});

// Helper: get store or 404
function getStoreOr404(storeId, res) {
  const store = stores[storeId];
  if (!store) {
    res.status(404).json({ error: "Unknown store" });
    return null;
  }
  return store;
}

// 4️⃣ Fetch orders for a specific store
app.get("/api/stores/:storeId/orders", async (req, res) => {
  const { storeId } = req.params;
  const store = getStoreOr404(storeId, res);
  if (!store) return;

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
      const details = await response.text();
      console.error(
        "BigCommerce orders fetch failed:",
        response.status,
        details
      );
      return res
        .status(response.status)
        .json({ error: "Failed to fetch orders", details });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ error: "Internal error fetching orders" });
  }
});

// 5️⃣ Approve a single order (set status_id: 11 -> Completed)
app.put("/api/stores/:storeId/orders/:orderId/approve", async (req, res) => {
  const { storeId, orderId } = req.params;
  const store = getStoreOr404(storeId, res);
  if (!store) return;

  const url = `https://api.bigcommerce.com/stores/${store.storeHash}/v2/orders/${orderId}`;
  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "X-Auth-Token": store.apiToken,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ status_id: 11 }), // Completed
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(
        `Failed to approve order ${orderId}:`,
        response.status,
        text
      );
      return res
        .status(response.status)
        .json({ error: "Failed to approve order", details: text });
    }

    const updated = await response.json();
    res.json({ success: true, order: updated });
  } catch (err) {
    console.error("Error approving order:", err);
    res.status(500).json({ error: "Internal error approving order" });
  }
});

// 6️⃣ Bulk approve orders
app.post("/api/stores/:storeId/orders/approve-all", async (req, res) => {
  const { storeId } = req.params;
  const { orderIds } = req.body; // expect array
  const store = getStoreOr404(storeId, res);
  if (!store) return;

  if (!Array.isArray(orderIds) || orderIds.length === 0) {
    return res
      .status(400)
      .json({ error: "orderIds must be a non-empty array" });
  }

  const results = { success: [], failed: [] };

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
          body: JSON.stringify({ status_id: 11 }),
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

// Start server and expose graceful shutdown
const server = app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});

// Basic process-level handlers
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

function shutdown() {
  console.log("Shutting down server...");
  server.close(() => {
    console.log("HTTP server closed.");
    process.exit(0);
  });
  // Fallback force exit
  setTimeout(() => process.exit(1), 10000).unref();
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

// Export (useful for tests)
module.exports = { app, server };
