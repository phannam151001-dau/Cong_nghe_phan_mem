<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

require_once 'config.php';



$body = file_get_contents('php://input');
$data = json_decode($body, true);

$pitchId = isset($data['pitch_id']) ? (int) $data['pitch_id'] : 0;
$status = isset($data['status']) ? trim($data['status']) : '';

if ($pitchId <= 0 || !in_array($status, ['hoat_dong', 'bao_tri'], true)) {
    echo json_encode(['success' => false, 'message' => 'Dữ liệu trạng thái sân không hợp lệ.'], JSON_UNESCAPED_UNICODE);
    $conn->close();
    exit;
}

$stmt = $conn->prepare('UPDATE `san` SET `trang_thai` = ? WHERE `ma_san` = ?');
$stmt->bind_param('si', $status, $pitchId);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Cập nhật trạng thái sân thành công.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Không thể cập nhật trạng thái sân.']);
}

$stmt->close();
$conn->close();
