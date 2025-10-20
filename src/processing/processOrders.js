export function processOrders(orders, products = []) {
  if (!Array.isArray(orders)) throw new Error("Invalid orders data");

  if (products && products.data) {
    products = products.data;
  }

  return orders.map((order) => {
    const billing = order.billing_address || {};
    const items = Array.isArray(order.products) ? order.products : []; // ✅ Fix here

    const enrichedItems = items.map((it) => {
      const product = products.find((p) => p.id === it.product_id);
      return {
        name: it.name,
        quantity: it.quantity,
        image:
          product && product.primary_image
            ? product.primary_image.url_standard
            : "",
      };
    });

    return {
      id: order.id,
      status: order.status,
      total: parseFloat(order.total_inc_tax) || 0,
      date: new Date(order.date_created).toLocaleDateString(),
      customer: {
        name: `${billing.first_name || ""} ${billing.last_name || ""}`.trim(),
        email: billing.email || "",
      },
      products: enrichedItems,
    };
  });
}
