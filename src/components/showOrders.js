export function renderOrders(app, orders, onReload) {
  app.innerHTML = "";

  const title = document.createElement("h1");
  title.textContent = "BigCommerce Orders";
  app.appendChild(title);

  // 🟦 Action buttons container
  const actionBar = document.createElement("div");
  actionBar.style.marginBottom = "15px";

  const reloadBtn = document.createElement("button");
  reloadBtn.textContent = "Reload Orders";
  reloadBtn.onclick = onReload;

  const approveAllBtn = document.createElement("button");
  approveAllBtn.textContent = "Approve All Orders";
  approveAllBtn.style.marginLeft = "10px";

  actionBar.appendChild(reloadBtn);
  actionBar.appendChild(approveAllBtn);
  app.appendChild(actionBar);

  // 🟦 If there are no orders
  if (!orders.length) {
    const msg = document.createElement("p");
    msg.textContent = "No orders available.";
    app.appendChild(msg);
    return;
  }

  // 🟦 Create table
  const table = document.createElement("table");
  table.style.width = "100%";

  const header = `
    <tr>
      <th>Order ID</th>
      <th>Customer</th>
      <th>Total</th>
      <th>Status</th>
      <th>Date</th>
      <th>Action</th>
    </tr>
  `;
  table.innerHTML = header;

  // 🟦 Populate orders
  orders.forEach((order) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${order.id}</td>
      <td>${order.customer.name}<br/>${order.customer.email}</td>
      <td>$${order.total.toFixed(2)}</td>
      <td>${order.status}</td>
      <td>${order.date}</td>
      <td><button class="approve-btn" data-id="${
        order.id
      }">Approve</button></td>
    `;
    table.appendChild(row);
  });

  app.appendChild(table);

  // 🟦 Approve single order
  app.querySelectorAll(".approve-btn").forEach((btn) => {
    btn.onclick = () => {
      const row = btn.closest("tr");
      row.remove();
      checkIfEmpty();
    };
  });

  // 🟦 Approve all
  approveAllBtn.onclick = () => {
    table.innerHTML = "";
    const msg = document.createElement("p");
    msg.textContent = "All orders approved!";
    app.appendChild(msg);
  };

  // 🟦 Helper to show message when all rows are gone
  function checkIfEmpty() {
    const rowsLeft = table.querySelectorAll("tr").length - 1; // exclude header
    if (rowsLeft === 0) {
      app.innerHTML = "<p>No orders available.</p>";
      app.appendChild(actionBar);
    }
  }
}
