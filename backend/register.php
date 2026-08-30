<?php
header('Content-Type: application/json; charset=utf-8');

require_once 'config.php';



if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $hoTen = trim($_POST['ho_ten'] ?? '');
    $tenDangNhap = trim($_POST['ten_dang_nhap'] ?? '');
    $soDienThoai = trim($_POST['so_dien_thoai'] ?? '');
    $matKhau = trim($_POST['mat_khau'] ?? '');
    $matKhauConfirm = trim($_POST['mat_khau_confirm'] ?? '');

    // Validation
    if (empty($hoTen)) {
        echo json_encode([
            'success' => false,
            'message' => 'Vui lòng nhập họ và tên.'
        ], JSON_UNESCAPED_UNICODE);
        $conn->close();
        exit;
    }

    if (empty($tenDangNhap)) {
        echo json_encode([
            'success' => false,
            'message' => 'Vui lòng nhập tên đăng nhập.'
        ], JSON_UNESCAPED_UNICODE);
        $conn->close();
        exit;
    }

    if (strlen($tenDangNhap) < 3) {
        echo json_encode([
            'success' => false,
            'message' => 'Tên đăng nhập phải có ít nhất 3 ký tự.'
        ], JSON_UNESCAPED_UNICODE);
        $conn->close();
        exit;
    }

    if (preg_match('/\s/', $tenDangNhap)) {
        echo json_encode([
            'success' => false,
            'message' => 'Tên đăng nhập không được chứa khoảng trắng.'
        ], JSON_UNESCAPED_UNICODE);
        $conn->close();
        exit;
    }

    if (empty($soDienThoai)) {
        echo json_encode([
            'success' => false,
            'message' => 'Vui lòng nhập số điện thoại.'
        ], JSON_UNESCAPED_UNICODE);
        $conn->close();
        exit;
    }

    if (!preg_match('/^0[0-9]{9}$/', $soDienThoai)) {
        echo json_encode([
            'success' => false,
            'message' => 'Số điện thoại không hợp lệ. Vui lòng nhập 10 chữ số bắt đầu bằng 0.'
        ], JSON_UNESCAPED_UNICODE);
        $conn->close();
        exit;
    }

    if (empty($matKhau)) {
        echo json_encode([
            'success' => false,
            'message' => 'Vui lòng nhập mật khẩu.'
        ], JSON_UNESCAPED_UNICODE);
        $conn->close();
        exit;
    }

    if (strlen($matKhau) < 6) {
        echo json_encode([
            'success' => false,
            'message' => 'Mật khẩu phải có ít nhất 6 ký tự.'
        ], JSON_UNESCAPED_UNICODE);
        $conn->close();
        exit;
    }

    if ($matKhau !== $matKhauConfirm) {
        echo json_encode([
            'success' => false,
            'message' => 'Mật khẩu xác nhận không khớp.'
        ], JSON_UNESCAPED_UNICODE);
        $conn->close();
        exit;
    }

    // Kiểm tra tên đăng nhập đã tồn tại chưa
    $stmt = $conn->prepare('SELECT ma_tk FROM tai_khoan WHERE ten_dang_nhap = ?');
    $stmt->bind_param('s', $tenDangNhap);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Tên đăng nhập này đã được sử dụng. Vui lòng chọn tên khác.'
        ], JSON_UNESCAPED_UNICODE);
        $stmt->close();
        $conn->close();
        exit;
    }

    $stmt->close();

    // Ensure tai_khoan table exists
    $conn->query("CREATE TABLE IF NOT EXISTS `tai_khoan` (
        `ma_tk` INT AUTO_INCREMENT PRIMARY KEY,
        `ho_ten` VARCHAR(100) NOT NULL,
        `ten_dang_nhap` VARCHAR(50) NOT NULL UNIQUE,
        `mat_khau` VARCHAR(100) NOT NULL,
        `so_dien_thoai` VARCHAR(20) DEFAULT NULL,
        `vai_tro` VARCHAR(20) NOT NULL DEFAULT 'khach_hang'
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

    // Insert new user
    $stmt = $conn->prepare('INSERT INTO tai_khoan (ho_ten, ten_dang_nhap, mat_khau, so_dien_thoai, vai_tro) VALUES (?, ?, ?, ?, ?)');
    $vaiTro = 'khach_hang';
    $stmt->bind_param('sssss', $hoTen, $tenDangNhap, $matKhau, $soDienThoai, $vaiTro);

    if ($stmt->execute()) {
        error_log("=== register.php: Đăng ký thành công cho: $tenDangNhap");
        echo json_encode([
            'success' => true,
            'message' => 'Đăng ký thành công! Vui lòng đăng nhập.'
        ], JSON_UNESCAPED_UNICODE);
    } else {
        error_log("=== register.php: Lỗi INSERT - " . $stmt->error);
        echo json_encode([
            'success' => false,
            'message' => 'Lỗi đăng ký. Vui lòng thử lại sau.'
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
