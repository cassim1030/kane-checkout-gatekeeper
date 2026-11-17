// Checkout Gatekeeper — tiny static shop, no build step, no backend.
// Cart math lives here so it can be tested from Node as well as the browser.

const PRODUCTS = [
  { id: "tote", name: "Kane Tote Bag", price: 19.99 },
  { id: "mug", name: "Gatekeeper Mug", price: 29.99 },
  { id: "notebook", name: "Ship-It Notebook", price: 9.99 },
];

let cart = {}; // product id -> quantity
let guestEmail = "";

function money(n) {
  return "$" + n.toFixed(2);
}

function productById(id) {
  return PRODUCTS.find((p) => p.id === id);
}

function addToCart(id) {
  if (!productById(id)) return false;
  cart[id] = (cart[id] || 0) + 1;
  return true;
}

function clearCart() {
  cart = {};
}

function getCart() {
  return Object.entries(cart).map(([id, qty]) => ({
    product: productById(id),
    qty,
    lineTotal: productById(id).price * qty,
  }));
}

function calculateCartTotal() {
  return getCart().reduce((sum, line) => sum + line.lineTotal, 0);
}

// Fixed 2026-11-17: Kane CLI caught the v1 bug in its first real run
// (review total $29.98 vs cart total $39.98; verdict "Review charge total
// omits Ship-It Notebook", confidence 0.98). The review total now matches
// the cart total. See BUG.md for the original bug and the run evidence.
function getReviewTotal() {
  return calculateCartTotal();
}

// --- Browser UI (skipped when loaded from Node for testing) ---
if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    const productsEl = document.getElementById("products");
    PRODUCTS.forEach((p) => {
      const div = document.createElement("div");
      div.className = "product";
      div.innerHTML =
        `<h3>${p.name}</h3>` +
        `<p class="price">${money(p.price)}</p>` +
        `<button type="button" data-product="${p.id}">Add to cart</button>`;
      productsEl.appendChild(div);
    });
    productsEl.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-product]");
      if (!btn) return;
      addToCart(btn.getAttribute("data-product"));
      renderCart();
    });

    document.getElementById("clear-cart").addEventListener("click", () => {
      clearCart();
      renderCart();
    });
    document.getElementById("go-checkout").addEventListener("click", () => {
      if (getCart().length === 0) {
        alert("Your cart is empty. Add a product first.");
        return;
      }
      document.getElementById("checkout-total").textContent = money(calculateCartTotal());
      showStep("step-checkout");
    });
    document.getElementById("back-to-shop").addEventListener("click", () => showStep("step-shop"));
    document.getElementById("back-to-checkout").addEventListener("click", () => showStep("step-checkout"));

    document.getElementById("checkout-form").addEventListener("submit", (e) => {
      e.preventDefault();
      guestEmail = document.getElementById("email").value.trim();
      document.getElementById("review-email").textContent = guestEmail;
      document.getElementById("review-cart-total").textContent = money(calculateCartTotal());
      document.getElementById("review-total").textContent = money(getReviewTotal());
      const reviewItems = document.getElementById("review-items");
      reviewItems.innerHTML = "";
      getCart().forEach((line) => {
        const li = document.createElement("li");
        li.textContent = `${line.product.name} x ${line.qty} — ${money(line.lineTotal)}`;
        reviewItems.appendChild(li);
      });
      showStep("step-review");
    });

    document.getElementById("place-order").addEventListener("click", () => {
      const orderNumber = "ORD-" + Date.now().toString(36).toUpperCase();
      document.getElementById("order-number").textContent = orderNumber;
      document.getElementById("confirmation-email").textContent = guestEmail;
      document.getElementById("confirmation-total").textContent = money(getReviewTotal());
      clearCart();
      renderCart();
      showStep("step-confirmation");
    });

    document.getElementById("start-again").addEventListener("click", () => {
      document.getElementById("email").value = "";
      guestEmail = "";
      showStep("step-shop");
    });

    renderCart();
  });

  function showStep(id) {
    document.querySelectorAll(".step").forEach((s) => {
      s.hidden = s.id !== id;
    });
  }

  function renderCart() {
    const itemsEl = document.getElementById("cart-items");
    const lines = getCart();
    document.getElementById("cart-empty").style.display = lines.length ? "none" : "";
    itemsEl.innerHTML = "";
    lines.forEach((line) => {
      const li = document.createElement("li");
      li.textContent = `${line.product.name} x ${line.qty} — ${money(line.lineTotal)}`;
      itemsEl.appendChild(li);
    });
    document.getElementById("cart-total").textContent = money(calculateCartTotal());
  }
}

// Export for Node-based verification (no DOM in that case).
if (typeof module !== "undefined" && module.exports) {
  module.exports = { PRODUCTS, money, addToCart, clearCart, getCart, calculateCartTotal, getReviewTotal };
}
