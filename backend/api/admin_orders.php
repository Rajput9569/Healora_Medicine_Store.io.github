<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/admin_auth.php';
require_admin($pdo);
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  $q=trim((string)($_GET['q'] ?? ''));
  $stmt=$pdo->prepare("SELECT * FROM orders WHERE customer_name LIKE ? OR email LIKE ? OR CAST(id AS CHAR) LIKE ? ORDER BY created_at DESC LIMIT 300");
  $like='%'.$q.'%'; $stmt->execute([$like,$like,$like]); $orders=$stmt->fetchAll();
  $items=$pdo->prepare("SELECT product_name,quantity,unit_price FROM order_items WHERE order_id=?");
  foreach($orders as &$o){$items->execute([$o['id']]);$o['items']=$items->fetchAll();}
  echo json_encode(['orders'=>$orders]); exit;
}
if ($_SERVER['REQUEST_METHOD'] === 'PATCH' || $_SERVER['REQUEST_METHOD'] === 'POST') {
  $d=read_json_body(); $id=(int)($d['id'] ?? 0); $status=(string)($d['status'] ?? '');
  $allowed=['Pending','Confirmed','Packed','Delivered','Cancelled'];
  if($id<1 || !in_array($status,$allowed,true)){http_response_code(422);echo json_encode(['error'=>'Valid order ID and status are required.']);exit;}
  $stmt=$pdo->prepare("UPDATE orders SET status=? WHERE id=?");$stmt->execute([$status,$id]);
  echo json_encode(['message'=>'Order status updated.']);exit;
}
header('Allow: GET, PATCH, POST');http_response_code(405);echo json_encode(['error'=>'Method not allowed']);
