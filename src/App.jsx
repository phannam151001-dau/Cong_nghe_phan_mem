import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import FilterSection from './components/FilterSection';
import PitchCard from './components/PitchCard';
import BookingModal from './components/BookingModal';
import SuccessModal from './components/SuccessModal';
import AuthModal from './components/AuthModal';
import MyBookings from './components/MyBookings';
import AdminSection from './components/AdminSection';
import OwnerSection from './components/OwnerSection';

function MainApp() {
  const { authState, reloadAuth } = useAuth();
  const { loggedIn, userRole } = authState;

  const [currentSection, setCurrentSection] = useState('home-section');

  const [pitches, setPitches] = useState(() => {
    const stored = localStorage.getItem('sancopro_pitches');
    return stored ? JSON.parse(stored) : [];
  });

  const [bookings, setBookings] = useState(() => {
    const stored = localStorage.getItem('sancopro_bookings');
    return stored ? JSON.parse(stored) : [];
  });

  const [services, setServices] = useState([]);

  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('default');

  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'login', targetSection: 'home-section' });
  const [bookingModal, setBookingModal] = useState({ isOpen: false, pitch: null });
  const [successModal, setSuccessModal] = useState({ isOpen: false, booking: null });

  const [theme, setTheme] = useState(() => localStorage.getItem('sancopro_theme') || 'dark');

  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success') => {
    const id = Date.now() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    }
    localStorage.setItem('sancopro_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    showToast(`Đã chuyển sang giao diện ${theme === 'dark' ? 'Sáng' : 'Tối'}`, 'info');
  };

  const loadPitches = async () => {
    try {
      const response = await fetch('/ttsan.php?_=' + Date.now(), {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const serverPitches = await response.json();

      if (serverPitches.error) throw new Error(serverPitches.error);

      if (Array.isArray(serverPitches)) {
        setPitches(serverPitches);
        localStorage.setItem('sancopro_pitches', JSON.stringify(serverPitches));
      }
    } catch (error) {
      console.warn('Lỗi tải sân từ DB, dùng offline cache:', error);
    }
  };

  const loadServices = async () => {
    try {
      const response = await fetch('/dichvu.php?_=' + Date.now(), {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const serverServices = await response.json();

      if (serverServices.error) throw new Error(serverServices.error);

      if (Array.isArray(serverServices)) {
        setServices(serverServices);
      }
    } catch (error) {
      console.warn('Lỗi tải dịch vụ từ DB:', error);
    }
  };

  useEffect(() => {
    loadPitches();
    loadServices();

    setTimeout(() => {
      showToast("Chào mừng bạn đến với SanCoPro! Trải nghiệm đặt sân ngay.", 'info');
    }, 800);
  }, []);

  const getFilteredPitches = () => {
    let result = [...pitches];

    if (query.trim()) {
      const q = query.toLowerCase().trim();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || (p.location && p.location.toLowerCase().includes(q))
      );
    }

    if (typeFilter !== 'all') {
      result = result.filter((p) => String(p.type) === String(typeFilter));
    }

    if (priceFilter !== 'all') {
      result = result.filter((p) => {
        const price = Number(p.price || 0);
        if (priceFilter === 'low') return price < 300000;
        if (priceFilter === 'mid') return price >= 300000 && price <= 600000;
        if (priceFilter === 'high') return price > 600000;
        return true;
      });
    }

    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  };

  const openAuthModal = (mode = 'login', targetSection = 'home-section') => {
    setAuthModal({ isOpen: true, mode, targetSection });
  };

  const handleBookingSuccess = (newBooking) => {
    const updatedBookings = [newBooking, ...bookings];
    setBookings(updatedBookings);
    localStorage.setItem('sancopro_bookings', JSON.stringify(updatedBookings));

    setBookingModal({ isOpen: false, pitch: null });
    setSuccessModal({ isOpen: true, booking: newBooking });
  };

  const triggerBooking = (pitch) => {
    if (!loggedIn) {
      showToast('Vui lòng đăng nhập để sử dụng chức năng này.', 'warning');
      openAuthModal('login', 'home-section');
      return;
    }
    setBookingModal({ isOpen: true, pitch });
  };

  const handleCancelBooking = (bookingId) => {
    const updated = bookings.map((b) => {
      if (b.id === bookingId) {
        return { ...b, status: 'cancelled' };
      }
      return b;
    });
    setBookings(updated);
    localStorage.setItem('sancopro_bookings', JSON.stringify(updated));
    showToast(`Đã hủy đặt sân ${bookingId} thành công`, 'warning');
  };

  const handleTogglePitchStatus = async (pitchId, newStatus) => {
    const dbStatus = newStatus === 'available' ? 'hoat_dong' : 'bao_tri';
    const numericId = parseInt(String(pitchId).replace('pitch-', ''), 10);

    try {
      const response = await fetch('/dongmosan.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pitch_id: numericId, status: dbStatus })
      });
      const result = await response.json();

      if (result.success) {
        await loadPitches();
        const pitch = pitches.find(p => p.id === pitchId);
        showToast(`Đã cập nhật trạng thái ${pitch ? pitch.name : 'sân'} thành công`, 'info');
      } else {
        showToast(result.message || 'Không thể cập nhật trạng thái sân.', 'danger');
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi kết nối khi cập nhật trạng thái sân.', 'danger');
    }
  };

  const handleAuthModalClose = () => {
    setAuthModal({ ...authModal, isOpen: false });
    reloadAuth().then((state) => {
      if (state.loggedIn && authModal.targetSection) {
        setCurrentSection(authModal.targetSection);
      }
    });
  };

  const filteredPitches = getFilteredPitches();

  return (
    <>
      <Header
        currentSection={currentSection}
        setCurrentSection={setCurrentSection}
        theme={theme}
        toggleTheme={toggleTheme}
        onOpenAuthModal={openAuthModal}
      />

      <main className="container">
        {currentSection === 'home-section' && (
          <section id="home-section" className="app-section active">
            <HeroSection />
            <FilterSection
              query={query}
              setQuery={setQuery}
              typeFilter={typeFilter}
              setTypeFilter={setTypeFilter}
              priceFilter={priceFilter}
              setPriceFilter={setPriceFilter}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />

            <div className="pitches-grid">
              {filteredPitches.length === 0 ? (
                <div className="empty-state">
                  <i className="fa-solid fa-search"></i>
                  <h3>Không tìm thấy sân nào</h3>
                  <p>Vui lòng thử các bộ lọc khác</p>
                </div>
              ) : (
                filteredPitches.map((pitch) => (
                  <PitchCard
                    key={pitch.id}
                    pitch={pitch}
                    onBookClick={() => triggerBooking(pitch)}
                  />
                ))
              )}
            </div>
          </section>
        )}

        {currentSection === 'my-bookings-section' && (
          <MyBookings
            bookings={bookings}
            onCancelBooking={handleCancelBooking}
            setCurrentSection={setCurrentSection}
            onOpenAuthModal={openAuthModal}
          />
        )}

        {currentSection === 'admin-section' && (
          <AdminSection
            pitches={pitches}
            bookings={bookings}
            onTogglePitchStatus={handleTogglePitchStatus}
            showToast={showToast}
          />
        )}

        {currentSection === 'owner-section' && (
          <OwnerSection
            showToast={showToast}
            onPitchStatusChanged={loadPitches}
          />
        )}
      </main>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>SanCoPro</h4>
            <p>Hệ thống đặt sân bóng trực tuyến</p>
          </div>
          <div className="footer-section">
            <h4>Liên hệ</h4>
            <p>📞 1900-xxxx</p>
            <p>📧 support@sancopro.com</p>
          </div>
          <div className="footer-section">
            <h4>Theo dõi</h4>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <i className="fa-brands fa-facebook"></i>
              <i className="fa-brands fa-instagram"></i>
              <i className="fa-brands fa-twitter"></i>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 SanCoPro. All rights reserved.</p>
        </div>
      </footer>

      <AuthModal
        isOpen={authModal.isOpen}
        onClose={handleAuthModalClose}
        initialMode={authModal.mode}
        showToast={showToast}
      />

      <BookingModal
        isOpen={bookingModal.isOpen}
        onClose={() => setBookingModal({ isOpen: false, pitch: null })}
        pitch={bookingModal.pitch}
        bookings={bookings}
        services={services}
        onBookingSuccess={handleBookingSuccess}
        showToast={showToast}
      />

      <SuccessModal
        isOpen={successModal.isOpen}
        booking={successModal.booking}
        onClose={() => setSuccessModal({ isOpen: false, booking: null })}
        onViewBookings={() => {
          setSuccessModal({ isOpen: false, booking: null });
          setCurrentSection('my-bookings-section');
        }}
      />

      <div className="toast-container" id="toast-container">
        {toasts.map((toast) => {
          let iconClass = 'fa-circle-check text-emerald';
          if (toast.type === 'danger') iconClass = 'fa-circle-xmark text-danger';
          if (toast.type === 'warning') iconClass = 'fa-triangle-exclamation text-gold';
          if (toast.type === 'info') iconClass = 'fa-circle-info text-blue';

          return (
            <div key={toast.id} className={`toast toast-${toast.type || 'success'}`}>
              <div className="toast-content">
                <i className={`fa-solid ${iconClass}`}></i>
                <span>{toast.message}</span>
              </div>
              <button className="toast-close" onClick={() => removeToast(toast.id)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

