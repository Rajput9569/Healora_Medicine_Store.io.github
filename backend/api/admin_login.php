<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/admin_auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); echo json_encode(['error'=>'Method not allowed']); exit;
}
$data = read_json_body();
$username = trim((string)($data['username'] ?? ''));
$password = (string)($data['password'] ?? '');
if ($username === '' || $password === '') {
    http_response_code(422); echo json_encode(['error'=>'Enter username and password.']); exit;
}
$stmt = $pdo->prepare("SELECT id, username, password_hash FROM admin_users WHERE username=? LIMIT 1");
$stmt->execute([$username]);
$user = $stmt->fetch();
if (!$user || !password_verify($password, $user['password_hash'])) {
    http_response_code(401); echo json_encode(['error'=>'Invalid username or password.']); exit;
}
$token = bin2hex(random_bytes(32));
$tokenHash = hash('sha256', $token);
$expires = date('Y-m-d H:i:s', time() + 8 * 60 * 60);
$save = $pdo->prepare("INSERT INTO admin_sessions (token_hash, admin_user_id, expires_at) VALUES (?,?,?)");
$save->execute([$tokenHash, $user['id'], $expires]);
echo json_encode(['token'=>$token, 'username'=>$user['username'], 'expires_at'=>$expires]);
