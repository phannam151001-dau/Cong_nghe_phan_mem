<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

// Kiểm tra admin
if (empty($_SESSION['logged_in']) || $_SESSION['user_role'] !== 'admin') {
    echo json_encode([
        'success' => false,
        'message' => 'Bạn không có quyền thực hiện hành động này.'
    ], JSON_UNESCAPED_UNICODE);
    http_response_code(403);
    exit;
}

require_once 'config.php';

function normalizeRole($role) {
    $role = trim((string) $role);

    $map = [
        'chu_san' => 'chu_san',
        'chusan' => 'chu_san',
        'owner' => 'chu_san',
        'khach_hang' => 'khach_hang',
        'user' => 'khach_hang',
        'admin' => 'admin',
    ];

    return $map[$role] ?? 'khach_hang';
}



if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $userId = isset($_POST['user_id']) ? intval($_POST['user_id']) : 0;
    $vaiTroRaw = trim($_POST['vai_tro'] ?? '');

    // Validation
    if ($userId <= 0) {
        echo json_encode([
            'success' => false,
            'message' => 'ID tài khoản không hợp lệ.'
        ], JSON_UNESCAPED_UNICODE);
        $conn->close();
        exit;
    }

    if (empty($vaiTroRaw)) {
        echo json_encode([
            'success' => false,
            'message' => 'Vui lòng chọn vai trò.'
        ], JSON_UNESCAPED_UNICODE);
        $conn->close();
        exit;
    }

    $allowedRoles = ['khach_hang', 'chu_san', 'chusan', 'admin', 'user', 'owner'];
    if (!in_array($vaiTroRaw, $allowedRoles, true)) {
        echo json_encode([
            'success' => false,
            'message' => 'Vai trò không hợp lệ.'
        ], JSON_UNESCAPED_UNICODE);
        $conn->close();
        exit;
    }

    $vaiTroMoi = normalizeRole($vaiTroRaw);

    // Không cho phép admin thay đổi chính mình thành khách hàng
    if ($userId == $_SESSION['user_id'] && $vaiTroMoi !== 'admin') {
        echo json_encode([
            'success' => false,
            'message' => 'Không thể thay đổi vai trò của chính mình.'
        ], JSON_UNESCAPED_UNICODE);
        $conn->close();
        exit;
    }

    // Kiểm tra tài khoản tồn tại
    $stmt = $conn->prepare('SELECT ma_tk, ho_ten, vai_tro FROM tai_khoan WHERE ma_tk = ?');
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Tài khoản không tồn tại.'
        ], JSON_UNESCAPED_UNICODE);
        $stmt->close();
        $conn->close();
        exit;
    }

    $user = $result->fetch_assoc();
    $vaiTroCu = $user['vai_tro'];
    $stmt->close();

    // Ngăn chặn thay đổi vai trò của bất kỳ Admin nào
    if ($vaiTroCu === 'admin') {
        echo json_encode([
            'success' => false,
            'message' => 'Không thể thay đổi vai trò của tài khoản Admin.'
        ], JSON_UNESCAPED_UNICODE);
        $conn->close();
        exit;
    }

    // Update vai trò
    $stmt = $conn->prepare('UPDATE tai_khoan SET vai_tro = ? WHERE ma_tk = ?');
    $stmt->bind_param('si', $vaiTroMoi, $userId);

    if ($stmt->execute()) {
        error_log("=== vaitro.php: Admin {$_SESSION['user_id']} thay đổi vai trò {$user['ho_ten']} từ {$vaiTroCu} thành {$vaiTroMoi}");
        
        // Chuyển vai trò sang tiếng Việt
        $vaiTroVietnamese = [
            'khach_hang' => 'Khách hàng',
            'chu_san' => 'Chủ sân',
            'admin' => 'Quản trị viên'
        ];

        echo json_encode([
            'success' => true,
            'message' => "✓ Cập nhật vai trò thành công: {$vaiTroVietnamese[$vaiTroMoi]}",
            'new_role' => $vaiTroMoi,
            'new_role_display' => $vaiTroVietnamese[$vaiTroMoi]
        ], JSON_UNESCAPED_UNICODE);
    } else {
        error_log("=== vaitro.php: Lỗi UPDATE - " . $stmt->error);
        echo json_encode([
            'success' => false,
            'message' => 'Lỗi cập nhật vai trò. Vui lòng thử lại.'
        ], JSON_UNESCAPED_UNICODE);
    }

    $stmt->close();
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Phương thức request không hợp lệ.'
    ], JSON_UNESCAPED_UNICODE);
}

$conn->close();
?>
