<?php
header('Content-Type: application/json');
require_once '../config.php';
session_start();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Anyone can view products
    $category = $_GET['category'] ?? null;
    $id = $_GET['id'] ?? null;
    
    if ($id) {
        $stmt = $pdo->prepare("SELECT * FROM products WHERE id = ?");
        $stmt->execute([$id]);
        $product = $stmt->fetch();
        echo json_encode($product);
    } else {
        $query = "SELECT * FROM products ORDER BY created_at DESC";
        if ($category) {
            $query = "SELECT * FROM products WHERE category = ? ORDER BY created_at DESC";
            $stmt = $pdo->prepare($query);
            $stmt->execute([$category]);
        } else {
            $stmt = $pdo->query($query);
        }
        echo json_encode($stmt->fetchAll());
    }
} elseif ($method === 'POST') {
    // Only admin can add/edit products
    if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
        echo json_encode(['success' => false, 'message' => 'Akses ditolak']);
        exit;
    }
    
    $name = $_POST['name'] ?? '';
    $price = $_POST['price'] ?? '';
    $category = $_POST['category'] ?? '';
    $id = $_POST['id'] ?? null;
    
    if (!$name || !$price || !$category) {
        echo json_encode(['success' => false, 'message' => 'Semua kolom harus diisi']);
        exit;
    }
    
    $image_path = '';
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $image = $_FILES['image'];
        $allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        
        if (!in_array($image['type'], $allowed_types)) {
            echo json_encode(['success' => false, 'message' => 'Format gambar tidak didukung']);
            exit;
        }
        
        $extension = pathinfo($image['name'], PATHINFO_EXTENSION);
        $filename = 'product_' . time() . '_' . rand(1000, 9999) . '.' . $extension;
        $image_path = 'uploads/' . $filename;
        
        if (!move_uploaded_file($image['tmp_name'], '../' . $image_path)) {
            echo json_encode(['success' => false, 'message' => 'Gagal mengupload gambar']);
            exit;
        }
    }
    
    try {
        if ($id) {
            // Update existing product
            if ($image_path) {
                // Get old image to delete
                $stmt = $pdo->prepare("SELECT image FROM products WHERE id = ?");
                $stmt->execute([$id]);
                $old_product = $stmt->fetch();
                if ($old_product && file_exists('../' . $old_product['image'])) {
                    unlink('../' . $old_product['image']);
                }
                
                $stmt = $pdo->prepare("UPDATE products SET name = ?, price = ?, category = ?, image = ? WHERE id = ?");
                $success = $stmt->execute([$name, $price, $category, $image_path, $id]);
            } else {
                $stmt = $pdo->prepare("UPDATE products SET name = ?, price = ?, category = ? WHERE id = ?");
                $success = $stmt->execute([$name, $price, $category, $id]);
            }
        } else {
            // Add new product
            if (!$image_path) {
                echo json_encode(['success' => false, 'message' => 'Gambar diperlukan untuk produk baru']);
                exit;
            }
            
            $product_id = 'GASA' . time();
            $stmt = $pdo->prepare("INSERT INTO products (id, name, price, category, image) VALUES (?, ?, ?, ?, ?)");
            $success = $stmt->execute([$product_id, $name, $price, $category, $image_path]);
        }
        
        echo json_encode(['success' => $success, 'message' => $id ? 'Produk berhasil diupdate' : 'Produk berhasil ditambahkan']);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
} elseif ($method === 'DELETE') {
    // Only admin can delete products
    if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
        echo json_encode(['success' => false, 'message' => 'Akses ditolak']);
        exit;
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $input['id'] ?? '';
    
    try {
        // Get product image to delete
        $stmt = $pdo->prepare("SELECT image FROM products WHERE id = ?");
        $stmt->execute([$id]);
        $product = $stmt->fetch();
        
        // Delete product from database
        $stmt = $pdo->prepare("DELETE FROM products WHERE id = ?");
        $success = $stmt->execute([$id]);
        
        // Delete image file
        if ($success && $product && file_exists('../' . $product['image'])) {
            unlink('../' . $product['image']);
        }
        
        echo json_encode(['success' => $success]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
}
?>