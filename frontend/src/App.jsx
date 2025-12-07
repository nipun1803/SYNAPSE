import React, { useContext } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import "react-toastify/dist/ReactToastify.css"
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import { AppContext } from './context/AppContext'
import About from './pages/About'
import Appointment from './pages/Appointment'
import Contact from './pages/Contact'
import Doctors from './pages/Doctors'
import Home from './pages/Home'
import MyAppointments from './pages/Appointments'
import MyProfile from './pages/Profile'
import PaymentHistory from './pages/PaymentHistory'
import PrescriptionHistory from './pages/PrescriptionHistory'
import UnifiedLogin from './pages/UnifiedLogin'
import ChatPage from './pages/ChatPage'


const ProtectedRoute = ({ children }) => {
  const { userData, loading } = useContext(AppContext)

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
      </div>
    )
  }

  if (!userData) {
    return <Navigate to='/unified-login' replace />
  }

  return children
}

const PublicOnlyRoute = ({ children }) => {
  const { userData, loading } = useContext(AppContext)

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
      </div>
    )
  }


  if (userData) {
    return <Navigate to='/' replace />
  }

  return children
}

const App = () => {
  const [isDark, setIsDark] = React.useState(false)

  React.useEffect(() => {
    const updateTheme = () => setIsDark(document.documentElement.classList.contains('dark'))
    updateTheme()
    const observer = new MutationObserver(updateTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-white'>
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
        theme={isDark ? 'dark' : 'light'}
      />
      <Navbar />
      <main className='mx-4 sm:mx-[10%] py-4'>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/doctors' element={<Doctors />} />
          <Route path='/doctors/:speciality' element={<Doctors />} />
          <Route path='/about' element={<About />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/unified-login' element={
            <PublicOnlyRoute>
              <UnifiedLogin />
            </PublicOnlyRoute>
          } />

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
          <Route path='/payment-history' element={
            <ProtectedRoute>
              <PaymentHistory />
            </ProtectedRoute>
          } />
          <Route path='/my-prescriptions' element={
            <ProtectedRoute>
              <PrescriptionHistory />
            </ProtectedRoute>
          } />
          <Route path='/my-prescriptions' element={
            <ProtectedRoute>
              <PrescriptionHistory />
            </ProtectedRoute>
          } />
          <Route path='/chat/:appointmentId' element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App