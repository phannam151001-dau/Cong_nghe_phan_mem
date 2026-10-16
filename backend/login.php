<?php
session_start();

require_once 'config.php';

$dbReady = true;
$dbError = '';

$message = '';
$messageType = '';
$tenDangNhapInput = '';
$redirectTo = 'index.html';
$ajaxRequest = !empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';
$dbReady = false;
$dbError = '';


function getRoleRedirect($role) {
    switch (strtolower(trim($role))) {
        case 'admin':
            return 'admin.html';
        case 'chusan':
        case 'chu_san':
        case 'owner':
            return 'chusan.html';
        case 'khach_hang':
        case 'customer':
        case 'user':
        default:
            return 'index.html';
    }
}

if ($conn && !$conn->connect_error) {
    $dbReady = true;
} else {
    $dbReady = false;
    $dbError = $conn ? $conn->connect_error : 'Không thể kết nối cơ sở dữ liệu.';
}
if (isset($_POST['redirect_to']) && !empty($_POST['redirect_to'])) {
    $redirectTo = $_POST['redirect_to'];
} elseif (isset($_GET['redirect_to']) && !empty($_GET['redirect_to'])) {
    $redirectTo = $_GET['redirect_to'];
}

if (strpos($redirectTo, 'http://') === 0 || strpos($redirectTo, 'https://') === 0 || strpos($redirectTo, '//') === 0) {
    $redirectTo = 'index.html';
}

if (isset($_SESSION['logged_in']) && $_SESSION['logged_in']) {
    $redirectTo .= (strpos($redirectTo, '?') === false ? '?' : '&') . 'auth=logged-in';
    if ($ajaxRequest) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['success' => true, 'redirectTo' => $redirectTo], JSON_UNESCAPED_UNICODE);
        exit;
    }
    header('Location: ' . $redirectTo);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $tenDangNhapInput = strtolower(trim($_POST['gmail'] ?? ''));
    $matKhau = trim($_POST['mat_khau'] ?? '');

    if ($tenDangNhapInput === '' || $matKhau === '') {
        $message = 'Vui lòng nhập đầy đủ gmail và mật khẩu.';
        $messageType = 'error';
    }
    else {

       $stmt = $conn->prepare(
    'SELECT ma_tk, ho_ten, gmail, mat_khau, so_dien_thoai, vai_tro
     FROM tai_khoan
     WHERE gmail = ?'
);

if ($stmt === false) {
    die("Prepare lỗi: " . $conn->error);
}
        $stmt->bind_param('s', $tenDangNhapInput);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 1) {
            $user = $result->fetch_assoc();
            if ($matKhau === $user['mat_khau']) {
                $_SESSION['logged_in'] = true;
                $_SESSION['user_id'] = $user['ma_tk'];
                $_SESSION['user_name'] = $user['ho_ten'];
                $_SESSION['user_phone'] = $user['so_dien_thoai'] ?? '';
                $_SESSION['user_role'] = $user['vai_tro'];
                $_SESSION['username'] = $user['gmail'];

                $roleRedirect = getRoleRedirect($user['vai_tro']);
                $redirectTo = $roleRedirect;
                $redirectTo .= (strpos($redirectTo, '?') === false ? '?' : '&') . 'auth=logged-in';
                if ($ajaxRequest) {
                    header('Content-Type: application/json; charset=utf-8');
                    echo json_encode(['success' => true, 'redirectTo' => $redirectTo], JSON_UNESCAPED_UNICODE);
                    exit;
                }
                header('Location: ' . $redirectTo);
                exit;
            } else {
                $message = 'Mật khẩu không đúng.';
                $messageType = 'error';
            }
        } else {
            $message = 'Gmail hoặc mật khẩu không đúng.';
            $messageType = 'error';
        }

        $stmt->close();
    }
}

if ($ajaxRequest && !empty($message)) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => false, 'message' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

if (isset($conn) && $conn) {
    $conn->close();
}
?>

