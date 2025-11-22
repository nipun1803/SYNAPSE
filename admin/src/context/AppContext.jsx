import { createContext } from "react";

export const AppContext = createContext()

const AppContextProvider = (props) => {
  const currency = import.meta.env.VITE_CURRENCY || '₹'
  const backendUrl = "" // Use Vite proxy

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  const slotDateFormat = (slotDate) => {
    const dateArray = slotDate.split('_')
    const day = dateArray[0]
    const monthIndex = Number(dateArray[1]) - 1
    const year = dateArray[2]
    return `${day} ${months[monthIndex]} ${year}`
  }

  const calculateAge = (dob) => {
    if (!dob) return 0
    const today = new Date()
    const birthDate = new Date(dob)
    let age = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const value = {
    backendUrl,
    currency,
    slotDateFormat,
    calculateAge,
  }

  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  )
}

export default AppContextProvider