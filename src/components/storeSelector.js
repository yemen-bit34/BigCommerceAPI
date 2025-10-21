export function renderStoreSelector(app, stores, onSelectStore) {
  app.innerHTML = `
      <div style="max-width: 600px; margin: 50px auto; padding: 20px;">
        <h2>Select a Store</h2>
        <ul style="list-style: none; padding: 0;">
          ${stores
            .map(
              (store) => `
            <li style="padding: 15px; border: 1px solid #ddd; margin-bottom: 10px; border-radius: 4px; cursor: pointer; transition: background 0.2s;" 
                data-store-id="${store.storeId}">
              <strong>${store.name}</strong>
              <br/>
              <small>Store ID: ${store.storeId}</small>
            </li>
          `
            )
            .join("")}
        </ul>
        <button id="add-store-btn" style="margin-top: 20px; padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Add Another Store
        </button>
      </div>
    `;

  // Handle store selection
  app.querySelectorAll("li[data-store-id]").forEach((li) => {
    li.addEventListener("click", () => {
      const storeId = li.getAttribute("data-store-id");
      onSelectStore(storeId);
    });

    li.addEventListener("mouseenter", (e) => {
      e.target.style.background = "#f0f0f0";
    });

    li.addEventListener("mouseleave", (e) => {
      e.target.style.background = "white";
    });
  });

  // Handle add store button
  document.getElementById("add-store-btn").addEventListener("click", () => {
    location.reload(); // Simple reload to show connect form
  });
}
