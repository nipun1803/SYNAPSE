import React, { createContext, useEffect, useState } from "react";
import { api } from "../api/client"; // no need for setAuthToken anymore

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user info when the app starts
  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data } = await api.get("/api/users/me", { withCredentials: true });
        setUser(data.user);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  // Login
  const login = async (email, password) => {
    try {
      const { data } = await api.post(
        "/api/auth/login",
        { email, password },
        { withCredentials: true } // ✅ important to include cookies
      );
      setUser(data.user);
    } catch (err) {
      console.error("Login failed:", err.response?.data || err.message);
      throw err;
    }
  };

  // Signup
  const signup = async (name, email, password) => {
    try {
      const { data } = await api.post(
        "/api/auth/register",
        { name, email, password },
        { withCredentials: true }
      );
      setUser(data.user);
    } catch (err) {
      console.error("Signup failed:", err.response?.data || err.message);
      throw err;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await api.post("/api/auth/logout", {}, { withCredentials: true });
      setUser(null);
    } catch (err) {
      console.error("Logout failed:", err.response?.data || err.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}