const express = require("express");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
require("dotenv").config({ path: "./APIs.env" });

const app = express();
const PORT = 3000;

// ✅ Enable CORS for your frontend
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.use(express.json());

// Route to proxy orders request
app.get("/api/orders", async (req, res) => {
  try {
    const url = `${process.env.BIGCOMMERCE_API_PATH}/orders`;

    console.log("Fetching from:", url); // Debug log

    const response = await fetch(url, {
      headers: {
        "X-Auth-Token": process.env.BIGCOMMERCE_ACCESS_TOKEN,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("BigCommerce API Error:", response.status, errorText);
      return res.status(response.status).json({
        error: `BigCommerce API error: ${response.status}`,
        details: errorText,
      });
    }

    const data = await response.json();
    console.log("Orders fetched successfully:", data.length || "N/A");
    res.json(data);
  } catch (error) {
    console.error("Backend proxy error:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});
app.get("/api/products", async (req, res) => {
  try {
    const url = `${process.env.BIGCOMMERCE_PRODUCTS_API_PATH}/catalog/products`;
    const response = await fetch(url, {
      headers: {
        "X-Auth-Token": process.env.BIGCOMMERCE_ACCESS_TOKEN,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: errText });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Internal Server Error", details: err.message });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`✅ Backend proxy server running at http://localhost:${PORT}`);
  console.log(`✅ Environment variables loaded:`, {
    hasToken: !!process.env.BIGCOMMERCE_ACCESS_TOKEN,
    hasPath: !!process.env.BIGCOMMERCE_API_PATH,
  });
});
