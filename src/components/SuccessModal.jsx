import React from 'react';

const TIME_SLOTS = [
  { id: "06-07", label: "06:00 - 07:00" },
  { id: "07-08", label: "07:00 - 08:00" },
  { id: "08-09", label: "08:00 - 09:00" },
  { id: "09-10", label: "09:00 - 10:00" },
  { id: "10-11", label: "10:00 - 11:00" },
  { id: "14-15", label: "14:00 - 15:00" },
  { id: "15-16", label: "15:00 - 16:00" },
  { id: "16-17", label: "16:00 - 17:00" },
  { id: "17-18", label: "17:00 - 18:00" },
  { id: "18-19", label: "18:00 - 19:00" },
  { id: "19-20", label: "19:00 - 20:00" },
  { id: "20-21", label: "20:00 - 21:00" },
  { id: "21-22", label: "21:00 - 22:00" }
];

export default function SuccessModal({ isOpen, onClose, booking, onViewBookings }) {
  if (!isOpen || !booking) return null;

  const formatDate = (dateStr) => {
    const parts = dateStr.split('-');
    return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr;
  };

  const sortedSlots = [...booking.slots].sort();
  const slotLabels = sortedSlots.map(id => TIME_SLOTS.find(ts => ts.id === id)?.label || id);

  return (
    <div className="modal open" onClick={(e) => e.target.classList.contains('modal') && onClose()}>
      <div className="modal-content success-card glass-card text-center" style={{ maxWidth: '550px', padding: '2.5rem' }}>
        <div className="success-icon-wrapper">
          <i className="fa-solid fa-circle-check success-check-icon"></i>
        </div>
        <h2>Đặt Sân Thành Công!</h2>
        <p>Hệ thống đã xác nhận đơn đặt sân của bạn.</p>

        <div className="ticket-box">
          <div className="ticket-top">
            <h4>VÉ ĐẶT SÂN ĐIỆN TỬ</h4>
            <span className="ticket-code">{booking.id}</span>
          </div>

          <div className="ticket-middle">
            <div className="ticket-info-grid">
              <div>
                <span>SÂN BÓNG</span>
                <p>{booking.pitchName}</p>
              </div>
              <div>
                <span>NGÀY</span>
                <p>{formatDate(booking.date)}</p>
              </div>
              <div>
                <span>GIỜ</span>
                <p>{slotLabels.join(', ')}</p>
              </div>
              <div>
                <span>TÊN KHÁCH</span>
                <p>{booking.customerName}</p>
              </div>
            </div>

            <div className="ticket-qr-section">
              <span className="mock-qr-code"><i className="fa-solid fa-qrcode"></i></span>
              <span className="qr-label">MÃ QUÉT</span>
            </div>
          </div>

          <div className="ticket-bottom">
            <div className="ticket-price-row">
              <span>TỔNG TIỀN</span>
              <h3>{Number(booking.totalPrice).toLocaleString('vi-VN')}đ</h3>
            </div>
          </div>
        </div>

        <div className="success-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            Đóng
          </button>
          <button className="btn btn-primary" onClick={onViewBookings}>
            <i className="fa-solid fa-ticket"></i> Xem vé của tôi
          </button>
        </div>
      </div>
    </div>
  );
}