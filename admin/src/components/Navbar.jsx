import React, { useContext, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AdminContext } from '../context/AdminContext'
import { DoctorContext } from '../context/DoctorContext'

const UNIFIED_LOGIN_URL = import.meta.env.VITE_UNIFIED_LOGIN_URL || 'http://localhost:5173/unified-login'

const Navbar = ({ onToggleSidebar }) => {
  const { dToken, setDToken, logoutDoctor } = useContext(DoctorContext)
  const { aToken, setAToken, logoutAdmin } = useContext(AdminContext)
  const navigate = useNavigate()
  const location = useLocation()
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  })

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [darkMode])

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
    ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800'
    : isDoctor
      ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
      : 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'

  return (
    <header className='sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm transition-colors duration-200'>
      <div className='flex items-center justify-between gap-3 px-4 py-3 sm:px-6'>
        {/* Left Section */}
        <div className='flex items-center gap-3'>
          {isAuthed && (
            <button
              type='button'
              onClick={onToggleSidebar}
              className='lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
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
              <text x="0" y="28" fontFamily="Arial, sans-serif" fontSize="20" fontWeight="bold" fill="currentColor" className="text-gray-900 dark:text-white">SYNAPSE</text>
              <path d="M128 23 L135 23 L139 20 L143 26 L147 23 L154 23" stroke="currentColor" className="text-primary dark:text-blue-400" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="158" cy="23" r="2.5" fill="currentColor" className="text-primary dark:text-blue-400" />
              <text x="0" y="42" fontFamily="Arial, sans-serif" fontSize="10" fill="currentColor" className="text-primary dark:text-blue-400">Connecting Healthcare</text>
            </svg>
          </div>
        </div>

        {/* Right Section */}
        <div className='flex items-center gap-3'>
          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* Role Badge */}
          <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border ${roleStyles}`}>
            <span className='text-sm font-medium'>{role}</span>
          </div>

          {/* Account Dropdown */}
          {isAuthed && (
            <div className='relative'>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className='flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:opacity-90 transition-colors'
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
                  <div className='absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50'>
                    <div className='p-3 border-b border-gray-100 dark:border-gray-700'>
                      <p className='text-xs text-gray-500 dark:text-gray-400'>Signed in as</p>
                      <p className='text-sm font-medium text-gray-900 dark:text-white'>{role}</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowDropdown(false)
                        onLogout()
                      }}
                      className='w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2'
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