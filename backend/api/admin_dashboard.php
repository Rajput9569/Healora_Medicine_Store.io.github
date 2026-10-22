<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/admin_auth.php';
require_admin($pdo);
try {
  $products = (int)$pdo->query("SELECT COUNT(*) FROM products")->fetchColumn();
  $lowStock = (int)$pdo->query("SELECT COUNT(*) FROM products WHERE stock <= 5")->fetchColumn();
  $orders = (int)$pdo->query("SELECT COUNT(*) FROM orders")->fetchColumn();
  $pending = (int)$pdo->query("SELECT COUNT(*) FROM orders WHERE status='Pending'")->fetchColumn();
  $customers = (int)$pdo->query("SELECT COUNT(DISTINCT email) FROM orders")->fetchColumn();
  $revenue = (float)$pdo->query("SELECT COALESCE(SUM(total),0) FROM orders WHERE status <> 'Cancelled'")->fetchColumn();
  $recent = $pdo->query("SELECT id,customer_name,email,total,status,created_at FROM orders ORDER BY created_at DESC LIMIT 8")->fetchAll();
  $stock = $pdo->query("SELECT id,name,stock,category FROM products ORDER BY stock ASC LIMIT 6")->fetchAll();
  echo json_encode(['stats'=>['products'=>$products,'low_stock'=>$lowStock,'orders'=>$orders,'pending_orders'=>$pending,'customers'=>$customers,'revenue'=>number_format($revenue,2,'.','')], 'recent_orders'=>$recent, 'low_stock_products'=>$stock]);
} catch (Throwable $e) {
  http_response_code(500); echo json_encode(['error'=>'Dashboard query failed. Ensure backend/upgrade_admin.sql was imported.']);
}
