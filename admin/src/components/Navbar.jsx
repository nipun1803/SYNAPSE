import React, { useContext, useState } from 'react'
import { DoctorContext } from '../context/DoctorContext'
import { AdminContext } from '../context/AdminContext'
import { useNavigate, useLocation } from 'react-router-dom'

const UNIFIED_LOGIN_URL = import.meta.env.VITE_UNIFIED_LOGIN_URL || 'http://localhost:5173/unified-login'

const Navbar = ({ onToggleSidebar }) => {
  const { dToken, setDToken, logoutDoctor } = useContext(DoctorContext)
  const { aToken, setAToken, logoutAdmin } = useContext(AdminContext)
  const navigate = useNavigate()
  const location = useLocation()
  const [showDropdown, setShowDropdown] = useState(false)

  const path = location.pathname
  const onAdminRoute = /^\/(admin-dashboard|all-appointments|add-doctor|doctor-list)\b/.test(path)
  const onDoctorRoute = /^\/doctor-/.test(path)

  const isAdmin = onAdminRoute && !!aToken
  const isDoctor = onDoctorRoute && !!dToken
  const isAuthed = isAdmin || isDoctor
  const role = isAdmin ? 'Admin' : isDoctor ? 'Doctor' : 'Guest'

  const handleLogoClick = () => {
    if (isAdmin) navigate('/admin-dashboard')
    else if (isDoctor) navigate('/doctor-dashboard')
    else window.location.href = UNIFIED_LOGIN_URL
  }

  const fallbackLogout = () => {
    try {
      if (isAdmin) {
        setAToken?.('')
        localStorage.removeItem('aToken')
      }
      if (isDoctor) {
        setDToken?.('')
        localStorage.removeItem('dToken')
      }
      localStorage.removeItem('userType')
    } finally {
      window.location.href = UNIFIED_LOGIN_URL
    }
  }

  const onLogout = () => {
    if (isAdmin && typeof logoutAdmin === 'function') return logoutAdmin()
    if (isDoctor && typeof logoutDoctor === 'function') return logoutDoctor()
    fallbackLogout()
  }

  const roleStyles = isAdmin
    ? 'bg-blue-50 text-blue-700 border-blue-200'
    : isDoctor
      ? 'bg-green-50 text-green-700 border-green-200'
      : 'bg-gray-50 text-gray-700 border-gray-200'

  return (
    <header className='sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm'>
      <div className='flex items-center justify-between gap-3 px-4 py-3 sm:px-6'>
        {/* Left Section */}
        <div className='flex items-center gap-3'>
          {isAuthed && (
            <button
              type='button'
              onClick={onToggleSidebar}
              className='lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100'
              aria-label='Toggle menu'
            >
              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16M4 18h16' />
              </svg>
            </button>
          )}
          
          {/* Synapse Logo SVG */}
          <div 
            onClick={handleLogoClick}
            className='cursor-pointer hover:opacity-80 transition-opacity'
          >
            <svg width="180" height="40" viewBox="0 0 220 46" fill="none" xmlns="http://www.w3.org/2000/svg">
              <text x="0" y="28" fontFamily="Arial, sans-serif" fontSize="20" fontWeight="bold" fill="#000B6D">SYNAPSE</text>
              <path d="M128 23 L135 23 L139 20 L143 26 L147 23 L154 23" stroke="#5F6FFF" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="158" cy="23" r="2.5" fill="#5F6FFF"/>
              <text x="0" y="42" fontFamily="Arial, sans-serif" fontSize="10" fill="#5F6FFF">Connecting Healthcare</text>
            </svg>
          </div>
        </div>

        {/* Right Section */}
        <div className='flex items-center gap-3'>
          {/* Role Badge */}
          <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border ${roleStyles}`}>
            <span className='text-sm font-medium'>{role}</span>
          </div>

          {/* Account Dropdown */}
          {isAuthed && (
            <div className='relative'>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className='flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:opacity-90'
              >
                <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                  <path d='M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z' />
                </svg>
                <span className='hidden sm:inline text-sm'>Account</span>
                <svg className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                </svg>
              </button>

              {showDropdown && (
                <>
                  <div className='fixed inset-0 z-40' onClick={() => setShowDropdown(false)}></div>
                  <div className='absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50'>
                    <div className='p-3 border-b border-gray-100'>
                      <p className='text-xs text-gray-500'>Signed in as</p>
                      <p className='text-sm font-medium text-gray-900'>{role}</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowDropdown(false)
                        onLogout()
                      }}
                      className='w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2'
                    >
                      <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1' />
                      </svg>
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar