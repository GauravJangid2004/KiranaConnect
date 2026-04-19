import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { connectSocket, disconnectSocket, joinRoom } from '../services/socket';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(() => localStorage.getItem('kc_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('kc_user');
    if (stored && token) {
      const u = JSON.parse(stored);
      setUser(u);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const sock = connectSocket();
      sock.on('connect', () => joinRoom(u.role, u.id));
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (phone, password) => {
    const { data } = await api.post('/auth/login', { phone, password });
    localStorage.setItem('kc_token', data.token);
    localStorage.setItem('kc_user', JSON.stringify(data.user));
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    setToken(data.token);
    setUser(data.user);
    const sock = connectSocket();
    sock.on('connect', () => joinRoom(data.user.role, data.user.id));
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    localStorage.setItem('kc_token', data.token);
    localStorage.setItem('kc_user', JSON.stringify(data.user));
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('kc_token');
    localStorage.removeItem('kc_user');
    delete api.defaults.headers.common['Authorization'];
    disconnectSocket();
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
