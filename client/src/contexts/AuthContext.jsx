import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { connectSocket, disconnectSocket, joinRoom } from "../services/socket";

/**
 * AUTH CONTEXT — KiranaConnect
 * ─────────────────────────────
 * Provides: { user, token, loading, login, register, logout }
 *
 * HOW PERSISTENCE WORKS:
 *   1. Token + user stored in localStorage on login/register
 *   2. On page reload, useEffect reads them back and re-attaches
 *      the token to Axios so all API calls stay authenticated
 *   3. Socket is also reconnected so real-time events resume
 *
 * HOW DUAL-ROLE WORKS:
 *   JWT payload carries { userId, role, shopName }
 *   - role = "shopOwner"  → Topbar shows catalogue/cart/orders tabs
 *   - role = "wholesaler" → Topbar shows incoming/batches/products tabs
 *   Backend requireRole() middleware reads this claim to guard routes.
 */

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(() => localStorage.getItem("kc_token"));
  const [loading, setLoading] = useState(true);

  // ── Restore session on page reload ──────────────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem("kc_user");
    if (stored && token) {
      const u = JSON.parse(stored);
      setUser(u);
      // Re-attach token to all future Axios requests
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      // Reconnect socket and re-join role-based room
      const sock = connectSocket();
      sock.on("connect", () => joinRoom(u.role, u.id));
    }
    setLoading(false);
  }, []);

  // ── Login ────────────────────────────────────────────────────────────────
  const login = useCallback(async (phone, password) => {
    const { data } = await api.post("/auth/login", { phone, password });
    _saveSession(data);
    return data.user;
  }, []);

  // ── Register ─────────────────────────────────────────────────────────────
  const register = useCallback(async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    _saveSession(data);
    return data.user;
  }, []);

  // ── Logout ───────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem("kc_token");
    localStorage.removeItem("kc_user");
    delete api.defaults.headers.common["Authorization"];
    disconnectSocket();
    setToken(null);
    setUser(null);
  }, []);

  // ── Internal: persist token + user after login/register ─────────────────
  const _saveSession = ({ token: t, user: u }) => {
    localStorage.setItem("kc_token", t);
    localStorage.setItem("kc_user", JSON.stringify(u));
    api.defaults.headers.common["Authorization"] = `Bearer ${t}`;
    setToken(t);
    setUser(u);
    const sock = connectSocket();
    sock.on("connect", () => joinRoom(u.role, u.id));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);