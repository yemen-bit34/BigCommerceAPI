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
export const fetchOrders = async () => {
  const url = "http://localhost:3000/api/orders"; // proxy route to backend server
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Fetch API Error: ", error);
    throw error; // rethrow for calling code
  }
};
