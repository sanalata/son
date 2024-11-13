<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf8mb4');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$host = 'sql111.infinityfree.com';
$dbname = 'if0_37485236_memkafe';
$username = 'if0_37485236';
$password = 'qNoQQ0JXYmP';

try {
    $db = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db->exec("SET NAMES utf8mb4");
    $db->exec("SET CHARACTER SET utf8mb4");
    $db->exec("SET CHARACTER_SET_CONNECTION=utf8mb4");
} catch(PDOException $e) {
    error_log('Database connection failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit();
}

// Get the request path
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);
$path = trim(str_replace('/db.php', '', $path), '/');
$segments = explode('/', $path);
$endpoint = $segments[0] ?? '';

try {
    switch ($endpoint) {
        case 'auth':
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                $data = json_decode(file_get_contents('php://input'), true);
                $username = $data['username'] ?? '';
                $password = $data['password'] ?? '';

                $stmt = $db->prepare('SELECT * FROM users WHERE username = ? AND password = ?');
                $stmt->execute([$username, $password]);
                $user = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($user) {
                    // Get user's orders
                    $stmt = $db->prepare('SELECT * FROM orders WHERE user_id = ?');
                    $stmt->execute([$user['id']]);
                    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

                    // Get order items for each order
                    foreach ($orders as &$order) {
                        $stmt = $db->prepare('SELECT * FROM order_items WHERE order_id = ?');
                        $stmt->execute([$order['id']]);
                        $order['items'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    }

                    $user['orders'] = $orders;
                    echo json_encode([
                        'success' => true,
                        'user' => [
                            'id' => $user['id'],
                            'username' => $user['username'],
                            'credits' => (int)$user['credits'],
                            'isAdmin' => (bool)$user['is_admin'],
                            'orders' => $orders
                        ]
                    ]);
                } else {
                    echo json_encode(['success' => false]);
                }
            }
            break;

        // ... rest of the endpoints remain the same
    }
} catch (Exception $e) {
    error_log('API Error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error']);
}
?>