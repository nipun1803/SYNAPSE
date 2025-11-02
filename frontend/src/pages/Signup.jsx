import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function Signup() {
  const { signup } = useContext(AuthContext);
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      await signup(form.name, form.email, form.password);
      nav("/profile");
    } catch (e) {
      setErr(e?.response?.data?.error?.message || "Signup failed");
    }
  };

  return (
    <div className="container" style={{ maxWidth: 420, margin: "40px auto" }}>
      <h2>Sign up</h2>
      <form onSubmit={submit}>
        <input
          placeholder="Full Name"
          value={form.name}
          onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
          required
        />
        <input
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
          required
        />
        <input
          placeholder="Password (min 8 chars)"
          type="password"
          minLength={8}
          value={form.password}
          onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
          required
        />
        {err && <p style={{ color: "red" }}>{err}</p>}
        <button type="submit">Create account</button>
      </form>
      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}