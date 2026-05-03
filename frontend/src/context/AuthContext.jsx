import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext(null);
const STORAGE_KEY = "fos_admin_v1";
const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.token) {
          setToken(parsed.token);
          // verify token still valid
          axios
            .get(`${API}/admin/me`, { headers: { Authorization: `Bearer ${parsed.token}` } })
            .then((res) => setUser(res.data))
            .catch(() => {
              localStorage.removeItem(STORAGE_KEY);
              setToken(null);
            })
            .finally(() => setLoading(false));
          return;
        }
      }
    } catch (e) {
      // ignore
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await axios.post(`${API}/admin/login`, { email, password });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
    setUser(null);
  };

  const authHeaders = () => (token ? { Authorization: `Bearer ${token}` } : {});

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, authHeaders }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
