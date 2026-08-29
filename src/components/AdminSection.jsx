import React, { useState } from 'react';

export default function AdminSection({ pitches, bookings, onTogglePitchStatus, showToast }) {
  const [activeTab, setActiveTab] = useState('overview');

  const totalRevenue = bookings.filter(b => b.status === 'confirmed').reduce((sum, b) => sum + Number(b.totalPrice || 0), 0);
  const activePitches = pitches.filter(p => p.status === 'available').length;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayBookings = bookings.filter(b => b.date === todayStr).length;

  const handleTogglePitch = (pitchId, isChecked) => {
    const newStatus = isChecked ? 'available' : 'maintenance';
    onTogglePitchStatus(pitchId, newStatus);
  };

  const tabs = [
    { key: 'overview', label: 'Tổng quan', icon: 'fa-chart-line' },
    { key: 'pitches', label: 'Quản lý sân', icon: 'fa-futbol' },
    { key: 'bookings', label: 'Lịch đặt', icon: 'fa-calendar-days' },
  ];

  return (
    <section id="admin-section" className="app-section active">
      <div className="section-header">
        <h2><i className="fa-solid fa-user-gear text-emerald"></i> Quản Trị</h2>
        <p>Quản lý sân bóng, lịch đặt và thống kê toàn hệ thống.</p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '1.5rem' }}>
        {tabs.map(tab => (
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
              fontSize: '0.9rem',
            }}
          >
            <i className={`fa-solid ${tab.icon}`} style={{ marginRight: '0.4rem' }}></i>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="admin-stats-grid">
            <div className="admin-stat-card glow-card">
              <div className="card-icon text-emerald"><i className="fa-solid fa-sack-dollar"></i></div>
              <div className="card-info">
                <span className="stat-label">Doanh thu</span>
                <h2>{Number(totalRevenue).toLocaleString('vi-VN')}đ</h2>
              </div>
            </div>
            <div className="admin-stat-card glow-card">
              <div className="card-icon text-blue"><i className="fa-solid fa-calendar-check"></i></div>
              <div className="card-info">
                <span className="stat-label">Lịch hôm nay</span>
                <h2>{todayBookings}</h2>
              </div>
            </div>
            <div className="admin-stat-card glow-card">
              <div className="card-icon text-gold"><i className="fa-solid fa-futbol"></i></div>
              <div className="card-info">
                <span className="stat-label">Sân hoạt động</span>
                <h2>{activePitches}</h2>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'pitches' && (
        <div className="admin-panel">
          <h3>Quản Lý Sân</h3>
          <div className="admin-pitch-list">
            {pitches.map(pitch => {
              const isChecked = pitch.status === 'available';
              return (
                <div className="admin-pitch-item" key={pitch.id}>
                  <div className="admin-pitch-meta">
                    <h4>{pitch.name}</h4>
                    <span className={isChecked ? 'text-emerald' : 'text-danger'}>
                      {isChecked ? 'Hoạt động' : 'Bảo trì'} (Sân {pitch.type})
                    </span>
                  </div>
                  <label className="switch-control">
                    <input type="checkbox" checked={isChecked} onChange={e => handleTogglePitch(pitch.id, e.target.checked)} />
                    <span className="slider"></span>
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'bookings' && (
        <div className="admin-panel table-panel">
          <h3>Danh Sách Lịch Đặt</h3>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mã đặt</th>
                  <th>Khách hàng</th>
                  <th>Sân</th>
                  <th>Ngày</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                      Chưa có lịch đặt
                    </td>
                  </tr>
                ) : (
                  bookings.map(b => (
                    <tr key={b.id}>
                      <td><strong>{b.id}</strong></td>
                      <td>{b.customerName}</td>
                      <td>{b.pitchName}</td>
                      <td>{b.date}</td>
                      <td><strong>{Number(b.totalPrice || 0).toLocaleString('vi-VN')}đ</strong></td>
                      <td>
                        <span className="badge" style={b.status === 'confirmed'
                          ? { background: 'rgba(16,185,129,0.1)', borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }
                          : { background: 'rgba(239,68,68,0.1)', borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}>
                          {b.status === 'confirmed' ? 'Xác nhận' : 'Hủy'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}