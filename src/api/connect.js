// src/api/connect.js
// Uses relative API base by default. If you need to override at runtime,
// set window.__API_BASE__ = 'https://your-api.example.com/api' before app loads.

const API_BASE =
  (typeof window !== "undefined" && window.__API_BASE__) || "/api";

export async function connectStore(name, storeHash, apiToken) {
  const response = await fetch(`${API_BASE}/connect`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, storeHash, apiToken }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || "Failed to connect store");
  }

  return await response.json();
}

export async function fetchStores() {
  const response = await fetch(`${API_BASE}/stores`);

  if (!response.ok) {
    throw new Error("Failed to fetch stores");
  }

  return await response.json();
}

export async function removeStore(storeId) {
  const response = await fetch(`${API_BASE}/stores/${storeId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || "Failed to remove store");
  }

  return await response.json();
}
