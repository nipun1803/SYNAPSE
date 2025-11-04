import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { User } from "lucide-react";
import { toast } from "react-toastify";

function Navbar() {
  const { user, logout, loading } = useContext(AuthContext);
  const location = useLocation();
  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup";

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully!");
  };

  if (isAuthPage || loading) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-lg border-b border-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <Link to="/">
              <svg width="220" height="46" viewBox="0 0 220 46" fill="none" xmlns="http://www.w3.org/2000/svg">
                <text x="0" y="28" fontFamily="Arial, sans-serif" fontSize="20" fontWeight="bold" fill="#000B6D">SYNAPSE</text>
                <path d="M128 23 L135 23 L139 20 L143 26 L147 23 L154 23" stroke="#5F6FFF" strokeWidth="2.5" strokeLinecap="round"/>
                <circle cx="158" cy="23" r="2.5" fill="#5F6FFF"/>
                <text x="0" y="42" fontFamily="Arial, sans-serif" fontSize="10" fill="#5F6FFF">Connecting Healthcare</text>
              </svg>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                location.pathname === "/" 
                  ? "text-primary border-b-2 border-primary" 
                  : "text-gray-700 hover:text-primary hover:bg-blue-50"
              }`}
            >
              Home
            </Link>
            <Link
              to="/doctors"
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                location.pathname === "/doctors" 
                  ? "text-primary border-b-2 border-primary" 
                  : "text-gray-700 hover:text-primary hover:bg-blue-50"
              }`}
            >
              All Doctors
            </Link>
            <Link
              to="/about"
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                location.pathname === "/about" 
                  ? "text-primary border-b-2 border-primary" 
                  : "text-gray-700 hover:text-primary hover:bg-blue-50"
              }`}
            >
              About
            </Link>
            <Link
              to="/contact"
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                location.pathname === "/contact" 
                  ? "text-primary border-b-2 border-primary" 
                  : "text-gray-700 hover:text-primary hover:bg-blue-50"
              }`}
            >
              Contact
            </Link>
            {user ? (
              <>
                <Link
                  to="/profile"
                  className={`px-4 py-2 rounded-md text-sm font-medium transition flex items-center gap-2 ${
                    location.pathname === "/profile" 
                      ? "text-primary border-b-2 border-primary" 
                      : "text-gray-700 hover:text-primary hover:bg-blue-50"
                  }`}
                >
                  <User className="w-4 h-4" />
                  Profile
                </Link>
                <div className="flex items-center gap-2 ml-2 pl-4 border-l border-gray-200">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{user?.name?.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="text-gray-900 text-sm font-medium">
                    {user?.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-md hover:shadow-lg"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 ml-2 pl-4 border-l border-gray-200">
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-primary hover:bg-blue-50 transition"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-md hover:shadow-lg"
                  >
                    Sign Up
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

