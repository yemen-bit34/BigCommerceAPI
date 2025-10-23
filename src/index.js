import "whatwg-fetch";
import "./styles.css";
import { connectStore, fetchStores, removeStore } from "./api/connect";
import { fetchOrders } from "./api/fetchOrders";
import { approveOrder, approveAllOrders } from "./api/approveOrders";
import { processOrders } from "./processing/processOrders";
import { renderOrders } from "./components/showOrders";
import { renderStoreSelector } from "./components/storeSelector";
import { showError, showInfo, showConfirm } from "./components/popupMessage";

const app = document.getElementById("app") || document.createElement("div");
app.id = "app";
document.body.appendChild(app);

let currentStoreId = null;
let currentTeardown = null; // if a component returns a teardown, store it

// Main initialization
async function init() {
  try {
    const stores = await fetchStores();

    // Defensive: ensure stores is an array
    if (!Array.isArray(stores) || stores.length === 0) {
      renderConnectForm();
      return;
    }

    // If a previous component returned a teardown, call it to clean up listeners/dom
    if (typeof currentTeardown === "function") {
      try {
        currentTeardown();
      } catch (err) {
        // ignore
      }
      currentTeardown = null;
    }

    // Render store selector and pass renderConnectForm as onAddStore so button shows connect form
    const maybeTeardown = renderStoreSelector(
      app,
      stores,
      (storeId) => {
        currentStoreId = storeId;
        loadOrders(storeId);
      },
      {
        onAddStore: renderConnectForm,
        onRemoveStore: async (storeId) => {
          try {
            await removeStore(storeId);
            // Refresh the store list after removal
            init();
          } catch (err) {
            showError(
              `Failed to remove store: ${
                err && err.message ? err.message : String(err)
              }`
            );
          }
        },
      }
    );

    // If the selector returned a teardown function, keep it
    if (typeof maybeTeardown === "function") {
      currentTeardown = maybeTeardown;
    }
  } catch (err) {
    app.innerHTML = `<p style="color:red;">Error initializing app: ${
      err && err.message ? err.message : String(err)
    }</p>`;
  }
}

// Render connection form
function renderConnectForm() {
  // cleanup previous component if it provided teardown
  if (typeof currentTeardown === "function") {
    try {
      currentTeardown();
    } catch (err) {
      // ignore
    }
    currentTeardown = null;
  }

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
        <button type="submit" id="connect-store-btn" style="width: 100%; padding: 10px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Connect Store</button>
      </form>
      <p id="error-msg" style="color: red; margin-top: 10px;"></p>
    </div>
  `;

  const form = document.getElementById("connect-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = (document.getElementById("store-name") || {}).value || "";
    const storeHash = (document.getElementById("store-hash") || {}).value || "";
    const apiToken = (document.getElementById("api-token") || {}).value || "";

    try {
      const result = await connectStore(name, storeHash, apiToken);
      // Expect result to contain storeId
      currentStoreId = result && result.storeId ? result.storeId : null;
      if (!currentStoreId) {
        throw new Error("No storeId returned from connectStore");
      }
      loadOrders(currentStoreId);
    } catch (err) {
      const msgEl = document.getElementById("error-msg");
      if (msgEl)
        msgEl.textContent = `Error: ${
          err && err.message ? err.message : String(err)
        }`;
    }
  });
}

// Load orders for a store
async function loadOrders(storeId) {
  try {
    app.innerHTML = "<p>Loading orders...</p>";
    const ordersData = await fetchOrders(storeId);
    const processed = processOrders(ordersData);

    // If a previous component returned a teardown, call it now
    if (typeof currentTeardown === "function") {
      try {
        currentTeardown();
      } catch (err) {
        // ignore
      }
      currentTeardown = null;
    }

    const teardown = renderOrders(app, processed, {
      onReload: () => loadOrders(storeId),
      onApprove: async (orderId) => {
        try {
          await approveOrder(storeId, orderId);
          loadOrders(storeId); // Refresh after approval
        } catch (err) {
          showError(
            `Failed to approve order: ${
              err && err.message ? err.message : String(err)
            }`
          );
        }
      },
      onApproveAll: async (orderIds) => {
        try {
          const results = await approveAllOrders(storeId, orderIds);
          showInfo(
            `Approved: ${results.success.length}, Failed: ${results.failed.length}`
          );
          loadOrders(storeId); // Refresh after bulk approval
        } catch (err) {
          showError(
            `Failed to approve all orders: ${
              err && err.message ? err.message : String(err)
            }`
          );
        }
      },
      onBackToStores: () => init(),
    });

    if (typeof teardown === "function") {
      currentTeardown = teardown;
    }
  } catch (err) {
    app.innerHTML = `<p style="color:red;">Error loading orders: ${
      err && err.message ? err.status : String(err)
    }</p>`;
  }
}

init();
