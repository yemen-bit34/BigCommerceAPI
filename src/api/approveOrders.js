const API_BASE = "http://localhost:3000/api";

export async function approveOrder(storeId, orderId) {
  const url = `${API_BASE}/${storeId}/orders/${orderId}/approve`;

  try {
    const response = await fetch(url, {
      method: "PUT",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || "Failed to approve order");
    }

    return await response.json();
  } catch (error) {
    console.error("Approve order error:", error);
    throw error;
  }
}

export async function approveAllOrders(storeId, orderIds) {
  const url = `${API_BASE}/${storeId}/orders/approve-all`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderIds }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to approve orders");
    }

    return await response.json();
  } catch (error) {
    console.error("Approve all orders error:", error);
    throw error;
  }
}
