import React, { useContext } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { AdminContext } from '../context/AdminContext'
import { DoctorContext } from '../context/DoctorContext'
import { Home, Calendar, UserPlus, Users, User, X, Clock } from 'lucide-react'

const Sidebar = ({ isOpen, onClose }) => {
  const { dToken } = useContext(DoctorContext)
  const { aToken } = useContext(AdminContext)
  const location = useLocation()

  const path = location.pathname
  const onAdminRoute = /^\/(admin-dashboard|all-appointments|add-doctor|doctor-list)(\/|$)/.test(path)
  const onDoctorRoute = /^\/(doctor-dashboard|doctor-appointments|doctor-profile|doctor-slots)(\/|$)/.test(path)

  let showAdmin = onAdminRoute && !!aToken
  let showDoctor = onDoctorRoute && !!dToken

  if (!onAdminRoute && !onDoctorRoute) {
    showAdmin = !!aToken
    showDoctor = !aToken && !!dToken
  }

  const adminNav = [
    {
      to: '/admin-dashboard',
      label: 'Dashboard',
      icon: Home
    },
    {
      to: '/all-appointments',
      label: 'Appointments',
      icon: Calendar
    },
    {
      to: '/add-doctor',
      label: 'Add Doctor',
      icon: UserPlus
    },
    {
      to: '/doctor-list',
      label: 'Doctors List',
      icon: Users
    },
    {
      to: '/users',
      label: 'Users List',
      icon: Users
    }
  ]

  const doctorNav = [
    {
      to: '/doctor-dashboard',
      label: 'Dashboard',
      icon: Home
    },
    {
      to: '/doctor-appointments',
      label: 'Appointments',
      icon: Calendar
    },
    {
      to: '/doctor-slots',
      label: 'Manage Slots',
      icon: Clock
    },
    {
      to: '/doctor-profile',
      label: 'Profile',
      icon: User
    }
  ]

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
        className={`fixed lg:sticky top-[61px] left-0 z-40 h-[calc(100vh-61px)] w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className='p-5'>
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className='lg:hidden absolute top-4 right-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          >
            <X className='w-5 h-5' />
          </button>

          {/* Panel Title Badge */}
          {title && (
            <div className='mb-6'>
              <p className='text-sm font-semibold text-gray-900 dark:text-gray-200'>{title}</p>
            </div>
          )}

          {/* Navigation */}
          <nav className='space-y-1'>
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`
                  }
                  onClick={onClose}
                >
                  <Icon className='w-5 h-5' />
                  {item.label}
                </NavLink>
              )
            })}
          </nav>
        </div>
      </aside>
    </>
  )
}

export default Sidebar