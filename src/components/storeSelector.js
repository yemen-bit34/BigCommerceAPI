export function renderStoreSelector(
  app,
  stores = [],
  onSelectStore,
  { onAddStore, onRemoveStore } = {}
) {
  if (!app || !(app instanceof HTMLElement)) {
    throw new TypeError("renderStoreSelector: 'app' must be a DOM element");
  }

  // Create container
  const container = document.createElement("div");
  container.style.maxWidth = "600px";
  container.style.margin = "50px auto";
  container.style.padding = "20px";

  const title = document.createElement("h2");
  title.textContent = "Select a Store";
  container.appendChild(title);

  const list = document.createElement("ul");
  list.style.listStyle = "none";
  list.style.padding = "0";
  container.appendChild(list);

  // Build list items safely using DOM APIs (avoids innerHTML injection)
  function createListItem(store) {
    const li = document.createElement("li");
    li.dataset.storeId = String(store.storeId ?? "");
    li.style.padding = "15px";
    li.style.border = "1px solid #ddd";
    li.style.marginBottom = "10px";
    li.style.borderRadius = "4px";
    li.style.cursor = "pointer";
    li.style.transition = "background 0.2s";
    li.style.position = "relative";
    li.setAttribute("role", "button");
    li.tabIndex = 0;

    // Store info container
    const storeInfo = document.createElement("div");
    storeInfo.style.flex = "1";

    const strong = document.createElement("strong");
    strong.textContent = store.name ?? "";
    storeInfo.appendChild(strong);

    storeInfo.appendChild(document.createElement("br"));

    const small = document.createElement("small");
    small.textContent = `Store ID: ${store.storeId ?? ""}`;
    storeInfo.appendChild(small);

    // Remove button
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove";
    removeBtn.type = "button";
    removeBtn.style.position = "absolute";
    removeBtn.style.top = "10px";
    removeBtn.style.right = "10px";
    removeBtn.style.padding = "5px 10px";
    removeBtn.style.background = "#dc3545";
    removeBtn.style.color = "white";
    removeBtn.style.border = "none";
    removeBtn.style.borderRadius = "3px";
    removeBtn.style.cursor = "pointer";
    removeBtn.style.fontSize = "12px";
    removeBtn.dataset.storeId = String(store.storeId ?? "");

    // Create flex container for store info and remove button
    const flexContainer = document.createElement("div");
    flexContainer.style.display = "flex";
    flexContainer.style.alignItems = "flex-start";
    flexContainer.style.gap = "10px";
    flexContainer.appendChild(storeInfo);
    flexContainer.appendChild(removeBtn);

    li.appendChild(flexContainer);

    return li;
  }

  const fragment = document.createDocumentFragment();
  for (const store of stores) {
    fragment.appendChild(createListItem(store));
  }
  list.appendChild(fragment);

  // Add-store button
  const addBtn = document.createElement("button");
  addBtn.id = "add-store-btn";
  addBtn.type = "button"; // explicit to avoid accidental form submits
  addBtn.style.marginTop = "20px";
  addBtn.style.padding = "10px 20px";
  addBtn.style.background = "#28a745";
  addBtn.style.color = "white";
  addBtn.style.border = "none";
  addBtn.style.borderRadius = "4px";
  addBtn.style.cursor = "pointer";
  addBtn.textContent = "Add Another Store";
  container.appendChild(addBtn);

  // Swap app contents for this component
  app.innerHTML = "";
  app.appendChild(container);

  // Event handlers (delegated where appropriate)
  function handleClick(e) {
    // Check if the click was on a remove button
    if (e.target.tagName === "BUTTON" && e.target.textContent === "Remove") {
      e.stopPropagation();
      const storeId = e.target.dataset.storeId;
      if (typeof onRemoveStore === "function") onRemoveStore(storeId);
      return;
    }

    const li = e.target.closest("li[data-store-id]");
    if (!li || !list.contains(li)) return;
    const storeId = li.dataset.storeId;
    if (typeof onSelectStore === "function") onSelectStore(storeId);
  }

  function handleKeydown(e) {
    // Support Enter and Space to activate the list item
    if (e.key === "Enter" || e.key === " ") {
      const li = e.target.closest("li[data-store-id]");
      if (!li || !list.contains(li)) return;
      e.preventDefault();
      const storeId = li.dataset.storeId;
      if (typeof onSelectStore === "function") onSelectStore(storeId);
    }
  }

  function handleMouseOver(e) {
    const li = e.target.closest("li[data-store-id]");
    if (!li || !list.contains(li)) return;
    li.style.background = "#f0f0f0";
  }

  function handleMouseOut(e) {
    const li = e.target.closest("li[data-store-id]");
    if (!li || !list.contains(li)) return;
    li.style.background = "white";
  }

  list.addEventListener("click", handleClick);
  list.addEventListener("keydown", handleKeydown);
  list.addEventListener("mouseover", handleMouseOver);
  list.addEventListener("mouseout", handleMouseOut);

  // Add button behavior: call callback if provided, otherwise fallback to reload
  function handleAddClick(e) {
    if (typeof onAddStore === "function") {
      onAddStore(e);
    } else {
      // Backward-compatible fallback (not recommended for SPA behavior)
      location.reload();
    }
  }
  addBtn.addEventListener("click", handleAddClick);

  // Return a teardown function so callers can unmount this component and remove listeners
  return function teardown() {
    try {
      list.removeEventListener("click", handleClick);
      list.removeEventListener("keydown", handleKeydown);
      list.removeEventListener("mouseover", handleMouseOver);
      list.removeEventListener("mouseout", handleMouseOut);
      addBtn.removeEventListener("click", handleAddClick);
      if (app.contains(container)) app.removeChild(container);
    } catch (err) {
      // ignore teardown errors
      // (caller should ensure teardown only called once if necessary)
    }
  };
}
