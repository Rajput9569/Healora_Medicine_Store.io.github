<?php
require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // DEMO ONLY: add admin authentication and authorization before deployment.
    try {
        $orders = $pdo->query("SELECT * FROM orders ORDER BY created_at DESC LIMIT 100")->fetchAll();
        foreach ($orders as &$order) {
            $stmt = $pdo->prepare("SELECT product_name, quantity, unit_price FROM order_items WHERE order_id = ?");
            $stmt->execute([$order['id']]);
            $order['items'] = $stmt->fetchAll();
        }
        echo json_encode(['orders' => $orders]);
    } catch (Throwable $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Unable to load orders.']);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$data = json_input();
$required = ['customer_name','email','phone','address','city','pincode','items'];
foreach ($required as $field) {
    if (empty($data[$field])) {
        http_response_code(422);
        echo json_encode(['error' => "Please provide $field"]);
        exit;
    }
}
if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode(['error' => 'Please provide a valid email address.']);
    exit;
}
if (!is_array($data['items']) || count($data['items']) === 0) {
    http_response_code(422);
    echo json_encode(['error' => 'Your cart is empty.']);
    exit;
}

try {
    $pdo->beginTransaction();
    $total = 0;
    $validated = [];
    $lookup = $pdo->prepare("SELECT id, name, price, stock, prescription_required FROM products WHERE id = ?");
    foreach ($data['items'] as $item) {
        $id = (int)($item['product_id'] ?? 0);
        $qty = (int)($item['quantity'] ?? 0);
        if ($id < 1 || $qty < 1 || $qty > 20) throw new RuntimeException('Invalid product quantity.');
        $lookup->execute([$id]);
        $product = $lookup->fetch();
        if (!$product || $product['stock'] < $qty) throw new RuntimeException('A product is unavailable or has insufficient stock.');
        if ((int)$product['prescription_required'] === 1) {
            throw new RuntimeException('This demo cannot accept prescription-medicine orders. Please contact a licensed pharmacy for prescription review.');
        }
        $lineTotal = (float)$product['price'] * $qty;
        $total += $lineTotal;
        $validated[] = ['product' => $product, 'quantity' => $qty];
    }

    $insert = $pdo->prepare("INSERT INTO orders (customer_name,email,phone,address,city,pincode,total) VALUES (?,?,?,?,?,?,?)");
    $insert->execute([
        trim($data['customer_name']), trim($data['email']), trim($data['phone']),
        trim($data['address']), trim($data['city']), trim($data['pincode']), $total
    ]);
    $orderId = (int)$pdo->lastInsertId();
    $itemInsert = $pdo->prepare("INSERT INTO order_items (order_id,product_id,product_name,quantity,unit_price) VALUES (?,?,?,?,?)");
    $stockUpdate = $pdo->prepare("UPDATE products SET stock = stock - ? WHERE id = ?");
    foreach ($validated as $entry) {
        $p = $entry['product']; $qty = $entry['quantity'];
        $itemInsert->execute([$orderId, $p['id'], $p['name'], $qty, $p['price']]);
        $stockUpdate->execute([$qty, $p['id']]);
    }
    $pdo->commit();
    http_response_code(201);
    echo json_encode(['message' => 'Demo order placed successfully.', 'order_id' => $orderId, 'total' => number_format($total, 2, '.', '')]);
} catch (RuntimeException $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    http_response_code(422);
    echo json_encode(['error' => $e->getMessage()]);
} catch (Throwable $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['error' => 'Could not place order. Please check the API/database setup.']);
}
