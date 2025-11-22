import React, { useContext, useEffect, useState } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AppContext'

const DoctorDashboard = () => {
  const { dToken, dashData, getDashData, cancelAppointment, completeAppointment } = useContext(DoctorContext)
  const { slotDateFormat, currency } = useContext(AppContext)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (dToken) {
      setLoading(true)
      getDashData().finally(() => setLoading(false))
    }
  }, [dToken])

  const handleCancel = async (id) => {
    if (!confirm('Cancel this appointment?')) return
    await cancelAppointment(id)
    await getDashData()
  }

  const handleComplete = async (id) => {
    if (!confirm('Mark as completed?')) return
    await completeAppointment(id)
    await getDashData()
  }

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-green-600'></div>
      </div>
    )
  }

  if (!dashData) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <p className='text-gray-500'>No data available</p>
      </div>
    )
  }

  const upcomingAppointments = dashData.latestAppointments?.filter(a => !a.cancelled && !a.isCompleted) || []

  return (
    <div className='p-6 max-w-7xl mx-auto'>
      
      {/* Welcome Header */}
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-900'>Doctor Dashboard</h1>
        <p className='text-gray-600 mt-1'>Manage your practice and appointments</p>
      </div>

      {/* Stats Grid - Professional Colors */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6'>
        
        {/* Earnings Card */}
        <div className='bg-white border border-gray-200 rounded-xl p-6 card-hover'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-600 text-sm font-medium mb-1'>Total Earnings</p>
              <p className='text-3xl font-bold text-gray-900'>{currency} {dashData.earnings}</p>
            </div>
            <div className='w-14 h-14 rounded-xl flex items-center justify-center' style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}>
              <svg className='w-7 h-7 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
              </svg>
            </div>
          </div>
        </div>

        {/* Appointments Card */}
        <div className='bg-white border border-gray-200 rounded-xl p-6 card-hover'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-600 text-sm font-medium mb-1'>Total Appointments</p>
              <p className='text-3xl font-bold text-gray-900'>{dashData.appointments}</p>
            </div>
            <div className='w-14 h-14 rounded-xl flex items-center justify-center' style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' }}>
              <svg className='w-7 h-7 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
              </svg>
            </div>
          </div>
        </div>

        {/* Patients Card */}
        <div className='bg-white border border-gray-200 rounded-xl p-6 card-hover'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-600 text-sm font-medium mb-1'>Total Patients</p>
              <p className='text-3xl font-bold text-gray-900'>{dashData.patients}</p>
            </div>
            <div className='w-14 h-14 rounded-xl flex items-center justify-center' style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' }}>
              <svg className='w-7 h-7 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
              </svg>
            </div>
          </div>
        </div>

        {/* Upcoming Card */}
        <div className='bg-white border border-gray-200 rounded-xl p-6 card-hover'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-600 text-sm font-medium mb-1'>Upcoming</p>
              <p className='text-3xl font-bold text-gray-900'>{upcomingAppointments.length}</p>
            </div>
            <div className='w-14 h-14 rounded-xl flex items-center justify-center' style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' }}>
              <svg className='w-7 h-7 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Latest Bookings */}
      <div className='bg-white border border-gray-200 rounded-xl overflow-hidden'>
        <div className='px-6 py-4 border-b border-gray-200 bg-gray-50'>
          <h2 className='font-semibold text-gray-900'>Latest Bookings</h2>
          <p className='text-sm text-gray-600 mt-1'>Recent patient appointments</p>
        </div>

        <div className='divide-y divide-gray-100'>
          {dashData.latestAppointments && dashData.latestAppointments.length > 0 ? (
            dashData.latestAppointments.slice(0, 5).map((item, index) => (
              <div key={item._id || index} className='px-6 py-4 hover:bg-gray-50 transition-colors'>
                <div className='flex items-center justify-between gap-4'>
                  <div className='flex items-center gap-4 flex-1'>
                    <img 
                      className='w-12 h-12 rounded-full object-cover border-2 border-gray-200' 
                      src={item.userData?.image || assets.profile_pic} 
                      alt='' 
                    />
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-semibold text-gray-900 truncate'>
                        {item.userData?.name || 'Unknown Patient'}
                      </p>
                      <p className='text-xs text-gray-500 mt-0.5'>
                        {slotDateFormat(item.slotDate)} at {item.slotTime}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-center gap-3'>
                    {item.cancelled ? (
                      <span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200'>
                        Cancelled
                      </span>
                    ) : item.isCompleted ? (
                      <span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200'>
                        Completed
                      </span>
                    ) : (
                      <>
                        <span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200'>
                          Upcoming
                        </span>
                        <div className='flex items-center gap-2'>
                          <button
                            onClick={() => handleComplete(item._id)}
                            className='p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors'
                            title='Mark as completed'
                          >
                            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleCancel(item._id)}
                            className='p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors'
                            title='Cancel appointment'
                          >
                            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                            </svg>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className='px-6 py-12 text-center'>
              <svg className='mx-auto h-12 w-12 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' />
              </svg>
              <h3 className='mt-2 text-sm font-medium text-gray-900'>No appointments</h3>
              <p className='mt-1 text-sm text-gray-500'>Appointments will appear here once patients book.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DoctorDashboard