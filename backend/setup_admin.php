<?php
// Run this file ONCE on your local machine after importing database.sql and upgrade_admin.sql.
// Then delete this file. It will create/reset the local demo admin credentials.
require_once __DIR__ . '/config.php';
$username = 'admin';
$password = 'Healora@123';
$hash = password_hash($password, PASSWORD_DEFAULT);
$stmt = $pdo->prepare("INSERT INTO admin_users (username,password_hash) VALUES (?,?) ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash)");
$stmt->execute([$username,$hash]);
echo "Admin account ready. Username: admin | Password: Healora@123<br>IMPORTANT: Delete setup_admin.php now and change the password before any non-demo use.";
