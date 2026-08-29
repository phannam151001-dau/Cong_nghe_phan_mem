import React, { useState, useEffect } from 'react';

export default function OwnerSection({ showToast, onPitchStatusChanged }) {
  const [pitches, setPitches] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatCurrency = (val) => Number(val || 0).toLocaleString('vi-VN') + 'đ';

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
      showToast('Lỗi kết nối', 'danger');
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayBookings = bookings.filter(b => b.date === todayStr);

  return (
    <section id="owner-section" className="app-section active">
      <div className="section-header">
        <h2><i className="fa-solid fa-building-user text-emerald"></i> Quản Lý Sân</h2>
        <p>Quản lý các sân bóng, theo dõi lịch đặt và doanh thu của bạn.</p>
      </div>

      <div className="admin-stats-grid">
        <div className="admin-stat-card glow-card">
          <div className="card-icon text-emerald"><i className="fa-solid fa-futbol"></i></div>
          <div className="card-info">
            <span className="stat-label">Số sân</span>
            <h2>{pitches.length}</h2>
          </div>
        </div>
        <div className="admin-stat-card glow-card">
          <div className="card-icon text-blue"><i className="fa-solid fa-calendar-check"></i></div>
          <div className="card-info">
            <span className="stat-label">Lịch hôm nay</span>
            <h2>{todayBookings.length}</h2>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem' }}></i>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <div className="admin-panel">
            <h3><i className="fa-solid fa-futbol"></i> Sân của tôi</h3>
            {pitches.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)' }}>Chưa có sân.</p>
            ) : (
              <div style={{ display: 'grid', gap: '0.7rem' }}>
                {pitches.map(pitch => (
                  <div
                    key={pitch.id}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '14px', flexWrap: 'wrap' }}
                  >
                    <div>
                      <strong>{pitch.name}</strong><br />
                      <small style={{ color: 'var(--color-text-muted)' }}>Sân {pitch.type} • {formatCurrency(pitch.price)}</small>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span className="badge" style={pitch.status === 'active'
                        ? { background: 'rgba(16,185,129,0.12)', borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }
                        : { background: 'rgba(245,158,11,0.12)', borderColor: '#f59e0b', color: '#f59e0b' }}>
                        {pitch.status === 'active' ? 'Hoạt động' : 'Bảo trì'}
                      </span>
                      <button
                        className={`btn ${pitch.status === 'active' ? 'btn-secondary' : 'btn-primary'}`}
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                        onClick={() => handleTogglePitch(pitch)}
                      >
                        {pitch.status === 'active' ? 'Đóng' : 'Mở'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="admin-panel">
            <h3><i className="fa-solid fa-calendar-days"></i> Lịch đặt</h3>
            {bookings.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)' }}>Chưa có lịch đặt.</p>
            ) : (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Mã đặt</th>
                      <th>Khách hàng</th>
                      <th>Sân</th>
                      <th>Ngày</th>
                      <th>Tổng tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(b => (
                      <tr key={b.id}>
                        <td><strong>{b.id}</strong></td>
                        <td>{b.customer}</td>
                        <td>{b.pitch}</td>
                        <td>{b.date}</td>
                        <td><strong>{formatCurrency(b.amount)}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}