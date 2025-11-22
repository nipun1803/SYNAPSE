import React, { useContext, useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import { AdminContext } from './context/AdminContext'
import { DoctorContext } from './context/DoctorContext'
import AddDoctor from './pages/Admin/AddDoctor'
import AllAppointments from './pages/Admin/AllAppointments'
import Dashboard from './pages/Admin/Dashboard'
import DoctorsList from './pages/Admin/DoctorsList'
import DoctorAppointments from './pages/Doctor/DoctorAppointments'
import DoctorDashboard from './pages/Doctor/DoctorDashboard'
import DoctorProfile from './pages/Doctor/DoctorProfile'

const UNIFIED_LOGIN_URL = import.meta.env.VITE_UNIFIED_LOGIN_URL || 'http://localhost:5173/unified-login'


const AdminRoute = ({ children }) => {
  const { aToken, checkingAuth } = useContext(AdminContext)
  
  if (checkingAuth) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-slate-50'>
        <div className='animate-spin rounded-full h-16 w-16 border-b-4 border-primary'></div>
      </div>
    )
  }
  
  if (!aToken) {
    window.location.href = UNIFIED_LOGIN_URL
    return null
  }
  
  return children
}

const DoctorRoute = ({ children }) => {
  const { dToken, checkingAuth } = useContext(DoctorContext)
  
  if (checkingAuth) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-slate-50'>
        <div className='animate-spin rounded-full h-16 w-16 border-b-4 border-green-600'></div>
      </div>
    )
  }
  
  if (!dToken) {
    window.location.href = UNIFIED_LOGIN_URL
    return null
  }
  
  return children
}

const App = () => {
  const { aToken } = useContext(AdminContext)
  const { dToken } = useContext(DoctorContext)
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  return (
    <div className='min-h-screen bg-slate-50 flex flex-col'>

      <ToastContainer 
        position='top-right'
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme='light'
        limit={3}
      />
      
      <Navbar onToggleSidebar={() => setSidebarOpen(prev => !prev)} />
      <div className='flex flex-1 overflow-hidden'>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className='flex-1 overflow-y-auto'>
          <Routes>
            <Route path='/' element={
              aToken ? <Navigate to='/admin-dashboard' replace /> : 
              dToken ? <Navigate to='/doctor-dashboard' replace /> :
              <Navigate to={UNIFIED_LOGIN_URL} replace />
            } />
            

            <Route path='/admin-dashboard' element={
              <AdminRoute>
                <Dashboard />
              </AdminRoute>
            } />
            <Route path='/all-appointments' element={
              <AdminRoute>
                <AllAppointments />
              </AdminRoute>
            } />
            <Route path='/add-doctor' element={
              <AdminRoute>
                <AddDoctor />
              </AdminRoute>
            } />
            <Route path='/doctor-list' element={
              <AdminRoute>
                <DoctorsList />
              </AdminRoute>
            } />
            

            <Route path='/doctor-dashboard' element={
              <DoctorRoute>
                <DoctorDashboard />
              </DoctorRoute>
            } />
            <Route path='/doctor-appointments' element={
              <DoctorRoute>
                <DoctorAppointments />
              </DoctorRoute>
            } />
            <Route path='/doctor-profile' element={
              <DoctorRoute>
                <DoctorProfile />
              </DoctorRoute>
            } />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App