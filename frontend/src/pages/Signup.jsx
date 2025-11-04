import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, UserPlus } from "lucide-react";
import { toast } from "react-toastify";

export default function Signup() {
  const { signup } = useContext(AuthContext);
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await signup(form.name, form.email, form.password);
      toast.success("Account created successfully! Welcome to Synapse.");
      nav("/profile");
    } catch (e) {
      const errorMessage = e?.response?.data?.error?.message || "Signup failed";
      setErr(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 px-4 py-12">
      <div className="w-full max-w-lg mx-auto bg-white rounded-3xl shadow-2xl p-8 border border-blue-100">
        <div className="text-center mb-6">
          <div className="mb-4 flex justify-center">
            <svg width="220" height="46" viewBox="0 0 220 46" fill="none" xmlns="http://www.w3.org/2000/svg">
              <text x="0" y="28" fontFamily="Arial, sans-serif" fontSize="20" fontWeight="bold" fill="#000B6D">SYNAPSE</text>
              <path d="M128 23 L135 23 L139 20 L143 26 L147 23 L154 23" stroke="#5F6FFF" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="158" cy="23" r="2.5" fill="#5F6FFF"/>
              <text x="0" y="42" fontFamily="Arial, sans-serif" fontSize="10" fill="#5F6FFF">Connecting Healthcare</text>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-primary mb-2">Join Synapse</h1>
          <p className="text-blue-600">Smart Doctor Appointment Booking</p>
        </div>
        
        <form onSubmit={submit} className="space-y-5">
          <div>
            <label htmlFor="name" className="flex text-sm font-semibold text-blue-900 mb-2 items-center gap-2">
              <User className="w-4 h-4" />
              Full Name
            </label>
            <input
              id="name"
              placeholder="Enter your full name"
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition bg-white"
              required
            />
          </div>
          
          <div>
            <label htmlFor="email" className="flex text-sm font-semibold text-blue-900 mb-2 items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </label>
            <input
              id="email"
              placeholder="Enter your email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
              className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition bg-white"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="flex text-sm font-semibold text-blue-900 mb-2 items-center gap-2">
              <Lock className="w-4 h-4" />
              Password
            </label>
            <input
              id="password"
              placeholder="Create a password (min 8 characters)"
              type="password"
              minLength={8}
              value={form.password}
              onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
              className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition bg-white"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-lg"
          >
            <UserPlus className="w-5 h-5" />
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm text-blue-600">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:text-blue-700 underline font-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}