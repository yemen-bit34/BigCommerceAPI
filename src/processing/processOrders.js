export function processOrders(orders) {
  if (!Array.isArray(orders)) throw new Error("Invalid orders data");

  return orders.map((order) => {
    const billing = order.billing_address || {};

    return {
      id: order.id,
      status: order.status,
      total: parseFloat(order.total_inc_tax) || 0,
      date: new Date(order.date_created).toLocaleDateString(),
      customer: {
        name: `${billing.first_name || ""} ${billing.last_name || ""}`.trim(),
        email: billing.email || "",
      },
    };
  });
}
