import React, { createContext, useEffect, useState } from "react";
import { api } from "../api/client"; 

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);


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


  const login = async (email, password) => {
    try {
      const { data } = await api.post(
        "/api/auth/login",
        { email, password },
        { withCredentials: true }
      );
      setUser(data.user);
      return data;
    } catch (err) {
      throw err;
    }
  };


  const signup = async (name, email, password) => {
    try {
      const { data } = await api.post(
        "/api/auth/register",
        { name, email, password },
        { withCredentials: true }
      );
      setUser(data.user);
      return data;
    } catch (err) {
      throw err;
    }
  };


  const logout = async () => {
    try {
      await api.post("/api/auth/logout", {}, { withCredentials: true });
      setUser(null);
    } catch (err) {
      console.error("Logout failed:", err?.response?.data?.message || err.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}