import { createContext, useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'

export const AppContext = createContext()

const AppContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || ''
  const currency = import.meta.env.VITE_CURRENCY || '$'

  const [doctors, setDoctors] = useState([])
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(false)

  const api = axios.create({
    baseURL: backendUrl,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json'
    }
  })

  const fetchDoctors = async () => {
    try {
      const { data } = await api.get('/api/doctors')
      if (data.success) {
        setDoctors(data.doctors)
      }
    } catch (error) {
      console.error('Doctors fetch error:', error)
    }
  }

  // Add refreshDoctors function
  const refreshDoctors = async () => {
    try {
      const { data } = await api.get('/api/doctors')
      if (data.success) {
        setDoctors(data.doctors)
      }
    } catch (error) {
      console.error('Refresh doctors error:', error)
    }
  }

  const loadUserProfileData = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/api/users/profile')
      if (data.success) {
        setUserData(data.userData)
      } else {
        setUserData(null)
      }
    } catch (error) {
      console.error('Profile fetch error:', error)
      setUserData(null)
    } finally {
      setLoading(false)
    }
  }

  const slotDateFormat = (slotDate) => {
    if (!slotDate) return ''
    const [day, month, year] = slotDate.split('_')
    const date = new Date(year, month - 1, day)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${day} ${monthNames[date.getMonth()]} ${year}`
  }

  const calculateAge = (dob) => {
    if (!dob) return ''
    const today = new Date()
    const birthDate = new Date(dob)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  // Load initial data
  useEffect(() => {
    fetchDoctors()
    loadUserProfileData()
  }, [])

  const value = {
    doctors,
    currency,
    currencySymbol: currency, // Add alias for currencySymbol
    backendUrl,
    userData,
    setUserData,
    loading,
    fetchDoctors,
    refreshDoctors, // Export refreshDoctors
    loadUserProfileData,
    slotDateFormat,
    calculateAge
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export default AppContextProvider