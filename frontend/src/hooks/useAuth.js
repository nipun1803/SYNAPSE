import { useState, useEffect } from 'react'

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  const checkAuth = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${backendUrl}/api/user/get-profile`, {
        method: 'GET',
        credentials: 'include', // Send cookies
      })
      const data = await res.json()
      
      if (data.success && data.userData) {
        setIsAuthenticated(true)
        setUser(data.userData)
      } else {
        setIsAuthenticated(false)
        setUser(null)
      }
    } catch (error) {
      console.error('Auth check error:', error)
      setIsAuthenticated(false)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const logout = async () => {
    try {
      await fetch(`${backendUrl}/api/user/logout`, {
        method: 'POST',
        credentials: 'include',
      })
      setIsAuthenticated(false)
      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return { isAuthenticated, loading, user, checkAuth, logout }
}