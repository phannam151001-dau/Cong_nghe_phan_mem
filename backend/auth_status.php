<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
session_start();

header('Content-Type: application/json; charset=utf-8');

$userPhone = $_SESSION['user_phone'] ?? '';
if (!empty($_SESSION['logged_in']) && !isset($_SESSION['user_phone']) && !empty($_SESSION['user_id'])) {
    require_once 'config.php';
    $stmt = $conn->prepare('SELECT so_dien_thoai FROM tai_khoan WHERE ma_tk = ?');
    if ($stmt === false) {
        error_log('Không thể tải số điện thoại tài khoản: ' . $conn->error);
    } else {
        $userId = (int) $_SESSION['user_id'];
        $stmt->bind_param('i', $userId);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($user = $result->fetch_assoc()) {
            $userPhone = $user['so_dien_thoai'] ?? '';
            $_SESSION['user_phone'] = $userPhone;
        }
        $stmt->close();
    }
    $conn->close();
}

echo json_encode([
    'loggedIn' => !empty($_SESSION['logged_in']),
    'userId' => !empty($_SESSION['user_id']) ? (int) $_SESSION['user_id'] : null,
    'userName' => !empty($_SESSION['user_name']) ? $_SESSION['user_name'] : '',
    'userPhone' => $userPhone,
    'userRole' => !empty($_SESSION['user_role']) ? $_SESSION['user_role'] : 'user'
], JSON_UNESCAPED_UNICODE);
