import React, { useContext, useEffect, useState } from 'react'
import { assets } from '../../assets/assets'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'
import { resolveImageUrl } from '../../utils/resolveImageUrl'

const Dashboard = () => {
  const { aToken, getDashData, cancelAppointment, dashData, appointments, getAllAppointments } = useContext(AdminContext)
  const { slotDateFormat, calculateAge, currency, backendUrl } = useContext(AppContext)

  const [totals, setTotals] = useState({ doctors: 0, appointments: 0, patients: 0 })
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (aToken) {
      setLoading(true)
      Promise.all([getDashData(), getAllAppointments()]).finally(() => setLoading(false))
    }
  }, [aToken])

  useEffect(() => {
    if (!dashData) return
    setTotals({
      doctors: dashData.doctors ?? 0,
      appointments: dashData.appointments ?? 0,
      patients: dashData.patients ?? 0,
    })
  }, [dashData])

  const handleCancel = async (id) => {
    if (!confirm('Cancel this appointment?')) return
    await cancelAppointment(id)
    await getAllAppointments()
  }

  const toSrc = (img, fallback) => {
    const src = resolveImageUrl(img, backendUrl)
    return src && !/^data:\s*$/i.test(src) ? src : fallback
  }

  const safeAge = (dob) => {
    try { return calculateAge(dob) } catch { return '-' }
  }

  const filteredAppointments = appointments.filter(item => {
    let statusMatch = true
    if (filter === 'upcoming') statusMatch = !item.cancelled && !item.isCompleted
    if (filter === 'completed') statusMatch = item.isCompleted
    if (filter === 'cancelled') statusMatch = item.cancelled

    const searchMatch = searchTerm === '' || 
      item.userData?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.docData?.name?.toLowerCase().includes(searchTerm.toLowerCase())

    return statusMatch && searchMatch
  })

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
      </div>
    )
  }

  const upcomingCount = appointments.filter(a => !a.cancelled && !a.isCompleted).length
  const completedCount = appointments.filter(a => a.isCompleted).length
  const cancelledCount = appointments.filter(a => a.cancelled).length

  return (
    <div className='p-5 w-full max-w-7xl mx-auto'>
      
      {/* Page Header */}
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-900'>Dashboard</h1>
        <p className='text-gray-600 text-sm mt-1'>Overview of your medical practice</p>
      </div>

      {/* Stats Cards - Professional Colors */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-5 mb-6'>
        {/* Doctors Card */}
        <div className='bg-white border border-gray-200 rounded-xl p-6 card-hover'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-600 text-sm font-medium mb-1'>Total Doctors</p>
              <p className='text-3xl font-bold text-gray-900'>{totals.doctors}</p>
            </div>
            <div className='w-14 h-14 rounded-xl flex items-center justify-center' style={{ background: 'linear-gradient(135deg, #5F6FFF 0%, #4A5AE8 100%)' }}>
              <svg className='w-7 h-7 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
              </svg>
            </div>
          </div>
        </div>

        {/* Appointments Card */}
        <div className='bg-white border border-gray-200 rounded-xl p-6 card-hover'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-600 text-sm font-medium mb-1'>Total Appointments</p>
              <p className='text-3xl font-bold text-gray-900'>{totals.appointments}</p>
            </div>
            <div className='w-14 h-14 rounded-xl flex items-center justify-center' style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}>
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
              <p className='text-3xl font-bold text-gray-900'>{totals.patients}</p>
            </div>
            <div className='w-14 h-14 rounded-xl flex items-center justify-center' style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' }}>
              <svg className='w-7 h-7 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats - Professional Colors */}
      <div className='grid grid-cols-3 gap-4 mb-6'>
        <div className='bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center'>
              <svg className='w-5 h-5 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
              </svg>
            </div>
            <div>
              <p className='text-xs text-blue-700 font-medium'>Upcoming</p>
              <p className='text-2xl font-bold text-blue-900'>{upcomingCount}</p>
            </div>
          </div>
        </div>

        <div className='bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center'>
              <svg className='w-5 h-5 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
              </svg>
            </div>
            <div>
              <p className='text-xs text-green-700 font-medium'>Completed</p>
              <p className='text-2xl font-bold text-green-900'>{completedCount}</p>
            </div>
          </div>
        </div>

        <div className='bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-4'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center'>
              <svg className='w-5 h-5 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' />
              </svg>
            </div>
            <div>
              <p className='text-xs text-red-700 font-medium'>Cancelled</p>
              <p className='text-2xl font-bold text-red-900'>{cancelledCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className='bg-white border border-gray-200 rounded-xl p-5 mb-5'>
        <div className='flex flex-wrap gap-2 mb-4'>
          {[
            { value: 'all', label: 'All', color: 'primary' },
            { value: 'upcoming', label: 'Upcoming', color: 'blue' },
            { value: 'completed', label: 'Completed', color: 'green' },
            { value: 'cancelled', label: 'Cancelled', color: 'red' }
          ].map((btn) => (
            <button
              key={btn.value}
              onClick={() => setFilter(btn.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === btn.value
                  ? btn.color === 'primary' ? 'bg-primary text-white shadow-md' :
                    btn.color === 'blue' ? 'bg-blue-600 text-white shadow-md' :
                    btn.color === 'green' ? 'bg-green-600 text-white shadow-md' :
                    'bg-red-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        <input
          type='text'
          placeholder='Search by patient or doctor name...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20'
        />
      </div>

      {/* Appointments Table */}
      <div className='bg-white border border-gray-200 rounded-xl overflow-hidden'>
        <div className='px-6 py-4 border-b border-gray-200 bg-gray-50'>
          <h2 className='font-semibold text-gray-900'>Latest Appointments</h2>
        </div>

        {filteredAppointments.length > 0 ? (
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-gray-50 border-b border-gray-200'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider'>#</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider'>Patient</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider'>Age</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider'>Date & Time</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider'>Doctor</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider'>Fees</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider'>Status</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider'>Action</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100'>
                {filteredAppointments.map((item, index) => {
                  const user = item?.userData || {}
                  const doc = item?.docData || {}
                  const userImg = toSrc(user.image, assets.people_icon)
                  const docImg = toSrc(doc.image, assets.doctor_icon)

                  return (
                    <tr key={item?._id || index} className='hover:bg-gray-50 transition-colors'>
                      <td className='px-6 py-4 text-sm font-medium text-gray-900'>{index + 1}</td>
                      <td className='px-6 py-4'>
                        <div className='flex items-center gap-3'>
                          <img src={userImg} className='w-10 h-10 rounded-full object-cover border-2 border-gray-200' alt='' />
                          <div>
                            <p className='text-sm font-medium text-gray-900'>{user?.name || 'Unknown'}</p>
                            <p className='text-xs text-gray-500'>{user?.email || '-'}</p>
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4 text-sm text-gray-700'>{safeAge(user.dob)} yrs</td>
                      <td className='px-6 py-4'>
                        <p className='text-sm font-medium text-gray-900'>{item?.slotDate ? slotDateFormat(item.slotDate) : 'TBD'}</p>
                        <p className='text-xs text-gray-500'>{item?.slotTime || '-'}</p>
                      </td>
                      <td className='px-6 py-4'>
                        <div className='flex items-center gap-3'>
                          <img src={docImg} className='w-10 h-10 rounded-full object-cover border-2 border-gray-200' alt='' />
                          <div>
                            <p className='text-sm font-medium text-gray-900'>{doc?.name || 'Unknown'}</p>
                            <p className='text-xs text-gray-500'>{doc?.speciality || '-'}</p>
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4 text-sm font-semibold text-gray-900'>{currency}{item?.amount ?? 0}</td>
                      <td className='px-6 py-4'>
                        {item?.cancelled ? (
                          <span className='inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700 border border-red-200'>
                            Cancelled
                          </span>
                        ) : item?.isCompleted ? (
                          <span className='inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 border border-green-200'>
                            Completed
                          </span>
                        ) : (
                          <span className='inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 border border-blue-200'>
                            Upcoming
                          </span>
                        )}
                      </td>
                      <td className='px-6 py-4'>
                        {!item?.cancelled && !item?.isCompleted ? (
                          <button
                            onClick={() => handleCancel(item?._id)}
                            className='p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors'
                            title='Cancel appointment'
                          >
                            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                            </svg>
                          </button>
                        ) : (
                          <span className='text-gray-400 text-sm'>-</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className='text-center py-12'>
            <svg className='mx-auto h-12 w-12 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' />
            </svg>
            <h3 className='mt-2 text-sm font-medium text-gray-900'>No appointments found</h3>
            <p className='mt-1 text-sm text-gray-500'>
              {searchTerm ? `No results for "${searchTerm}"` : 'Appointments will appear here'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard