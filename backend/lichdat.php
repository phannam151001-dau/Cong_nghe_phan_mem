<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

require_once 'config.php';


$sql = "SELECT 
    d.`ma_dat_san`, 
    d.`ma_san`, 
    d.`ten`, 
    d.`sdt`, 
    d.`ghi_chu`, 
    d.`ngay_dat`, 
    d.`khung_gio`, 
    d.`thoi_luong`, 
    d.`gia`, 
    d.`ma_dich_vu`, 
    
    s.`ten_san` AS pitch_name, 
    t.`ma_thanh_toan`, 
    t.`so_tien` AS payment_amount, 
    t.`trang_thai` AS payment_status, 
    t.`ngay_thanh_toan`
FROM `dat_san` d
LEFT JOIN `san` s ON d.`ma_san` = s.`ma_san`
LEFT JOIN (
    SELECT t1.*
    FROM `thanh_toan` t1
    INNER JOIN (
        SELECT `ma_dat_san`, MAX(`ma_thanh_toan`) AS max_payment_id
        FROM `thanh_toan`
        GROUP BY `ma_dat_san`
    ) t2 ON t1.`ma_dat_san` = t2.`ma_dat_san` AND t1.`ma_thanh_toan` = t2.max_payment_id
) t ON d.`ma_dat_san` = t.`ma_dat_san`
ORDER BY d.`ma_dat_san` DESC";

$result = $conn->query($sql);
$bookings = [];
while ($row = $result->fetch_assoc()) {
    $bookings[] = [
        'id' => 'BK' . str_pad($row['ma_dat_san'], 6, '0', STR_PAD_LEFT),
        'pitch_id' => (int) $row['ma_san'],
        'pitch' => $row['pitch_name'] ?? 'Không xác định',
        'customer' => $row['ten'],
        'phone' => $row['sdt'],
        'note' => $row['ghi_chu'],
        'date' => $row['ngay_dat'],
        'slot' => $row['khung_gio'],
        'duration' => (int) $row['thoi_luong'],
        'amount' => (int) $row['gia'],
        'service_id' => $row['ma_dich_vu'],
        
        'payment' => $row['ma_thanh_toan'] ? [
            'id' => 'PM' . str_pad($row['ma_thanh_toan'], 6, '0', STR_PAD_LEFT),
            'amount' => (int) $row['payment_amount'],
            'status' => $row['payment_status'],
            'paid_at' => $row['ngay_thanh_toan']
        ] : null
    ];
}

$conn->close();

echo json_encode(['success' => true, 'bookings' => $bookings], JSON_UNESCAPED_UNICODE);
