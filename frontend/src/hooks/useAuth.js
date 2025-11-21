import { useState, useEffect } from 'react'
import axios from 'axios'

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  const backendUrl = import.meta.env.VITE_BACKEND_URL || ''

  const checkAuth = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/users/profile`, {
        withCredentials: true
      })

      if (data.success) {
        setIsAuthenticated(true)
        setUser(data.userData)
      } else {
        setIsAuthenticated(false)
        setUser(null)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setIsAuthenticated(false)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  return { isAuthenticated, loading, user, checkAuth }
}