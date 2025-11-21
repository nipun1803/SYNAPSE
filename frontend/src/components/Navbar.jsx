import React, { useEffect, useState, useContext } from 'react'
import { assets } from '../assets/assets'
import { NavLink, useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

const Navbar = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout, backendUrl } = useContext(AppContext)
  const [showMenu, setShowMenu] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const getProfileImageUrl = () => {
    if (!user?.image) return assets.profile_pic
    if (user.image.startsWith('http://') || user.image.startsWith('https://')) {
      return user.image
    }
    return `${backendUrl}${user.image.startsWith('/') ? '' : '/'}${user.image}`
  }

  return (
    <div className='bg-white shadow-sm border-b border-gray-200'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16'>
          <img onClick={() => navigate('/')} className='w-44 cursor-pointer hover:opacity-80 transition-opacity' src={assets.logo} alt="" />
          
          <nav className='hidden md:flex items-center space-x-8'>
            <NavLink to='/' className={({ isActive }) => `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}>
              Home
            </NavLink>
            <NavLink to='/doctors' className={({ isActive }) => `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}>
              All Doctors
            </NavLink>
            <NavLink to='/about' className={({ isActive }) => `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}>
              About
            </NavLink>
            <NavLink to='/contact' className={({ isActive }) => `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}>
              Contact
            </NavLink>
          </nav>

          <div className='flex items-center gap-4'>
            {isAuthenticated ? (
              <div className='flex items-center gap-2 cursor-pointer group relative'>
                <div className='flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors'>
                  <img 
                    className='w-8 h-8 rounded-full border-2 border-gray-200 object-cover' 
                    src={getProfileImageUrl()} 
                    alt="Profile"
                    onError={(e) => { e.target.src = assets.profile_pic }}
                  />
                  {user?.name && (
                    <span className='hidden lg:block text-sm font-medium text-gray-700'>
                      {user.name.split(' ')[0]}
                    </span>
                  )}
                  <img className='w-4 h-4' src={assets.dropdown_icon} alt="" />
                </div>
                <div className='absolute top-12 right-0 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20 hidden group-hover:block'>
                  <div className='py-2'>
                    {user?.name && (
                      <div className='px-4 py-2 border-b border-gray-100'>
                        <p className='text-sm font-semibold text-gray-800'>{user.name}</p>
                        <p className='text-xs text-gray-500 truncate'>{user.email}</p>
                      </div>
                    )}
                    <button onClick={() => navigate('/my-profile')} className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors'>
                      My Profile
                    </button>
                    <button onClick={() => navigate('/my-appointments')} className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors'>
                      My Appointments
                    </button>
                    <hr className='my-1' />
                    <button onClick={handleLogout} className='w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors'>
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button onClick={() => navigate('/unified-login')} className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-lg transform hover:scale-105 hidden md:block'>
                Login / Sign Up
              </button>
            )}
            <button onClick={() => setShowMenu(true)} className='md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors'>
              <img className='w-6 h-6' src={assets.menu_icon} alt="" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden fixed inset-0 z-50 bg-white transition-all duration-300 ${showMenu ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className='flex items-center justify-between px-6 py-4 border-b border-gray-200'>
          <img src={assets.logo} className='w-36' alt="" />
          <button onClick={() => setShowMenu(false)} className='p-2 rounded-lg hover:bg-gray-100 transition-colors'>
            <img src={assets.cross_icon} className='w-6 h-6' alt="" />
          </button>
        </div>
        <nav className='px-6 py-4'>
          {isAuthenticated && user && (
            <div className='mb-6 p-4 bg-gray-50 rounded-lg'>
              <div className='flex items-center gap-3'>
                <img 
                  className='w-12 h-12 rounded-full border-2 border-gray-200 object-cover' 
                  src={getProfileImageUrl()} 
                  alt="Profile"
                  onError={(e) => { e.target.src = assets.profile_pic }}
                />
                <div>
                  <p className='font-semibold text-gray-800'>{user.name}</p>
                  <p className='text-xs text-gray-500 truncate'>{user.email}</p>
                </div>
              </div>
            </div>
          )}
          <div className='space-y-2'>
            <NavLink onClick={() => setShowMenu(false)} to='/' className='block px-4 py-3 text-lg font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors'>
              Home
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to='/doctors' className='block px-4 py-3 text-lg font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors'>
              All Doctors
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to='/about' className='block px-4 py-3 text-lg font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors'>
              About
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to='/contact' className='block px-4 py-3 text-lg font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors'>
              Contact
            </NavLink>
            {isAuthenticated && (
              <>
                <hr className='my-2' />
                <NavLink onClick={() => setShowMenu(false)} to='/my-profile' className='block px-4 py-3 text-lg font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors'>
                  My Profile
                </NavLink>
                <NavLink onClick={() => setShowMenu(false)} to='/my-appointments' className='block px-4 py-3 text-lg font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors'>
                  My Appointments
                </NavLink>
                <button onClick={() => { handleLogout(); setShowMenu(false); }} className='w-full text-left px-4 py-3 text-lg font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors'>
                  Logout
                </button>
              </>
            )}
          </div>
        </nav>
      </div>
    </div>
  )
}

export default Navbar