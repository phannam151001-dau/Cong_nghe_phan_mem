<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

require_once 'config.php';


$userId = (int) $_SESSION['user_id'];
$userName = !empty($_SESSION['user_name']) ? $_SESSION['user_name'] : 'Chủ sân';

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $conn->prepare('SELECT `ma_san`, `ten_san`, `loai_san`, `gia_san`, `trang_thai`, `ma_tk`, `dia_chi` FROM `san` WHERE `ma_tk` = ? ORDER BY `ma_san` DESC');
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $result = $stmt->get_result();

    $pitches = [];
    $pitchIds = [];
    while ($row = $result->fetch_assoc()) {
        $pitches[] = [
            'id' => (int) $row['ma_san'],
            'name' => $row['ten_san'],
            'type' => $row['loai_san'],
            'price' => (int) $row['gia_san'],
            'status' => $row['trang_thai'] === 'bao_tri' ? 'maintenance' : 'active',
            'address' => $row['dia_chi'] ?? '',
            'ownerId' => (int) $row['ma_tk']
        ];
        $pitchIds[] = (int) $row['ma_san'];
    }

    // Fetch bookings for owner's pitches
    $bookings = [];
    if (count($pitchIds) > 0) {
        $placeholders = implode(',', array_fill(0, count($pitchIds), '?'));
        $types = str_repeat('i', count($pitchIds));
        $sql = "SELECT d.`ma_dat_san`, d.`ma_san`, d.`ten`, d.`sdt`, d.`ngay_dat`, d.`khung_gio`, d.`thoi_luong`, d.`gia`,`trang_thai`, s.`ten_san` as pitch_name
                FROM `dat_san` d
                JOIN `san` s ON d.`ma_san` = s.`ma_san`
                WHERE d.`ma_san` IN ($placeholders)
                ORDER BY d.`ma_dat_san` DESC";

        $stmt2 = $conn->prepare($sql);
        // bind params dynamically
        $refs = [];
        $refs[] = &$types;
        foreach ($pitchIds as $i => $id) {
            $refs[] = &$pitchIds[$i];
        }
        call_user_func_array([$stmt2, 'bind_param'], $refs);
        $stmt2->execute();
        $res2 = $stmt2->get_result();
        while ($row = $res2->fetch_assoc()) {
            $bookings[] = [
                'id' => 'BK' . str_pad($row['ma_dat_san'], 6, '0', STR_PAD_LEFT),
                'booking_id' => (int) $row['ma_dat_san'],
                'pitch_id' => (int) $row['ma_san'],
                'pitch' => $row['pitch_name'] ?? '',
                'customer' => $row['ten'],
                'phone' => $row['sdt'],
                'date' => $row['ngay_dat'],
                'slot' => $row['khung_gio'],
                'duration' => (int) $row['thoi_luong'],
                'amount' => (int) $row['gia'],
                'status' => $row['trang_thai']
            ];
        }
        $stmt2->close();
    }

    // Fetch payments related to owner's pitches (via dat_san -> san)
    $payments = [];
    if (count($pitchIds) > 0) {
        $placeholders = implode(',', array_fill(0, count($pitchIds), '?'));
        $types = str_repeat('i', count($pitchIds));
        $sqlp = "SELECT t.`ma_thanh_toan`, t.`ma_dat_san`, t.`so_tien`, t.`trang_thai`, t.`ngay_thanh_toan`, d.`ten` as customer, d.`sdt` as phone, s.`ten_san` as pitch_name
                FROM `thanh_toan` t
                JOIN `dat_san` d ON t.`ma_dat_san` = d.`ma_dat_san`
                JOIN `san` s ON d.`ma_san` = s.`ma_san`
                WHERE d.`ma_san` IN ($placeholders)
                ORDER BY t.`ma_thanh_toan` DESC";

        $stmt3 = $conn->prepare($sqlp);
        $refs = [];
        $refs[] = &$types;
        foreach ($pitchIds as $i => $id) {
            $refs[] = &$pitchIds[$i];
        }
        call_user_func_array([$stmt3, 'bind_param'], $refs);
        $stmt3->execute();
        $res3 = $stmt3->get_result();
        while ($row = $res3->fetch_assoc()) {
            $payments[] = [
                'id' => 'PM' . str_pad($row['ma_thanh_toan'], 6, '0', STR_PAD_LEFT),
                'payment_id' => (int) $row['ma_thanh_toan'],
                'booking_id' => (int) $row['ma_dat_san'],
                'booking' => 'BK' . str_pad($row['ma_dat_san'], 6, '0', STR_PAD_LEFT),
                'customer' => $row['customer'],
                'phone' => $row['phone'],
                'pitch' => $row['pitch_name'] ?? '',
                'amount' => (int) $row['so_tien'],
                'status' => $row['trang_thai'],
                'paid_at' => $row['ngay_thanh_toan']
            ];
        }
        $stmt3->close();
    }

    $stmt->close();
    $conn->close();

    echo json_encode([
        'success' => true,
        'ownerId' => $userId,
        'ownerName' => $userName,
        'pitches' => $pitches,
        'bookings' => $bookings,
        'payments' => $payments
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $tenSan = trim($_POST['ten_san'] ?? '');
    $loaiSan = trim($_POST['loai_san'] ?? '7');
    $giaSan = trim($_POST['gia_san'] ?? '0');
    $trangThai = trim($_POST['trang_thai'] ?? 'hoat_dong');
    $diaChi = trim($_POST['dia_chi'] ?? '');

    if ($tenSan === '' || !is_numeric($giaSan)) {
        echo json_encode(['success' => false, 'message' => 'Vui lòng nhập tên sân và giá sân hợp lệ.'], JSON_UNESCAPED_UNICODE);
        $conn->close();
        exit;
    }

    $giaSanValue = (int) $giaSan;
    $statusValue = $trangThai === 'bao_tri' ? 'bao_tri' : 'hoat_dong';

    $stmt = $conn->prepare('INSERT INTO `san` (`ten_san`, `loai_san`, `gia_san`, `trang_thai`, `ma_tk`, `dia_chi`) VALUES (?, ?, ?, ?, ?, ?)');
    $stmt->bind_param('ssisis', $tenSan, $loaiSan, $giaSanValue, $statusValue, $userId, $diaChi);

    if ($stmt->execute()) {
        $pitchId = $stmt->insert_id;
        echo json_encode([
            'success' => true,
            'message' => 'Đã thêm sân thành công.',
            'pitch' => [
                'id' => $pitchId,
                'name' => $tenSan,
                'type' => $loaiSan,
                'price' => $giaSanValue,
                'status' => $statusValue === 'bao_tri' ? 'maintenance' : 'active',
                'address' => $diaChi,
                'ownerId' => $userId
            ]
        ], JSON_UNESCAPED_UNICODE);
    } else {
        echo json_encode(['success' => false, 'message' => 'Không thể thêm sân. Vui lòng thử lại.'], JSON_UNESCAPED_UNICODE);
    }

    $stmt->close();
    $conn->close();
    exit;
}

$conn->close();
echo json_encode(['success' => false, 'message' => 'Phương thức không được hỗ trợ.'], JSON_UNESCAPED_UNICODE);
