<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

require_once 'config.php';

// Handle POST requests to update payment status
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
    if (!is_array($body)) {
        echo json_encode(['success' => false, 'message' => 'Dữ liệu không hợp lệ.'], JSON_UNESCAPED_UNICODE);
        $conn->close();
        exit;
    }

    $paymentId = null;
    if (!empty($body['payment_id'])) {
        $paymentId = (int) $body['payment_id'];
    } elseif (!empty($body['id'])) {
        // accept form like "PM000001"
        $digits = preg_replace('/[^0-9]/', '', $body['id']);
        $paymentId = $digits ? (int) $digits : null;
    }

    if (!$paymentId) {
        echo json_encode(['success' => false, 'message' => 'payment_id chưa được cung cấp.'], JSON_UNESCAPED_UNICODE);
        $conn->close();
        exit;
    }

    $newStatus = 'da_thanh_toan';
    $stmt = $conn->prepare('UPDATE `thanh_toan` SET `trang_thai` = ?, `ngay_thanh_toan` = NOW() WHERE `ma_thanh_toan` = ?');
    $stmt->bind_param('si', $newStatus, $paymentId);
    if ($stmt->execute()) {
        // return updated payment info
        $q = $conn->prepare("SELECT t.`ma_thanh_toan`, t.`ma_dat_san`, t.`so_tien`, t.`trang_thai`, t.`ngay_thanh_toan`, d.`ten` AS customer, d.`sdt` AS phone, s.`ten_san` AS pitch_name
            FROM `thanh_toan` t
            LEFT JOIN `dat_san` d ON t.`ma_dat_san` = d.`ma_dat_san`
            LEFT JOIN `san` s ON d.`ma_san` = s.`ma_san`
            WHERE t.`ma_thanh_toan` = ? LIMIT 1");
        $q->bind_param('i', $paymentId);
        $q->execute();
        $res = $q->get_result();
        $row = $res->fetch_assoc();
        if ($row) {
            $payment = [
                'id' => 'PM' . str_pad($row['ma_thanh_toan'], 6, '0', STR_PAD_LEFT),
                'payment_id' => (int) $row['ma_thanh_toan'],
                'booking' => 'BK' . str_pad($row['ma_dat_san'], 6, '0', STR_PAD_LEFT),
                'customer' => $row['customer'],
                'phone' => $row['phone'],
                'pitch' => $row['pitch_name'] ?? '',
                'amount' => (int) $row['so_tien'],
                'status' => $row['trang_thai'],
                'paid_at' => $row['ngay_thanh_toan']
            ];
            echo json_encode(['success' => true, 'payment' => $payment], JSON_UNESCAPED_UNICODE);
        } else {
            echo json_encode(['success' => false, 'message' => 'Không tìm thấy thanh toán.'], JSON_UNESCAPED_UNICODE);
        }
        $q->close();
    } else {
        echo json_encode(['success' => false, 'message' => 'Cập nhật thất bại.'], JSON_UNESCAPED_UNICODE);
    }
    $stmt->close();
    $conn->close();
    exit;
}

$sql = "SELECT 
    t.`ma_thanh_toan`,
    t.`ma_dat_san`,
    t.`so_tien`,
    t.`trang_thai`,
    t.`ngay_thanh_toan`,
    d.`ten` AS customer,
    d.`sdt` AS phone,
    d.`ma_san`,
    s.`ten_san` AS pitch_name
FROM `thanh_toan` t
LEFT JOIN `dat_san` d ON t.`ma_dat_san` = d.`ma_dat_san`
LEFT JOIN `san` s ON d.`ma_san` = s.`ma_san`
ORDER BY t.`ma_thanh_toan` DESC";

$result = $conn->query($sql);
$payments = [];
while ($row = $result->fetch_assoc()) {
    $payments[] = [
        'id' => 'PM' . str_pad($row['ma_thanh_toan'], 6, '0', STR_PAD_LEFT),
        'booking_id' => 'BK' . str_pad($row['ma_dat_san'], 6, '0', STR_PAD_LEFT),
        'booking' => 'BK' . str_pad($row['ma_dat_san'], 6, '0', STR_PAD_LEFT),
        'customer' => $row['customer'],
        'phone' => $row['phone'],
        'pitch' => $row['pitch_name'] ?? 'Không xác định',
        'amount' => (int) $row['so_tien'],
        'status' => $row['trang_thai'],
        'paid_at' => $row['ngay_thanh_toan']
    ];
}

$conn->close();

echo json_encode(['success' => true, 'payments' => $payments], JSON_UNESCAPED_UNICODE);
