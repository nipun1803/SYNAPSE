import React, { useContext } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { DoctorContext } from '../context/DoctorContext'
import { AdminContext } from '../context/AdminContext'
import { assets } from '../assets/assets'

const adminNav = [
  { to: '/admin-dashboard', label: 'Dashboard', icon: assets.home_icon },
  { to: '/all-appointments', label: 'Appointments', icon: assets.appointment_icon },
  { to: '/add-doctor', label: 'Add Doctor', icon: assets.add_icon },
  { to: '/doctor-list', label: 'Doctors List', icon: assets.people_icon }
]

const doctorNav = [
  { to: '/doctor-dashboard', label: 'Dashboard', icon: assets.home_icon },
  { to: '/doctor-appointments', label: 'Appointments', icon: assets.appointment_icon },
  { to: '/doctor-profile', label: 'Profile', icon: assets.people_icon }
]

const Sidebar = ({ isOpen, onClose }) => {
  const { dToken } = useContext(DoctorContext)
  const { aToken } = useContext(AdminContext)
  const location = useLocation()

  const path = location.pathname
  const onAdminRoute = /^\/(admin-dashboard|all-appointments|add-doctor|doctor-list)(\/|$)/.test(path)
  const onDoctorRoute = /^\/(doctor-dashboard|doctor-appointments|doctor-profile)(\/|$)/.test(path)

  let showAdmin = onAdminRoute && !!aToken
  let showDoctor = onDoctorRoute && !!dToken

  if (!onAdminRoute && !onDoctorRoute) {
    showAdmin = !!aToken
    showDoctor = !aToken && !!dToken
  }

  const navItems = showAdmin ? adminNav : showDoctor ? doctorNav : []
  const title = showAdmin ? 'Admin Panel' : showDoctor ? 'Doctor Panel' : ''

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className='fixed inset-0 bg-black/20 z-40 lg:hidden' onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-white border-r border-gray-200 overflow-y-auto transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className='p-5'>
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className='lg:hidden absolute top-4 right-4 text-gray-600 hover:text-gray-900'
          >
            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
            </svg>
          </button>

          {/* Panel Title */}
          {title && (
            <div className='mb-5'>
              <p className='text-xs font-semibold text-gray-500 uppercase tracking-wider'>{title}</p>
            </div>
          )}

          {/* Navigation */}
          <nav className='space-y-1'>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
                onClick={onClose}
              >
                <img className='w-5 h-5' src={item.icon} alt='' />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Help Section */}
          <div className='mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200'>
            <p className='text-sm font-medium text-gray-900 mb-1'>Need Help?</p>
            <p className='text-xs text-gray-600'>Check our documentation or contact support.</p>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar