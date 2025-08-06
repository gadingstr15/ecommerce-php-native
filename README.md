# GASA Official Store - Proyek E-Commerce PHP Native

Selamat datang di repositori GASA Official Store! Ini adalah proyek toko online (e-commerce) sederhana yang saya bangun sebagai proyek pertama menggunakan **PHP Native**. Proyek ini mencakup fitur-fitur dasar dari sebuah situs e-commerce, mulai dari tampilan katalog, otentikasi pengguna, hingga panel admin untuk manajemen produk.

## 🚀 Tentang Proyek
Proyek ini dibuat untuk mempraktikkan dan mendemonstrasikan pemahaman tentang pengembangan web backend dengan PHP tanpa menggunakan framework. Tujuannya adalah membangun aplikasi web dinamis yang terhubung ke database MySQL, mengelola sesi pengguna, dan menangani operasi CRUD (Create, Read, Update, Delete) untuk produk.

## ✨ Fitur Utama
* **Katalog Produk:** Menampilkan produk dalam beberapa kategori (`Apparel` & `Accessories`).
* **Otentikasi Pengguna:** Sistem Login dan Registrasi untuk pelanggan. ID unik dibuat secara otomatis saat registrasi.
* **Keranjang Belanja:** Pengguna dapat menambahkan produk ke keranjang, mengubah kuantitas, dan melakukan checkout.
* **Panel Admin:**
    * Login admin terpisah.
    * Menambah, mengedit, dan menghapus produk.
    * Pratinjau gambar sebelum produk diunggah.
* **Antarmuka Responsif:** Didesain agar dapat diakses dengan baik di perangkat desktop maupun mobile.

## 💻 Teknologi yang Digunakan
* **Backend:** PHP
* **Frontend:** HTML, CSS, JavaScript (Vanilla JS)
* **Database:** MySQL / MariaDB
* **Interaksi Asinkron:** Fetch API (AJAX) untuk interaksi yang mulus tanpa me-reload halaman.

## 🛠️ Cara Instalasi dan Menjalankan Proyek
Untuk menjalankan proyek ini di lingkungan lokal Anda, ikuti langkah-langkah berikut:

1.  **Clone repositori ini:**
    ```bash
    git clone [https://github.com/gadingstr15/ecommerce-php-native.git](https://github.com/gadingstr15/ecommerce-php-native.git)
    ```

2.  **Setup Database:**
    * Buat database baru di MySQL (misalnya dengan phpMyAdmin) dengan nama `gasa_store`.
    * Tabel (`users`, `products`, `cart`, dll.) akan dibuat secara otomatis saat kode pertama kali dijalankan berkat skrip di `config.php`.

3.  **Konfigurasi Koneksi:**
    * Salin file `config.example.php` menjadi file baru bernama `config.php`.
    * Buka `config.php` dan sesuaikan kredensial database (`$username` dan `$password`) dengan pengaturan lokal Anda.

4.  **Jalankan Server:**
    * Letakkan folder proyek di dalam direktori `htdocs` pada instalasi XAMPP/MAMP Anda.
    * Buka web server (Apache) dan MySQL dari panel kontrol XAMPP/MAMP.
    * Akses proyek melalui browser di alamat `http://localhost/nama-folder-proyek`.

---
*Dibuat dengan semangat belajar sebagai proyek PHP native pertama.*
