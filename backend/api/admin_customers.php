<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/admin_auth.php';
require_admin($pdo);
$q=trim((string)($_GET['q'] ?? ''));
$like='%'.$q.'%';
$stmt=$pdo->prepare("SELECT customer_name,email,phone,MAX(created_at) AS last_order,COUNT(*) AS order_count,SUM(CASE WHEN status <> 'Cancelled' THEN total ELSE 0 END) AS total_spend FROM orders WHERE customer_name LIKE ? OR email LIKE ? OR phone LIKE ? GROUP BY customer_name,email,phone ORDER BY last_order DESC LIMIT 300");
$stmt->execute([$like,$like,$like]);
echo json_encode(['customers'=>$stmt->fetchAll()]);
