<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

require_once 'config.php';




$result = $conn->query('SELECT `ma_tk`, `ho_ten`, `gmail`, `so_dien_thoai`, `vai_tro` FROM `tai_khoan` ORDER BY `ma_tk` DESC');
$accounts = [];
while ($row = $result->fetch_assoc()) {
    $accounts[] = [
        'id' => (int) $row['ma_tk'],
        'name' => $row['ho_ten'],
        'username' => $row['gmail'] ?? '',
        'phone' => $row['so_dien_thoai'],
        'role' => $row['vai_tro'],
        'status' => $row['trang_thai'] ?? 'active'
    ];
}

$conn->close();

echo json_encode(['success' => true, 'accounts' => $accounts], JSON_UNESCAPED_UNICODE);
