import React from 'react'
import Navbar from './components/Navbar'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Doctors from './pages/Doctors'
import UnifiedLogin from './pages/UnifiedLogin'
import About from './pages/About'
import Contact from './pages/Contact'
import Appointment from './pages/Appointment'
import MyAppointments from './pages/MyAppointments'
import MyProfile from './pages/MyProfile'
import Footer from './components/Footer'
import { useAuth } from './hooks/useAuth'
import { ToastContainer } from 'react-toastify'
import "react-toastify/dist/ReactToastify.css";

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to='/unified-login' replace />
  }

  return children
}

const App = () => {
  return (
    <div className='min-h-screen bg-gray-50'>
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
      />
      <Navbar />
      <main className='mx-4 sm:mx-[10%] py-4'>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/doctors' element={<Doctors />} />
          <Route path='/doctors/:speciality' element={<Doctors />} />
          <Route path='/unified-login' element={<UnifiedLogin />} />
          <Route path='/about' element={<About />} />
          <Route path='/contact' element={<Contact />} />
          
          {/* Protected Routes */}
          <Route path='/appointment/:docId' element={
            <ProtectedRoute>
              <Appointment />
            </ProtectedRoute>
          } />
          <Route path='/my-appointments' element={
            <ProtectedRoute>
              <MyAppointments />
            </ProtectedRoute>
          } />
          <Route path='/my-profile' element={
            <ProtectedRoute>
              <MyProfile />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App