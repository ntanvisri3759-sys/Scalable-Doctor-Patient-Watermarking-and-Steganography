import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);
const KEY = "securemedshare_demo_user";

// DEMO AUTH ONLY (Phase 1). No password is checked or stored.
// Real authentication (Supabase Auth + server-side RBAC) arrives in Phase 2.
const DEMO_NAMES = { doctor: "Dr. Meera Iyer", patient: "Aarav Sharma", admin: "Admin Kiran" };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; }
  });

  const login = ({ email, role, name }) => {
    const u = { email, role, name: name || DEMO_NAMES[role] };
    localStorage.setItem(KEY, JSON.stringify(u));
    setUser(u);
  };
  const logout = () => {
    localStorage.removeItem(KEY);
    localStorage.removeItem("securemedshare_token");
    setUser(null);
  };
  const updateUser = (patch) => {
    setUser((prev) => {
      const u = { ...prev, ...patch };
      localStorage.setItem(KEY, JSON.stringify(u));
      return u;
    });
  };
  return <AuthContext.Provider value={{ user, login, logout, updateUser }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
