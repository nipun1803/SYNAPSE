import { createContext, useEffect, useState } from 'react'
import { doctorService, userService } from '../api/services'

export const AppContext = createContext()

const AppContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || ''
  const currency = import.meta.env.VITE_CURRENCY || '₹'

  const [doctors, setDoctors] = useState([])
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchDoctors = async () => {
    try {
      const data = await doctorService.getList()
      if (data.success) {
        setDoctors(data.doctors)
      }
    } catch (error) {
      console.error('Doctors fetch error:', error)
    }
  }


  const refreshDoctors = async () => {
    try {
      const data = await doctorService.getList()
      if (data.success) {
        setDoctors(data.doctors)
      }
    } catch (error) {
      console.error('Refresh doctors error:', error)
    }
  }

  const loadProfile = async () => {
    try {
      setLoading(true)
      const data = await userService.getProfile()
      if (data.success) {
        setUserData(data.userData)
      } else {
        setUserData(null)
      }
    } catch (error) {
      if (error.status === 401) {
        // Not logged in - this is expected for guests
        setUserData(null)
      } else {
        console.error('Profile fetch error:', error)
        setUserData(null)
      }
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


  useEffect(() => {
    fetchDoctors()
    loadProfile()
  }, [])

  const value = {
    doctors,
    currency,
    currencySymbol: currency,
    backendUrl,
    userData,
    setUserData,
    loading,
    fetchDoctors,
    refreshDoctors,
    loadProfile,
    slotDateFormat,
    calculateAge
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export default AppContextProvider
