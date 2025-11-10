import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, UserPlus } from "lucide-react";
import { toast } from "react-toastify";

export default function Signup() {
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signup(form.name, form.email, form.password);
      toast.success("Account created successfully!");
      navigate("/");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md bg-white shadow-xl p-8 rounded-2xl border border-blue-100">
        
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <UserPlus className="w-10 h-10 text-blue-700" />
          </div>
          <h1 className="text-3xl font-bold text-blue-900">Create Account</h1>
          <p className="text-gray-600 text-sm mt-1">
            Join Synapse & start booking appointments
          </p>
        </div>

        <form onSubmit={submit} className="space-y-6">
          
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <User className="w-4 h-4 text-blue-600" />
              Full Name
            </label>
            <input
              required
              placeholder="Your full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Mail className="w-4 h-4 text-blue-600" />
              Email Address
            </label>
            <input
              required
              type="email"
              value={form.email}
              placeholder="you@example.com"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Lock className="w-4 h-4 text-blue-600" />
              Password
            </label>
            <input
              required
              type="password"
              placeholder="Choose a strong password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-lg font-semibold text-white text-lg bg-blue-600 hover:bg-blue-700 transition-all shadow-sm disabled:opacity-50"
          >
            <UserPlus className="w-5 h-5" />
            {loading ? "Creating..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?
          <Link
            to="/login"
            className="text-blue-600 hover:text-blue-800 font-medium ml-1"
          >
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}