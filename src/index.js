import "./styles.css";
import { fetchOrders } from "./api/fetchOrders";
import { processOrders } from "./processing/processOrders";
import { renderOrders } from "./components/showOrders";

const app = document.getElementById("app") || document.createElement("div");
app.id = "app";
document.body.appendChild(app);

async function loadOrders(storeId) {
  try {
    const ordersData = await fetchOrders(storeId);
    const processed = processOrders(ordersData);
    renderOrders(app, processed, () => loadOrders(storeId));
  } catch (err) {
    app.innerHTML = `<p style="color:red;">Error loading orders: ${err.message}</p>`;
  }
}
loadOrders();
