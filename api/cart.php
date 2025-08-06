<?php
header('Content-Type: application/json');
require_once '../config.php';
session_start();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    if (!isset($_SESSION['user'])) {
        echo json_encode([]);
        exit;
    }
    
    $user_id = $_SESSION['user']['id'];
    
    try {
        $stmt = $pdo->prepare("
            SELECT c.id, c.quantity, p.id as product_id, p.name, p.price, p.image 
            FROM cart c 
            JOIN products p ON c.product_id = p.id 
            WHERE c.user_id = ?
            ORDER BY c.created_at DESC
        ");
        $stmt->execute([$user_id]);
        $cart_items = $stmt->fetchAll();
        
        echo json_encode($cart_items);
    } catch (PDOException $e) {
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
} elseif ($method === 'POST') {
    if (!isset($_SESSION['user'])) {
        echo json_encode(['success' => false, 'message' => 'Anda harus login terlebih dahulu']);
        exit;
    }
    
    $user_id = $_SESSION['user']['id'];
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Handle checkout
    if (isset($_GET['action']) && $_GET['action'] === 'checkout') {
        try {
            // Get cart total
            $stmt = $pdo->prepare("
                SELECT SUM(c.quantity * p.price) as total 
                FROM cart c 
                JOIN products p ON c.product_id = p.id 
                WHERE c.user_id = ?
            ");
            $stmt->execute([$user_id]);
            $result = $stmt->fetch();
            $total = $result['total'] ?? 0;
            
            if ($total <= 0) {
                echo json_encode(['success' => false, 'message' => 'Keranjang kosong']);
                exit;
            }
            
            // Create order
            $stmt = $pdo->prepare("INSERT INTO orders (user_id, total, status) VALUES (?, ?, 'completed')");
            $stmt->execute([$user_id, $total]);
            $order_id = $pdo->lastInsertId();
            
            // Create order details
            $stmt = $pdo->prepare("
                INSERT INTO order_details (order_id, product_id, quantity, price) 
                SELECT ?, c.product_id, c.quantity, p.price 
                FROM cart c 
                JOIN products p ON c.product_id = p.id 
                WHERE c.user_id = ?
            ");
            $stmt->execute([$order_id, $user_id]);
            
            // Clear cart
            $stmt = $pdo->prepare("DELETE FROM cart WHERE user_id = ?");
            $stmt->execute([$user_id]);
            
            echo json_encode(['success' => true, 'message' => 'Terima kasih! Pembelian Anda berhasil diproses.']);
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
        exit;
    }
    
    // Handle add to cart or buy now
    $product_id = $input['product_id'] ?? '';
    $buy_now = $input['buy_now'] ?? false;
    
    if (!$product_id) {
        echo json_encode(['success' => false, 'message' => 'Product ID diperlukan']);
        exit;
    }
    
    try {
        // Check if product exists
        $stmt = $pdo->prepare("SELECT * FROM products WHERE id = ?");
        $stmt->execute([$product_id]);
        $product = $stmt->fetch();
        
        if (!$product) {
            echo json_encode(['success' => false, 'message' => 'Produk tidak ditemukan']);
            exit;
        }
        
        // Check if item already in cart
        $stmt = $pdo->prepare("SELECT * FROM cart WHERE user_id = ? AND product_id = ?");
        $stmt->execute([$user_id, $product_id]);
        $existing_item = $stmt->fetch();
        
        if ($existing_item) {
            // Update quantity
            $stmt = $pdo->prepare("UPDATE cart SET quantity = quantity + 1 WHERE user_id = ? AND product_id = ?");
            $stmt->execute([$user_id, $product_id]);
        } else {
            // Add new item
            $stmt = $pdo->prepare("INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, 1)");
            $stmt->execute([$user_id, $product_id]);
        }
        
        if ($buy_now) {
            // Process immediate purchase
            $stmt = $pdo->prepare("
                SELECT SUM(c.quantity * p.price) as total 
                FROM cart c 
                JOIN products p ON c.product_id = p.id 
                WHERE c.user_id = ?
            ");
            $stmt->execute([$user_id]);
            $result = $stmt->fetch();
            $total = $result['total'] ?? 0;
            
            // Create order
            $stmt = $pdo->prepare("INSERT INTO orders (user_id, total, status) VALUES (?, ?, 'completed')");
            $stmt->execute([$user_id, $total]);
            $order_id = $pdo->lastInsertId();
            
            // Create order details
            $stmt = $pdo->prepare("
                INSERT INTO order_details (order_id, product_id, quantity, price) 
                SELECT ?, c.product_id, c.quantity, p.price 
                FROM cart c 
                JOIN products p ON c.product_id = p.id 
                WHERE c.user_id = ?
            ");
            $stmt->execute([$order_id, $user_id]);
            
            // Clear cart
            $stmt = $pdo->prepare("DELETE FROM cart WHERE user_id = ?");
            $stmt->execute([$user_id]);
            
            echo json_encode(['success' => true, 'message' => "Terima kasih! Pembelian {$product['name']} berhasil diproses."]);
        } else {
            echo json_encode(['success' => true, 'message' => "{$product['name']} berhasil ditambahkan ke keranjang"]);
        }
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
} elseif ($method === 'PUT') {
    if (!isset($_SESSION['user'])) {
        echo json_encode(['success' => false, 'message' => 'Anda harus login']);
        exit;
    }
    
    $user_id = $_SESSION['user']['id'];
    $input = json_decode(file_get_contents('php://input'), true);
    $cart_id = $input['cart_id'] ?? '';
    $quantity = max(1, intval($input['quantity'] ?? 1));
    
    try {
        $stmt = $pdo->prepare("UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?");
        $success = $stmt->execute([$quantity, $cart_id, $user_id]);
        echo json_encode(['success' => $success]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
} elseif ($method === 'DELETE') {
    if (!isset($_SESSION['user'])) {
        echo json_encode(['success' => false, 'message' => 'Anda harus login']);
        exit;
    }
    
    $user_id = $_SESSION['user']['id'];
    $input = json_decode(file_get_contents('php://input'), true);
    $cart_id = $input['cart_id'] ?? '';
    
    try {
        $stmt = $pdo->prepare("DELETE FROM cart WHERE id = ? AND user_id = ?");
        $success = $stmt->execute([$cart_id, $user_id]);
        echo json_encode(['success' => $success]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
}
?>