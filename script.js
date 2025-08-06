// === DOM ELEMENTS ===
const authModal = document.getElementById("auth-modal");
const cartModal = document.getElementById("cart-modal");
const closeModalBtn = document.querySelector(".close-modal-btn");
const closeCartModalBtn = document.getElementById("close-cart-modal");
const loginTabBtn = document.getElementById("login-tab-btn");
const registerTabBtn = document.getElementById("register-tab-btn");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const loginUsernameInput = document.getElementById("login-username");
const loginPasswordInput = document.getElementById("login-password");
const loginBtn = document.getElementById("login-btn");
const loginErrorMsg = document.getElementById("login-error");
const registerPasswordInput = document.getElementById("register-password");
const registerBtn = document.getElementById("register-btn");
const registerMessage = document.getElementById("register-message");
const tombolTambah = document.getElementById("tombol-tambah");
const inputNama = document.getElementById("input-nama");
const inputHarga = document.getElementById("input-harga");
const inputKategori = document.getElementById("input-kategori");
const inputGambar = document.getElementById("input-gambar");
const imagePreviewImg = document.getElementById("image-preview-img");
const imagePreviewText = document.getElementById("image-preview-text");
const editingProductId = document.getElementById("editing-product-id");
const cartCountSpan = document.querySelector(".cart-count");

let currentPage = "home";
let currentAdminTab = "add-product";

// === UTILITY FUNCTIONS ===
function showNotification(message, type = "info") {
  // Create notification element
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${
          type === "success"
            ? "#16a34a"
            : type === "error"
            ? "#dc2626"
            : "#3b82f6"
        };
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
    `;
  notification.textContent = message;

  document.body.appendChild(notification);

  // Show notification
  setTimeout(() => {
    notification.style.transform = "translateX(0)";
  }, 100);

  // Hide notification after 3 seconds
  setTimeout(() => {
    notification.style.transform = "translateX(100%)";
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

function formatPrice(price) {
  // Format price to Indonesian Rupiah format
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

// === API CALLS ===
async function fetchProducts(category = null) {
  try {
    const url = category
      ? `api/products.php?category=${category}`
      : "api/products.php";
    const response = await fetch(url);
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

async function fetchCart() {
  try {
    const response = await fetch("api/cart.php");
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching cart:", error);
    return [];
  }
}

async function updateCartCount() {
  try {
    const cart = await fetchCart();
    const totalItems = cart.reduce(
      (sum, item) => sum + parseInt(item.quantity),
      0
    );
    cartCountSpan.textContent = totalItems;
  } catch (error) {
    console.error("Error updating cart count:", error);
    cartCountSpan.textContent = "0";
  }
}

// === PAGE NAVIGATION ===
function showPage(pageName) {
  document
    .querySelectorAll(".page-section")
    .forEach((page) => page.classList.add("hidden"));
  document.getElementById(pageName + "-page").classList.remove("hidden");
  document
    .querySelectorAll(".nav-link")
    .forEach((link) => link.classList.remove("active"));

  const activeLink = document.querySelector(
    `[onclick="showPage('${pageName}')"]`
  );
  if (activeLink) {
    activeLink.classList.add("active");
  }

  currentPage = pageName;

  if (pageName === "apparel" || pageName === "accessories") {
    renderCatalog(pageName);
  } else if (pageName === "new-arrivals") {
    renderNewArrivals();
  }
}

// === ADMIN PANEL ===
function showAdminTab(tabName) {
  document
    .querySelectorAll(".admin-tab-content")
    .forEach((tab) => tab.classList.add("hidden"));
  document.getElementById(tabName + "-tab").classList.remove("hidden");
  document
    .querySelectorAll(".admin-tab-btn")
    .forEach((btn) => btn.classList.remove("active"));

  const activeBtn = document.querySelector(
    `[onclick="showAdminTab('${tabName}')"]`
  );
  if (activeBtn) {
    activeBtn.classList.add("active");
  }

  currentAdminTab = tabName;

  if (tabName === "manage-products") {
    renderProductsTable();
  }
}

// === UI RENDERING ===
async function renderCatalog(category) {
  const container = document.getElementById(category + "-grid");
  container.innerHTML =
    '<div style="text-align: center; padding: 40px;">Memuat produk...</div>';

  try {
    const products = await fetchProducts(category);
    container.innerHTML = "";

    if (products.length === 0) {
      container.innerHTML =
        '<div style="text-align: center; padding: 40px; color: #6b7280;">Belum ada produk dalam kategori ini</div>';
      return;
    }

    products.forEach((product) => renderProductCard(product, container));
  } catch (error) {
    container.innerHTML =
      '<div style="text-align: center; padding: 40px; color: #dc2626;">Error memuat produk</div>';
  }
}

async function renderNewArrivals() {
  const container = document.getElementById("new-arrivals-grid");
  container.innerHTML =
    '<div style="text-align: center; padding: 40px;">Memuat produk terbaru...</div>';

  try {
    const products = await fetchProducts();
    container.innerHTML = "";

    if (products.length === 0) {
      container.innerHTML =
        '<div style="text-align: center; padding: 40px; color: #6b7280;">Belum ada produk</div>';
      return;
    }

    const newArrivals = products.slice(0, 6); // Get latest 6 products
    newArrivals.forEach((product) => renderProductCard(product, container));
  } catch (error) {
    container.innerHTML =
      '<div style="text-align: center; padding: 40px; color: #dc2626;">Error memuat produk</div>';
  }
}

function renderProductCard(product, container) {
  const card = document.createElement("div");
  card.className = "kartu-produk";
  card.innerHTML = `
        <div class="gambar-produk-wrapper">
            <img src="${product.image}" alt="${product.name}" 
                 onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjM1MCIgdmlld0JveD0iMCAwIDI4MCAzNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyODAiIGhlaWdodD0iMzUwIiBmaWxsPSIjRjlGQUZCIi8+CjxwYXRoIGQ9Ik0xNDAgMTc1QzE0MCAyMDAgMTIwIDIyMCA5NSAyMjBDNzAgMjIwIDUwIDIwMCA1MCAxNzVDNTAgMTUwIDcwIDEzMCA5NSAxMzBDMTIwIDEzMCAxNDAgMTUwIDE0MCAxNzVaIiBmaWxsPSIjRTVFN0VCIi8+Cjx0ZXh0IHg9IjE0MCIgeT0iMjYwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNkI3MjgwIiBmb250LWZhbWlseT0iSW50ZXIiIGZvbnQtc2l6ZT0iMTQiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K'">
        </div>
        <div class="info-produk">
            <h3>${product.name}</h3>
            <p class="harga">${formatPrice(product.price)}</p>
            <div class="product-actions">
                <button class="action-btn cart-btn" onclick="addToCartAction('${
                  product.id
                }')">Keranjang</button>
                <button class="action-btn buy-btn" onclick="buyNowAction('${
                  product.id
                }')">Beli</button>
            </div>
        </div>
    `;
  container.appendChild(card);
}

async function renderProductsTable() {
  const container = document.getElementById("products-table-container");
  container.innerHTML =
    '<div style="text-align: center; padding: 40px;">Memuat produk...</div>';

  try {
    const products = await fetchProducts();

    if (products.length === 0) {
      container.innerHTML =
        '<p style="text-align: center; color: var(--text-light); padding: 40px;">Belum ada produk</p>';
      return;
    }

    container.innerHTML = `
            <table class="products-table">
                <thead>
                    <tr>
                        <th>Gambar</th>
                        <th>Nama</th>
                        <th>Harga</th>
                        <th>Kategori</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    ${products
                      .map(
                        (product) => `
                        <tr>
                            <td><img src="${product.image}" alt="${
                          product.name
                        }" 
                                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRjlGQUZCIi8+CjxjaXJjbGUgY3g9IjMwIiBjeT0iMzAiIHI9IjEwIiBmaWxsPSIjRTVFN0VCIi8+Cjx0ZXh0IHg9IjMwIiB5PSI0NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzZCNzI4MCIgZm9udC1mYW1pbHk9IkludGVyIiBmb250LXNpemU9IjgiPk5vPC90ZXh0Pgo8L3N2Zz4='"></td>
                            <td>${product.name}</td>
                            <td>${formatPrice(product.price)}</td>
                            <td>${product.category}</td>
                            <td>
                                <div class="table-actions">
                                    <button class="btn-primary btn-sm" onclick="editProduct('${
                                      product.id
                                    }')">Edit</button>
                                    <button class="btn-danger btn-sm" onclick="deleteProduct('${
                                      product.id
                                    }')">Hapus</button>
                                </div>
                            </td>
                        </tr>
                    `
                      )
                      .join("")}
                </tbody>
            </table>
        `;
  } catch (error) {
    container.innerHTML =
      '<div style="text-align: center; padding: 40px; color: #dc2626;">Error memuat produk</div>';
  }
}

async function renderCartModal() {
  const cartContent = document.getElementById("cart-content");
  cartContent.innerHTML =
    '<div style="text-align: center; padding: 20px;">Memuat keranjang...</div>';

  try {
    const cart = await fetchCart();

    if (cart.length === 0) {
      cartContent.innerHTML = `
                <div class="empty-cart">
                    <div class="empty-cart-icon">🛒</div>
                    <h3>Keranjang Kosong</h3>
                    <p>Belum ada produk dalam keranjang Anda</p>
                    <button class="btn-primary" onclick="hideCartModal(); showPage('apparel');">Mulai Belanja</button>
                </div>
            `;
      return;
    }

    const totalPrice = cart.reduce(
      (sum, item) => sum + parseInt(item.price) * parseInt(item.quantity),
      0
    );

    cartContent.innerHTML = `
            <div style="max-height: 400px; overflow-y: auto; margin-bottom: 20px;">
                ${cart
                  .map(
                    (item) => `
                    <div class="cart-item">
                        <img src="${item.image}" alt="${item.name}" 
                             onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjlGQUZCIi8+CjxjaXJjbGUgY3g9IjQwIiBjeT0iNDAiIHI9IjE1IiBmaWxsPSIjRTVFN0VCIi8+Cjx0ZXh0IHg9IjQwIiB5PSI2MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzZCNzI4MCIgZm9udC1mYW1pbHk9IkludGVyIiBmb250LXNpemU9IjEwIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+Cg=='">
                        <div class="cart-item-info">
                            <div class="cart-item-name">${item.name}</div>
                            <div class="cart-item-price">${formatPrice(
                              item.price
                            )}</div>
                            <div class="quantity-controls">
                                <button class="quantity-btn" onclick="updateQuantity(${
                                  item.id
                                }, ${parseInt(item.quantity) - 1})">-</button>
                                <input type="number" class="quantity-input" value="${
                                  item.quantity
                                }" min="1" 
                                       onchange="updateQuantity(${
                                         item.id
                                       }, parseInt(this.value))">
                                <button class="quantity-btn" onclick="updateQuantity(${
                                  item.id
                                }, ${parseInt(item.quantity) + 1})">+</button>
                            </div>
                            <div class="cart-item-total">${formatPrice(
                              parseInt(item.price) * parseInt(item.quantity)
                            )}</div>
                        </div>
                        <button class="remove-item-btn" onclick="removeFromCart(${
                          item.id
                        })">Hapus</button>
                    </div>
                `
                  )
                  .join("")}
            </div>
            <div class="cart-summary">
                <h3>Ringkasan Pesanan</h3>
                <div class="cart-total">
                    <span>Total:</span>
                    <span>${formatPrice(totalPrice)}</span>
                </div>
                <button class="checkout-btn" onclick="checkout()">Checkout</button>
            </div>
        `;
  } catch (error) {
    cartContent.innerHTML =
      '<div style="text-align: center; padding: 40px; color: #dc2626;">Error memuat keranjang</div>';
  }
}

// === MODAL FUNCTIONS ===
function showAuthModal() {
  authModal.classList.remove("hidden");
}

function hideAuthModal() {
  authModal.classList.add("hidden");
  // Clear form inputs
  loginUsernameInput.value = "";
  loginPasswordInput.value = "";
  registerPasswordInput.value = "";
  loginErrorMsg.textContent = "";
  registerMessage.textContent = "";
  registerMessage.className = "message-text";
}

async function showCartModal(productId = null) {
  if (productId) {
    await addToCartAction(productId);
  }
  await renderCartModal();
  cartModal.classList.remove("hidden");
}

function hideCartModal() {
  cartModal.classList.add("hidden");
}

// === AUTHENTICATION ===
async function handleRegister() {
  const password = registerPasswordInput.value.trim();
  registerMessage.textContent = "";
  registerMessage.className = "message-text";

  if (password.length < 6) {
    registerMessage.textContent = "Password minimal 6 karakter.";
    registerMessage.className = "message-text error";
    return;
  }

  try {
    const response = await fetch("api/auth.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "register", password }),
    });

    const result = await response.json();

    if (result.success) {
      registerMessage.innerHTML = `Akun berhasil dibuat! ID Anda: <strong>${result.username}</strong>`;
      registerMessage.className = "message-text success";
      registerPasswordInput.value = "";
      showNotification(
        `Akun berhasil dibuat! ID Anda: ${result.username}`,
        "success"
      );
    } else {
      registerMessage.textContent = result.message;
      registerMessage.className = "message-text error";
    }
  } catch (error) {
    registerMessage.textContent = "Error: Tidak dapat terhubung ke server";
    registerMessage.className = "message-text error";
  }
}

async function handleLogin() {
  const username = loginUsernameInput.value.trim();
  const password = loginPasswordInput.value.trim();
  loginErrorMsg.textContent = "";

  if (!username || !password) {
    loginErrorMsg.textContent = "Username dan password harus diisi";
    return;
  }

  try {
    const response = await fetch("api/auth.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "login", username, password }),
    });

    const result = await response.json();

    if (result.success) {
      showNotification("Login berhasil!", "success");
      hideAuthModal();
      setTimeout(() => {
        location.reload();
      }, 1000);
    } else {
      loginErrorMsg.textContent = result.message;
    }
  } catch (error) {
    loginErrorMsg.textContent = "Error: Tidak dapat terhubung ke server";
  }
}

async function handleLogout() {
  try {
    await fetch("api/auth.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });

    showNotification("Logout berhasil!", "success");
    setTimeout(() => {
      location.reload();
    }, 1000);
  } catch (error) {
    console.error("Logout error:", error);
    location.reload();
  }
}

// === PRODUCT MANAGEMENT ===
async function handleAddProduct() {
  const nama = inputNama.value.trim();
  const harga = inputHarga.value.trim();
  const kategori = inputKategori.value;
  const file = inputGambar.files[0];
  const editingId = editingProductId.value;

  if (!nama || !harga || (!file && !editingId)) {
    showNotification("Semua kolom harus diisi!", "error");
    return;
  }

  if (isNaN(harga) || parseInt(harga) <= 0) {
    showNotification("Harga harus berupa angka yang valid!", "error");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("name", nama);
    formData.append("price", harga);
    formData.append("category", kategori);
    if (file) formData.append("image", file);
    if (editingId) formData.append("id", editingId);

    const response = await fetch("api/products.php", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (result.success) {
      // Clear form
      inputNama.value = "";
      inputHarga.value = "";
      inputKategori.value = "apparel";
      inputGambar.value = "";
      imagePreviewImg.src = "";
      imagePreviewImg.classList.remove("active");
      if (imagePreviewText) imagePreviewText.style.display = "block";
      editingProductId.value = "";
      tombolTambah.textContent = "Tambahkan Produk";

      // Refresh displays
      if (currentAdminTab === "manage-products") renderProductsTable();
      if (currentPage === "new-arrivals") renderNewArrivals();
      else if (currentPage === "apparel" || currentPage === "accessories")
        renderCatalog(currentPage);

      showNotification(
        result.message ||
          (editingId
            ? "Produk berhasil diupdate!"
            : "Produk berhasil ditambahkan!"),
        "success"
      );
    } else {
      showNotification(result.message || "Gagal menyimpan produk", "error");
    }
  } catch (error) {
    console.error("Add product error:", error);
    showNotification("Error: Tidak dapat terhubung ke server", "error");
  }
}

async function editProduct(productId) {
  try {
    const response = await fetch(`api/products.php?id=${productId}`);
    const product = await response.json();

    if (product && product.id) {
      inputNama.value = product.name;
      inputHarga.value = product.price;
      inputKategori.value = product.category;
      imagePreviewImg.src = product.image;
      imagePreviewImg.classList.add("active");
      if (imagePreviewText) imagePreviewText.style.display = "none";
      editingProductId.value = productId;
      tombolTambah.textContent = "Update Produk";
      showAdminTab("add-product");
      showNotification("Data produk dimuat untuk diedit", "info");
    } else {
      showNotification("Produk tidak ditemukan", "error");
    }
  } catch (error) {
    console.error("Edit product error:", error);
    showNotification("Error memuat data produk", "error");
  }
}

async function deleteProduct(productId) {
  if (!confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
    return;
  }

  try {
    const response = await fetch("api/products.php", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: productId }),
    });

    const result = await response.json();

    if (result.success) {
      renderProductsTable();
      if (currentPage === "new-arrivals") renderNewArrivals();
      else if (currentPage === "apparel" || currentPage === "accessories")
        renderCatalog(currentPage);
      showNotification("Produk berhasil dihapus!", "success");
    } else {
      showNotification("Gagal menghapus produk", "error");
    }
  } catch (error) {
    console.error("Delete product error:", error);
    showNotification("Error: Tidak dapat menghapus produk", "error");
  }
}

// === CART FUNCTIONS ===
async function addToCartAction(productId) {
  try {
    const response = await fetch("api/cart.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: productId }),
    });

    const result = await response.json();

    if (result.success) {
      await updateCartCount();
      showNotification(result.message, "success");
      return true;
    } else {
      showNotification(result.message, "error");
      if (result.message.includes("login")) {
        setTimeout(() => showAuthModal(), 1000);
      }
      return false;
    }
  } catch (error) {
    console.error("Add to cart error:", error);
    showNotification("Error menambahkan ke keranjang", "error");
    return false;
  }
}

async function buyNowAction(productId) {
  try {
    const response = await fetch("api/cart.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: productId, buy_now: true }),
    });

    const result = await response.json();

    if (result.success) {
      await updateCartCount();
      showNotification(result.message, "success");
    } else {
      showNotification(result.message, "error");
      if (result.message.includes("login")) {
        setTimeout(() => showAuthModal(), 1000);
      }
    }
  } catch (error) {
    console.error("Buy now error:", error);
    showNotification("Error memproses pembelian", "error");
  }
}

async function updateQuantity(cartId, quantity) {
  quantity = Math.max(1, parseInt(quantity) || 1);

  try {
    const response = await fetch("api/cart.php", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cart_id: cartId, quantity: quantity }),
    });

    const result = await response.json();

    if (result.success) {
      await updateCartCount();
      await renderCartModal();
    } else {
      showNotification("Gagal mengupdate quantity", "error");
    }
  } catch (error) {
    console.error("Update quantity error:", error);
    showNotification("Error mengupdate quantity", "error");
  }
}

async function removeFromCart(cartId) {
  if (!confirm("Hapus produk dari keranjang?")) {
    return;
  }

  try {
    const response = await fetch("api/cart.php", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cart_id: cartId }),
    });

    const result = await response.json();

    if (result.success) {
      await updateCartCount();
      await renderCartModal();
      showNotification("Produk dihapus dari keranjang", "success");
    } else {
      showNotification("Gagal menghapus produk", "error");
    }
  } catch (error) {
    console.error("Remove from cart error:", error);
    showNotification("Error menghapus produk", "error");
  }
}

async function checkout() {
  try {
    const response = await fetch("api/cart.php?action=checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();

    if (result.success) {
      await updateCartCount();
      hideCartModal();
      showNotification(result.message, "success");
    } else {
      showNotification(result.message, "error");
    }
  } catch (error) {
    console.error("Checkout error:", error);
    showNotification("Error memproses checkout", "error");
  }
}

// === EVENT LISTENERS ===
document.addEventListener("DOMContentLoaded", () => {
  // Modal event listeners
  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", hideAuthModal);
  }
  if (closeCartModalBtn) {
    closeCartModalBtn.addEventListener("click", hideCartModal);
  }

  // Click outside modal to close
  authModal?.addEventListener("click", (e) => {
    if (e.target === authModal) hideAuthModal();
  });
  cartModal?.addEventListener("click", (e) => {
    if (e.target === cartModal) hideCartModal();
  });

  // Auth tab switching
  loginTabBtn?.addEventListener("click", () => {
    loginTabBtn.classList.add("active");
    registerTabBtn.classList.remove("active");
    loginForm.classList.remove("hidden");
    registerForm.classList.add("hidden");
  });

  registerTabBtn?.addEventListener("click", () => {
    registerTabBtn.classList.add("active");
    loginTabBtn.classList.remove("active");
    registerForm.classList.remove("hidden");
    loginForm.classList.add("hidden");
  });

  // Auth form submissions
  registerBtn?.addEventListener("click", handleRegister);
  loginBtn?.addEventListener("click", handleLogin);

  // Enter key submissions
  registerPasswordInput?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleRegister();
  });

  loginPasswordInput?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleLogin();
  });

  // Logout button
  document
    .getElementById("logout-btn")
    ?.addEventListener("click", handleLogout);

  // Show login modal button
  document
    .getElementById("show-login-modal-btn")
    ?.addEventListener("click", showAuthModal);

  // Product form submission
  tombolTambah?.addEventListener("click", handleAddProduct);

  // Image preview
  inputGambar?.addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        imagePreviewImg.src = e.target.result;
        imagePreviewImg.classList.add("active");
        if (imagePreviewText) imagePreviewText.style.display = "none";
      };
      reader.readAsDataURL(file);
    } else {
      imagePreviewImg.src = "";
      imagePreviewImg.classList.remove("active");
      if (imagePreviewText) imagePreviewText.style.display = "block";
    }
  });

  // Initialize page
  updateCartCount();
  showPage("home");
});
