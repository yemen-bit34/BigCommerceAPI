// src/api/approveOrders.js
const API_BASE =
  (typeof window !== "undefined" && window.__API_BASE__) || "/api";

async function parseErrorResponse(response) {
  try {
    // Try JSON first
    const payload = await response.json();
    return (
      payload || { status: response.status, text: JSON.stringify(payload) }
    );
  } catch {
    // Fallback to text
    const text = await response.text().catch(() => "");
    return { status: response.status, text };
  }
}

export async function approveOrder(storeId, orderId) {
  const url = `${API_BASE}/stores/${storeId}/orders/${orderId}/approve`;

  try {
    const response = await fetch(url, {
      method: "PUT",
    });

    if (!response.ok) {
      const details = await parseErrorResponse(response);

      if (response.status === 403) {
        // Make the error message actionable
        throw new Error(
          `403 Forbidden: The API token used for this store does not have the required permissions to modify orders. ` +
            `Please create or update the API account in your BigCommerce Control Panel and grant "Orders (Modify)" scope, then reconnect the store. ` +
            `Details: ${JSON.stringify(details)}`
        );
      }

      throw new Error(
        (details &&
          (details.error || details.text || JSON.stringify(details))) ||
          `Failed to approve order (status ${response.status})`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Approve order error:", error);
    throw error;
  }
}

export async function approveAllOrders(storeId, orderIds) {
  const url = `${API_BASE}/stores/${storeId}/orders/approve-all`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderIds }),
    });

    if (!response.ok) {
      const details = await parseErrorResponse(response);

      if (response.status === 403) {
        throw new Error(
          `403 Forbidden: The API token used for this store does not have the required permissions to modify orders. ` +
            `Grant "Orders (Modify)" scope in BigCommerce and reconnect. Details: ${JSON.stringify(
              details
            )}`
        );
      }

      throw new Error(
        (details &&
          (details.error || details.text || JSON.stringify(details))) ||
          "Failed to approve orders"
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Approve all orders error:", error);
    throw error;
  }
}
