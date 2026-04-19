import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);
const TOKEN_KEY = 'kc_token';
const USER_KEY = 'kc_user';

function applyAuthHeader(nextToken) {
  if (nextToken) {
    api.defaults.headers.common.Authorization = `Bearer ${nextToken}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

function persistSession(nextToken, nextUser) {
  localStorage.setItem(TOKEN_KEY, nextToken);
  localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
  applyAuthHeader(nextToken);
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  applyAuthHeader(null);
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (!token) {
      clearSession();
      setLoading(false);
      return;
    }

    applyAuthHeader(token);

    const restoreSession = async () => {
      try {
        const { data } = await api.get('/auth/me');
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        setUser(data.user);
        setAuthError('');
      } catch {
        clearSession();
        setToken(null);
        setUser(null);
        setAuthError('Your previous session expired. Please sign in again.');
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, [token]);

  const login = useCallback(async (phone, password) => {
    const { data } = await api.post('/auth/login', { phone, password });
    persistSession(data.token, data.user);
    setToken(data.token);
    setUser(data.user);
    setAuthError('');
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    persistSession(data.token, data.user);
    setToken(data.token);
    setUser(data.user);
    setAuthError('');
    return data.user;
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setToken(null);
    setUser(null);
    setAuthError('');
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, authError, setAuthError, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
