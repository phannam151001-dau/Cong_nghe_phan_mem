<?php
header('Content-Type: application/json; charset=utf-8');

require_once 'config.php';


$conn->query("CREATE TABLE IF NOT EXISTS `dich_vu` (
    `ma_dich_vu` INT AUTO_INCREMENT PRIMARY KEY,
    `ten_dv` VARCHAR(100) NOT NULL,
    `gia` DECIMAL(12,0) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

// Kiểm tra số lượng dịch vụ trong bảng
$countResult = $conn->query("SELECT COUNT(*) as total FROM `dich_vu`");
$countRow = $countResult->fetch_assoc();
$totalServices = $countRow['total'];

error_log("=== dichvu.php: Bảng dich_vu có $totalServices dịch vụ");

// Nếu bảng trống, insert dữ liệu mẫu
if ($totalServices == 0) {
    error_log("=== dichvu.php: Insert dữ liệu mẫu");
    $insertSql = "INSERT INTO `dich_vu` (`ten_dv`, `gia`) VALUES 
    ('Bóng đá chính thức', 150000),
    ('Phục vụ nước uống', 50000),
    ('Áo đồng đội', 200000),
    ('Hướng dẫn viên huấn luyện', 500000),
    ('Chụp ảnh sự kiện', 300000),
    ('Dịch vụ phục vụ cơm chiều', 100000)";
    
    if ($conn->query($insertSql)) {
        error_log("=== dichvu.php: Insert thành công");
    } else {
        error_log("=== dichvu.php: Lỗi INSERT: " . $conn->error);
    }
}

$result = $conn->query('SELECT `ma_dich_vu`, `ten_dv`, `gia` FROM `dich_vu` ORDER BY `ma_dich_vu` ASC');
$services = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $services[] = [
            'id' => (string) $row['ma_dich_vu'],
            'name' => $row['ten_dv'],
            'price' => (int) $row['gia']
        ];
    }
}

error_log("=== dichvu.php: Trả về " . count($services) . " dịch vụ");

$conn->close();
echo json_encode($services, JSON_UNESCAPED_UNICODE);
