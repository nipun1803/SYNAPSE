import axios from 'axios'
import React, { useContext, useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'

const Navbar = () => {
  const navigate = useNavigate()
  const context = useContext(AppContext)
  
  const user = context?.userData || null
  const backendUrl = context?.backendUrl || ''
  const loadUserProfileData = context?.loadUserProfileData
  
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [profileImage, setProfileImage] = useState(assets.profile_pic)


  useEffect(() => {
    setIsAuthenticated(!!user)
  }, [user])


  useEffect(() => {
    if (user?.image) {
      const imageUrl = getProfileImageUrl(user.image)
      setProfileImage(imageUrl)
    } else {
      setProfileImage(assets.profile_pic)
    }
  }, [user, user?.image, backendUrl])

  useEffect(() => {
    if (isAuthenticated && loadUserProfileData) {
      loadUserProfileData()
    }
  }, [isAuthenticated])

  const handleLogout = async () => {
    try {
      await axios.post(`${backendUrl}/api/auth/logout/user`, {}, {
        withCredentials: true
      })
      toast.success('Logged out successfully')
      setTimeout(() => {
        window.location.href = '/unified-login'
      }, 500)
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Failed to logout')
    }
  }

  const getProfileImageUrl = (image) => {
    if (!image) return assets.profile_pic
    
    // If it's a full URL (http/https)
    if (image.startsWith('http://') || image.startsWith('https://')) {
      return image
    }
    
    // If it's a Cloudinary URL without protocol
    if (image.includes('cloudinary.com')) {
      return `https://${image}`
    }
    
    // If it's a relative path
    const separator = image.startsWith('/') ? '' : '/'
    return `${backendUrl}${separator}${image}`
  }

  const handleImageError = () => {
    setProfileImage(assets.profile_pic)
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
                    key={profileImage} // Force re-render when image changes
                    className='w-8 h-8 rounded-full border-2 border-gray-200 object-cover' 
                    src={profileImage} 
                    alt="Profile"
                    onError={handleImageError}
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
                        <div className='flex items-center gap-3 mb-2'>
                          <img 
                            className='w-10 h-10 rounded-full border-2 border-gray-200 object-cover' 
                            src={profileImage} 
                            alt="Profile"
                            onError={handleImageError}
                          />
                          <div>
                            <p className='text-sm font-semibold text-gray-800'>{user.name}</p>
                            <p className='text-xs text-gray-500 truncate'>{user.email}</p>
                          </div>
                        </div>
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
                  key={profileImage}
                  className='w-12 h-12 rounded-full border-2 border-gray-200 object-cover' 
                  src={profileImage} 
                  alt="Profile"
                  onError={handleImageError}
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