import React, { createContext, useEffect, useState } from "react";
import { api, setAuthToken } from "../api/client";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(localStorage.getItem("token") || "");

  useEffect(() => {
    const loadMe = async () => {
      if (!token) return;
      try {
        const { data } = await api.get("/api/v1/users/me");
        setUser(data.user);
      } catch {
        setAuthToken(null);
        setUser(null);
        setTokenState("");
      }
    };
    loadMe();
  }, [token]);

  const login = async (email, password) => {
    const { data } = await api.post("/api/v1/auth/login", { email, password });
    setAuthToken(data.token);
    setTokenState(data.token);
    setUser(data.user);
  };

  const signup = async (name, email, password) => {
    const { data } = await api.post("/api/v1/auth/register", { name, email, password });
    setAuthToken(data.token);
    setTokenState(data.token);
    setUser(data.user);
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
    setTokenState("");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}