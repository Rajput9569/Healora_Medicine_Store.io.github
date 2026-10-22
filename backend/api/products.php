<?php
require_once __DIR__ . '/../config.php';
try {
    $sql = "SELECT id, name, category, description, price, image_url, prescription_required, stock FROM products WHERE stock > 0";
    $params = [];
    if (!empty($_GET['category']) && $_GET['category'] !== 'All') {
        $sql .= " AND category = :category";
        $params[':category'] = $_GET['category'];
    }
    if (!empty($_GET['q'])) {
        $sql .= " AND (name LIKE :q OR description LIKE :q OR category LIKE :q)";
        $params[':q'] = '%' . trim($_GET['q']) . '%';
    }
    $sql .= " ORDER BY id DESC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    echo json_encode(['products' => $stmt->fetchAll()]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Unable to load products.']);
}
