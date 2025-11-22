import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { AppContext } from '../context/AppContext'

const ADMIN_PORTAL_URL = import.meta.env.VITE_ADMIN_URL || 'http://localhost:5174'
const DOCTOR_PORTAL_URL = import.meta.env.VITE_DOCTOR_URL || ADMIN_PORTAL_URL

const UnifiedLogin = () => {
  const navigate = useNavigate()
  const { backendUrl, loadUserProfileData } = useContext(AppContext) // for loading user data 
  
  const [state, setState] = useState('Login') 
  const [role, setRole] = useState('user') 
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)


  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  // Roles configuration for mapping
  const roles = [
    { id: 'user', label: 'Patient' },
    { id: 'doctor', label: 'Doctor' },
    { id: 'admin', label: 'Admin' }
  ]

  const onSubmit = async (e) => {
    e.preventDefault()
    const { email, password, name } = formData

    if (state === 'Sign Up' && !name) return toast.error('Name is required')
    if (!email || !password) return toast.error('Please fill all fields')

    setLoading(true)
    try {
      let data
      
      if (state === 'Login') {
        const res = await fetch(`${backendUrl || ''}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email, password, userType: role }),
        })
        data = await res.json()

        if (data.success) {
          toast.success('Welcome back!')
          
          if (data.userType === 'admin') {
            window.location.href = `${ADMIN_PORTAL_URL}/admin-dashboard`
          } else if (data.userType === 'doctor') {
            window.location.href = `${DOCTOR_PORTAL_URL}/doctor-dashboard`
          } else {
            if (loadUserProfileData) {
              await loadUserProfileData()
            }
            setTimeout(() => {
              window.location.href = '/'
            }, 500)
          }
        } else {
          toast.error(data.message || 'Login failed')
        }

      } else {
        if (role !== 'user') return toast.error('Only patients can register online.')

        const res = await fetch(`${backendUrl || ''}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ name, email, password }),
        })
        data = await res.json()

        if (data.success) {
          toast.success('Account created!')
          if (loadUserProfileData) {
            await loadUserProfileData()
          }
          setTimeout(() => {
            navigate('/my-profile')
            window.location.reload()
          }, 500)
        } else {
          toast.error(data.message || 'Registration failed')
        }
      }
    } catch (error) {
      console.error(error)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4'>
      <form onSubmit={onSubmit} className='bg-white rounded-lg shadow-lg border border-gray-100 p-8 w-full max-w-md'>
        
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-gray-800 mb-2'>
            {state === 'Login' ? 'Sign In' : 'Create Account'}
          </h1>
          <p className='text-gray-500 text-sm'>
            Please select your role to continue
          </p>
        </div>

        {/* Role Switcher - Mapped */}
        <div className='grid grid-cols-3 gap-2 mb-6 bg-gray-100 p-1 rounded-lg'>
          {roles.map((r) => (
            <button
              key={r.id}
              type='button'
              onClick={() => setRole(r.id)}
              className={`py-2 text-sm font-medium rounded-md transition-all ${
                role === r.id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className='space-y-4'>
          {state === 'Sign Up' && role === 'user' && (
            <div>
              <label className='text-xs font-semibold text-gray-600 uppercase'>Full Name</label>
              <input
                name='name'
                value={formData.name}
                onChange={handleChange}
                className='w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all'
                placeholder="John Doe"
              />
            </div>
          )}

          <div>
            <label className='text-xs font-semibold text-gray-600 uppercase'>Email</label>
            <input
              name='email'
              type='email'
              value={formData.email}
              onChange={handleChange}
              className='w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all'
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label className='text-xs font-semibold text-gray-600 uppercase'>Password</label>
            <div className='relative'>
              <input
                name='password'
                type={showPass ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                className='w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all'
                placeholder="••••••••"
              />
              <span 
                onClick={() => setShowPass(!showPass)}
                className='absolute right-3 top-3 text-xs text-gray-500 cursor-pointer hover:text-blue-600'
              >
                {showPass ? 'HIDE' : 'SHOW'}
              </span>
            </div>
          </div>
        </div>

        <button
          disabled={loading}
          className='w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed'
        >
          {loading ? 'Processing...' : (state === 'Login' ? 'Login' : 'Create Account')}
        </button>

        {/* Toggle Login/Signup */}
        <div className='mt-6 text-center text-sm text-gray-600'>
          {state === 'Login' ? (
            <p>New here? <span onClick={() => setState('Sign Up')} className='text-blue-600 font-medium cursor-pointer hover:underline'>Create an account</span></p>
          ) : (
            <p>Already have an account? <span onClick={() => setState('Login')} className='text-blue-600 font-medium cursor-pointer hover:underline'>Login here</span></p>
          )}
        </div>

        {/* Warning for non-patients */}
        {state === 'Sign Up' && role !== 'user' && (
          <div className='mt-4 p-3 bg-yellow-50 text-yellow-700 text-xs rounded border border-yellow-200'>
            Note: Doctors and Admins must be added by the system administrator.
          </div>
        )}

      </form>
    </div>
  )
}

export default UnifiedLogin