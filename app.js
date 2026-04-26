// ==============================
// SIMONETA BIJUO – app.js
// Products, Cart, Modals, Slider
// ==============================

/// ---- DATA & STATE ----
const DEFAULT_PRODUCTS = [
  { id: 1, name: "Pulsera Perlas Corazón", category: "pulseras", price: 3000, originalPrice: 6000, desc: "Pulsera elástica de mini perlas blancas con charm corazón plateado.", emoji: "💎", bg: "linear-gradient(135deg, #fff, #fde4ee)", badge: "Más vendido", badgeType: "pink", tags: ["nuevo"], stars: 5, reviews: 0, img: "corazon rosita y perlas.jpg" },
  { id: 2, name: "pulsera perlas rojas", category: "pulseras", price: 3000, originalPrice: null, desc: "pulsera artesanal con detalles en dorado", emoji: "💎", bg: "linear-gradient(135deg, #fff, #fde4ee)", badge: "Nuevo", badgeType: "green", tags: ["nuevo"], stars: 5, reviews: 0, img: "pulsera_roja.jpeg" },
  { id: 3, name: "Pulsera Cuentas Pastel Grande", category: "pulseras", price: 3000, originalPrice: null, desc: "Pulsera elástica con cuentas matte grandes en colores pasteles.", emoji: "💎", bg: "linear-gradient(135deg, #fff, #fde4ee)", badge: "⭐ Favorita", badgeType: "pink", tags: ["nuevo"], stars: 5, reviews: 0, img: "pulsera-cuentas-pastel.jpg.jpeg" },
  { id: 4, name: "Llavero Letra Inicial", category: "llaveros", price: 3200, originalPrice: null, desc: "Llavero con tu letra inicial personalizada. Disponible en todos los colores.", emoji: "💎", bg: "linear-gradient(135deg, #fff, #fde4ee)", badge: "Personalizable", badgeType: "pink", tags: ["nuevo"], stars: 5, reviews: 0, img: "llavero letra inicial.jpeg" },
  { id: 5, name: "pulsera de fimo ", category: "pulseras", price: 3000, originalPrice: 7500, desc: "pulsera con tonos celestes, de fimo con perlas ", emoji: "💎", bg: "linear-gradient(135deg, #fff, #fde4ee)", badge: "-20%", badgeType: "pink", tags: ["nuevo"], stars: 5, reviews: 0, img: "pulsera_fimo.jpeg" }
];

const DEFAULT_PROMOS = [
  { id: 1, color: "pink-card", label: "🌸 Promo Especial", title: "2x1 en Pulseras<br>Seleccionadas", desc: "Llevate 2 pulseras de nuestra colección y pagá solo 1. ¡Por tiempo limitado!", disc: "2×1" },
  { id: 2, color: "blue-card", label: "💙 Combo", title: "Combo Collar<br>+ Pulsera", desc: "Llevate un collar y una pulsera a juego con un 20% de descuento en el total.", disc: "-20%" },
  { id: 3, color: "green-card", label: "💚 Envío Gratis", title: "Envío Gratis<br>en toda la web", desc: "Comprando más de $15.000 te hacemos el envío gratis a todo el país. ¡Aprovechá!", disc: "🚚" },
  { id: 4, color: "pink-card", label: "🎁 Regalos", title: "Pack Regalo<br>Personalizado", desc: "Armá tu pack con letra inicial personalizada + pulsera + packaging de regalo incluido.", disc: "🎀" },
  { id: 5, color: "blue-card", label: "🔑 Iniciales", title: "Colección Llaveros<br>Letra Inicial", desc: "Encontrá tu inicial y llevatela con un packaging especial de regalo. ✨", disc: "NUEVO" }
];

let PRODUCTS = JSON.parse(localStorage.getItem("zoe_products")) || DEFAULT_PRODUCTS;
let PROMOTIONS = JSON.parse(localStorage.getItem("zoe_promos")) || DEFAULT_PROMOS;

// Sincronización Forzada: asegurar que nuevos productos/promos del código aparezcan en el cliente
let needsSync = false;
DEFAULT_PRODUCTS.forEach(dp => {
  if (!PRODUCTS.find(p => p.id == dp.id)) { PRODUCTS.push(dp); needsSync = true; }
});
DEFAULT_PROMOS.forEach(dp => {
  if (!PROMOTIONS.find(p => p.id == dp.id)) { PROMOTIONS.push(dp); needsSync = true; }
});

if (needsSync) {
  console.log("Sincronizando nuevos productos...");
  localStorage.setItem("zoe_products", JSON.stringify(PRODUCTS));
  localStorage.setItem("zoe_promos", JSON.stringify(PROMOTIONS));
}

let cart = [];
let currentProduct = null;
let currentSlide = 0;
let activeCategory = "all";
let currentSort = "default";
let isAdmin = false;

function saveData() {
  localStorage.setItem("zoe_products", JSON.stringify(PRODUCTS));
  localStorage.setItem("zoe_promos", JSON.stringify(PROMOTIONS));
}

// ---- HELPERS ----
const fmt = (n) => "$" + n.toLocaleString("es-AR");

function showToast(msg, type = "success") {
  const toast = document.getElementById("toast");
  const icon = document.getElementById("toast-icon");
  const msgEl = document.getElementById("toast-msg");
  icon.textContent = type === "success" ? "✅" : "ℹ️";
  msgEl.textContent = msg;
  toast.className = `show ${type}`;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { toast.className = ""; }, 2800);
}

// ---- RENDER PRODUCTS ----
function getFilteredProducts() {
  let list = activeCategory === "all" ? [...PRODUCTS] : PRODUCTS.filter(p => p.category === activeCategory);
  if (currentSort === "price-asc") list.sort((a, b) => a.price - b.price);
  else if (currentSort === "price-desc") list.sort((a, b) => b.price - a.price);
  else if (currentSort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
  return list;
}

function renderProducts() {
  const grid = document.getElementById("products-grid");
  const countEl = document.getElementById("catalog-count");
  const list = getFilteredProducts();
  countEl.textContent = `Mostrando ${list.length} producto${list.length !== 1 ? "s" : ""}`;

  if (list.length === 0) {
    grid.innerHTML = '<div class="no-results">😕 No hay productos en esta categoría</div>';
    return;
  }

  grid.innerHTML = list.map(p => `
    <article class="product-card" data-id="${p.id}" tabindex="0" role="button" aria-label="${p.name}">
      <div class="product-img-wrap">
        <div class="product-img-bg" style="background:${p.bg}"></div>
        ${p.img
      ? `<img class="product-img" src="${p.img}" alt="${p.name}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
             <div class="product-placeholder" style="display:none">${p.emoji}</div>`
      : `<div class="product-placeholder">${p.emoji}</div>`
    }
        <div class="product-overlay">
          <button class="overlay-btn quick-view-btn" data-id="${p.id}" title="Vista rápida" aria-label="Vista rápida de ${p.name}">👁️</button>
          <button class="overlay-btn cart-overlay-btn" data-id="${p.id}" title="Agregar al carrito" aria-label="Agregar ${p.name} al carrito">🛍️</button>
        </div>
        ${p.badge ? `<div class="product-badge"><span class="tag tag-${p.badgeType}">${p.badge}</span></div>` : ""}
        <button class="wishlist-btn" data-id="${p.id}" aria-label="Agregar a favoritos">🤍</button>
      </div>
      <div class="product-info">
        <div class="product-category">${categoryLabel(p.category)}</div>
        <h3 class="product-name">${p.name}</h3>
        <p class="product-desc-short">${p.desc.substring(0, 60)}…</p>
        <div class="product-price-row">
          <div class="price-wrap">
            <span class="price-current">${fmt(p.price)}</span>
            ${p.originalPrice ? `<span class="price-original">${fmt(p.originalPrice)}</span>` : ""}
          </div>
          <button class="add-to-cart-btn" data-id="${p.id}" aria-label="Agregar al carrito">+</button>
        </div>
      </div>
    </article>
  `).join("");

  // Bind events
  grid.querySelectorAll(".product-card").forEach(card => {
    const id = parseInt(card.dataset.id);
    card.addEventListener("click", (e) => {
      if (!e.target.closest("button")) openProductModal(id);
    });
    card.addEventListener("keydown", (e) => { if (e.key === "Enter") openProductModal(id); });
  });
  grid.querySelectorAll(".quick-view-btn").forEach(btn => {
    btn.addEventListener("click", (e) => { e.stopPropagation(); openProductModal(parseInt(btn.dataset.id)); });
  });
  grid.querySelectorAll(".cart-overlay-btn, .add-to-cart-btn").forEach(btn => {
    btn.addEventListener("click", (e) => { e.stopPropagation(); addToCart(parseInt(btn.dataset.id)); });
  });
  grid.querySelectorAll(".wishlist-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      btn.classList.toggle("active");
      btn.textContent = btn.classList.contains("active") ? "❤️" : "🤍";
      showToast(btn.classList.contains("active") ? "Agregado a favoritos ❤️" : "Quitado de favoritos", "info");
    });
  });
}

function categoryLabel(cat) {
  return { pulseras: "Pulseras", collares: "Collares", llaveros: "Llaveros", accesorios: "Accesorios" }[cat] || cat;
}

// ---- CATEGORY FILTER ----
document.querySelectorAll(".category-chip").forEach(chip => {
  chip.addEventListener("click", () => {
    document.querySelectorAll(".category-chip").forEach(c => c.classList.remove("active"));
    chip.classList.add("active");
    activeCategory = chip.dataset.cat;
    renderProducts();
    document.getElementById("catalog").scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

document.getElementById("sort-select").addEventListener("change", (e) => {
  currentSort = e.target.value;
  renderProducts();
});

// ---- PRODUCT MODAL ----
function openProductModal(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  currentProduct = p;

  document.getElementById("modal-cat").textContent = categoryLabel(p.category);
  document.getElementById("modal-name").textContent = p.name;
  document.getElementById("modal-price").textContent = fmt(p.price);
  document.getElementById("modal-original").textContent = p.originalPrice ? fmt(p.originalPrice) : "";
  document.getElementById("modal-desc").textContent = p.desc;
  document.getElementById("modal-qty").value = 1;

  // Stars
  const starsEl = document.getElementById("modal-stars");
  starsEl.innerHTML = "⭐".repeat(p.stars) + `<span>(${p.reviews} reseñas)</span>`;

  // Tags
  document.getElementById("modal-tags").innerHTML = p.tags.map(t =>
    `<span class="tag tag-pink">${t}</span>`
  ).join("");

  // Image
  const imgWrap = document.getElementById("modal-img-wrap");
  if (p.img) {
    imgWrap.innerHTML = `
      <img class="modal-img" src="${p.img}" alt="${p.name}"
        onerror="this.style.display='none';document.getElementById('modal-img-fallback').style.display='flex'">
      <div id="modal-img-fallback" class="modal-placeholder" style="display:none;background:${p.bg}">${p.emoji}</div>
    `;
  } else {
    imgWrap.innerHTML = `<div class="modal-placeholder" style="background:${p.bg}">${p.emoji}</div>`;
  }

  document.getElementById("product-modal").classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeProductModal() {
  document.getElementById("product-modal").classList.remove("open");
  document.body.style.overflow = "";
}

document.getElementById("modal-close").addEventListener("click", closeProductModal);
document.getElementById("product-modal").addEventListener("click", (e) => {
  if (e.target === e.currentTarget) closeProductModal();
});

document.getElementById("qty-minus").addEventListener("click", () => {
  const qty = document.getElementById("modal-qty");
  if (parseInt(qty.value) > 1) qty.value = parseInt(qty.value) - 1;
});
document.getElementById("qty-plus").addEventListener("click", () => {
  const qty = document.getElementById("modal-qty");
  if (parseInt(qty.value) < 99) qty.value = parseInt(qty.value) + 1;
});

document.getElementById("modal-add-btn").addEventListener("click", () => {
  const qty = parseInt(document.getElementById("modal-qty").value) || 1;
  if (currentProduct) {
    addToCart(currentProduct.id, qty);
    closeProductModal();
  }
});

// ---- CART ----
function addToCart(id, qty = 1) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  const existing = cart.find(x => x.id === id);
  if (existing) existing.qty += qty;
  else cart.push({ ...p, qty });
  updateCartUI();
  showToast(`${p.name} agregado al carrito 🛍️`);
  animateCartIcon();
}

function removeFromCart(id) {
  cart = cart.filter(x => x.id !== id);
  updateCartUI();
}

function updateCartQty(id, delta) {
  const item = cart.find(x => x.id === id);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  if (item.qty === 0) removeFromCart(id);
  else updateCartUI();
}

function updateCartUI() {
  const count = cart.reduce((s, x) => s + x.qty, 0);
  const total = cart.reduce((s, x) => s + x.price * x.qty, 0);
  const countEl = document.getElementById("cart-count");
  countEl.textContent = count;
  countEl.classList.toggle("visible", count > 0);

  const empty = document.getElementById("cart-empty");
  const items = document.getElementById("cart-items");
  const footer = document.getElementById("cart-footer");
  empty.style.display = cart.length === 0 ? "flex" : "none";
  items.style.display = cart.length === 0 ? "none" : "flex";
  footer.style.display = cart.length === 0 ? "none" : "block";

  items.innerHTML = cart.map(item => `
    <div class="cart-item" data-id="${item.id}">
      ${item.img
      ? `<img class="cart-item-img" src="${item.img}" alt="${item.name}"
            onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
           <div class="cart-item-placeholder" style="display:none">${item.emoji}</div>`
      : `<div class="cart-item-placeholder">${item.emoji}</div>`
    }
      <div>
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${fmt(item.price)}</div>
        <div class="cart-item-qty">
          <button class="ci-qty-btn" data-id="${item.id}" data-delta="-1" aria-label="Restar">−</button>
          <span class="ci-qty">${item.qty}</span>
          <button class="ci-qty-btn" data-id="${item.id}" data-delta="1" aria-label="Sumar">+</button>
        </div>
      </div>
      <button class="cart-item-remove" data-id="${item.id}" aria-label="Quitar del carrito">✕</button>
    </div>
  `).join("");

  items.querySelectorAll(".ci-qty-btn").forEach(btn => {
    btn.addEventListener("click", () => updateCartQty(parseInt(btn.dataset.id), parseInt(btn.dataset.delta)));
  });
  items.querySelectorAll(".cart-item-remove").forEach(btn => {
    btn.addEventListener("click", () => removeFromCart(parseInt(btn.dataset.id)));
  });

  document.getElementById("cart-subtotal").textContent = fmt(total);
  document.getElementById("cart-total").textContent = total >= 15000 ? fmt(total) + " 🎉" : fmt(total);
  document.getElementById("cart-shipping").textContent = total >= 15000 ? "🎉 ¡Gratis!" : "A calcular";
  document.getElementById("payment-total-display").textContent = fmt(total);
}

function animateCartIcon() {
  const btn = document.getElementById("cart-btn");
  btn.style.transform = "scale(1.3)";
  setTimeout(() => { btn.style.transform = ""; }, 300);
}

// Cart open/close
function openCart() {
  document.getElementById("cart-overlay").classList.add("open");
  document.body.style.overflow = "hidden";
}
function closeCart() {
  document.getElementById("cart-overlay").classList.remove("open");
  document.body.style.overflow = "";
}

document.getElementById("cart-btn").addEventListener("click", openCart);
document.getElementById("cart-close").addEventListener("click", closeCart);
document.getElementById("cart-overlay").addEventListener("click", (e) => {
  if (e.target === e.currentTarget) closeCart();
});
document.getElementById("cart-continue-btn").addEventListener("click", closeCart);
document.getElementById("go-shop-btn")?.addEventListener("click", closeCart);

// Checkout → payment modal
document.getElementById("checkout-btn").addEventListener("click", () => {
  if (cart.length === 0) return;
  closeCart();
  setTimeout(() => {
    document.getElementById("payment-modal-overlay").classList.add("open");
    document.body.style.overflow = "hidden";
  }, 300);
});

// ---- PAYMENT MODAL ----
let selectedPayment = null;

document.querySelectorAll(".payment-method-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".payment-method-btn").forEach(b => {
      b.classList.remove("selected");
      b.setAttribute("aria-checked", "false");
      b.querySelector(".pm-check").textContent = "";
    });
    btn.classList.add("selected");
    btn.setAttribute("aria-checked", "true");
    btn.querySelector(".pm-check").textContent = "✓";
    selectedPayment = btn.dataset.method;

    // Show the right form
    document.querySelectorAll(".payment-form").forEach(f => f.classList.remove("active"));
    const form = document.getElementById(`form-${selectedPayment}`);
    if (form) form.classList.add("active");
  });
});

document.getElementById("payment-modal-close").addEventListener("click", () => {
  document.getElementById("payment-modal-overlay").classList.remove("open");
  document.body.style.overflow = "";
});
document.getElementById("payment-modal-overlay").addEventListener("click", (e) => {
  if (e.target === e.currentTarget) {
    document.getElementById("payment-modal-overlay").classList.remove("open");
    document.body.style.overflow = "";
  }
});

document.getElementById("confirm-payment-btn").addEventListener("click", () => {
  if (!selectedPayment) { showToast("Seleccioná un método de pago", "info"); return; }
  if (cart.length === 0) { showToast("Tu carrito está vacío", "info"); return; }

  // Basic validation
  if (selectedPayment === "card") {
    const num = document.getElementById("card-number").value.replace(/\s/g, "");
    if (num.length < 13) { showToast("Ingresá un número de tarjeta válido", "info"); return; }
  }
  if (selectedPayment === "mp") {
    const email = document.getElementById("mp-email").value;
    if (!email.includes("@")) { showToast("Ingresá un email válido", "info"); return; }
  }
  if (selectedPayment === "cash") {
    const phone = document.getElementById("cash-phone").value;
    if (phone.length < 8) { showToast("Ingresá tu número de WhatsApp", "info"); return; }
  }

  document.getElementById("payment-modal-overlay").classList.remove("open");
  cart = [];
  updateCartUI();
  setTimeout(() => {
    document.getElementById("order-success").classList.add("open");
  }, 200);
});

document.getElementById("success-back-btn").addEventListener("click", () => {
  document.getElementById("order-success").classList.remove("open");
  document.body.style.overflow = "";
  selectedPayment = null;
  document.querySelectorAll(".payment-method-btn").forEach(b => {
    b.classList.remove("selected");
    b.querySelector(".pm-check").textContent = "";
  });
  document.querySelectorAll(".payment-form").forEach(f => f.classList.remove("active"));
});

// Card number formatting
document.getElementById("card-number").addEventListener("input", (e) => {
  let v = e.target.value.replace(/\D/g, "").substring(0, 16);
  e.target.value = v.replace(/(.{4})/g, "$1 ").trim();
});
document.getElementById("card-exp").addEventListener("input", (e) => {
  let v = e.target.value.replace(/\D/g, "").substring(0, 4);
  if (v.length >= 2) v = v.substring(0, 2) + "/" + v.substring(2);
  e.target.value = v;
});

// ---- PROMO SLIDER & DYNAMIC RENDERING ----
function renderPromotions() {
  const slider = document.getElementById("promo-slider");
  const dotsContainer = document.getElementById("slider-dots-container");

  slider.innerHTML = PROMOTIONS.map(p => `
    <div class="promo-slide">
      <div class="promo-card ${p.color}">
        <div class="promo-deco-circles"></div>
        <div>
          <div class="promo-label">${p.label}</div>
          <h3 class="promo-title-text">${p.title}</h3>
          <p class="promo-desc-text">${p.desc}</p>
          <a href="#categories" class="promo-btn">Ver más →</a>
        </div>
        <div class="promo-discount">${p.disc}</div>
      </div>
    </div>
  `).join("");

  // Update dots
  const oldDots = dotsContainer.querySelectorAll(".slider-dot");
  oldDots.forEach(d => d.remove());

  PROMOTIONS.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.className = `slider-dot ${i === 0 ? "active" : ""}`;
    dot.dataset.index = i;
    dot.setAttribute("aria-label", `Promo ${i + 1}`);
    dot.addEventListener("click", () => goToSlide(i));
    dotsContainer.insertBefore(dot, document.getElementById("promo-next"));
  });

  initSliderLogic();
}

function initSliderLogic() {
  const slides = document.querySelectorAll(".promo-slide");
  const dots = document.querySelectorAll(".slider-dot");

  function goToSlide(n) {
    currentSlide = (n + PROMOTIONS.length) % PROMOTIONS.length;
    document.getElementById("promo-slider").style.transform = `translateX(-${currentSlide * 100}%)`;
    document.querySelectorAll(".slider-dot").forEach((d, i) => d.classList.toggle("active", i === currentSlide));
  }

  document.getElementById("promo-prev").onclick = () => goToSlide(currentSlide - 1);
  document.getElementById("promo-next").onclick = () => goToSlide(currentSlide + 1);

  // Auto-slide 
  clearInterval(window.sliderInterval);
  window.sliderInterval = setInterval(() => goToSlide(currentSlide + 1), 5000);
}

// ---- ADMIN LOGIC ----
function initAdmin() {
  const loginLink = document.getElementById("admin-login-link");
  const loginModal = document.getElementById("admin-login-modal");
  const dashModal = document.getElementById("admin-dashboard-modal");

  loginLink.addEventListener("click", (e) => {
    e.preventDefault();
    loginModal.classList.add("open");
  });

  document.getElementById("admin-login-close").onclick = () => loginModal.classList.remove("open");
  document.getElementById("admin-dash-close").onclick = () => dashModal.classList.remove("open");

  document.getElementById("admin-login-btn").onclick = () => {
    const pass = document.getElementById("admin-pass").value;
    if (pass === "zoe2025") { // Simpan contraseña simple
      isAdmin = true;
      loginModal.classList.remove("open");
      dashModal.classList.add("open");
      document.getElementById("admin-pass").value = "";
      renderAdminProducts();
      renderAdminPromos();
    } else {
      showToast("Contraseña incorrecta", "info");
    }
  };

  // Tabs
  document.querySelectorAll(".admin-tab").forEach(tab => {
    tab.onclick = () => {
      document.querySelectorAll(".admin-tab").forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".admin-tab-content").forEach(c => c.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById(`tab-${tab.dataset.tab}`).classList.add("active");
    };
  });

  // Export/Clear
  document.getElementById("export-data-btn").onclick = () => {
    const area = document.getElementById("export-area");
    const dataString = JSON.stringify({ PRODUCTS, PROMOTIONS }, null, 2);
    area.value = dataString;
    area.style.display = "block";
    
    // Copiar al portapapeles automáticamente
    navigator.clipboard.writeText(dataString).then(() => {
      showToast("📋 ¡Copiado al portapapeles!");
    }).catch(err => {
      showToast("Datos listos en el recuadro", "info");
      console.error('Error al copiar: ', err);
    });
  };

  document.getElementById("clear-local-btn").onclick = () => {
    if (confirm("¿Borrar todos los cambios locales y volver al original?")) {
      localStorage.removeItem("zoe_products");
      localStorage.removeItem("zoe_promos");
      location.reload();
    }
  };

  initProductEditor();
  initPromoEditor();
}

function renderAdminProducts() {
  const list = document.getElementById("admin-products-list");
  list.innerHTML = PRODUCTS.map(p => `
    <tr>
      <td><img src="${p.img || ''}" class="admin-img-small" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${p.emoji}</text></svg>'"></td>
      <td><strong>${p.name}</strong></td>
      <td>${categoryLabel(p.category)}</td>
      <td>${fmt(p.price)}</td>
      <td>
        <div class="admin-table-actions">
          <button class="action-btn edit-p" data-id="${p.id}">✏️</button>
          <button class="action-btn del-p" data-id="${p.id}" style="color:red">🗑️</button>
        </div>
      </td>
    </tr>
  `).join("");

  list.querySelectorAll(".edit-p").forEach(btn => btn.onclick = () => openProductEditor(parseInt(btn.dataset.id)));
  list.querySelectorAll(".del-p").forEach(btn => btn.onclick = () => deleteProduct(parseInt(btn.dataset.id)));
}

function renderAdminPromos() {
  const list = document.getElementById("admin-promos-list");
  list.innerHTML = PROMOTIONS.map(p => `
    <div class="admin-promo-item">
      <div class="admin-promo-controls">
        <button class="action-btn edit-promo" data-id="${p.id}">✏️</button>
        <button class="action-btn del-promo" data-id="${p.id}" style="color:red">🗑️</button>
      </div>
      <div class="tag tag-pink">${p.label}</div>
      <div style="font-weight:600; margin-top:8px;">${p.title.replace('<br>', ' ')}</div>
      <div style="font-size:12px; color:var(--gray-400); margin-top:4px;">${p.disc}</div>
    </div>
  `).join("");

  list.querySelectorAll(".edit-promo").forEach(btn => btn.onclick = () => openPromoEditor(parseInt(btn.dataset.id)));
  list.querySelectorAll(".del-promo").forEach(btn => btn.onclick = () => deletePromo(parseInt(btn.dataset.id)));
}

// ---- PRODUCT EDITOR ----
function initProductEditor() {
  const modal = document.getElementById("product-editor-modal");
  document.getElementById("add-product-btn-admin").onclick = () => openProductEditor();
  document.getElementById("editor-close").onclick = () => modal.classList.remove("open");

  const fileInput = document.getElementById("edit-p-img-file");
  fileInput.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (re) => {
        document.getElementById("edit-p-img-base64").value = re.target.result;
        document.getElementById("img-preview").innerHTML = `<img src="${re.target.result}" style="width:100%; height:100%; object-fit:cover;">`;
      };
      reader.readAsDataURL(file);
    }
  };

  document.getElementById("product-form").onsubmit = (e) => {
    e.preventDefault();
    const id = document.getElementById("edit-product-id").value;
    const newP = {
      id: id ? parseInt(id) : Date.now(),
      name: document.getElementById("edit-p-name").value,
      category: document.getElementById("edit-p-cat").value,
      price: parseInt(document.getElementById("edit-p-price").value),
      desc: document.getElementById("edit-p-desc").value,
      img: document.getElementById("edit-p-img-base64").value || null,
      emoji: "💎",
      bg: "linear-gradient(135deg, #fff, #fde4ee)",
      stars: 5,
      reviews: 0,
      tags: ["nuevo"]
    };

    if (id) {
      const idx = PRODUCTS.findIndex(p => p.id === parseInt(id));
      // Keep old props not in editor
      PRODUCTS[idx] = { ...PRODUCTS[idx], ...newP };
    } else {
      PRODUCTS.push(newP);
    }

    saveData();
    renderProducts();
    renderAdminProducts();
    modal.classList.remove("open");
    showToast("Producto guardado");
  };
}

function openProductEditor(id = null) {
  const modal = document.getElementById("product-editor-modal");
  const form = document.getElementById("product-form");
  form.reset();
  document.getElementById("edit-product-id").value = id || "";
  document.getElementById("img-preview").innerHTML = "<span>Sin foto</span>";
  document.getElementById("edit-p-img-base64").value = "";

  if (id) {
    const p = PRODUCTS.find(x => x.id === id);
    document.getElementById("edit-p-name").value = p.name;
    document.getElementById("edit-p-cat").value = p.category;
    document.getElementById("edit-p-price").value = p.price;
    document.getElementById("edit-p-desc").value = p.desc;
    document.getElementById("edit-p-img-base64").value = p.img || "";
    if (p.img) document.getElementById("img-preview").innerHTML = `<img src="${p.img}" style="width:100%; height:100%; object-fit:cover;">`;
    document.getElementById("editor-title").textContent = "Editar Producto";
  } else {
    document.getElementById("editor-title").textContent = "Nuevo Producto";
  }
  modal.classList.add("open");
}

function deleteProduct(id) {
  if (confirm("¿Estás seguro de eliminar este producto?")) {
    PRODUCTS = PRODUCTS.filter(p => p.id !== id);
    saveData();
    renderProducts();
    renderAdminProducts();
    showToast("Producto eliminado", "info");
  }
}

// ---- PROMO EDITOR ----
function initPromoEditor() {
  const modal = document.getElementById("promo-editor-modal");
  document.getElementById("add-promo-btn-admin").onclick = () => openPromoEditor();
  document.getElementById("promo-editor-close").onclick = () => modal.classList.remove("open");

  document.getElementById("promo-form").onsubmit = (e) => {
    e.preventDefault();
    const id = document.getElementById("edit-promo-id").value;
    const newPromo = {
      id: id ? parseInt(id) : Date.now(),
      color: document.getElementById("edit-promo-color").value,
      label: document.getElementById("edit-promo-label").value,
      title: document.getElementById("edit-promo-title").value,
      desc: document.getElementById("edit-promo-desc").value,
      disc: document.getElementById("edit-promo-disc").value
    };

    if (id) {
      const idx = PROMOTIONS.findIndex(p => p.id === parseInt(id));
      PROMOTIONS[idx] = newPromo;
    } else {
      PROMOTIONS.push(newPromo);
    }

    saveData();
    renderPromotions();
    renderAdminPromos();
    modal.classList.remove("open");
    showToast("Promoción guardada");
  };
}

function openPromoEditor(id = null) {
  const modal = document.getElementById("promo-editor-modal");
  document.getElementById("promo-form").reset();
  document.getElementById("edit-promo-id").value = id || "";

  if (id) {
    const p = PROMOTIONS.find(x => x.id === id);
    document.getElementById("edit-promo-color").value = p.color;
    document.getElementById("edit-promo-label").value = p.label;
    document.getElementById("edit-promo-title").value = p.title;
    document.getElementById("edit-promo-desc").value = p.desc;
    document.getElementById("edit-promo-disc").value = p.disc;
  }
  modal.classList.add("open");
}

function deletePromo(id) {
  if (PROMOTIONS.length <= 1) { showToast("Debe haber al menos 1 promo", "info"); return; }
  if (confirm("¿Eliminar esta promoción?")) {
    PROMOTIONS = PROMOTIONS.filter(p => p.id !== id);
    saveData();
    renderPromotions();
    renderAdminPromos();
  }
}

// ---- OLD SLIDER LOGIC REPLACEMENT ----
// (Removed static dots and slides logic since it's now dynamic in renderPromotions)

// ---- HEADER SCROLL ----
window.addEventListener("scroll", () => {
  document.getElementById("main-header").classList.toggle("scrolled", window.scrollY > 60);
});

// ---- MOBILE NAV ----
document.getElementById("hamburger").addEventListener("click", () => {
  const nav = document.getElementById("mobile-nav");
  nav.style.display = nav.style.display === "none" ? "block" : "none";
});
document.querySelectorAll("#mobile-nav a").forEach(a => {
  a.addEventListener("click", () => {
    document.getElementById("mobile-nav").style.display = "none";
  });
});

// ---- SEARCH ----
document.getElementById("search-btn").addEventListener("click", () => {
  const q = prompt("🔍 ¿Qué estás buscando?")?.toLowerCase();
  if (!q) return;
  activeCategory = "all";
  document.querySelectorAll(".category-chip").forEach(c => c.classList.remove("active"));
  document.querySelector('[data-cat="all"]').classList.add("active");
  const filtered = PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q) || p.tags.some(t => t.includes(q))
  );
  const grid = document.getElementById("products-grid");
  document.getElementById("catalog-count").textContent = `${filtered.length} resultado${filtered.length !== 1 ? "s" : ""} para "${q}"`;
  if (filtered.length === 0) {
    grid.innerHTML = '<div class="no-results">😕 No encontramos lo que buscás. ¡Probá con otro término!</div>';
  } else {
    activeCategory = "all";
    currentSort = "default";
    document.getElementById("sort-select").value = "default";
    // Temporarily filter
    const origProducts = [...PRODUCTS];
    grid.innerHTML = filtered.map(p => {
      const idx = PRODUCTS.indexOf(p);
      return renderSingleProduct(p);
    }).join("");
    bindProductEvents();
  }
  document.getElementById("catalog").scrollIntoView({ behavior: "smooth" });
});

function renderSingleProduct(p) {
  return `
    <article class="product-card" data-id="${p.id}" tabindex="0" role="button" aria-label="${p.name}">
      <div class="product-img-wrap">
        <div class="product-img-bg" style="background:${p.bg}"></div>
        ${p.img
      ? `<img class="product-img" src="${p.img}" alt="${p.name}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
             <div class="product-placeholder" style="display:none">${p.emoji}</div>`
      : `<div class="product-placeholder">${p.emoji}</div>`
    }
        <div class="product-overlay">
          <button class="overlay-btn quick-view-btn" data-id="${p.id}" title="Vista rápida">👁️</button>
          <button class="overlay-btn cart-overlay-btn" data-id="${p.id}" title="Agregar al carrito">🛍️</button>
        </div>
        ${p.badge ? `<div class="product-badge"><span class="tag tag-${p.badgeType}">${p.badge}</span></div>` : ""}
        <button class="wishlist-btn" data-id="${p.id}">🤍</button>
      </div>
      <div class="product-info">
        <div class="product-category">${categoryLabel(p.category)}</div>
        <h3 class="product-name">${p.name}</h3>
        <p class="product-desc-short">${p.desc.substring(0, 60)}…</p>
        <div class="product-price-row">
          <div class="price-wrap">
            <span class="price-current">${fmt(p.price)}</span>
            ${p.originalPrice ? `<span class="price-original">${fmt(p.originalPrice)}</span>` : ""}
          </div>
          <button class="add-to-cart-btn" data-id="${p.id}">+</button>
        </div>
      </div>
    </article>
  `;
}

function bindProductEvents() {
  const grid = document.getElementById("products-grid");
  grid.querySelectorAll(".product-card").forEach(card => {
    const id = parseInt(card.dataset.id);
    card.addEventListener("click", (e) => { if (!e.target.closest("button")) openProductModal(id); });
    card.addEventListener("keydown", (e) => { if (e.key === "Enter") openProductModal(id); });
  });
  grid.querySelectorAll(".quick-view-btn").forEach(btn =>
    btn.addEventListener("click", (e) => { e.stopPropagation(); openProductModal(parseInt(btn.dataset.id)); }));
  grid.querySelectorAll(".cart-overlay-btn, .add-to-cart-btn").forEach(btn =>
    btn.addEventListener("click", (e) => { e.stopPropagation(); addToCart(parseInt(btn.dataset.id)); }));
  grid.querySelectorAll(".wishlist-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      btn.classList.toggle("active");
      btn.textContent = btn.classList.contains("active") ? "❤️" : "🤍";
      showToast(btn.classList.contains("active") ? "Agregado a favoritos ❤️" : "Quitado de favoritos", "info");
    });
  });
}

// Keyboard accessibility
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeProductModal();
    closeCart();
    document.getElementById("payment-modal-overlay").classList.remove("open");
    document.body.style.overflow = "";
  }
});

// ---- INIT ----
renderPromotions();
renderProducts();
updateCartUI();
initAdmin();
