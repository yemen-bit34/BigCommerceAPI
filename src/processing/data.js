// Defensive data processor for BigCommerce Orders
export function processData(data) {
  // Validate data structure
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("Invalid data format. Please reload the page...");
  }

  //Safe string helper
  const safeString = (val) => (typeof val === "string" ? val.trim() : "");

  //Map and validate each order
  return data
    .map((item, index) => {
      try {
        if (typeof item.id !== "number") throw new Error("Invalid order ID");
        if (typeof item.status !== "string") throw new Error("Missing status");
        if (!item.billing_address || typeof item.billing_address !== "object")
          throw new Error("Missing billing address");

        const billing = item.billing_address;

        return {
          id: item.id,
          date_created: safeString(item.date_created),
          status: safeString(item.status),
          total: parseFloat(item.total_inc_tax) || 0,
          payment_status: safeString(item.payment_status),
          items_total: item.items_total ?? 0,
          customer: {
            name: `${safeString(billing.first_name)} ${safeString(
              billing.last_name
            )}`.trim(),
            email: safeString(billing.email),
            phone: safeString(billing.phone),
            city: safeString(billing.city),
            country: safeString(billing.country),
          },
        };
      } catch (err) {
        console.warn(
          ` Skipped invalid order at index ${index}: ${err.message}`
        );
        return null;
      }
    })
    .filter(Boolean);
}
