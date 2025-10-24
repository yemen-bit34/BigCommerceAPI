// export const fetchAPI = async () => {
//   const url = `${process.env.BIGCOMMERCE_API_PATH}/orders`;
//   const headers = {
//     "X-Auth-Token": process.env.BIGCOMMERCE_ACCESS_TOKEN,
//     Accept: "application/json",
//     "Content-Type": "application/json",
//   };
//   try {
//     const response = await fetch(url, { headers });
//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }
//     return await response.json();
//   } catch (error) {
//     console.error("Fetch API Error: ", error);
//   }
// };
// Changed to call backend proxy server to avoid CORS
// src/api/fetchOrders.js
const API_BASE =
  (typeof window !== "undefined" && window.__API_BASE__) || "/api";

export async function fetchOrders(storeId) {
  const url = `${API_BASE}/stores/${storeId}/orders`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.details || `HTTP error! status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Fetch orders error:", error);
    throw error;
  }
}
