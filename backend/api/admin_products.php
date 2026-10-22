<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/admin_auth.php';
require_admin($pdo);
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
  $q = trim((string)($_GET['q'] ?? ''));
  $stmt = $pdo->prepare("SELECT id,name,category,description,price,image_url,prescription_required,stock,created_at FROM products WHERE name LIKE ? OR category LIKE ? ORDER BY id DESC");
  $like = '%' . $q . '%'; $stmt->execute([$like,$like]);
  echo json_encode(['products'=>$stmt->fetchAll()]); exit;
}
if ($method === 'POST') {
  $d = read_json_body();
  $name = trim((string)($d['name'] ?? '')); $category = trim((string)($d['category'] ?? ''));
  $description = trim((string)($d['description'] ?? '')); $price = filter_var($d['price'] ?? null, FILTER_VALIDATE_FLOAT);
  $image = trim((string)($d['image_url'] ?? '')); $stock = filter_var($d['stock'] ?? null, FILTER_VALIDATE_INT);
  $rx = !empty($d['prescription_required']) ? 1 : 0;
  if ($name==='' || $category==='' || $price===false || $price<0 || $stock===false || $stock<0) {
    http_response_code(422); echo json_encode(['error'=>'Name, category, valid price and non-negative stock are required.']); exit;
  }
  $stmt=$pdo->prepare("INSERT INTO products (name,category,description,price,image_url,prescription_required,stock) VALUES (?,?,?,?,?,?,?)");
  $stmt->execute([$name,$category,$description,$price,$image,$rx,$stock]);
  http_response_code(201); echo json_encode(['message'=>'Product created.','id'=>(int)$pdo->lastInsertId()]); exit;
}
if ($method === 'PUT') {
  $d = read_json_body(); $id=(int)($d['id'] ?? 0);
  $name=trim((string)($d['name'] ?? '')); $category=trim((string)($d['category'] ?? ''));
  $description=trim((string)($d['description'] ?? '')); $price=filter_var($d['price'] ?? null,FILTER_VALIDATE_FLOAT);
  $image=trim((string)($d['image_url'] ?? '')); $stock=filter_var($d['stock'] ?? null,FILTER_VALIDATE_INT);
  $rx=!empty($d['prescription_required'])?1:0;
  if ($id<1 || $name==='' || $category==='' || $price===false || $price<0 || $stock===false || $stock<0) {
    http_response_code(422); echo json_encode(['error'=>'Product ID, name, category, valid price and non-negative stock are required.']); exit;
  }
  $stmt=$pdo->prepare("UPDATE products SET name=?,category=?,description=?,price=?,image_url=?,prescription_required=?,stock=? WHERE id=?");
  $stmt->execute([$name,$category,$description,$price,$image,$rx,$stock,$id]);
  echo json_encode(['message'=>'Product updated.']); exit;
}
if ($method === 'DELETE') {
  $d = read_json_body(); $id=(int)($d['id'] ?? 0);
  if ($id<1) { http_response_code(422); echo json_encode(['error'=>'Valid product ID required.']); exit; }
  try {
    $stmt=$pdo->prepare("DELETE FROM products WHERE id=?"); $stmt->execute([$id]);
    echo json_encode(['message'=>'Product deleted.']);
  } catch (PDOException $e) {
    http_response_code(409); echo json_encode(['error'=>'This product is attached to an order and cannot be deleted. Set its stock to 0 instead.']);
  }
  exit;
}
header('Allow: GET, POST, PUT, DELETE'); http_response_code(405); echo json_encode(['error'=>'Method not allowed']);
