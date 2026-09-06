import React from 'react';
import { useAuth } from '../context/AuthContext';
//Lịch sử đặt sân của tôi-Giao diện hiển thị danh sách các vé đặt sân của người dùng, bao gồm thông tin sân, ngày, giờ, trạng thái và tổng giá
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

export default function MyBookings({ bookings, onCancelBooking, setCurrentSection, onOpenAuthModal }) {
  const { authState } = useAuth();
  const { loggedIn, userId } = authState;

  const userBookings = loggedIn ? bookings.filter(b => b.userId === userId) : [];

  const formatDate = (dateStr) => {
    const parts = dateStr.split('-');
    return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr;
  };

  const handleCancelClick = (bookingId) => {
    if (window.confirm(`Hủy đặt sân ${bookingId}?`)) {
      onCancelBooking(bookingId);
    }
  };

  if (!loggedIn) {
    return (
      <section id="my-bookings-section" className="app-section active">
        <div className="section-header">
          <h2><i className="fa-solid fa-ticket text-emerald"></i> Vé Của Tôi</h2>
        </div>
        <div className="bookings-list">
          <div className="empty-state">
            <i className="fa-solid fa-lock"></i>
            <h3>Vui lòng đăng nhập</h3>
            <p>Đăng nhập để xem vé của bạn.</p>
            <button className="btn btn-primary" onClick={() => onOpenAuthModal('login', 'my-bookings-section')} style={{ marginTop: '1rem' }}>
              Đăng nhập ngay
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="my-bookings-section" className="app-section active">
      <div className="section-header">
        <h2><i className="fa-solid fa-ticket text-emerald"></i> Vé Của Tôi</h2>
      </div>

      <div className="bookings-list">
        {userBookings.length === 0 ? (
          <div className="empty-state">
            <i className="fa-solid fa-ticket"></i>
            <h3>Bạn chưa đặt sân</h3>
            <p>Khám phá danh sách sân cỏ và đặt sân ngay!</p>
            <button className="btn btn-primary" onClick={() => setCurrentSection('home-section')} style={{ marginTop: '1rem' }}>
              Đặt sân ngay
            </button>
          </div>
        ) : (
          userBookings.map((booking) => {
            const sortedSlots = [...booking.slots].sort();
            const slotLabels = sortedSlots.map(id => TIME_SLOTS.find(ts => ts.id === id)?.label || id);

            return (
              <div className="booking-ticket-card" key={booking.id}>
                <div className="booking-card-header">
                  <div className="booking-card-header-left">
                    <span className="ticket-code">{booking.id}</span>
                    <h4>{booking.pitchName}</h4>
                  </div>
                  <span className={`booking-status-tag ${booking.status === 'confirmed' ? 'confirmed' : 'cancelled'}`}>
                    <i className={`fa-solid ${booking.status === 'confirmed' ? 'fa-check-double' : 'fa-xmark'}`}></i>
                    {booking.status === 'confirmed' ? 'Xác nhận' : 'Hủy'}
                  </span>
                </div>

                <div className="booking-ticket-body">
                  <div className="info-item">
                    <span>NGÀY</span>
                    <p>{formatDate(booking.date)}</p>
                  </div>
                  <div className="info-item">
                    <span>GIỜ</span>
                    <p>{slotLabels.join(', ')}</p>
                  </div>
                  <div className="info-item">
                    <span>TÊN</span>
                    <p>{booking.customerName}</p>
                  </div>
                  <div className="info-item">
                    <span>SỐ ĐIỆN THOẠI</span>
                    <p>{booking.customerPhone}</p>
                  </div>
                </div>

                <div className="booking-ticket-footer">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div className="text-right">
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: '600', display: 'block' }}>TỔNG</span>
                      <strong style={{ color: 'var(--color-primary)', fontSize: '1.15rem' }}>
                        {Number(booking.totalPrice).toLocaleString('vi-VN')}đ
                      </strong>
                    </div>
                    {booking.status === 'confirmed' && (
                      <button className="btn btn-danger" onClick={() => handleCancelClick(booking.id)}>
                        Hủy
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}