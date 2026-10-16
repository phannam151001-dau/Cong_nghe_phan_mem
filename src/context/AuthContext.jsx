import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const normalizeRole = (role) => {
  const raw = String(role || '').trim().toLowerCase();
  if (!raw) return 'user';
  if (raw === 'admin' || raw === 'quản trị viên' || raw === 'quan_tri_vien') return 'admin';
  if (raw === 'chu_san' || raw === 'chusan' || raw === 'owner' || raw === 'chủ sân' || raw === 'chu-san') return 'chu_san';
  if (raw === 'khach_hang' || raw === 'customer' || raw === 'user' || raw === 'khách hàng') return 'khach_hang';
  return raw;
};

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    loggedIn: false,
    userId: null,
    userName: '',
    userPhone: '',
    userRole: 'user',
  });
  const [loading, setLoading] = useState(true);

  // Helper to read URL query params (fallback auth flags)
  const getAuthFlagFromUrl = (flagName) => {
    const params = new URLSearchParams(window.location.search);
    return params.get('auth') === flagName || params.get('login') === flagName || params.get('login') === 'success';
  };

  const loadAuthState = async () => {
    const urlLogoutFlag = getAuthFlagFromUrl('logged-out');
    if (urlLogoutFlag) {
      localStorage.removeItem('sancopro_logged_in');
      localStorage.removeItem('sancopro_user_id');
      localStorage.removeItem('sancopro_user_name');
      localStorage.removeItem('sancopro_user_phone');
      localStorage.removeItem('sancopro_user_role');
      setAuthState({ loggedIn: false, userId: null, userName: '', userPhone: '', userRole: 'user' });
      setLoading(false);
      return;
    }

    const localLoginFlag = localStorage.getItem('sancopro_logged_in') === '1';
    const localUserId = parseInt(localStorage.getItem('sancopro_user_id') || '0', 10) || null;
    const localUserName = localStorage.getItem('sancopro_user_name') || '';
    const localUserPhone = localStorage.getItem('sancopro_user_phone') || '';
    const localUserRole = normalizeRole(localStorage.getItem('sancopro_user_role') || 'user');

    try {
      const response = await fetch('/auth_status.php');
      if (!response.ok) throw new Error('Cannot load auth state from server');

      const data = await response.json();
      const isLoggedIn = Boolean(data.loggedIn);
      const normalizedRole = normalizeRole(data.userRole);

      const newState = {
        loggedIn: isLoggedIn,
        userId: data.userId || null,
        userName: data.userName || '',
        userPhone: data.userPhone || '',
        userRole: normalizedRole,
      };

      setAuthState(newState);

      if (isLoggedIn) {
        localStorage.setItem('sancopro_logged_in', '1');
        if (data.userId) localStorage.setItem('sancopro_user_id', String(data.userId));
        if (data.userName) localStorage.setItem('sancopro_user_name', data.userName);
        localStorage.setItem('sancopro_user_phone', data.userPhone || '');
        localStorage.setItem('sancopro_user_role', normalizedRole);
      } else {
        localStorage.removeItem('sancopro_logged_in');
        localStorage.removeItem('sancopro_user_id');
        localStorage.removeItem('sancopro_user_name');
        localStorage.removeItem('sancopro_user_phone');
        localStorage.removeItem('sancopro_user_role');
      }
    } catch (error) {
      console.warn('Lỗi kết nối server auth, dùng localStorage:', error);
      setAuthState({
        loggedIn: localLoginFlag,
        userId: localUserId,
        userName: localUserName,
        userPhone: localUserPhone,
        userRole: localUserRole,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuthState();
  }, []);

  const login = async (username, password) => {
    const formData = new FormData();
    formData.append('gmail', username);
    formData.append('mat_khau', password);

    const response = await fetch('/login.php', {
      method: 'POST',
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: formData,
    });

    const text = await response.text();
    let data = { success: false, message: 'Không thể kết nối máy chủ.' };
    try {
      data = JSON.parse(text);
    } catch (e) {
      data.message = text || data.message;
    }

    if (data.success) {
      // Reload auth state after successful login
      await loadAuthState();
    }
    return data;
  };

  const register = async (formData) => {
    const response = await fetch('/register.php', {
      method: 'POST',
      body: formData,
    });

    const text = await response.text();
    let data = { success: false, message: 'Không thể kết nối máy chủ.' };
    try {
      data = JSON.parse(text);
    } catch (e) {
      data.message = text || data.message;
    }
    return data;
  };

  const logout = async () => {
    try {
      await fetch('/logout.php');
    } catch (e) {
      console.error('Lỗi khi gọi logout API:', e);
    }
    localStorage.removeItem('sancopro_logged_in');
    localStorage.removeItem('sancopro_user_id');
    localStorage.removeItem('sancopro_user_name');
    localStorage.removeItem('sancopro_user_phone');
    localStorage.removeItem('sancopro_user_role');
    setAuthState({ loggedIn: false, userId: null, userName: '', userPhone: '', userRole: 'user' });
    // Redirect to index page to clear query params if any
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ authState, loading, login, register, logout, reloadAuth: loadAuthState }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}