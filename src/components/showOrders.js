import { showConfirm } from "./popupMessage";

export function renderOrders(app, orders, callbacks) {
  const { onReload, onApprove, onApproveAll, onBackToStores } = callbacks;

  app.innerHTML = "";

  // Header
  const header = document.createElement("div");
  header.style.cssText =
    "display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;";
  header.innerHTML = `
    <h1 style="margin: 0;">BigCommerce Orders (${orders.length})</h1>
    <button id="back-btn" style="padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">
      ← Back to Stores
    </button>
  `;
  app.appendChild(header);

  document.getElementById("back-btn").addEventListener("click", onBackToStores);

  // Action buttons
  const actionBar = document.createElement("div");
  actionBar.style.marginBottom = "15px";

  const reloadBtn = document.createElement("button");
  reloadBtn.textContent = "🔄 Reload Orders";
  reloadBtn.style.cssText =
    "padding: 10px 20px; margin-right: 10px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;";
  reloadBtn.onclick = onReload;

  const approveAllBtn = document.createElement("button");
  approveAllBtn.textContent = "✅ Approve All Orders";
  approveAllBtn.style.cssText =
    "padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;";

  actionBar.appendChild(reloadBtn);
  actionBar.appendChild(approveAllBtn);
  app.appendChild(actionBar);

  // No orders message
  if (!orders.length) {
    const msg = document.createElement("p");
    msg.textContent = "No orders available.";
    app.appendChild(msg);
    return;
  }

  // Create table
  const table = document.createElement("table");
  table.style.cssText = "width: 100%; border-collapse: collapse;";
  table.innerHTML = `
    <thead>
      <tr style="background: #f8f9fa;">
        <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6;">Order ID</th>
        <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6;">Customer</th>
        <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6;">Total</th>
        <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6;">Status</th>
        <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6;">Date</th>
        <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6;">Action</th>
      </tr>
    </thead>
    <tbody>
    </tbody>
  `;

  const tbody = table.querySelector("tbody");

  // Populate orders
  orders.forEach((order) => {
    const row = document.createElement("tr");
    row.style.cssText = "border-bottom: 1px solid #dee2e6;";
    row.innerHTML = `
      <td style="padding: 12px;">#${order.id}</td>
      <td style="padding: 12px;">
        <strong>${order.customer.name || "Guest"}</strong><br/>
        <small>${order.customer.email || "N/A"}</small>
      </td>
      <td style="padding: 12px;"><strong>$${order.total.toFixed(
        2
      )}</strong></td>
      <td style="padding: 12px;">
        <span style="padding: 4px 8px; background: ${getStatusColor(
          order.status
        )}; color: white; border-radius: 3px; font-size: 12px;">
          ${order.status}
        </span>
      </td>
      <td style="padding: 12px;">${order.date}</td>
      <td style="padding: 12px;">
        <button class="approve-btn" data-id="${
          order.id
        }" style="padding: 6px 12px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Approve
        </button>
      </td>
    `;
    tbody.appendChild(row);
  });

  app.appendChild(table);

  // Approve single order
  app.querySelectorAll(".approve-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const orderId = btn.getAttribute("data-id");
      btn.disabled = true;
      btn.textContent = "Approving...";

      try {
        await onApprove(orderId);
      } catch (err) {
        btn.disabled = false;
        btn.textContent = "Approve";
      }
    });
  });

  // Approve all orders
  approveAllBtn.addEventListener("click", async () => {
    showConfirm(
      `Are you sure you want to approve all ${orders.length} orders?`,
      async () => {
        approveAllBtn.disabled = true;
        approveAllBtn.textContent = "Approving...";

        const orderIds = orders.map((o) => o.id);

        try {
          await onApproveAll(orderIds);
        } catch (err) {
          approveAllBtn.disabled = false;
          approveAllBtn.textContent = "✅ Approve All Orders";
        }
      }
    );
  });
}

function getStatusColor(status) {
  const colors = {
    Pending: "#ffc107",
    "Awaiting Payment": "#fd7e14",
    "Awaiting Fulfillment": "#17a2b8",
    "Awaiting Shipment": "#6f42c1",
    Completed: "#28a745",
    Shipped: "#20c997",
    Cancelled: "#dc3545",
    Declined: "#dc3545",
    Refunded: "#6c757d",
  };
  return colors[status] || "#6c757d";
}
