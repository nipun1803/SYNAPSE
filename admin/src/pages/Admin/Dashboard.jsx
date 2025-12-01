import React, { useContext, useEffect, useState } from 'react'
import { assets } from '../../assets/assets'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'
import { resolveImageUrl } from '../../lib/resolveImageUrl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, Calendar, Activity, Clock, CheckCircle, XCircle, Search, TrendingUp } from 'lucide-react'

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
    <div className='p-6 max-w-7xl mx-auto space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold text-gray-900'>Dashboard</h1>
        <p className='text-gray-600 mt-1'>Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <Card className='border-l-4 border-l-blue-500'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>Total Doctors</p>
                <p className='text-3xl font-bold text-gray-900 mt-2'>{totals.doctors}</p>
                <p className='text-xs text-gray-500 mt-1 flex items-center gap-1'>
                  <TrendingUp className='w-3 h-3' />
                  Active professionals
                </p>
              </div>
              <div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center'>
                <Users className='w-6 h-6 text-blue-600' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='border-l-4 border-l-green-500'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>Total Appointments</p>
                <p className='text-3xl font-bold text-gray-900 mt-2'>{totals.appointments}</p>
                <p className='text-xs text-gray-500 mt-1 flex items-center gap-1'>
                  <TrendingUp className='w-3 h-3' />
                  All time bookings
                </p>
              </div>
              <div className='w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center'>
                <Calendar className='w-6 h-6 text-green-600' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='border-l-4 border-l-purple-500'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>Total Patients</p>
                <p className='text-3xl font-bold text-gray-900 mt-2'>{totals.patients}</p>
                <p className='text-xs text-gray-500 mt-1 flex items-center gap-1'>
                  <TrendingUp className='w-3 h-3' />
                  Registered users
                </p>
              </div>
              <div className='w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center'>
                <Activity className='w-6 h-6 text-purple-600' />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className='grid grid-cols-3 gap-4'>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center'>
                <Clock className='w-5 h-5 text-blue-600' />
              </div>
              <div>
                <p className='text-sm text-gray-600'>Upcoming</p>
                <p className='text-2xl font-bold text-gray-900'>{upcomingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center'>
                <CheckCircle className='w-5 h-5 text-green-600' />
              </div>
              <div>
                <p className='text-sm text-gray-600'>Completed</p>
                <p className='text-2xl font-bold text-gray-900'>{completedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center'>
                <XCircle className='w-5 h-5 text-red-600' />
              </div>
              <div>
                <p className='text-sm text-gray-600'>Cancelled</p>
                <p className='text-2xl font-bold text-gray-900'>{cancelledCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className='p-4'>
          <div className='flex flex-col sm:flex-row gap-4'>
            <div className='flex gap-2 flex-wrap'>
              <Button
                onClick={() => setFilter('all')}
                variant={filter === 'all' ? 'default' : 'outline'}
                className={filter === 'all' ? 'bg-gray-900 text-white hover:bg-gray-800' : ''}
                size='sm'
              >
                All
              </Button>
              <Button
                onClick={() => setFilter('upcoming')}
                variant={filter === 'upcoming' ? 'default' : 'outline'}
                className={filter === 'upcoming' ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                size='sm'
              >
                <Clock className='w-4 h-4 mr-1' />
                Upcoming
              </Button>
              <Button
                onClick={() => setFilter('completed')}
                variant={filter === 'completed' ? 'default' : 'outline'}
                className={filter === 'completed' ? 'bg-green-600 text-white hover:bg-green-700' : ''}
                size='sm'
              >
                <CheckCircle className='w-4 h-4 mr-1' />
                Completed
              </Button>
              <Button
                onClick={() => setFilter('cancelled')}
                variant={filter === 'cancelled' ? 'default' : 'outline'}
                className={filter === 'cancelled' ? 'bg-red-600 text-white hover:bg-red-700' : ''}
                size='sm'
              >
                <XCircle className='w-4 h-4 mr-1' />
                Cancelled
              </Button>
            </div>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
              <input
                type='text'
                placeholder='Search by name...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAppointments.length > 0 ? (
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-gray-50 border-b'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase'>#</th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase'>Patient</th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase'>Age</th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase'>Date & Time</th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase'>Doctor</th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase'>Fees</th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase'>Status</th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase'>Action</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-100'>
                  {filteredAppointments.slice(0, 10).map((item, index) => {
                    const user = item?.userData || {}
                    const doc = item?.docData || {}
                    const userImg = toSrc(user.image, assets.people_icon)
                    const docImg = toSrc(doc.image, assets.doctor_icon)

                    return (
                      <tr key={item?._id || index} className='hover:bg-gray-50'>
                        <td className='px-6 py-4 text-sm font-medium text-gray-900'>{index + 1}</td>
                        <td className='px-6 py-4'>
                          <div className='flex items-center gap-3'>
                            <img src={userImg} className='w-10 h-10 rounded-full object-cover' alt='' />
                            <div>
                              <p className='text-sm font-medium text-gray-900'>{user.name || 'Unknown'}</p>
                              <p className='text-xs text-gray-500'>{user.email || '-'}</p>
                            </div>
                          </div>
                        </td>
                        <td className='px-6 py-4 text-sm text-gray-700'>{safeAge(user.dob)} yrs</td>
                        <td className='px-6 py-4'>
                          <p className='text-sm font-medium text-gray-900'>{item?.slotDate ? slotDateFormat(item.slotDate) : '-'}</p>
                          <p className='text-xs text-gray-500'>{item?.slotTime || '-'}</p>
                        </td>
                        <td className='px-6 py-4'>
                          <div className='flex items-center gap-3'>
                            <img src={docImg} className='w-10 h-10 rounded-full object-cover' alt='' />
                            <div>
                              <p className='text-sm font-medium text-gray-900'>{doc.name || 'Unknown'}</p>
                              <p className='text-xs text-gray-500'>{doc.speciality || '-'}</p>
                            </div>
                          </div>
                        </td>
                        <td className='px-6 py-4 text-sm font-semibold text-gray-900'>{currency}{item?.amount ?? 0}</td>
                        <td className='px-6 py-4'>
                          {item?.cancelled ? (
                            <Badge variant='destructive' className='gap-1'>
                              <XCircle className='w-3 h-3' />
                              Cancelled
                            </Badge>
                          ) : item?.isCompleted ? (
                            <Badge className='bg-green-100 text-green-700 hover:bg-green-100 gap-1'>
                              <CheckCircle className='w-3 h-3' />
                              Completed
                            </Badge>
                          ) : (
                            <Badge className='bg-blue-100 text-blue-700 hover:bg-blue-100 gap-1'>
                              <Clock className='w-3 h-3' />
                              Upcoming
                            </Badge>
                          )}
                        </td>
                        <td className='px-6 py-4'>
                          {!item?.cancelled && !item?.isCompleted && (
                            <Button
                              onClick={() => handleCancel(item?._id)}
                              variant='ghost'
                              size='sm'
                              className='text-red-600 hover:text-red-700 hover:bg-red-50'
                            >
                              Cancel
                            </Button>
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
              <Calendar className='mx-auto h-12 w-12 text-gray-400' />
              <h3 className='mt-2 text-sm font-medium text-gray-900'>No appointments found</h3>
              <p className='mt-1 text-sm text-gray-500'>
                {searchTerm ? `No results for "${searchTerm}"` : 'Appointments will appear here'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard