import React, { useContext, useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import { authService } from '../api/services'

const Navbar = () => {
  const navigate = useNavigate()
  const { userData, backendUrl, loadProfile, loading } = useContext(AppContext) || {}

  const user = userData || null
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileImg, setProfileImg] = useState(assets.profile_pic)

  useEffect(() => {
    setIsLoggedIn(Boolean(user))
  }, [user])

  useEffect(() => {
    if (user?.image) {
      updateImg(user.image)
    } else {
      setProfileImg(assets.profile_pic)
    }
  }, [user, backendUrl])

  useEffect(() => {
    if (isLoggedIn && loadProfile) {
      loadProfile()
    }
  }, [isLoggedIn])

  const updateImg = (imgPath) => {
    try {
      if (!imgPath) return setProfileImg(assets.profile_pic)
      if (imgPath.startsWith('http')) return setProfileImg(imgPath)
      if (imgPath.includes('cloudinary.com')) return setProfileImg(`https://${imgPath}`)
      const prefix = imgPath.startsWith('/') ? '' : '/'
      setProfileImg(backendUrl + prefix + imgPath)
    } catch {
      setProfileImg(assets.profile_pic)
    }
  }

  const logout = async () => {
    try {
      await authService.logoutUser()
      toast.success('Logged out successfully')
      setTimeout(() => (window.location.href = '/unified-login'), 400)
    } catch (err) {
      toast.error('Failed to logout')
    }
  }

  const fallback = () => setProfileImg(assets.profile_pic)

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* logo */}
          <div className="logo-container relative overflow-hidden">
            <img
              src={assets.logo}
              alt="Synapse Logo"
              className="w-44 cursor-pointer hover:opacity-90 duration-300"
              onClick={() => navigate('/')}
            />
            <div className="shimmer-overlay" />
          </div>

          {/* main nav */}
          <nav className="hidden md:flex items-center gap-8">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-4 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200 nav-main ${isActive ? 'text-blue-600 bg-blue-50 font-semibold nav-main-active' : ''}`
              }
            >
              Home
            </NavLink>

            <NavLink
              to="/doctors"
              className={({ isActive }) =>
                `px-4 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200 nav-main ${isActive ? 'text-blue-600 bg-blue-50 font-semibold nav-main-active' : ''}`
              }
            >
              All Doctors
            </NavLink>

            <NavLink
              to="/about"
              className={({ isActive }) =>
                `px-4 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200 nav-main ${isActive ? 'text-blue-600 bg-blue-50 font-semibold nav-main-active' : ''}`
              }
            >
              About
            </NavLink>

            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `px-4 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200 nav-main ${isActive ? 'text-blue-600 bg-blue-50 font-semibold nav-main-active' : ''}`
              }
            >
              Contact
            </NavLink>
          </nav>

          {/* right */}
          <div className="flex items-center gap-4">

            {loading && (
              <div className="hidden md:block w-24 h-9 rounded-lg shimmer-bg animate-shimmer" />
            )}

            {/* profile menu */}
            {!loading && isLoggedIn && (
              <div className="relative group cursor-pointer">
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition">
                  <img
                    src={profileImg}
                    onError={fallback}
                    className="w-8 h-8 rounded-full border object-cover ring-2 ring-white/40"
                  />
                  <span className="hidden lg:block text-sm text-gray-800">
                    {user?.name?.split(' ')[0] || ''}
                  </span>
                  <img src={assets.dropdown_icon} className="w-4 h-4" />
                </div>

                {/* dropdown */}
                <div className="absolute hidden group-hover:block top-12 right-0 w-56 bg-white rounded-xl shadow-xl border border-gray-200 z-20 transition-all duration-200 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0">
                  <div className="py-2">
                    <div className="px-4 py-2 border-b">
                      <div className="flex items-center gap-3">
                        <img
                          src={profileImg}
                          onError={fallback}
                          className="w-10 h-10 rounded-full border object-cover"
                        />
                        <div>
                          <p className="text-sm font-semibold text-gray-700">{user?.name}</p>
                          <p className="text-xs text-gray-700 truncate">{user?.email}</p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate('/my-profile')}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                    >
                      My Profile
                    </button>

                    <button
                      onClick={() => navigate('/my-appointments')}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                    >
                      My Appointments
                    </button>

                    <hr className="my-1" />

                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* login */}
            {!loading && !isLoggedIn && (
              <button
                onClick={() => navigate('/unified-login')}
                className="hidden md:block px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Login / Sign Up
              </button>
            )}

            <button
              onClick={() => setMenuOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-white/10"
            >
              <img src={assets.menu_icon} className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* mobile menu */}
      <div
        className={`md:hidden fixed inset-0 bg-white text-gray-800 backdrop-blur-md z-50 transition-all duration-300 ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <img src={assets.logo} className="w-36" />
          <button
            onClick={() => setMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-white/10"
          >
            <img src={assets.cross_icon} className="w-6 h-6" />
          </button>
        </div>

        <nav className="px-6 py-4">
          {isLoggedIn && (
            <div className="mb-6 p-4 bg-white/10 rounded-md">
              <div className="flex items-center gap-3">
                <img
                  src={profileImg}
                  onError={fallback}
                  className="w-12 h-12 rounded-full border object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-800">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>
            </div>
          )}

          <NavLink
            to="/"
            onClick={() => setMenuOpen(false)}
            className="block px-4 py-3 text-lg text-gray-600 hover:bg-gray-50 rounded-lg"
          >
            Home
          </NavLink>

          <NavLink
            to="/doctors"
            onClick={() => setMenuOpen(false)}
            className="block px-4 py-3 text-lg text-gray-600 hover:bg-gray-50 rounded-lg"
          >
            All Doctors
          </NavLink>

          <NavLink
            to="/about"
            onClick={() => setMenuOpen(false)}
            className="block px-4 py-3 text-lg text-gray-600 hover:bg-gray-50 rounded-lg"
          >
            About
          </NavLink>

          <NavLink
            to="/contact"
            onClick={() => setMenuOpen(false)}
            className="block px-4 py-3 text-lg text-gray-600 hover:bg-gray-50 rounded-lg"
          >
            Contact
          </NavLink>

          {isLoggedIn && (
            <>
              <hr className="my-2" />

              <NavLink
                to="/my-profile"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-3 text-lg text-gray-600 hover:bg-gray-50 rounded-lg"
              >
                My Profile
              </NavLink>

              <NavLink
                to="/my-appointments"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-3 textlg text-gray-600 hover:bg-gray-50 rounded-lg"
              >
                My Appointments
              </NavLink>

              <button
                onClick={() => {
                  logout()
                  setMenuOpen(false)
                }}
                className="w-full text-left px-4 py-3 text-lg text-red-600 hover:bg-red-50 rounded-lg"
              >
                Logout
              </button>
            </>
          )}
        </nav>
      </div>
      <style>{`
        .shimmer-bg {
          background: linear-gradient(
            90deg,
            #e5e7eb 0%,
            #f3f4f6 50%,
            #e5e7eb 100%
          );
          background-size: 200% 100%;
        }

        @keyframes shimmerMove {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        .animate-shimmer {
          animation: shimmerMove 1.2s ease-in-out infinite;
        }

        .logo-container {
          position: relative;
          display: inline-block;
        }

        .shimmer-overlay {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(59, 130, 246, 0.3) 50%,
            transparent 100%
          );
          pointer-events: none;
          transition: left 0.6s ease-in-out;
        }

        .logo-container:hover .shimmer-overlay {
          animation: shimmer 1.5s ease-in-out infinite;
        }

        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }

        .nav-main {
          position: relative;
        }
        .nav-main::after {
          content: "";
          position: absolute;
          left: 50%;
          bottom: -6px;
          width: 0%;
          height: 2px;
          background: #2563EB;
          transform: translateX(-50%);
          transition: width .25s ease;
        }
        .nav-main:hover::after {
          width: 45%;
        }
        .nav-main-active::after {
          width: 60%;
        }
      `}</style>
    </div>
  )
}

export default Navbar