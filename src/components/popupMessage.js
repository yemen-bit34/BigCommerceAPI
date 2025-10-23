/**
 * Creates and manages popup messages with confirmation dialogs
 * @param {string} message - The message to display
 * @param {string} type - Type of popup: 'info', 'warning', 'error', 'confirm'
 * @param {Object} options - Additional options
 * @param {Function} options.onConfirm - Callback for confirm button
 * @param {Function} options.onCancel - Callback for cancel button
 * @param {string} options.confirmText - Text for confirm button (default: 'OK')
 * @param {string} options.cancelText - Text for cancel button (default: 'Cancel')
 * @returns {Function} - Teardown function to remove the popup
 */
export function showPopup(message, type = "info", options = {}) {
  const {
    onConfirm,
    onCancel,
    confirmText = "OK",
    cancelText = "Cancel",
  } = options;

  // Create overlay
  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
    animation: fadeIn 0.3s ease-out;
  `;

  // Create popup container
  const popup = document.createElement("div");
  popup.style.cssText = `
    background: white;
    border-radius: 8px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    max-width: 400px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    animation: slideIn 0.3s ease-out;
  `;

  // Create header
  const header = document.createElement("div");
  header.style.cssText = `
    padding: 20px 20px 10px 20px;
    border-bottom: 1px solid #eee;
  `;

  const title = document.createElement("h3");
  title.style.cssText = `
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #333;
  `;

  // Set title and color based on type
  switch (type) {
    case "warning":
      title.textContent = "⚠️ Warning";
      title.style.color = "#f39c12";
      break;
    case "error":
      title.textContent = "❌ Error";
      title.style.color = "#e74c3c";
      break;
    case "confirm":
      title.textContent = "❓ Confirm";
      title.style.color = "#3498db";
      break;
    default:
      title.textContent = "ℹ️ Information";
      title.style.color = "#2c3e50";
  }

  header.appendChild(title);

  // Create body
  const body = document.createElement("div");
  body.style.cssText = `
    padding: 20px;
    line-height: 1.5;
    color: #555;
  `;
  body.textContent = message;

  // Create footer with buttons
  const footer = document.createElement("div");
  footer.style.cssText = `
    padding: 10px 20px 20px 20px;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  `;

  // Create cancel button (for confirm type or when onCancel is provided)
  let cancelBtn = null;
  if (type === "confirm" || onCancel) {
    cancelBtn = document.createElement("button");
    cancelBtn.textContent = cancelText;
    cancelBtn.style.cssText = `
      padding: 8px 16px;
      border: 1px solid #ddd;
      background: white;
      color: #666;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    `;

    cancelBtn.addEventListener("mouseenter", () => {
      cancelBtn.style.background = "#f8f9fa";
    });

    cancelBtn.addEventListener("mouseleave", () => {
      cancelBtn.style.background = "white";
    });

    cancelBtn.addEventListener("click", () => {
      if (onCancel) onCancel();
      teardown();
    });

    footer.appendChild(cancelBtn);
  }

  // Create confirm button
  const confirmBtn = document.createElement("button");
  confirmBtn.textContent = confirmText;
  confirmBtn.style.cssText = `
    padding: 8px 16px;
    border: none;
    background: #007bff;
    color: white;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;
  `;

  confirmBtn.addEventListener("mouseenter", () => {
    confirmBtn.style.background = "#0056b3";
  });

  confirmBtn.addEventListener("mouseleave", () => {
    confirmBtn.style.background = "#007bff";
  });

  confirmBtn.addEventListener("click", () => {
    if (onConfirm) onConfirm();
    teardown();
  });

  footer.appendChild(confirmBtn);

  // Assemble popup
  popup.appendChild(header);
  popup.appendChild(body);
  popup.appendChild(footer);

  overlay.appendChild(popup);
  document.body.appendChild(overlay);

  // Add CSS animations
  const style = document.createElement("style");
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideIn {
      from { 
        opacity: 0;
        transform: translateY(-20px) scale(0.95);
      }
      to { 
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
  `;
  document.head.appendChild(style);

  // Handle escape key
  const handleEscape = (e) => {
    if (e.key === "Escape") {
      if (onCancel) onCancel();
      teardown();
    }
  };
  document.addEventListener("keydown", handleEscape);

  // Handle overlay click
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      if (onCancel) onCancel();
      teardown();
    }
  });

  // Focus the confirm button
  confirmBtn.focus();

  // Teardown function
  function teardown() {
    try {
      document.removeEventListener("keydown", handleEscape);
      if (document.body.contains(overlay)) {
        document.body.removeChild(overlay);
      }
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    } catch (err) {
      // Ignore cleanup errors
    }
  }

  return teardown;
}

/**
 * Convenience function for confirmation dialogs
 * @param {string} message - The message to display
 * @param {Function} onConfirm - Callback for confirm
 * @param {Function} onCancel - Callback for cancel (optional)
 * @returns {Function} - Teardown function
 */
export function showConfirm(message, onConfirm, onCancel) {
  return showPopup(message, "confirm", {
    onConfirm,
    onCancel,
    confirmText: "Yes",
    cancelText: "No",
  });
}

/**
 * Convenience function for error messages
 * @param {string} message - The error message
 * @param {Function} onClose - Callback when closed (optional)
 * @returns {Function} - Teardown function
 */
export function showError(message, onClose) {
  return showPopup(message, "error", {
    onConfirm: onClose,
    confirmText: "OK",
  });
}

/**
 * Convenience function for info messages
 * @param {string} message - The info message
 * @param {Function} onClose - Callback when closed (optional)
 * @returns {Function} - Teardown function
 */
export function showInfo(message, onClose) {
  return showPopup(message, "info", {
    onConfirm: onClose,
    confirmText: "OK",
  });
}
