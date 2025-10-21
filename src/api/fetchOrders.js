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
const API_BASE = "http://localhost:3000/api";

export async function fetchOrders(storeId) {
  const url = `${API_BASE}/${storeId}/orders`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const error = await response.json();
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
