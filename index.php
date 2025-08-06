<?php
session_start();
require_once 'config.php';

// Cek apakah pengguna sudah login
$user = isset($_SESSION['user']) ? $_SESSION['user'] : null;
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GASA Official Store</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <!-- AUTH MODAL -->
    <div id="auth-modal" class="modal-overlay hidden">
        <div class="modal-content">
            <button class="close-modal-btn">&times;</button>
            <div class="modal-tabs">
                <button id="login-tab-btn" class="tab-btn active">Login</button>
                <button id="register-tab-btn" class="tab-btn">Daftar</button>
            </div>
            <div id="login-form" class="auth-form">
                <h2>Selamat Datang Kembali</h2>
                <input type="text" id="login-username" placeholder="Username (e.g., ADM546 atau MEM...)" autocomplete="username">
                <input type="password" id="login-password" placeholder="Password" autocomplete="current-password">
                <button id="login-btn" class="submit-btn">Login</button>
                <p id="login-error" class="error-message"></p>
            </div>
            <div id="register-form" class="auth-form hidden">
                <h2>Buat Akun GASA</h2>
                <p class="info-text">GASA ID unik Anda akan dibuat secara otomatis.</p>
                <input type="password" id="register-password" placeholder="Buat Password Anda" autocomplete="new-password">
                <button id="register-btn" class="submit-btn">Daftar Akun</button>
                <p id="register-message" class="message-text"></p>
            </div>
        </div>
    </div>

    <!-- CART MODAL -->
    <div id="cart-modal" class="modal-overlay hidden">
        <div class="modal-content">
            <button class="close-modal-btn" id="close-cart-modal">&times;</button>
            <h2>Keranjang Belanja</h2>
            <div id="cart-content"></div>
        </div>
    </div>

    <div class="container">
        <header>
            <div class="logo" onclick="showPage('home')">GASA</div>
            <nav>
                <a href="#" onclick="showPage('home')" class="nav-link active">Home</a>
                <a href="#" onclick="showPage('new-arrivals')" class="nav-link">New Arrivals</a>
                <a href="#" onclick="showPage('apparel')" class="nav-link">Apparel</a>
                <a href="#" onclick="showPage('accessories')" class="nav-link">Accessories</a>
            </nav>
            <div class="header-actions">
                <div id="user-actions">
                    <?php if ($user): ?>
                        <div class="user-info">
                            <span><?php echo htmlspecialchars($user['username']); ?></span>
                            <button id="logout-btn" class="logout-btn">Logout</button>
                        </div>
                    <?php else: ?>
                        <button id="show-login-modal-btn" class="auth-btn">Login / Daftar</button>
                    <?php endif; ?>
                </div>
                <div id="cart-container" class="cart-icon-wrapper" onclick="showCartModal()">
                    <span class="cart-count">0</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                </div>
            </div>
        </header>

        <!-- HOME PAGE -->
        <section id="home-page" class="page-section">
            <div class="hero-section">
                <h1 class="hero-title">GASA Official Store</h1>
                <p class="hero-subtitle">Discover premium fashion that defines your style</p>
                <a href="#" onclick="showPage('new-arrivals')" class="hero-btn">Explore Collection</a>
            </div>

            <!-- ADMIN PANEL -->
            <div id="admin-panel" class="admin-panel <?php echo $user && $user['role'] === 'admin' ? '' : 'hidden'; ?>">
                <div class="admin-header">
                    <h2 class="admin-title">Admin Panel</h2>
                </div>
                <div class="admin-tabs">
                    <button class="admin-tab-btn active" onclick="showAdminTab('add-product')">Tambah Produk</button>
                    <button class="admin-tab-btn" onclick="showAdminTab('manage-products')">Kelola Produk</button>
                </div>
                <div id="add-product-tab" class="admin-tab-content">
                    <div class="admin-form-layout">
                        <div class="form-inputs">
                            <div class="input-group">
                                <label for="input-nama">Nama Produk</label>
                                <input type="text" id="input-nama" placeholder="e.g., GASA Essential Hoodie">
                            </div>
                            <div class="input-group">
                                <label for="input-harga">Harga Produk</label>
                                <input type="number" id="input-harga" placeholder="e.g., 350000">
                            </div>
                            <div class="input-group">
                                <label for="input-kategori">Kategori</label>
                                <select id="input-kategori">
                                    <option value="apparel">Apparel</option>
                                    <option value="accessories">Accessories</option>
                                </select>
                            </div>
                            <div class="input-group">
                                <label for="input-gambar">Gambar Produk</label>
                                <label for="input-gambar" class="file-upload-label">
                                    <span>Pilih File Gambar</span>
                                </label>
                                <input type="file" id="input-gambar" accept="image/*" style="display: none">
                            </div>
                        </div>
                        <div class="form-preview">
                            <div id="image-preview-box" class="image-preview-box">
                                <img id="image-preview-img" src="" alt="Image Preview">
                                <span id="image-preview-text">Preview Gambar</span>
                            </div>
                        </div>
                    </div>
                    <button id="tombol-tambah" class="btn-primary" style="width: 100%; margin-top: 16px">Tambahkan Produk</button>
                    <input type="hidden" id="editing-product-id">
                </div>
                <div id="manage-products-tab" class="admin-tab-content hidden">
                    <div id="products-table-container"></div>
                </div>
            </div>
        </section>

        <!-- NEW ARRIVALS PAGE -->
        <section id="new-arrivals-page" class="page-section hidden">
            <div class="section-header">
                <h2 class="section-title">New Arrivals</h2>
                <p class="section-subtitle">Discover our latest collections</p>
            </div>
            <div id="new-arrivals-grid" class="katalog-grid"></div>
        </section>

        <!-- APPAREL PAGE -->
        <section id="apparel-page" class="page-section hidden">
            <div class="section-header">
                <h2 class="section-title">Apparel Collection</h2>
                <p class="section-subtitle">Premium clothing for every occasion</p>
            </div>
            <div id="apparel-grid" class="katalog-grid"></div>
        </section>

        <!-- ACCESSORIES PAGE -->
        <section id="accessories-page" class="page-section hidden">
            <div class="section-header">
                <h2 class="section-title">Accessories</h2>
                <p class="section-subtitle">Complete your look with our premium accessories</p>
            </div>
            <div id="accessories-grid" class="katalog-grid"></div>
        </section>

        <footer>
            <p>&copy; 2025 GASA Official Store. All rights reserved.</p>
        </footer>
    </div>

    <script src="script.js"></script>
</body>
</html>