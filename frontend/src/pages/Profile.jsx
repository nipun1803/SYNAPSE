import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { api } from "../api/client";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { LogOut } from "lucide-react";

export default function Profile() {
  const { user, logout } = useContext(AuthContext);
  const [me, setMe] = useState(user);
  const nav = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/api/users/me");
        setMe(data.user);
      } catch {
        // ignore
      }
    };
    if (!me) load();
  }, []);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully!");
    nav("/login");
  };

  return (
    <div className="min-h-screen bg-blue-50 px-4 py-8 pt-28">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
            <p className="text-gray-600">View and manage your account information</p>
          </div>
          
          {me ? (
            <div className="space-y-6">
              <div className="bg-primary rounded-lg p-8 text-white">
                <div className="flex items-center justify-center w-20 h-20 bg-white bg-opacity-20 rounded-full mb-4 mx-auto border-2 border-white border-opacity-30">
                  <span className="text-3xl font-bold">{me.name?.charAt(0).toUpperCase()}</span>
                </div>
                <h2 className="text-2xl font-bold text-center">{me.name}</h2>
                <p className="text-center text-blue-100 mt-2">{me.email}</p>
              </div>
              
              <div className="border-t border-gray-200 pt-6 space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-sm transition">
                  <span className="text-sm font-medium text-gray-700">User ID</span>
                  <span className="text-xs text-gray-600 font-mono">{me._id || me.id}</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-sm transition">
                  <span className="text-sm font-medium text-gray-700">Role</span>
                  <span className="text-sm text-primary capitalize font-medium">{me.role || "user"}</span>
                </div>
                
                {me.createdAt && (
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-sm transition">
                    <span className="text-sm font-medium text-gray-700">Member Since</span>
                    <span className="text-sm text-gray-600 font-medium">
                      {new Date(me.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
              
              <button
                onClick={handleLogout}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-md transition duration-200 shadow-sm hover:shadow flex items-center justify-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-primary mx-auto"></div>
              <p className="mt-4 text-blue-600 font-semibold">Loading profile...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}