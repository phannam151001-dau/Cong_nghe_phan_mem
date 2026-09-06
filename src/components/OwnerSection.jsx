import React, { useState, useEffect } from 'react';
//Khu vực chủ sân-Giao diện quản lý sân bóng của chủ sân, bao gồm quản lý sân, lịch đặt, thanh toán và doanh thu
export default function OwnerSection({ showToast, onPitchStatusChanged }) {
  const [pitches, setPitches] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pitches');
  const [showAddModal, setShowAddModal] = useState(false);
  const [pitchForm, setPitchForm] = useState({
    ten_san: '',
    loai_san: '7',
    gia_san: '',
    dia_chi: '',
    trang_thai: 'hoat_dong'
  });

  const formatCurrency = (val) => Number(val || 0).toLocaleString('vi-VN') + 'đ';

  const getStatusBadge = (status) => {
    const normalized = String(status || '').toLowerCase();
    if (normalized === 'active' || normalized === 'paid' || normalized === 'confirmed' || normalized === 'da_thanh_toan') {
      return <span style={{ display: 'inline-block', padding: '0.3rem 0.6rem', borderRadius: '999px', background: 'rgba(16,185,129,0.2)', color: '#6ee7b7', fontSize: '0.82rem', fontWeight: 700 }}>Đã xác nhận</span>;
    }
    if (normalized === 'maintenance' || normalized === 'pending' || normalized === 'chua_thanh_toan' || normalized === 'unpaid') {
      return <span style={{ display: 'inline-block', padding: '0.3rem 0.6rem', borderRadius: '999px', background: 'rgba(245,158,11,0.2)', color: '#fde68a', fontSize: '0.82rem', fontWeight: 700 }}>Chờ xử lý</span>;
    }
    return <span style={{ display: 'inline-block', padding: '0.3rem 0.6rem', borderRadius: '999px', background: 'rgba(59,130,246,0.2)', color: '#93c5fd', fontSize: '0.82rem', fontWeight: 700 }}>Hoạt động</span>;
  };

  const tabs = [
    { key: 'pitches', label: 'Quản lý sân', icon: 'fa-futbol' },
    { key: 'bookings', label: 'Lịch đặt', icon: 'fa-calendar-days' },
    { key: 'payments', label: 'Quản lý thanh toán', icon: 'fa-money-bill-wave' }
  ];

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/addsan.php', {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });
      const result = await response.json();
      if (result.success) {
        setPitches(Array.isArray(result.pitches) ? result.pitches : []);
        setBookings(Array.isArray(result.bookings) ? result.bookings : []);
        setPayments(Array.isArray(result.payments) ? result.payments : []);
      } else {
        showToast(result.message || 'Lỗi tải dữ liệu', 'danger');
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi kết nối', 'danger');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalRevenue = payments
    .filter((payment) => String(payment.status || '').toLowerCase() === 'paid' || String(payment.status || '').toLowerCase() === 'da_thanh_toan')
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayBookings = bookings.filter((b) => b.date === todayStr);

  const handleTogglePitch = async (pitch) => {
    const newStatus = pitch.status === 'active' ? 'bao_tri' : 'hoat_dong';
    const numericId = parseInt(String(pitch.id).replace('pitch-', ''), 10);

    try {
      const response = await fetch('/dongmosan.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pitch_id: numericId, status: newStatus })
      });
      const result = await response.json();
      if (result.success) {
        showToast('Cập nhật trạng thái sân', 'success');
        await loadData();
        if (onPitchStatusChanged) await onPitchStatusChanged();
      } else {
        showToast(result.message || 'Lỗi cập nhật', 'danger');
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi kết nối', 'danger');
    }
  };

  const handleAddPitch = async (e) => {
    e.preventDefault();

    if (!pitchForm.ten_san.trim() || !pitchForm.gia_san) {
      showToast('Vui lòng nhập tên sân và giá sân.', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('ten_san', pitchForm.ten_san);
    formData.append('loai_san', pitchForm.loai_san);
    formData.append('gia_san', pitchForm.gia_san);
    formData.append('dia_chi', pitchForm.dia_chi || '');
    formData.append('trang_thai', pitchForm.trang_thai || 'hoat_dong');

    try {
      const response = await fetch('/addsan.php', {
        method: 'POST',
        body: formData,
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });
      const result = await response.json();
      if (result.success) {
        setPitchForm({ ten_san: '', loai_san: '7', gia_san: '', dia_chi: '', trang_thai: 'hoat_dong' });
        setShowAddModal(false);
        showToast('Đã thêm sân thành công', 'success');
        await loadData();
        if (onPitchStatusChanged) await onPitchStatusChanged();
      } else {
        showToast(result.message || 'Không thể thêm sân', 'danger');
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi kết nối khi thêm sân', 'danger');
    }
  };

  const handleConfirmPayment = async (payment) => {
    const paymentId = payment.payment_id || payment.id?.replace(/[^0-9]/g, '') || null;
    if (!paymentId) return;

    try {
      const response = await fetch('/thanhtoan.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_id: Number(paymentId) })
      });
      const result = await response.json();
      if (result.success) {
        showToast('Đã xác nhận thanh toán', 'success');
        await loadData();
      } else {
        showToast(result.message || 'Không thể xác nhận thanh toán', 'danger');
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi kết nối thanh toán', 'danger');
    }
  };

  return (
    <section id="owner-section" className="app-section active" style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
      <div className="section-header">
        <h2><i className="fa-solid fa-building-user text-emerald"></i> Bảng điều khiển chủ sân</h2>
        <p>Quản lý sân của mình, theo dõi đặt sân, thanh toán và doanh thu.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        <div style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', padding: '1rem' }}>
          <div style={{ color: 'var(--color-text-muted)' }}>Sân của bạn</div>
          <h3 style={{ margin: '0.3rem 0 0', fontSize: '2rem' }}>{pitches.length}</h3>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', padding: '1rem' }}>
          <div style={{ color: 'var(--color-text-muted)' }}>Lịch đặt hôm nay</div>
          <h3 style={{ margin: '0.3rem 0 0', fontSize: '2rem' }}>{todayBookings.length}</h3>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', padding: '1rem' }}>
          <div style={{ color: 'var(--color-text-muted)' }}>Doanh thu</div>
          <h3 style={{ margin: '0.3rem 0 0', fontSize: '2rem' }}>{formatCurrency(totalRevenue)}</h3>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem' }}></i>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '1.5rem' }}>
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  border: 'none',
                  borderRadius: '999px',
                  padding: '0.65rem 1.1rem',
                  cursor: 'pointer',
                  fontWeight: activeTab === tab.key ? 700 : 400,
                  background: activeTab === tab.key ? 'linear-gradient(135deg, #10b981, #34d399)' : 'rgba(255,255,255,0.08)',
                  color: activeTab === tab.key ? '#052e16' : '#fff',
                  fontSize: '0.9rem'
                }}
              >
                <i className={`fa-solid ${tab.icon}`} style={{ marginRight: '0.4rem' }}></i>
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'pitches' && (
            <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '22px', padding: '1rem', display: 'grid', gap: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <h3 style={{ margin: 0 }}><i className="fa-solid fa-futbol"></i> Quản lý sân của tôi</h3>
                <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                  <i className="fa-solid fa-plus"></i> Thêm sân
                </button>
              </div>
              <div style={{ display: 'grid', gap: '0.7rem' }}>
                {pitches.length === 0 ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '14px' }}>
                    <strong>Không có sân nào thuộc quyền của bạn.</strong>
                  </div>
                ) : (
                  pitches.map((pitch) => (
                    <div key={pitch.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '14px', flexWrap: 'wrap' }}>
                      <div>
                        <strong>{pitch.name}</strong><br />
                        <small style={{ color: 'var(--color-text-muted)' }}>{pitch.type} • {formatCurrency(pitch.price)}</small>
                        {pitch.address ? <><br /><small style={{ color: 'var(--color-text-muted)' }}><i className="fa-solid fa-location-dot"></i> {pitch.address}</small></> : null}
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        {getStatusBadge(pitch.status)}
                        <button className={`btn ${pitch.status === 'active' ? 'btn-secondary' : 'btn-primary'}`} style={{ padding: '0.45rem 0.75rem' }} onClick={() => handleTogglePitch(pitch)}>
                          {pitch.status === 'active' ? 'Đóng' : 'Mở'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '22px', padding: '1rem', display: 'grid', gap: '0.8rem' }}>
              <h3 style={{ margin: 0 }}><i className="fa-solid fa-calendar-days"></i> Quản lý lịch đặt</h3>
              <div style={{ display: 'grid', gap: '0.7rem' }}>
                {bookings.length === 0 ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '14px' }}>
                    <strong>Chưa có lịch đặt nào cho sân của bạn.</strong>
                  </div>
                ) : (
                  bookings.map((booking) => (
                    <div key={booking.id || booking.booking_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '14px', flexWrap: 'wrap' }}>
                      <div>
                        <strong>{booking.id || `BK${String(booking.booking_id || '').padStart(6, '0')}`}</strong><br />
                        <small style={{ color: 'var(--color-text-muted)' }}>{booking.customer || booking.ten} • {booking.pitch || booking.pitch_name} • {booking.slot || booking.khung_gio}</small>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        {getStatusBadge(booking.status)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '22px', padding: '1rem', display: 'grid', gap: '0.8rem' }}>
              <h3 style={{ margin: 0 }}><i className="fa-solid fa-money-bill-wave"></i> Quản lý thanh toán</h3>
              <div style={{ display: 'grid', gap: '0.7rem' }}>
                {payments.length === 0 ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '14px' }}>
                    <strong>Chưa có giao dịch thanh toán nào.</strong>
                  </div>
                ) : (
                  payments.map((payment) => (
                    <div key={payment.id || payment.payment_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '14px', flexWrap: 'wrap' }}>
                      <div>
                        <strong>{payment.id || `PM${String(payment.payment_id || '').padStart(6, '0')}`}</strong><br />
                        <small style={{ color: 'var(--color-text-muted)' }}>{payment.booking || payment.booking_id} • {payment.method || 'Tiền mặt'} • {formatCurrency(payment.amount)}</small>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        {getStatusBadge(payment.status)}
                        <button className={`btn ${String(payment.status || '').toLowerCase() === 'paid' || String(payment.status || '').toLowerCase() === 'da_thanh_toan' ? 'btn-secondary' : 'btn-primary'}`} style={{ padding: '0.45rem 0.75rem' }} onClick={() => handleConfirmPayment(payment)}>
                          {String(payment.status || '').toLowerCase() === 'paid' || String(payment.status || '').toLowerCase() === 'da_thanh_toan' ? 'Đã thanh toán' : 'Xác nhận'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </>
      )}

      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 9999, overflowY: 'auto' }} onClick={(e) => e.target === e.currentTarget && setShowAddModal(false)}>
          <div style={{ width: 'min(100%, 480px)', maxHeight: '90vh', overflowY: 'auto', background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '1.25rem', color: 'white', boxShadow: '0 24px 70px rgba(0,0,0,0.45)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}><i className="fa-solid fa-plus"></i> Thêm sân mới</h3>
              <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <form onSubmit={handleAddPitch} style={{ display: 'grid', gap: '0.8rem' }}>
              <label>
                <span style={{ display: 'block', marginBottom: '0.35rem' }}>Tên sân</span>
                <input type="text" value={pitchForm.ten_san} onChange={(e) => setPitchForm({ ...pitchForm, ten_san: e.target.value })} required style={{ width: '100%', padding: '0.7rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', background: '#0f172a', color: 'white' }} />
              </label>
              <label>
                <span style={{ display: 'block', marginBottom: '0.35rem' }}>Loại sân</span>
                <select value={pitchForm.loai_san} onChange={(e) => setPitchForm({ ...pitchForm, loai_san: e.target.value })} style={{ width: '100%', padding: '0.7rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', background: '#0f172a', color: 'white' }}>
                  <option value="5">Sân 5</option>
                  <option value="7">Sân 7</option>
                  <option value="11">Sân 11</option>
                </select>
              </label>
              <label>
                <span style={{ display: 'block', marginBottom: '0.35rem' }}>Giá sân (đ/giờ)</span>
                <input type="number" min="0" value={pitchForm.gia_san} onChange={(e) => setPitchForm({ ...pitchForm, gia_san: e.target.value })} required style={{ width: '100%', padding: '0.7rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', background: '#0f172a', color: 'white' }} />
              </label>
              <label>
                <span style={{ display: 'block', marginBottom: '0.35rem' }}>Địa chỉ sân</span>
                <input type="text" value={pitchForm.dia_chi} onChange={(e) => setPitchForm({ ...pitchForm, dia_chi: e.target.value })} placeholder="Ví dụ: 123 Nguyễn Văn Linh, Đà Nẵng" style={{ width: '100%', padding: '0.7rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', background: '#0f172a', color: 'white' }} />
              </label>
              <label>
                <span style={{ display: 'block', marginBottom: '0.35rem' }}>Trạng thái</span>
                <select value={pitchForm.trang_thai} onChange={(e) => setPitchForm({ ...pitchForm, trang_thai: e.target.value })} style={{ width: '100%', padding: '0.7rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', background: '#0f172a', color: 'white' }}>
                  <option value="hoat_dong">Hoạt động</option>
                  <option value="bao_tri">Bảo trì</option>
                </select>
              </label>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.7rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Lưu sân</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}