const API_BASE = "http://localhost:3000/api";

export async function connectStore(name, storeHash, apiToken) {
  const response = await fetch(`${API_BASE}/connect`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, storeHash, apiToken }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to connect store");
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
