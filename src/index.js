import "./styles.css";
import { fetchOrders } from "./api/fetchOrders";
import { fetchProducts } from "./api/fetchProducts";
import { processOrders } from "./processing/processOrders";
import { renderOrders } from "./components/showOrders";

const app = document.createElement("div");
app.id = "app";
document.body.appendChild(app);

async function loadOrders() {
  try {
    const [ordersData, productsData] = await Promise.all([
      fetchOrders(),
      fetchProducts(),
    ]);

    const processed = processOrders(ordersData, productsData);
    renderOrders(app, processed, loadOrders); // pass reload callback
  } catch (err) {
    app.innerHTML = `<p style="color:red;">Error loading orders: ${err.message}</p>`;
  }
}

// ✅ Load automatically on startup
loadOrders();
