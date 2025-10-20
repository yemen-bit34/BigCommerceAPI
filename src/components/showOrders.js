export function renderOrders(app, orders, onReload) {
  app.innerHTML = ""; // clear old content

  const title = document.createElement("h1");
  title.textContent = "BigCommerce Orders";
  app.appendChild(title);

  // If no orders at all
  if (!orders.length) {
    const msg = document.createElement("p");
    msg.textContent = "No orders available.";
    app.appendChild(msg);

    const reloadBtn = document.createElement("button");
    reloadBtn.textContent = "Reload Orders";
    reloadBtn.style.padding = "10px 20px";
    reloadBtn.style.cursor = "pointer";
    reloadBtn.onclick = onReload;
    app.appendChild(reloadBtn);
    return;
  }

  // Create Approve All button
  const approveAllBtn = document.createElement("button");
  approveAllBtn.textContent = "Approve All Orders";
  approveAllBtn.style.padding = "10px 20px";
  approveAllBtn.style.cursor = "pointer";
  approveAllBtn.style.marginBottom = "20px";
  app.appendChild(approveAllBtn);

  const table = document.createElement("table");
  table.style.width = "100%";
  table.style.borderCollapse = "collapse";
  table.style.marginTop = "10px";

  const header = `
    <tr style="background:#f2f2f2;">
      <th style="border:1px solid #ddd;padding:8px;">Order ID</th>
      <th style="border:1px solid #ddd;padding:8px;">Customer</th>
      <th style="border:1px solid #ddd;padding:8px;">Products</th>
      <th style="border:1px solid #ddd;padding:8px;">Total</th>
      <th style="border:1px solid #ddd;padding:8px;">Status</th>
      <th style="border:1px solid #ddd;padding:8px;">Date</th>
      <th style="border:1px solid #ddd;padding:8px;">Action</th>
    </tr>
  `;
  table.innerHTML = header;

  const tbody = document.createElement("tbody");
  table.appendChild(tbody);

  // Render each order
  orders.forEach((order) => {
    const row = document.createElement("tr");

    const productCells = order.products
      .map(
        (p) =>
          `<div style="margin-bottom:5px;">
             ${p.image ? `<img src="${p.image}" width="50"/> ` : ""}
             ${p.name} (x${p.quantity})
           </div>`
      )
      .join("");

    row.innerHTML = `
      <td style="border:1px solid #ddd;padding:8px;">${order.id}</td>
      <td style="border:1px solid #ddd;padding:8px;">${
        order.customer.name
      }<br/>${order.customer.email}</td>
      <td style="border:1px solid #ddd;padding:8px;">${productCells}</td>
      <td style="border:1px solid #ddd;padding:8px;">$${order.total.toFixed(
        2
      )}</td>
      <td style="border:1px solid #ddd;padding:8px;" class="status-cell">${
        order.status
      }</td>
      <td style="border:1px solid #ddd;padding:8px;">${order.date}</td>
      <td style="border:1px solid #ddd;padding:8px;"></td>
    `;

    const approveBtn = document.createElement("button");
    approveBtn.textContent = "Approve";
    approveBtn.style.padding = "6px 12px";
    approveBtn.style.cursor = "pointer";
    approveBtn.addEventListener("click", () => {
      order.status = "Approved";
      row.remove(); // remove from table

      // if all rows removed -> show reload
      if (tbody.children.length === 0) {
        app.innerHTML = "<p>No orders available.</p>";
        const reloadBtn = document.createElement("button");
        reloadBtn.textContent = "Reload Orders";
        reloadBtn.style.padding = "10px 20px";
        reloadBtn.style.cursor = "pointer";
        reloadBtn.onclick = onReload;
        app.appendChild(reloadBtn);
      }
    });

    row.lastElementChild.appendChild(approveBtn);
    tbody.appendChild(row);
  });

  app.appendChild(table);

  // Approve all button logic
  approveAllBtn.addEventListener("click", () => {
    tbody.innerHTML = ""; // clear all rows
    app.innerHTML = "<p>All orders approved!</p>";

    const reloadBtn = document.createElement("button");
    reloadBtn.textContent = "Reload Orders";
    reloadBtn.style.padding = "10px 20px";
    reloadBtn.style.cursor = "pointer";
    reloadBtn.onclick = onReload;
    app.appendChild(reloadBtn);
  });
}
