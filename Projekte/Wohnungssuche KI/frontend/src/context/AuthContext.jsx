// frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useCallback } from 'react';

// Create the Auth context
const AuthContext = createContext(null);

// Helper to get backend URL (same logic as in App.jsx)
const getBackendUrl = () => {
  return import.meta.env.VITE_BACKEND_URL || `http://${typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : 'localhost'}:5000`;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  // Persist token changes
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  // Fetch current user info if token is present (optional – backend currently returns user on login/register)
  const fetchUser = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${getBackendUrl()}/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        // Token might be invalid – clear it
        setToken(null);
        setUser(null);
      }
    } catch (e) {
      console.error('Failed to fetch user:', e);
    }
  }, [token]);

  // Run once on mount to validate existing token
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email, password) => {
    const res = await fetch(`${getBackendUrl()}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    const data = await res.json();
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const register = async (email, password, name) => {
    const res = await fetch(`${getBackendUrl()}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Registration failed');
    }
    const data = await res.json();
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);

export default AuthContext;
