<?php
require_once __DIR__ . '/../config.php';

function admin_user_from_token(PDO $pdo): ?array {
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!$header && function_exists('getallheaders')) {
        $headers = getallheaders();
        $header = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    }
    if (!preg_match('/^Bearer\s+([a-f0-9]{64})$/i', trim($header), $m)) return null;
    $hash = hash('sha256', $m[1]);
    $stmt = $pdo->prepare("SELECT u.id, u.username FROM admin_sessions s JOIN admin_users u ON u.id=s.admin_user_id WHERE s.token_hash=? AND s.expires_at > NOW() LIMIT 1");
    $stmt->execute([$hash]);
    $user = $stmt->fetch();
    return $user ?: null;
}
function require_admin(PDO $pdo): array {
    $user = admin_user_from_token($pdo);
    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Admin sign-in required. Please sign in again.']);
        exit;
    }
    return $user;
}
function read_json_body(): array {
    $data = json_decode(file_get_contents('php://input'), true);
    return is_array($data) ? $data : [];
}
