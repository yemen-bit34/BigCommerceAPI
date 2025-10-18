import { fetchAPI } from "../api/bigCommerce";
import { processData } from "../processing/data";

export async function showOrders() {
  const app = document.createElement("div");
  app.id = "app";
  document.body.appendChild(app);

  const title = document.createElement("h1");
  title.textContent = "BigCommerce Orders";
  app.appendChild(title);

  const btn = document.createElement("button");
  btn.textContent = "Show Orders";
  btn.style.padding = "10px 20px";
  btn.style.cursor = "pointer";
  btn.style.marginBottom = "20px";
  app.appendChild(btn);

  const container = document.createElement("div");
  container.id = "orders-container";
  app.appendChild(container);

  // Only create one Approve All button
  const approveAllBtn = document.createElement("button");
  approveAllBtn.textContent = "Approve All Orders";
  approveAllBtn.style.padding = "10px 20px";
  approveAllBtn.style.cursor = "pointer";
  approveAllBtn.style.marginBottom = "20px";
  approveAllBtn.style.display = "none"; // hidden until orders load
  app.insertBefore(approveAllBtn, container);

  btn.addEventListener("click", async () => {
    container.innerHTML = "<p>Loading orders...</p>";

    try {
      const response = await fetchAPI();
      const orders = processData(response);

      if (!orders.length) {
        container.innerHTML = "<p>No orders found.</p>";
        approveAllBtn.style.display = "none";
        return;
      }

      const table = document.createElement("table");
      table.style.borderCollapse = "collapse";
      table.style.width = "100%";
      table.style.marginTop = "15px";

      const thead = document.createElement("thead");
      const headerRow = document.createElement("tr");
      ["Order ID", "Customer", "Total", "Status", "Date", "Action"].forEach(
        (header) => {
          const th = document.createElement("th");
          th.textContent = header;
          th.style.border = "1px solid #ddd";
          th.style.padding = "8px";
          th.style.backgroundColor = "#f2f2f2";
          headerRow.appendChild(th);
        }
      );
      thead.appendChild(headerRow);
      table.appendChild(thead);

      const tbody = document.createElement("tbody");
      orders.forEach((order) => {
        const row = document.createElement("tr");

        // Table cells
        const cells = [
          order.id,
          order.customer.name,
          `$${order.total.toFixed(2)}`,
          order.status,
          new Date(order.date_created).toLocaleDateString(),
        ];

        cells.forEach((val) => {
          const td = document.createElement("td");
          td.textContent = val;
          td.style.border = "1px solid #ddd";
          td.style.padding = "8px";
          row.appendChild(td);
        });

        // Add approve button
        const actionTd = document.createElement("td");
        const approveBtn = document.createElement("button");
        approveBtn.textContent = "Approve";
        approveBtn.style.padding = "6px 12px";
        approveBtn.style.cursor = "pointer";

        approveBtn.addEventListener("click", () => {
          console.log(`Approving order ID: ${order.id}`);
          // Simulate approving the order
          order.status = "Approved";
          row.cells[3].textContent = order.status;
          approveBtn.disabled = true;
        });

        actionTd.appendChild(approveBtn);
        row.appendChild(actionTd);
        tbody.appendChild(row);
      });

      table.appendChild(tbody);
      container.innerHTML = "";
      container.appendChild(table);
      approveAllBtn.style.display = "inline-block";

      // Approve all button logic
      approveAllBtn.onclick = () => {
        orders.forEach((order, index) => {
          order.status = "Approved";
          tbody.rows[index].cells[3].textContent = "Approved";
          const approveBtn = tbody.rows[index].cells[5].querySelector("button");
          if (approveBtn) approveBtn.disabled = true;
        });
        console.log("All orders approved!");
      };
    } catch (err) {
      console.error("Error loading orders:", err);
      container.innerHTML = `<p style="color:red;">Failed to load orders: ${err.message}</p>`;
      approveAllBtn.style.display = "none";
    }
  });
}
