<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

require_once 'config.php';

$result = $conn->query('SELECT `ma_san`, `ten_san`, `loai_san`, `gia_san`, `trang_thai`, `ma_tk`, `dia_chi` FROM `san` ORDER BY `ma_san` DESC');
$pitches = [];
while ($row = $result->fetch_assoc()) {
    $pitches[] = [
        'id' => (int) $row['ma_san'],
        'name' => $row['ten_san'],
        'type' => $row['loai_san'],
        'price' => (int) $row['gia_san'],
        'status' => $row['trang_thai'] === 'bao_tri' ? 'maintenance' : 'active',
        'address' => $row['dia_chi'] ?? '',
        'ownerId' => (int) $row['ma_tk']
    ];
}

$conn->close();

echo json_encode(['success' => true, 'pitches' => $pitches], JSON_UNESCAPED_UNICODE);
