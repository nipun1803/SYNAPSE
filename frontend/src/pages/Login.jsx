import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, LogIn } from "lucide-react";
import { toast } from "react-toastify";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(form.email, form.password);
      toast.success("Welcome back");
      navigate("/");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Invalid login details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md bg-white shadow-xl p-8 rounded-2xl border border-blue-100">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <LogIn className="w-10 h-10 text-blue-700" />
          </div>
          <h1 className="text-3xl font-bold text-blue-900">Welcome Back</h1>
          <p className="text-gray-600 text-sm mt-1">
            Sign in to continue your journey
          </p>
        </div>

        <form onSubmit={submit} className="space-y-6">
          
          {/* Email */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Mail className="w-4 h-4 text-blue-600" />
              Email Address
            </label>
            <input
              required
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Lock className="w-4 h-4 text-blue-600" />
              Password
            </label>
            <input
              required
              type="password"
              placeholder="Enter password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-lg font-semibold text-white text-lg bg-blue-600 hover:bg-blue-700 transition-all shadow-sm disabled:opacity-50"
          >
            <LogIn className="w-5 h-5" />
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Don’t have an account?
          <Link to="/signup" className="text-blue-600 hover:text-blue-800 font-medium ml-1">
            Create Account
          </Link>
        </p>

      </div>
    </div>
  );
}