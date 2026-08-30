<?php
header('Content-Type: application/json; charset=utf-8');

require_once 'config.php';






$sql = "SELECT `ma_san`, `ten_san`, `loai_san`, `gia_san`, `trang_thai`, `ma_tk`, `dia_chi` FROM `san` ORDER BY `ma_san` DESC";
$result = $conn->query($sql);

$data = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $status = strtolower(trim($row['trang_thai']));
        $statusValue = $status === 'bao_tri' || $status === 'maintenance' ? 'maintenance' : 'available';

        $data[] = [
            'id' => 'pitch-' . $row['ma_san'],
            'name' => $row['ten_san'],
            'type' => (string) $row['loai_san'],
            'price' => (int) $row['gia_san'],
            'rating' => 4.6,
            'reviewsCount' => rand(50, 200),
            'location' => !empty($row['dia_chi']) ? $row['dia_chi'] : 'Địa điểm cập nhật từ cơ sở dữ liệu',
            'image' => $row['loai_san'] === '11' ? 'assets/images/pitch11.jpg' : ($row['loai_san'] === '7' ? 'assets/images/pitch7.jpg' : 'assets/images/pitch5.jpg'),
            'amenities' => ['Bãi đỗ xe', 'Đèn cao áp', 'Đèn LED', 'Phòng tắm'],
            'status' => $statusValue
        ];
    }
}

error_log("=== ttsan.php: Trả về " . count($data) . " sân");
echo json_encode($data, JSON_UNESCAPED_UNICODE);
$conn->close();
