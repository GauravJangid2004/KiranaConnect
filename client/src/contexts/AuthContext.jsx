import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '../services/api.js';

const AuthContext = createContext(null);
const TOKEN_KEY = 'kc_token';
const USER_KEY = 'kc_user';

function setApiToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

function storeSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  setApiToken(token);
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  setApiToken(null);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (!token) {
      clearSession();
      setLoading(false);
      return;
    }

    setApiToken(token);

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
    storeSession(data.token, data.user);
    setToken(data.token);
    setUser(data.user);
    setAuthError('');
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    storeSession(data.token, data.user);
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

export default function useAuth() {
  return useContext(AuthContext);
}
