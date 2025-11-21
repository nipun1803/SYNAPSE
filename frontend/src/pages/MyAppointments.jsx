import React, { useContext, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'

const MyAppointments = () => {
  const { backendUrl, currencySymbol, slotDateFormat } = useContext(AppContext)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(null)

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${backendUrl || ''}/api/users/appointments`, {
        credentials: 'include',
      })
      const data = await res.json()
      if (data.success) {
        setAppointments(data.appointments || [])
      } else {
        toast.error(data.message || 'Failed to load appointments')
      }
    } catch (err) {
      console.error('Appointments fetch error:', err)
      toast.error('Failed to load appointments.')
    } finally {
      setLoading(false)
    }
  }

  const cancelAppointment = async (id) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return
    
    try {
      setCancelling(id)
      const res = await fetch(`${backendUrl || ''}/api/users/appointments/${id}/cancel`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ appointmentId: id })
      })
      
      const data = await res.json()
      
      if (data.success) {
        toast.success(data.message || 'Appointment cancelled successfully')
        await fetchAppointments()
      } else {
        toast.error(data.message || 'Failed to cancel appointment')
      }
    } catch (err) {
      console.error('Cancel error:', err)
      toast.error('Failed to cancel appointment.')
    } finally {
      setCancelling(null)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-[60vh]'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
      </div>
    )
  }

  return (
    <div className='max-w-6xl mx-auto py-8 px-4'>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900'>My Appointments</h1>
        <p className='text-gray-600 mt-2'>Manage your upcoming and past appointments</p>
      </div>

      {/* Appointments List */}
      {appointments.length > 0 ? (
        <div className='space-y-4'>
          {appointments.map((item) => (
            <div
              key={item._id}
              className='bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow'
            >
              <div className='flex flex-col md:flex-row gap-6'>
                {/* Doctor Image */}
                <div className='flex-shrink-0'>
                  <img
                    className='w-32 h-32 rounded-lg object-cover bg-indigo-50'
                    src={item.docData?.image || assets.doctor_icon}
                    alt={item.docData?.name}
                    onError={(e) => { e.target.src = assets.doctor_icon }}
                  />
                </div>

                {/* Appointment Details */}
                <div className='flex-1 space-y-3'>
                  <div className='flex items-start justify-between'>
                    <div>
                      <h3 className='text-xl font-semibold text-gray-900 flex items-center gap-2'>
                        {item.docData?.name}
                        {item.docData?.verified && (
                          <img src={assets.verified_icon} className='w-5 h-5' alt='Verified' />
                        )}
                      </h3>
                      <p className='text-gray-600 mt-1'>{item.docData?.speciality}</p>
                      <p className='text-sm text-gray-500 mt-1'>{item.docData?.degree}</p>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {item.cancelled ? (
                        <span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200'>
                          Cancelled
                        </span>
                      ) : item.isCompleted ? (
                        <span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200'>
                          Completed
                        </span>
                      ) : (
                        <span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200'>
                          Upcoming
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Address */}
                  <div className='flex items-start gap-2 text-sm text-gray-600'>
                    <svg className='w-5 h-5 text-gray-400 mt-0.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' />
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
                    </svg>
                    <div>
                      <p className='font-medium text-gray-700'>Address:</p>
                      <p>{item.docData?.address?.line1}</p>
                      {item.docData?.address?.line2 && <p>{item.docData?.address?.line2}</p>}
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className='flex items-center gap-2 text-sm'>
                    <svg className='w-5 h-5 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                    </svg>
                    <span className='font-medium text-gray-700'>Date & Time:</span>
                    <span className='text-gray-900'>
                      {slotDateFormat ? slotDateFormat(item.slotDate) : item.slotDate} at {item.slotTime}
                    </span>
                  </div>

                  {/* Fee */}
                  <div className='flex items-center gap-2 text-sm'>
                    <svg className='w-5 h-5 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                    </svg>
                    <span className='font-medium text-gray-700'>Consultation Fee:</span>
                    <span className='text-gray-900 font-semibold'>₹{item.amount || item.docData?.fees}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className='flex md:flex-col gap-3 justify-end md:justify-start md:min-w-[140px]'>
                  {item.payment ? (
                    <button
                      disabled
                      className='px-6 py-2.5 bg-gray-100 text-gray-400 rounded-lg text-sm font-medium cursor-not-allowed'
                    >
                      Paid
                    </button>
                  ) : (
                    <button
                      className='px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors'
                    >
                      Pay Now
                    </button>
                  )}

                  {!item.cancelled && !item.isCompleted && (
                    <button
                      onClick={() => cancelAppointment(item._id)}
                      disabled={cancelling === item._id}
                      className='px-6 py-2.5 border-2 border-red-500 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      {cancelling === item._id ? (
                        <span className='flex items-center gap-2'>
                          <svg className='animate-spin h-4 w-4' fill='none' viewBox='0 0 24 24'>
                            <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                            <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                          </svg>
                          Cancelling...
                        </span>
                      ) : (
                        'Cancel'
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className='text-center py-16 bg-white rounded-xl border border-gray-200'>
          <svg className='mx-auto h-16 w-16 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' />
          </svg>
          <h3 className='mt-4 text-lg font-medium text-gray-900'>No appointments yet</h3>
          <p className='mt-2 text-sm text-gray-500'>Start by booking an appointment with a doctor.</p>
          <button
            onClick={() => window.location.href = '/doctors'}
            className='mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors'
          >
            Browse Doctors
          </button>
        </div>
      )}
    </div>
  )
}

export default MyAppointments