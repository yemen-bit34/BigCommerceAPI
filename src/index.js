import "whatwg-fetch";
import "./styles.css";
import { connectStore, fetchStores } from "./api/connect";
import { fetchOrders } from "./api/fetchOrders";
import { approveOrder, approveAllOrders } from "./api/approveOrders";
import { processOrders } from "./processing/processOrders";
import { renderOrders } from "./components/showOrders";
import { renderStoreSelector } from "./components/storeSelector";

const app = document.getElementById("app") || document.createElement("div");
app.id = "app";
document.body.appendChild(app);

let currentStoreId = null;

// Main initialization
async function init() {
  try {
    const stores = await fetchStores();

    if (stores.length === 0) {
      renderConnectForm();
    } else {
      renderStoreSelector(app, stores, (storeId) => {
        currentStoreId = storeId;
        loadOrders(storeId);
      });
    }
  } catch (err) {
    app.innerHTML = `<p style="color:red;">Error initializing app: ${err.message}</p>`;
  }
}

// Render connection form
function renderConnectForm() {
  app.innerHTML = `
    <div style="max-width: 500px; margin: 50px auto; padding: 20px; border: 1px solid #ccc; border-radius: 8px;">
      <h2>Connect BigCommerce Store</h2>
      <form id="connect-form">
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px;">Store Name:</label>
          <input type="text" id="store-name" placeholder="My Store" required style="width: 100%; padding: 8px;" />
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px;">Store Hash:</label>
          <input type="text" id="store-hash" placeholder="abc123xyz" required style="width: 100%; padding: 8px;" />
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px;">API Token:</label>
          <input type="password" id="api-token" placeholder="Your API token" required style="width: 100%; padding: 8px;" />
        </div>
        <button type="submit" style="width: 100%; padding: 10px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Connect Store</button>
      </form>
      <p id="error-msg" style="color: red; margin-top: 10px;"></p>
    </div>
  `;

  document
    .getElementById("connect-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("store-name").value;
      const storeHash = document.getElementById("store-hash").value;
      const apiToken = document.getElementById("api-token").value;

      try {
        const result = await connectStore(name, storeHash, apiToken);
        currentStoreId = result.storeId;
        loadOrders(result.storeId);
      } catch (err) {
        document.getElementById(
          "error-msg"
        ).textContent = `Error: ${err.message}`;
      }
    });
}

// Load orders for a store
async function loadOrders(storeId) {
  try {
    app.innerHTML = "<p>Loading orders...</p>";
    const ordersData = await fetchOrders(storeId);
    const processed = processOrders(ordersData);

    renderOrders(app, processed, {
      onReload: () => loadOrders(storeId),
      onApprove: async (orderId) => {
        try {
          await approveOrder(storeId, orderId);
          loadOrders(storeId); // Refresh after approval
        } catch (err) {
          alert(`Failed to approve order: ${err.message}`);
        }
      },
      onApproveAll: async (orderIds) => {
        try {
          const results = await approveAllOrders(storeId, orderIds);
          alert(
            `Approved: ${results.success.length}, Failed: ${results.failed.length}`
          );
          loadOrders(storeId); // Refresh after bulk approval
        } catch (err) {
          alert(`Failed to approve all orders: ${err.message}`);
        }
      },
      onBackToStores: () => init(),
    });
  } catch (err) {
    app.innerHTML = `<p style="color:red;">Error loading orders: ${err.message}</p>`;
  }
}

init();
