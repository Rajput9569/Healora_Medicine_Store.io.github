<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/admin_auth.php';
$user = require_admin($pdo);
$header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
if (preg_match('/^Bearer\s+([a-f0-9]{64})$/i', trim($header), $m)) {
    $stmt = $pdo->prepare("DELETE FROM admin_sessions WHERE token_hash=?");
    $stmt->execute([hash('sha256', $m[1])]);
}
echo json_encode(['message'=>'Signed out.']);
