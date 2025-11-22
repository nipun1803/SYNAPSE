import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import adminApi from '../services/api'
import { AdminContext } from '../context/AdminContext'
import { toast } from 'react-toastify'

const Login = () => {
  const [role, setRole] = useState('admin') // admin | doctor
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { setAToken } = useContext(AdminContext)
  const navigate = useNavigate()

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = { email, password, userType: role }
      const { data } = await adminApi.login(payload)
      if (data?.success) {
        toast.success(`${role} logged in`)
        // token may be returned in data.token - store it
        if (data.token) {
          localStorage.setItem('aToken', data.token)
          setAToken(data.token)
        }
        // If admin -> admin dashboard; if doctor -> doctor dashboard route could be unified
        navigate('/dashboard')
      } else {
        toast.error(data?.message || 'Login failed')
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Login failed'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form onSubmit={onSubmitHandler} className="w-full max-w-md bg-white shadow rounded p-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">Admin / Doctor Login</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Login as</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full border rounded px-3 py-2">
            <option value="admin">Admin</option>
            <option value="doctor">Doctor</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2" required />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2" required />
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}

export default Login