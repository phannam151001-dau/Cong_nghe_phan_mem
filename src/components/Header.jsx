import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Header({ currentSection, setCurrentSection, theme, toggleTheme, onOpenAuthModal }) {
  const { authState, logout } = useAuth();
  const { loggedIn, userName, userRole } = authState;

  const handleNavClick = (section, e) => {
    e.preventDefault();
    if ((section === 'my-bookings-section' || section === 'admin-section') && !loggedIn) {
      onOpenAuthModal('login', section);
      return;
    }
    setCurrentSection(section);
  };

  const handleLogoutClick = (e) => {
    e.preventDefault();
    if (window.confirm('Bạn có muốn đăng xuất không?')) {
      logout();
    }
  };

  return (
    <header className="main-header">
      <div className="container header-container">
        <a
          href="/"
          className="logo"
          onClick={(e) => {
            e.preventDefault();
            setCurrentSection('home-section');
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit' }}
        >
          <i className="fa-solid fa-circle-nodes logo-icon"></i>
          <span>SanCo<span className="highlight">Pro</span></span>
        </a>

        <nav className="main-nav">
          <a
            href="#"
            className={`nav-link ${currentSection === 'home-section' ? 'active' : ''}`}
            onClick={(e) => handleNavClick('home-section', e)}
          >
            <i className="fa-solid fa-house"></i> Trang chủ
          </a>
          <a
            href="#"
            className={`nav-link ${currentSection === 'my-bookings-section' ? 'active' : ''}`}
            onClick={(e) => handleNavClick('my-bookings-section', e)}
          >
            <i className="fa-solid fa-ticket"></i> Vé Của Tôi
          </a>
          {(userRole === 'admin' || userRole === 'owner' || userRole === 'chu_san' || userRole === 'chusan') && (
            <a
              href="#"
              className={`nav-link ${currentSection === 'admin-section' ? 'active' : ''}`}
              onClick={(e) => handleNavClick('admin-section', e)}
            >
              <i className={`fa-solid ${userRole === 'admin' ? 'fa-user-gear' : 'fa-building-user'}`}></i>{' '}
              {userRole === 'admin' ? 'Quản trị' : 'Quản lý sân'}
            </a>
          )}
        </nav>

        <div className="header-actions">
          {loggedIn ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="user-profile">
                <div className="avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.8rem', fontWeight: 'bold' }}>
                  {userName ? userName.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="username">{userName}</span>
              </div>
              <a href="#" className="btn btn-secondary login-link" onClick={handleLogoutClick}>
                <i className="fa-solid fa-right-from-bracket"></i> Đăng xuất
              </a>
            </div>
          ) : (
            <>
              <a
                href="#"
                className="btn btn-secondary login-link"
                onClick={(e) => {
                  e.preventDefault();
                  onOpenAuthModal('login', currentSection);
                }}
              >
                <i className="fa-solid fa-right-to-bracket"></i> Đăng nhập
              </a>
              <a
                href="#"
                className="btn btn-primary"
                onClick={(e) => {
                  e.preventDefault();
                  onOpenAuthModal('register', currentSection);
                }}
              >
                <i className="fa-solid fa-user-plus"></i> Đăng ký
              </a>
            </>
          )}
        </div>
      </div>
    </header>
  );
}