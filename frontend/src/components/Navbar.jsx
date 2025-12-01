import React, { useContext, useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import { authService } from '../api/services'

const Navbar = () => {
  const navigate = useNavigate()
  const context = useContext(AppContext)

  const user = context?.userData || null
  const backendUrl = context?.backendUrl || ''
  const loadProfile = context?.loadProfile
  const isLoading = context?.loading

  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [profileImage, setProfileImage] = useState(assets.profile_pic)

  useEffect(() => {
    setIsAuthenticated(!!user)
  }, [user])

  useEffect(() => {
    if (user?.image) {
      const img = getProfileImageUrl(user.image)
      setProfileImage(img)
    } else {
      setProfileImage(assets.profile_pic)
    }
  }, [user, user?.image, backendUrl])

  useEffect(() => {
    if (isAuthenticated && loadProfile) {
      loadProfile()
    }
  }, [isAuthenticated])

  const handleLogout = async () => {
    try {
      await authService.logoutUser()
      toast.success('Logged out successfully')
      setTimeout(() => {
        window.location.href = '/unified-login'
      }, 500)
    } catch (err) {
      console.error('Logout error:', err)
      toast.error('Failed to logout')
    }
  }

  const getProfileImageUrl = (image) => {
    if (!image) return assets.profile_pic
    if (image.startsWith('http://') || image.startsWith('https://')) return image
    if (image.includes('cloudinary.com')) return `https://${image}`
    const sep = image.startsWith('/') ? '' : '/'
    return backendUrl + sep + image
  }

  const handleImageError = () => {
    setProfileImage(assets.profile_pic)
  }

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* LOGO */}
          <div className="logo-container relative overflow-hidden">
            <img
              onClick={() => navigate('/')}
              className="w-44 cursor-pointer hover:opacity-90 transition-all duration-300"
              src={assets.logo}
              alt="Synapse Logo"
            />
            <div className="shimmer-overlay"></div>
          </div>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center space-x-8">
            <NavLink to="/" className={({ isActive }) =>
              `px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`
            }>
              Home
            </NavLink>

            <NavLink to="/doctors" className={({ isActive }) =>
              `px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`
            }>
              All Doctors
            </NavLink>

            <NavLink to="/about" className={({ isActive }) =>
              `px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`
            }>
              About
            </NavLink>

            <NavLink to="/contact" className={({ isActive }) =>
              `px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`
            }>
              Contact
            </NavLink>
          </nav>

          {/* RIGHT SECTION */}
          <div className="flex items-center gap-4">

            {/* SHOW SHIMMER FOR LOGIN BUTTON AREA ONLY WHILE LOADING */}
            {isLoading && (
              <div className="hidden md:block w-24 h-9 rounded-lg shimmer-bg animate-shimmer" aria-hidden="true" />
            )}

            {/* LOGGED IN USER MENU (after loading finishes) */}
            {!isLoading && isAuthenticated && (
              <div className="flex items-center gap-2 cursor-pointer group relative">
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors" onClick={() => {/* optional click */ }}>
                  <img
                    key={profileImage}
                    className="w-8 h-8 rounded-full border-2 border-gray-200 object-cover"
                    src={profileImage}
                    alt="Profile"
                    onError={handleImageError}
                  />
                  {user?.name && (
                    <span className="hidden lg:block text-sm font-medium text-gray-700">
                      {user.name.split(' ')[0]}
                    </span>
                  )}
                  <img className="w-4 h-4" src={assets.dropdown_icon} alt="" />
                </div>

                <div className="absolute top-12 right-0 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20 hidden group-hover:block">
                  <div className="py-2">
                    {user?.name && (
                      <div className="px-4 py-2 border-b border-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                          <img
                            className="w-10 h-10 rounded-full border-2 border-gray-200 object-cover"
                            src={profileImage}
                            alt="Profile"
                            onError={handleImageError}
                          />
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <button onClick={() => navigate('/my-profile')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      My Profile
                    </button>
                    <button onClick={() => navigate('/my-appointments')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      My Appointments
                    </button>
                    <hr className="my-1" />
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!isLoading && !isAuthenticated && (
              <button
                onClick={() => navigate('/unified-login')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition hidden md:block"
              >
                Login / Sign Up
              </button>
            )}

            <button
              onClick={() => setShowMenu(true)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <img className="w-6 h-6" src={assets.menu_icon} alt="menu" />
            </button>
          </div>
        </div>
      </div>

      <div className={`md:hidden fixed inset-0 z-50 bg-white transition-all duration-300 ${showMenu ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <img src={assets.logo} className="w-36" alt="logo" />
          <button onClick={() => setShowMenu(false)} className="p-2 rounded-lg hover:bg-gray-100">
            <img src={assets.cross_icon} className="w-6 h-6" alt="close" />
          </button>
        </div>

        <nav className="px-6 py-4">
          {!isLoading && isAuthenticated && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <img
                  key={profileImage}
                  className="w-12 h-12 rounded-full border-2 border-gray-200 object-cover"
                  src={profileImage}
                  alt="Profile"
                  onError={handleImageError}
                />
                <div>
                  <p className="font-semibold text-gray-800">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
            </div>
          )}
          <div className="space-y-2">
            <NavLink onClick={() => setShowMenu(false)} to="/" className="block px-4 py-3 text-lg font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
              Home
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to="/doctors" className="block px-4 py-3 text-lg font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
              All Doctors
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to="/about" className="block px-4 py-3 text-lg font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
              About
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to="/contact" className="block px-4 py-3 text-lg font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
              Contact
            </NavLink>

            {!isLoading && isAuthenticated && (
              <>
                <hr className="my-2" />
                <NavLink onClick={() => setShowMenu(false)} to="/my-profile" className="block px-4 py-3 text-lg font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                  My Profile
                </NavLink>
                <NavLink onClick={() => setShowMenu(false)} to="/my-appointments" className="block px-4 py-3 text-lg font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                  My Appointments
                </NavLink>
                <button
                  onClick={() => { handleLogout(); setShowMenu(false); }}
                  className="w-full text-left px-4 py-3 text-lg font-medium text-red-600 hover:bg-red-50 rounded-lg"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </nav>
      </div>

      {/* SHIMMER + LOGO CSS */}
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
      `}</style>
    </div>
  )
}

export default Navbar