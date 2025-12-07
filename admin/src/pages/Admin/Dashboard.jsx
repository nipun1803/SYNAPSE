import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { assets } from '../../assets/assets'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'
import { resolveImageUrl } from '../../lib/resolveImageUrl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, Calendar, Activity, Clock, CheckCircle, XCircle, Search, TrendingUp, UserPlus, Stethoscope, List } from 'lucide-react'
import DashboardChart from '../../components/DashboardChart'

const Dashboard = () => {
  const navigate = useNavigate()
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
    <div className='p-6 max-w-7xl mx-auto space-y-8'>

      {/* Header & Quick Actions */}
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>Admin Dashboard</h1>
          <p className='text-gray-600 dark:text-gray-400 mt-1'>Overview of system performance and activities.</p>
        </div>
        <div className='flex gap-3'>
          <Button onClick={() => navigate('/add-doctor')} className='bg-primary hover:bg-primary/90 text-white gap-2'>
            <UserPlus className='w-4 h-4' />
            Add Doctor
          </Button>
          <Button onClick={() => navigate('/doctors-list')} variant='outline' className='gap-2'>
            <Stethoscope className='w-4 h-4' />
            Doctors List
          </Button>
          <Button onClick={() => navigate('/all-appointments')} variant='outline' className='gap-2'>
            <List className='w-4 h-4' />
            All Appointments
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <Card className='border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700 dark:border-l-blue-500'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>Total Doctors</p>
                <p className='text-3xl font-bold text-gray-900 dark:text-white mt-2'>{totals.doctors}</p>
                <p className='text-xs text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1 font-medium'>
                  <TrendingUp className='w-3 h-3' />
                  Active professionals
                </p>
              </div>
              <div className='w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center'>
                <Users className='w-6 h-6 text-blue-600 dark:text-blue-400' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700 dark:border-l-green-500'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>Total Appointments</p>
                <p className='text-3xl font-bold text-gray-900 dark:text-white mt-2'>{totals.appointments}</p>
                <p className='text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1 font-medium'>
                  <TrendingUp className='w-3 h-3' />
                  All time bookings
                </p>
              </div>
              <div className='w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center'>
                <Calendar className='w-6 h-6 text-green-600 dark:text-green-400' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700 dark:border-l-purple-500'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>Total Patients</p>
                <p className='text-3xl font-bold text-gray-900 dark:text-white mt-2'>{totals.patients}</p>
                <p className='text-xs text-purple-600 dark:text-purple-400 mt-1 flex items-center gap-1 font-medium'>
                  <TrendingUp className='w-3 h-3' />
                  Registered users
                </p>
              </div>
              <div className='w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center'>
                <Activity className='w-6 h-6 text-purple-600 dark:text-purple-400' />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Chart */}
      {/* Analytics Chart */}
      {dashData && (
        <DashboardChart data={dashData.chartData} allAppointments={dashData.allAppointments} isAdmin={true} />
      )}

      {/* Appointment Status Breakdown */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        <Card className='bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800'>
          <CardContent className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center'>
                <Clock className='w-5 h-5 text-blue-600 dark:text-blue-400' />
              </div>
              <div>
                <p className='text-sm text-gray-600 dark:text-gray-400'>Upcoming</p>
                <p className='text-2xl font-bold text-gray-900 dark:text-white'>{upcomingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='bg-green-50/50 dark:bg-green-900/10 border-green-100 dark:border-green-800'>
          <CardContent className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center'>
                <CheckCircle className='w-5 h-5 text-green-600 dark:text-green-400' />
              </div>
              <div>
                <p className='text-sm text-gray-600 dark:text-gray-400'>Completed</p>
                <p className='text-2xl font-bold text-gray-900 dark:text-white'>{completedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-800'>
          <CardContent className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center'>
                <XCircle className='w-5 h-5 text-red-600 dark:text-red-400' />
              </div>
              <div>
                <p className='text-sm text-gray-600 dark:text-gray-400'>Cancelled</p>
                <p className='text-2xl font-bold text-gray-900 dark:text-white'>{cancelledCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtering & Search */}
      <Card className='shadow-sm dark:bg-gray-800 dark:border-gray-700'>
        <CardContent className='p-4'>
          <div className='flex flex-col sm:flex-row gap-4 justify-between'>
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
            <div className='relative w-full sm:w-64'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
              <input
                type='text'
                placeholder='Search by name...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-gray-800 dark:text-white'
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Appointments Table */}
      <Card className='shadow-sm border-gray-200 dark:border-gray-700 dark:bg-gray-800'>
        <CardHeader className='border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50'>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2'>
              <Activity className='w-5 h-5 text-blue-600' />
              Recent Appointments
            </CardTitle>
            <Button variant='ghost' size='sm' onClick={() => navigate('/all-appointments')} className='text-blue-600 hover:text-blue-700'>
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent className='p-0'>
          {filteredAppointments.length > 0 ? (
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700'>
                  <tr>
                    <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>#</th>
                    <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>Patient</th>
                    <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>Date & Time</th>
                    <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>Doctor</th>
                    <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>Fees</th>
                    <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>Status</th>
                    <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>Action</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800'>
                  {filteredAppointments.slice(0, 10).map((item, index) => {
                    const user = item?.userData || {}
                    const doc = item?.docData || {}
                    const userImg = toSrc(user.image, assets.people_icon)
                    const docImg = toSrc(doc.image, assets.doctor_icon)

                    return (
                      <tr key={item?._id || index} className='hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'>
                        <td className='px-6 py-4 text-sm font-medium text-gray-900'>{index + 1}</td>
                        <td className='px-6 py-4'>
                          <div className='flex items-center gap-3'>
                            <img src={userImg} className='w-10 h-10 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm' alt='' />
                            <div>
                              <p className='text-sm font-semibold text-gray-900 dark:text-white'>{user.name || 'Unknown'}</p>
                              <p className='text-xs text-gray-500 dark:text-gray-400'>{safeAge(user.dob)} yrs</p>
                            </div>
                          </div>
                        </td>
                        <td className='px-6 py-4'>
                          <div className='flex flex-col'>
                            <span className='text-sm font-medium text-gray-900 dark:text-gray-200'>
                              {item?.slotDate ? slotDateFormat(item.slotDate) : '-'}
                            </span>
                            <span className='text-xs text-gray-500 flex items-center gap-1 mt-0.5'>
                              <Clock className='w-3 h-3' />
                              {item?.slotTime || '-'}
                            </span>
                          </div>
                        </td>
                        <td className='px-6 py-4'>
                          <div className='flex items-center gap-3'>
                            <img src={docImg} className='w-8 h-8 rounded-full object-cover border border-gray-100 dark:border-gray-700' alt='' />
                            <p className='text-sm font-medium text-gray-900 dark:text-white'>{doc.name || 'Unknown'}</p>
                          </div>
                        </td>
                        <td className='px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white'>{currency}{item?.amount ?? 0}</td>
                        <td className='px-6 py-4'>
                          {item?.cancelled ? (
                            <Badge variant='destructive' className='bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-100 gap-1 pl-1.5'>
                              <XCircle className='w-3.5 h-3.5' />
                              Cancelled
                            </Badge>
                          ) : item?.isCompleted ? (
                            <Badge className='bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 hover:bg-green-100 gap-1 pl-1.5'>
                              <CheckCircle className='w-3.5 h-3.5' />
                              Completed
                            </Badge>
                          ) : (
                            <Badge className='bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-100 gap-1 pl-1.5'>
                              <Clock className='w-3.5 h-3.5' />
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
                              className='text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0 rounded-full'
                              title='Cancel Appointment'
                            >
                              <XCircle className='w-4 h-4' />
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
              <div className='w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4'>
                <Calendar className='h-8 w-8 text-gray-400 dark:text-gray-500' />
              </div>
              <h3 className='text-lg font-medium text-gray-900 dark:text-white'>No appointments found</h3>
              <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
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