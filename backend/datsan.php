<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

require_once 'config.php';


$raw = file_get_contents("php://input");
$data = json_decode($raw, true);

if (!$data) {
    $data = $_POST;
}
$maSan = isset($data['pitch_id']) ? (int) $data['pitch_id'] : 0;
$ten = trim($data['ten'] ?? '');
$sdt = trim($data['sdt'] ?? '');
$ghiChu = trim($data['ghi_chu'] ?? '');
$ngayDat = trim($data['ngay_dat'] ?? '');
$khungGio = trim($data['khung_gio'] ?? '');
$thoiLuong = isset($data['thoi_luong']) ? (int) $data['thoi_luong'] : 60;
$gia = isset($data['gia']) ? (int) $data['gia'] : 0;
$maDichVu = trim($data['ma_dich_vu'] ?? '');

if ($maSan <= 0 || $ten === '' || $sdt === '' || $ngayDat === '') {
    echo json_encode(['success' => false, 'message' => 'Thiếu thông tin đặt sân.'], JSON_UNESCAPED_UNICODE);
    $conn->close();
    exit;
}

if ($maDichVu === '') {
    $maDichVu = '';
}

$stmt = $conn->prepare('INSERT INTO `dat_san` (`ma_san`, `ten`, `sdt`, `ghi_chu`, `ngay_dat`, `khung_gio`, `thoi_luong`, `gia`, `ma_dich_vu`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
$stmt->bind_param('isssssiis', $maSan, $ten, $sdt, $ghiChu, $ngayDat, $khungGio, $thoiLuong, $gia, $maDichVu);

if (!$stmt->execute()) {
    echo json_encode(['success' => false, 'message' => 'Không thể lưu đặt sân vào cơ sở dữ liệu.'], JSON_UNESCAPED_UNICODE);
    $stmt->close();
    $conn->close();
    exit;
}

$bookingId = $stmt->insert_id;
$stmt->close();

$paymentStmt = $conn->prepare('INSERT INTO `thanh_toan` (`ma_dat_san`, `so_tien`, `trang_thai`) VALUES (?, ?, ?)');
$paymentStatus = 'chua_thanh_toan';
$paymentStmt->bind_param('iis', $bookingId, $gia, $paymentStatus);
$paymentStmt->execute();
$paymentStmt->close();

$conn->close();

echo json_encode([
    'success' => true,
    'message' => 'Đặt sân thành công.',
    'booking_id' => $bookingId
], JSON_UNESCAPED_UNICODE);
