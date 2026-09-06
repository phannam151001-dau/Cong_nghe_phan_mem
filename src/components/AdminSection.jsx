import React, { useState, useEffect } from 'react';
//Khu vực quản trị viên-Giao diện quản trị viên, bao gồm quản lý tài khoản, sân bóng, lịch đặt và thống kê
export default function AdminSection({ pitches, bookings, onTogglePitchStatus, showToast }) {
  const [activeTab, setActiveTab] = useState('accounts');
  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [accountError, setAccountError] = useState('');

  const totalRevenue = bookings.filter(b => b.status === 'confirmed').reduce((sum, b) => sum + Number(b.totalPrice || 0), 0);
  const activePitches = pitches.filter(p => p.status === 'available').length;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayBookings = bookings.filter(b => b.date === todayStr).length;

  const normalizeRoleDisplay = (role) => {
    const normalized = String(role || '').toLowerCase();
    if (normalized === 'admin') return 'Quản trị viên';
    if (normalized === 'chu_san' || normalized === 'chusan' || normalized === 'owner') return 'Chủ sân';
    return 'Khách hàng';
  };

  const loadAccounts = async () => {
    setLoadingAccounts(true);
    setAccountError('');

    try {
      const response = await fetch('/admin.php', {
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        credentials: 'same-origin'
      });

      const text = await response.text();
      let result = { success: false, message: 'Không thể tải danh sách tài khoản.' };

      try {
        result = JSON.parse(text);
      } catch (error) {
        result.message = text || result.message;
      }

      if (response.ok && result.success && Array.isArray(result.accounts)) {
        setAccounts(result.accounts);
      } else {
        setAccounts([]);
        const message = result.message || 'Không thể tải danh sách tài khoản.';
        setAccountError(message);
        showToast(message, 'danger');
      }
    } catch (error) {
      console.error(error);
      setAccounts([]);
      setAccountError('Lỗi kết nối khi tải tài khoản.');
      showToast('Lỗi kết nối khi tải tài khoản.', 'danger');
    } finally {
      setLoadingAccounts(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'accounts') {
      loadAccounts();
    }
  }, [activeTab]);

  const handleTogglePitch = (pitchId, isChecked) => {
    const newStatus = isChecked ? 'available' : 'maintenance';
    onTogglePitchStatus(pitchId, newStatus);
  };

  const handleUpdateRole = async (accountId, nextRole) => {
    if (!accountId || !nextRole) return;

    try {
      const body = new URLSearchParams({
        user_id: String(accountId),
        vai_tro: nextRole
      }).toString();

      const response = await fetch('/vaitro.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body
      });

      const text = await response.text();
      let result = { success: false, message: 'Không nhận được phản hồi từ máy chủ.' };
      try {
        result = JSON.parse(text);
      } catch (error) {
        result.message = text || result.message;
      }

      if (result.success) {
        setAccounts(prev => prev.map(account => account.id === accountId ? { ...account, role: nextRole } : account));
        showToast(result.message || 'Cập nhật quyền thành công.', 'success');
      } else {
        showToast(result.message || 'Không thể cập nhật quyền.', 'danger');
      }
    } catch (error) {
      console.error(error);
      showToast('Lỗi kết nối khi cập nhật quyền.', 'danger');
    }
  };

  const tabs = [
    { key: 'accounts', label: 'Quản lý tài khoản', icon: 'fa-users' },
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

      {activeTab === 'accounts' && (
        <div className="admin-panel" style={{ display: 'block' }}>
          <h3><i className="fa-solid fa-users-gear" style={{ marginRight: '0.5rem' }}></i> Danh sách tài khoản</h3>

          {loadingAccounts ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '1.7rem' }}></i>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '0.8rem', marginTop: '0.8rem' }}>
              {accountError && (
                <div style={{ padding: '1rem', borderRadius: '14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
                  <div style={{ marginBottom: '0.75rem' }}>{accountError}</div>
                  <button
                    type="button"
                    onClick={loadAccounts}
                    style={{ border: 'none', borderRadius: '999px', background: '#10b981', color: '#fff', padding: '0.55rem 0.9rem', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Thử lại
                  </button>
                </div>
              )}

              {!accountError && accounts.length === 0 ? (
                <div style={{ padding: '1rem', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-muted)' }}>
                  Chưa có tài khoản nào.
                </div>
              ) : (
                !accountError && accounts.map(account => {
                  const isAdmin = String(account.role || '').toLowerCase() === 'admin';
                  return (
                    <div
                      key={account.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '0.8rem 1rem',
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '14px',
                        border: '1px solid rgba(255,255,255,0.08)',
                        flexWrap: 'wrap'
                      }}
                    >
                      <div>
                        <strong>{account.name || account.username || `TK-${account.id}`}</strong><br />
                        <small style={{ color: 'var(--color-text-muted)' }}>
                          {account.username || 'No username'} • {normalizeRoleDisplay(account.role)}
                          {account.phone ? ` • ${account.phone}` : ''}
                          {isAdmin ? ' ⚠️ Admin' : ''}
                        </small>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <select
                          value={String(account.role || 'khach_hang').toLowerCase()}
                          disabled={isAdmin}
                          onChange={(event) => handleUpdateRole(account.id, event.target.value)}
                          style={{
                            border: 'none',
                            borderRadius: '999px',
                            padding: '0.45rem 0.75rem',
                            cursor: isAdmin ? 'not-allowed' : 'pointer',
                            background: isAdmin ? '#999' : '#667eea',
                            color: '#fff',
                            minWidth: '160px',
                            fontSize: '0.9rem'
                          }}
                        >
                          <option value="khach_hang">Khách hàng</option>
                          <option value="chu_san">Chủ sân</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}