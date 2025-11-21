import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AppContext";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, UserPlus, Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";

export default function Signup() {
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-[#eef4ff] to-white p-4">
      <Card className="w-full max-w-md bg-white/90 backdrop-blur-md shadow-lg border border-blue-100 rounded-2xl">
        <CardHeader className="text-center space-y-2 py-5">
          <UserPlus className="w-12 h-12 mx-auto text-primary" />
          <CardTitle className="text-2xl font-bold text-primary">
            Create Account
          </CardTitle>
          <CardDescription className="text-gray-600">
            Join Synapse & start booking appointments
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 space-y-5 pb-2">
          <form onSubmit={submit} className="space-y-5">
            {/* Name */}
            <div className="space-y-1">
              <Label className="flex items-center gap-1 text-sm font-medium text-gray-700">
                <User className="w-4 h-4 text-primary" /> Full Name
              </Label>
              <Input
                required
                placeholder="Your full name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="h-10 text-sm"
              />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <Label className="flex items-center gap-1 text-sm font-medium text-gray-700">
                <Mail className="w-4 h-4 text-primary" /> Email Address
              </Label>
              <Input
                type="email"
                required
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="h-10 text-sm"
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <Label className="flex items-center gap-1 text-sm font-medium text-gray-700">
                <Lock className="w-4 h-4 text-primary" /> Password
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Choose a strong password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="h-10 text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-primary"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              disabled={loading}
              className="w-full h-10 text-sm font-medium"
            >
              <UserPlus className="w-4 h-4" />
              {loading ? "Creating..." : "Sign Up"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center pt-1 pb-6">
          <p className="text-gray-600 text-sm mt-1">
            Already have an account?
            <Link
              to="/login"
              className="ml-1 text-primary hover:underline font-medium"
            >
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
