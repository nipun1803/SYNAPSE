import React, { useContext, useEffect, useState, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Home,
  Users,
  Info,
  MessageCircle,
  ChevronDown,
  UserCircle,
  Calendar,
  LogOut,
  Menu,
  X,
  ArrowRight,
  CreditCard,
  FileText,
} from "lucide-react";

import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";
import { authService } from "../api/services";

const NAV_ITEMS = [
  { to: "/", label: "Home", Icon: Home },
  { to: "/doctors", label: "Find Doctors", Icon: Users },
  { to: "/about", label: "About Us", Icon: Info },
  { to: "/contact", label: "Get in Touch", Icon: MessageCircle },
];

const Navbar = () => {
  const navigate = useNavigate();
  const { userData, backendUrl, loadProfile, loading } =
    useContext(AppContext) || {};

  const user = userData;
  const isLoggedIn = !!user;

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileImg, setProfileImg] = useState(null);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const hoverTimeout = useRef(null);

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  useEffect(() => {
    if (user?.image) updateImg(user.image);
    else setProfileImg(null);
  }, [user, backendUrl]);

  useEffect(() => {
    if (isLoggedIn) loadProfile?.();
  }, [isLoggedIn]);


  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "unset";
    return () => (document.body.style.overflow = "unset");
  }, [menuOpen]);

  useEffect(() => {
    const closeOnScroll = () => setDropdownOpen(false);
    window.addEventListener("scroll", closeOnScroll);
    return () => window.removeEventListener("scroll", closeOnScroll);
  }, []);

  const updateImg = (img) => {
    try {
      if (!img) return setProfileImg(null);
      if (img.startsWith("http")) return setProfileImg(img);
      if (img.includes("cloudinary.com")) return setProfileImg(`https://${img}`);

      setProfileImg(backendUrl + (img.startsWith("/") ? "" : "/") + img);
    } catch {
      setProfileImg(null);
    }
  };

  const logout = async () => {
    try {
      await authService.logoutUser();
      toast.success("Take care! See you soon 👋");
      setTimeout(() => (window.location.href = "/unified-login"), 400);
    } catch {
      toast.error("Oops! Something went wrong");
    }
  };

  return (
    <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex items-center justify-between h-16">

          {/* LOGO */}
          <div className="relative overflow-hidden group cursor-pointer">
            <img
              src={assets.logo}
              className="w-36 md:w-44 transition group-hover:brightness-110"
              onClick={() => navigate("/")}
            />
            <div className="shimmer-overlay" />
          </div>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(({ to, label, Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`
                }
              >
                <Icon size={16} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          {/* RIGHT SECTION */}
          <div className="flex items-center gap-3">

            {loading && (
              <div className="hidden md:block w-24 h-9 rounded-full shimmer-bg animate-shimmer" />
            )}

            {/* PROFILE MENU */}
            {isLoggedIn && !loading && (
              <div
                className="relative hidden md:block"
                onMouseEnter={() => {
                  clearTimeout(hoverTimeout.current);
                  setDropdownOpen(true);
                }}
                onMouseLeave={() => {
                  hoverTimeout.current = setTimeout(() => setDropdownOpen(false), 150);
                }}
                ref={dropdownRef}
              >
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 cursor-pointer pt-3 pb-3"
                >
                  {profileImg ? (
                    <img
                      src={profileImg}
                      onError={() => setProfileImg(null)}
                      className="w-8 h-8 object-cover rounded-full border"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                      {getInitials(user?.name)}
                    </div>
                  )}
                  <span className="text-sm text-gray-700 hidden xl:block">
                    Hey, {user?.name?.split(" ")[0]}!
                  </span>
                  <ChevronDown size={16} className="text-gray-500" />
                </div>

                {/* DROPDOWN */}
                <div
                  className={`absolute right-0 top-full mt-3 w-56 bg-white border border-gray-200 rounded-2xl shadow-xl transition-all duration-200 transform ${dropdownOpen
                    ? "opacity-100 visible translate-y-0"
                    : "opacity-0 invisible -translate-y-2"
                    }`}
                >
                  <div className="p-4 border-b bg-gray-50">
                    <div className="flex items-center gap-3">
                      {profileImg ? (
                        <img
                          src={profileImg}
                          className="w-12 h-12 rounded-full object-cover border shadow-sm"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-semibold shadow-sm">
                          {getInitials(user?.name)}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                    </div>
                  </div>

                  {[["/my-profile", "My Profile", UserCircle],
                  ["/my-appointments", "My Appointments", Calendar]].map(
                    ([to, label, Icon]) => (
                      <button
                        key={to}
                        onClick={() => navigate(to)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Icon size={16} />
                        {label}
                      </button>
                    )
                  )}

                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-b-2xl"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              </div>
            )}

            {/* LOGIN BUTTON */}
            {!isLoggedIn && !loading && (
              <button
                onClick={() => navigate("/unified-login")}
                className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 text-white text-sm hover:bg-blue-700 shadow"
              >
                Get Started <ArrowRight size={16} />
              </button>
            )}

            {/* MOBILE MENU BUTTON */}
            <button
              onClick={() => setMenuOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU (FULLY OPAQUE NOW) */}
      <div
        className={`md:hidden fixed inset-0 bg-white z-50 transition duration-300 ${menuOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-white">
          <img src={assets.logo} className="w-36" />
          <button onClick={() => setMenuOpen(false)} className="p-2 rounded hover:bg-gray-100">
            <X size={24} />
          </button>
        </div>

        {/* CONTENT */}
        <nav className="px-6 py-6 overflow-y-auto h-[calc(100vh-72px)] bg-white">
          {isLoggedIn && (
            <div className="mb-6 p-4 bg-blue-50/80 rounded-xl border border-blue-100">
              <div className="flex items-center gap-3">
                {profileImg ? (
                  <img src={profileImg} className="w-14 h-14 rounded-full object-cover border" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-semibold">
                    {getInitials(user?.name)}
                  </div>
                )}
                <div>
                  <p className="text-sm text-blue-600">Welcome back,</p>
                  <p className="font-semibold text-gray-900">{user?.name}</p>
                </div>
              </div>
            </div>
          )}

          {/* NAV LINKS */}
          <div className="space-y-2">
            {NAV_ITEMS.map(({ to, label, Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium ${isActive
                    ? "bg-blue-600 text-white shadow"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`
                }
              >
                <Icon size={20} />
                {label}
              </NavLink>
            ))}
          </div>

          {/* USER ACTIONS */}
          {isLoggedIn ? (
            <>
              <div className="my-5 border-t"></div>

              {[["/my-profile", "My Profile", UserCircle],
              ["/my-appointments", "My Appointments", Calendar]].map(
                ([to, label, Icon]) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 text-gray-700 hover:bg-gray-100"
                  >
                    <Icon size={20} />
                    {label}
                  </NavLink>
                )
              )}

              <button
                onClick={() => {
                  logout();
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 bg-red-50 hover:bg-red-100"
              >
                <LogOut size={20} />
                Sign Out
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                navigate("/unified-login");
                setMenuOpen(false);
              }}
              className="w-full mt-8 flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-blue-600 text-white text-base shadow hover:bg-blue-700"
            >
              Get Started <ArrowRight size={20} />
            </button>
          )}
        </nav>
      </div>

      {/* SHIMMER EFFECT */}
      <style>{`
        .shimmer-bg {
          background: linear-gradient(90deg,#dbeafe,#bfdbfe,#dbeafe);
          background-size: 200% 100%;
          animation: shimmerMove 1.8s infinite;
        }
        @keyframes shimmerMove {
          from { background-position: -200% 0; }
          to { background-position: 200% 0; }
        }
        .shimmer-overlay {
          position:absolute; top:0; left:-100%; width:100%; height:100%;
          background:linear-gradient(90deg,transparent,rgba(96,165,250,.25),transparent);
        }
        .logo-container:hover .shimmer-overlay {
          animation: shimmer 1s;
        }
        @keyframes shimmer {
          from { left:-100%; }
          to { left:100%; }
        }
      `}</style>
    </div>
  );
};

export default Navbar;