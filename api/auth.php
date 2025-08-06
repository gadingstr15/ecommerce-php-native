<?php
header('Content-Type: application/json');
require_once '../config.php';
session_start();

$input = json_decode(file_get_contents('php://input'), true);
$action = $input['action'] ?? '';

switch ($action) {
    case 'register':
        $password = $input['password'] ?? '';
        
        if (strlen($password) < 6) {
            echo json_encode(['success' => false, 'message' => 'Password minimal 6 karakter']);
            exit;
        }
        
        try {
            // Generate unique username
            do {
                $username = 'MEM' . rand(1000, 9999);
                $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
                $stmt->execute([$username]);
            } while ($stmt->fetch());
            
            $hashed_password = password_hash($password, PASSWORD_DEFAULT);
            $stmt = $pdo->prepare("INSERT INTO users (username, password, role) VALUES (?, ?, 'user')");
            
            if ($stmt->execute([$username, $hashed_password])) {
                echo json_encode(['success' => true, 'username' => $username, 'message' => 'Registrasi berhasil']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Gagal mendaftar, coba lagi']);
            }
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
        break;

    case 'login':
        $username = $input['username'] ?? '';
        $password = $input['password'] ?? '';
        
        if (empty($username) || empty($password)) {
            echo json_encode(['success' => false, 'message' => 'Username dan password harus diisi']);
            exit;
        }
        
        // Check for admin login
        if ($username === 'ADM546' && $password === 'admin123') {
            $_SESSION['user'] = [
                'id' => 0, 
                'username' => 'ADM546', 
                'role' => 'admin'
            ];
            echo json_encode(['success' => true, 'message' => 'Login admin berhasil']);
            exit;
        }
        
        try {
            $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
            $stmt->execute([$username]);
            $user = $stmt->fetch();
            
            if ($user && password_verify($password, $user['password'])) {
                $_SESSION['user'] = [
                    'id' => $user['id'], 
                    'username' => $user['username'], 
                    'role' => $user['role']
                ];
                echo json_encode(['success' => true, 'message' => 'Login berhasil']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Username atau password salah']);
            }
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
        break;

    case 'logout':
        session_destroy();
        echo json_encode(['success' => true, 'message' => 'Logout berhasil']);
        break;

    default:
        echo json_encode(['success' => false, 'message' => 'Aksi tidak valid']);
}
?>