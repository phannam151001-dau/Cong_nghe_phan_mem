import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
//Cửa sổ xác thực-Đăng nhập, đăng ký, đăng xuất
export default function AuthModal({ isOpen, onClose, initialMode = 'login', showToast }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState(initialMode);
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [regUser, setRegUser] = useState('');
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regPassConfirm, setRegPassConfirm] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  React.useEffect(() => {
    setMode(initialMode);
    setMessage({ text: '', type: '' });
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    const trimmedLoginUser = loginUser.trim();
    if (!trimmedLoginUser || !loginPass) {
      setMessage({ text: 'Vui lòng nhập gmail và mật khẩu.', type: 'error' });
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(trimmedLoginUser)) {
      setMessage({ text: 'Vui lòng nhập địa chỉ gmail hợp lệ.', type: 'error' });
      return;
    }

    try {
      const data = await login(trimmedLoginUser, loginPass);
      if (data.success) {
        showToast('Đăng nhập thành công!', 'success');
        onClose();
      } else {
        setMessage({ text: data.message || 'Đăng nhập thất bại.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Lỗi kết nối máy chủ.', type: 'error' });
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    const trimmedRegUser = regUser.trim();
    if (!trimmedRegUser || !regName || !regPhone || !regPass || !regPassConfirm) {
      setMessage({ text: 'Vui lòng điền đầy đủ các thông tin.', type: 'error' });
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(trimmedRegUser)) {
      setMessage({ text: 'Vui lòng nhập gmail hợp lệ.', type: 'error' });
      return;
    }

    if (regPass.length < 6) {
      setMessage({ text: 'Mật khẩu phải có ít nhất 6 ký tự.', type: 'error' });
      return;
    }

    if (regPass !== regPassConfirm) {
      setMessage({ text: 'Mật khẩu xác nhận không khớp.', type: 'error' });
      return;
    }

    const formData = new FormData();
    formData.append('ten_dang_nhap', trimmedRegUser);
    formData.append('ho_ten', regName);
    formData.append('so_dien_thoai', regPhone);
    formData.append('mat_khau', regPass);
    formData.append('mat_khau_confirm', regPassConfirm);

    try {
      const data = await register(formData);
      if (data.success) {
        setMessage({ text: '✓ Đăng ký thành công! Chuyển sang Đăng nhập...', type: 'success' });
        showToast('Đăng ký thành công!', 'success');
        setTimeout(() => {
          setMode('login');
          setMessage({ text: '', type: '' });
        }, 1500);
      } else {
        setMessage({ text: data.message || 'Đăng ký thất bại.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Lỗi kết nối máy chủ.', type: 'error' });
    }
  };

  return (
    <div className="auth-modal-backdrop is-open" onClick={(e) => e.target.classList.contains('auth-modal-backdrop') && onClose()}>
      <div className="auth-modal">
        <div className="auth-card auth-card-modal glass-card">
          <button className="auth-modal-close" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>

          <h2>{mode === 'login' ? 'Đăng nhập' : 'Đăng ký tài khoản'}</h2>
          <p>{mode === 'login' ? 'Nhập thông tin đăng nhập để tiếp tục.' : 'Tạo tài khoản mới để sử dụng dịch vụ.'}</p>

          {message.text && (
            <div className={`auth-message ${message.type}`} style={{ marginBottom: '1rem', display: 'block' }}>
              {message.text}
            </div>
          )}

          {mode === 'login' && (
            <form className="auth-form" onSubmit={handleLoginSubmit}>
              <div>
                <label>Gmail</label>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  inputMode="email"
                  required
                  placeholder="Nhập gmail..."
                  value={loginUser}
                  onChange={(e) => setLoginUser(e.target.value)}
                />
              </div>
              <div>
                <label>Mật khẩu</label>
                <input
                  type="password"
                  required
                  placeholder="Nhập mật khẩu..."
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                />
              </div>
              <button className="btn btn-primary" type="submit" style={{ marginTop: '0.5rem' }}>
                Đăng nhập
              </button>
              <div className="auth-link-row">
                <span>Chưa có tài khoản?</span>
                <a href="#" className="auth-tab-btn" onClick={(e) => { e.preventDefault(); setMode('register'); setMessage({ text: '', type: '' }); }}>
                  Đăng ký ngay
                </a>
              </div>
            </form>
          )}

          {mode === 'register' && (
            <form className="auth-form" onSubmit={handleRegisterSubmit}>
              <div>
                <label>Gmail (*)</label>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  inputMode="email"
                  required
                  placeholder="Nhập gmail..."
                  value={regUser}
                  onChange={(e) => setRegUser(e.target.value)}
                />
              </div>
              <div>
                <label>Họ và tên (*)</label>
                <input
                  type="text"
                  required
                  placeholder="Họ và tên..."
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                />
              </div>
              <div>
                <label>Số điện thoại (*)</label>
                <input
                  type="tel"
                  required
                  placeholder="Số điện thoại..."
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                />
              </div>
              <div>
                <label>Mật khẩu (*)</label>
                <input
                  type="password"
                  required
                  placeholder="Mật khẩu..."
                  value={regPass}
                  onChange={(e) => setRegPass(e.target.value)}
                />
              </div>
              <div>
                <label>Xác nhận mật khẩu (*)</label>
                <input
                  type="password"
                  required
                  placeholder="Xác nhận mật khẩu..."
                  value={regPassConfirm}
                  onChange={(e) => setRegPassConfirm(e.target.value)}
                />
              </div>
              <button className="btn btn-primary" type="submit">
                Đăng ký
              </button>
              <div className="auth-link-row">
                <span>Đã có tài khoản?</span>
                <a href="#" className="auth-tab-btn" onClick={(e) => { e.preventDefault(); setMode('login'); setMessage({ text: '', type: '' }); }}>
                  Đăng nhập
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}