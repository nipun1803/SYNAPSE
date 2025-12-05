import React, { useContext, useEffect, useState } from 'react'
import { assets } from '../../assets/assets'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'
import { resolveImageUrl } from '../../lib/resolveImageUrl'
import { toast } from 'react-toastify'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, CheckCircle, XCircle, Search, Trash2, Loader2, RefreshCw } from 'lucide-react'

const AllAppointments = () => {
  const { aToken, appointments, cancelAppointment, getAllAppointments } = useContext(AdminContext)
  const { slotDateFormat, calculateAge, currency, backendUrl } = useContext(AppContext)

  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [deleting, setDeleting] = useState(null)

  const fetchAppointments = async () => {
    if (!aToken) return
    setLoading(true)
    try {
      const paginationData = await getAllAppointments(page, 10)
      if (paginationData) {
        setTotalPages(paginationData.pages || 1)
        setTotalCount(paginationData.total || 0)
        // Update stats from pagination data if available
        if (paginationData.stats) {
          setStats(paginationData.stats)
        }
      }
    } catch (error) {
      console.error('Failed to fetch appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [aToken, page])

  // Calculate stats from current appointments if not provided by backend
  useEffect(() => {
    if (appointments.length > 0) {
      const upcoming = appointments.filter(a => !a.cancelled && !a.isCompleted).length
      const completed = appointments.filter(a => a.isCompleted).length
      const cancelled = appointments.filter(a => a.cancelled).length
      setStats(prev => ({
        total: totalCount || appointments.length,
        upcoming: prev.upcoming || upcoming,
        completed: prev.completed || completed,
        cancelled: prev.cancelled || cancelled
      }))
    }
  }, [appointments, totalCount])

  const safeAge = (dob) => {
    try { return calculateAge(dob) } catch { return '-' }
  }

  const toSrc = (img, fallback) => {
    const src = resolveImageUrl(img, backendUrl)
    return src && !/^data:\s*$/i.test(src) ? src : fallback
  }

  const handleCancel = async (id) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return
    try {
      setCancelling(id)
      await cancelAppointment(id)
      await fetchAppointments()
    } catch (error) {
      console.error(error)
      toast.error('Failed to cancel appointment')
    } finally {
      setCancelling(null)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to permanently delete this appointment? This action cannot be undone.')) return
    try {
      setDeleting(id)
      const res = await fetch(`${backendUrl}/api/admin/appointment/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${aToken}`
        }
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Appointment deleted successfully')
        await fetchAppointments()
      } else {
        toast.error(data.message || 'Failed to delete appointment')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete appointment')
    } finally {
      setDeleting(null)
    }
  }

  const handleRefund = async (id) => {
    if (!confirm('Are you sure you want to refund this appointment? This action cannot be undone.')) return
    try {
      setRefunding(id)
      const res = await fetch(`${backendUrl}/api/payment/refund/${id}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${aToken}`
        }
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Appointment refunded successfully')
        getAllAppointments()
      } else {
        toast.error(data.message || 'Failed to refund appointment')
      }
    } catch (error) {
      console.error('Refund error:', error)
      toast.error('Failed to refund appointment')
    } finally {
      setRefunding(null)
    }
  }

  // Client-side filtering for current page data
  const filteredAppointments = appointments.filter(item => {
    // Status filter
    let statusMatch = true
    if (filter === 'upcoming') statusMatch = !item.cancelled && !item.isCompleted
    if (filter === 'completed') statusMatch = item.isCompleted
    if (filter === 'cancelled') statusMatch = item.cancelled

    // Search filter
    const searchLower = searchTerm.toLowerCase()
    const searchMatch = searchTerm === '' ||
      item.userData?.name?.toLowerCase().includes(searchLower) ||
      item.docData?.name?.toLowerCase().includes(searchLower) ||
      item.userData?.email?.toLowerCase().includes(searchLower)

    return statusMatch && searchMatch
  })

  const filterButtons = [
    { key: 'all', label: 'All', icon: null, color: 'bg-gray-900' },
    { key: 'upcoming', label: 'Upcoming', icon: Clock, color: 'bg-blue-600 hover:bg-blue-700' },
    { key: 'completed', label: 'Completed', icon: CheckCircle, color: 'bg-green-600 hover:bg-green-700' },
    { key: 'cancelled', label: 'Cancelled', icon: XCircle, color: 'bg-red-600 hover:bg-red-700' }
  ]

  return (
    <div className='p-6 max-w-7xl mx-auto space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold text-gray-900'>All Appointments</h1>
        <p className='text-gray-600 mt-1'>Manage and track all patient appointments</p>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 bg-gray-200 rounded-xl flex items-center justify-center'>
                <Calendar className='w-5 h-5 text-gray-600' />
              </div>
              <div>
                <p className='text-xs md:text-sm text-gray-500 font-medium'>Total</p>
                <p className='text-xl md:text-2xl font-bold text-gray-900'>{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100'>
          <CardContent className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 bg-blue-200 rounded-xl flex items-center justify-center'>
                <Clock className='w-5 h-5 text-blue-600' />
              </div>
              <div>
                <p className='text-xs md:text-sm text-blue-600 font-medium'>Upcoming</p>
                <p className='text-xl md:text-2xl font-bold text-gray-900'>{stats.upcoming}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100'>
          <CardContent className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 bg-green-200 rounded-xl flex items-center justify-center'>
                <CheckCircle className='w-5 h-5 text-green-600' />
              </div>
              <div>
                <p className='text-xs md:text-sm text-green-600 font-medium'>Completed</p>
                <p className='text-xl md:text-2xl font-bold text-gray-900'>{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='border-0 shadow-sm bg-gradient-to-br from-red-50 to-red-100'>
          <CardContent className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 bg-red-200 rounded-xl flex items-center justify-center'>
                <XCircle className='w-5 h-5 text-red-600' />
              </div>
              <div>
                <p className='text-xs md:text-sm text-red-600 font-medium'>Cancelled</p>
                <p className='text-xl md:text-2xl font-bold text-gray-900'>{stats.cancelled}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className='p-4'>
          <div className='flex flex-col gap-4'>
            {/* Filter Buttons */}
            <div className='flex flex-wrap gap-2'>
              {filterButtons.map(({ key, label, icon: Icon, color }) => (
                <Button
                  key={key}
                  onClick={() => setFilter(key)}
                  variant={filter === key ? 'default' : 'outline'}
                  size='sm'
                  className={filter === key ? `${color} text-white` : 'text-gray-600'}
                >
                  {Icon && <Icon className='w-4 h-4 mr-1.5' />}
                  {label}
                </Button>
              ))}
            </div>

            {/* Search */}
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
              <input
                type='text'
                placeholder='Search by patient or doctor name...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm'
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Appointments List</CardTitle>
        </CardHeader>
        <CardContent className='p-0'>
          {loading ? (
            <div className='flex justify-center items-center py-16'>
              <Loader2 className='w-8 h-8 text-blue-600 animate-spin' />
            </div>
          ) : filteredAppointments.length > 0 ? (
            <div className='overflow-x-auto'>
              <table className='w-full min-w-[800px]'>
                <thead className='bg-gray-50 border-b'>
                  <tr>
                    <th className='px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>#</th>
                    <th className='px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>Patient</th>
                    <th className='px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>Age</th>
                    <th className='px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>Date & Time</th>
                    <th className='px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>Doctor</th>
                    <th className='px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>Fees</th>
                    <th className='px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>Status</th>
                    <th className='px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>Actions</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-100'>
                  {filteredAppointments.map((item, index) => {
                    const user = item?.userData || {}
                    const doc = item?.docData || {}
                    const userImg = toSrc(user.image, assets.people_icon)
                    const docImg = toSrc(doc.image, assets.doctor_icon)
                    const userName = user.name || 'Unknown Patient'
                    const docName = doc.name || 'Unknown Doctor'
                    const dateStr = item?.slotDate ? slotDateFormat(item.slotDate) : 'Unknown date'
                    const amount = item?.amount ?? 0

                    return (
                      <tr key={item?._id || index} className='hover:bg-gray-50 transition-colors'>
                        <td className='px-4 py-4 text-sm font-medium text-gray-500'>
                          {(page - 1) * 10 + index + 1}
                        </td>
                        <td className='px-4 py-4'>
                          <div className='flex items-center gap-3'>
                            <img
                              src={userImg}
                              className='w-9 h-9 rounded-full object-cover border border-gray-200'
                              alt=''
                              onError={(e) => { e.target.src = assets.people_icon }}
                            />
                            <div className='min-w-0'>
                              <p className='text-sm font-medium text-gray-900 truncate'>{userName}</p>
                              <p className='text-xs text-gray-500 truncate'>{user.email || '-'}</p>
                            </div>
                          </div>
                        </td>
                        <td className='px-4 py-4 text-sm text-gray-600'>{safeAge(user.dob)} yrs</td>
                        <td className='px-4 py-4'>
                          <p className='text-sm font-medium text-gray-900'>{dateStr}</p>
                          <p className='text-xs text-gray-500'>{item?.slotTime || '-'}</p>
                        </td>
                        <td className='px-4 py-4'>
                          <div className='flex items-center gap-3'>
                            <img
                              src={docImg}
                              className='w-9 h-9 rounded-full object-cover border border-gray-200'
                              alt=''
                              onError={(e) => { e.target.src = assets.doctor_icon }}
                            />
                            <div className='min-w-0'>
                              <p className='text-sm font-medium text-gray-900 truncate'>{docName}</p>
                              <p className='text-xs text-gray-500 truncate'>{doc.speciality || '-'}</p>
                            </div>
                          </div>
                        </td>
                        <td className='px-6 py-4 text-sm font-semibold text-gray-900'>{currency}{amount}</td>
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
                        <td className='px-4 py-4'>
                          <div className='flex items-center gap-1'>
                            {!item?.cancelled && !item?.isCompleted && (
                              <Button
                                onClick={() => handleCancel(item?._id)}
                                disabled={cancelling === item?._id}
                                variant='ghost'
                                size='sm'
                                className='h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50'
                              >
                                {cancelling === item?._id ? (
                                  <Loader2 className='w-4 h-4 animate-spin' />
                                ) : (
                                  <>
                                    <XCircle className='w-4 h-4' />
                                    <span className='ml-1 hidden sm:inline'>Cancel</span>
                                  </>
                                )}
                              </Button>
                            )}
                            {item?.cancelled && item?.payment && item?.paymentStatus === 'completed' && (
                              <Button
                                onClick={() => handleRefund(item?._id)}
                                disabled={refunding === item?._id}
                                variant='ghost'
                                size='sm'
                                className='text-orange-600 hover:text-orange-700 hover:bg-orange-50'
                              >
                                {refunding === item?._id ? (
                                  <div className='w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin' />
                                ) : (
                                  <>
                                    Refund
                                  </>
                                )}
                              </Button>
                            )}
                            <Button
                              onClick={() => handleDelete(item?._id)}
                              disabled={deleting === item?._id}
                              variant='ghost'
                              size='sm'
                              className='h-8 px-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                            >
                              {deleting === item?._id ? (
                                <Loader2 className='w-4 h-4 animate-spin' />
                              ) : (
                                <Trash2 className='w-4 h-4' />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className='text-center py-16 px-4'>
              <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <Calendar className='w-8 h-8 text-gray-400' />
              </div>
              <h3 className='text-sm font-medium text-gray-900'>No appointments found</h3>
              <p className='mt-1 text-sm text-gray-500 max-w-sm mx-auto'>
                {searchTerm
                  ? `No results for "${searchTerm}"`
                  : filter === 'all'
                    ? 'No appointments yet.'
                    : `No ${filter} appointments found.`}
              </p>
              {(searchTerm || filter !== 'all') && (
                <Button
                  onClick={() => { setSearchTerm(''); setFilter('all'); }}
                  variant='outline'
                  size='sm'
                  className='mt-4'
                >
                  Clear filters
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='flex justify-center gap-4'>
          <Button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            variant='outline'
            size='sm'
          >
            Previous
          </Button>
          <span className='flex items-center px-4 py-2 text-sm font-medium text-gray-700'>
            Page {page} of {totalPages}
          </span>
          <Button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            variant='outline'
            size='sm'
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}

export default AllAppointments
