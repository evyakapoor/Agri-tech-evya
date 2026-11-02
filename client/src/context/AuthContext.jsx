import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client.js';
import i18n from '../i18n/index.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('agritech_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('agritech_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data?.success && res.data?.user) {
            setUser(res.data.user);
            if (res.data.user.preferredLanguage) {
              i18n.changeLanguage(res.data.user.preferredLanguage);
              localStorage.setItem('agritech_lang', res.data.user.preferredLanguage);
            }
          }
        } catch (err) {
          console.warn('[AuthContext] Session invalid or expired.');
          localStorage.removeItem('agritech_token');
          localStorage.removeItem('agritech_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.success && res.data?.token) {
      localStorage.setItem('agritech_token', res.data.token);
      localStorage.setItem('agritech_user', JSON.stringify(res.data.user));
      setToken(res.data.token);
      setUser(res.data.user);
      if (res.data.user.preferredLanguage) {
        i18n.changeLanguage(res.data.user.preferredLanguage);
        localStorage.setItem('agritech_lang', res.data.user.preferredLanguage);
      }
      return res.data;
    }
    throw new Error(res.data?.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data?.success && res.data?.token) {
      localStorage.setItem('agritech_token', res.data.token);
      localStorage.setItem('agritech_user', JSON.stringify(res.data.user));
      setToken(res.data.token);
      setUser(res.data.user);
      if (res.data.user.preferredLanguage) {
        i18n.changeLanguage(res.data.user.preferredLanguage);
        localStorage.setItem('agritech_lang', res.data.user.preferredLanguage);
      }
      return res.data;
    }
    throw new Error(res.data?.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('agritech_token');
    localStorage.removeItem('agritech_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
    localStorage.setItem('agritech_user', JSON.stringify({ ...user, ...updatedUser }));
    if (updatedUser.preferredLanguage) {
      i18n.changeLanguage(updatedUser.preferredLanguage);
      localStorage.setItem('agritech_lang', updatedUser.preferredLanguage);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: Boolean(user && token),
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
