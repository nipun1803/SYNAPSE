import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AppContext";
import { api } from "../api/client";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  LogOut,
  ShieldCheck,
  CalendarDays,
  User as UserIcon,
  Mail,
} from "lucide-react";

export default function Profile() {
  const { user, logout } = useContext(AuthContext);
  const [me, setMe] = useState(user);
  const nav = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/api/users/me", {
          withCredentials: true,
        });
        setMe(data.user);
      } catch {
        // ignore
      }
    };
    if (!user) {
      load();
    } else {
      setMe(user);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully!");
    nav("/login");
  };

  return (
    <div className="min-h-screen bg-blue-50 px-4 py-8 pt-28">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              My Profile
            </h1>
            <p className="text-gray-600 text-sm">
              View and manage your account information
            </p>
          </div>

          {me ? (
            <div className="space-y-6">
              <div className="bg-primary rounded-lg p-6 text-white grid md:grid-cols-[auto,1fr] gap-4 items-center">
                <div className="flex items-center justify-center w-14 h-14 bg-white bg-opacity-20 rounded-full mx-auto md:mx-0 border-2 border-white border-opacity-30">
                  <span className="text-2xl font-bold">
                    {me.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-bold">Hello, {me.name}</h2>
                  <p className="text-white mt-0.5 flex items-center gap-2 text-sm font-medium">
                    <Mail className="w-4 h-4" /> {me.email}
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 text-gray-700 mb-1">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm font-medium">Email</span>
                  </div>
                  <div className="text-gray-900 font-semibold break-all text-sm">
                    {me.email}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 text-gray-700 mb-1">
                    <UserIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">Role</span>
                  </div>
                  <div className="text-primary font-semibold capitalize text-sm">
                    {me.role || "user"}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 text-gray-700 mb-1">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-sm font-medium">Account Status</span>
                  </div>
                  <div className="text-emerald-700 font-semibold text-sm">
                    Active
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-5 space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200 overflow-x-auto">
                  <span className="text-sm font-medium text-gray-700">
                    User ID
                  </span>
                  <span className="text-xs text-gray-600 font-mono">
                    {me._id || me.id}
                  </span>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-2">
                <button
                  onClick={handleLogout}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-md transition duration-200 shadow-sm hover:shadow flex items-center justify-center gap-2 text-sm"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
                <a
                  href="/doctors"
                  className="w-full text-center bg-primary hover:bg-blue-700 text-white font-semibold py-2.5 rounded-md transition duration-200 shadow-sm hover:shadow flex items-center justify-center gap-2 text-sm"
                >
                  Explore Doctors
                </a>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-primary mx-auto"></div>
              <p className="mt-4 text-blue-600 font-semibold">
                Loading profile...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
