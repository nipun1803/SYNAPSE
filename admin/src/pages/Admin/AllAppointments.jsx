import React, { useContext, useEffect, useState } from 'react'
import { assets } from '../../assets/assets'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'
import { resolveImageUrl } from '../../lib/resolveImageUrl'
import { toast } from 'react-toastify'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, CheckCircle, XCircle, Search, Trash2, Loader2, RefreshCw, ArrowUpDown } from 'lucide-react'

const AllAppointments = () => {
  const { aToken, appointments, cancelAppointment, getAllAppointments } = useContext(AdminContext)
  const { slotDateFormat, calculateAge, currency, backendUrl } = useContext(AppContext)

  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [deleting, setDeleting] = useState(null)
  const [stats, setStats] = useState({ total: 0, upcoming: 0, completed: 0, cancelled: 0 })
  const [totalCount, setTotalCount] = useState(0)
  const [cancelling, setCancelling] = useState(null)
  const [refunding, setRefunding] = useState(null)
  const [sortConfig, setSortConfig] = useState({ key: 'slotDate', direction: 'desc' })

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
      // Error handled silently
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
      toast.error('Failed to refund appointment')
    } finally {
      setRefunding(null)
    }
  }

  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  // Client-side filtering and sorting
  const filteredAppointments = appointments
    .filter(item => {
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
    .sort((a, b) => {
      if (sortConfig.key === 'slotDate') {
        // Custom date sorting logic if needed, assuming ISO strings or timestamps
        // But here slotDate is likely a string DD_MM_YYYY, which is hard to sort directly
        // So we might need to parse it or rely on createdAt if available
        // Let's try to parse DD_MM_YYYY
        const parseDate = (dateStr) => {
          if (!dateStr) return 0
          const [d, m, y] = dateStr.split('_').map(Number)
          return new Date(y, m - 1, d).getTime()
        }
        const dateA = parseDate(a.slotDate)
        const dateB = parseDate(b.slotDate)
        return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA
      }
      if (sortConfig.key === 'amount') {
        return sortConfig.direction === 'asc' ? (a.amount - b.amount) : (b.amount - a.amount)
      }
      return 0
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
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>All Appointments</h1>
          <p className='text-gray-600 dark:text-gray-400 mt-1'>Manage and track all patient appointments</p>
        </div>
        <Button onClick={fetchAppointments} variant='outline' size='sm' className='gap-2 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card className='dark:bg-gray-800 dark:border-gray-700'>
          <CardContent className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center'>
                <Calendar className='w-5 h-5 text-gray-600 dark:text-gray-300' />
              </div>
              <div>
                <p className='text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium'>Total</p>
                <p className='text-xl md:text-2xl font-bold text-gray-900 dark:text-white'>{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20'>
          <CardContent className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 bg-blue-200 dark:bg-blue-900/40 rounded-xl flex items-center justify-center'>
                <Clock className='w-5 h-5 text-blue-600 dark:text-blue-400' />
              </div>
              <div>
                <p className='text-xs md:text-sm text-blue-600 dark:text-blue-400 font-medium'>Upcoming</p>
                <p className='text-xl md:text-2xl font-bold text-gray-900 dark:text-white'>{stats.upcoming}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20'>
          <CardContent className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 bg-green-200 dark:bg-green-900/40 rounded-xl flex items-center justify-center'>
                <CheckCircle className='w-5 h-5 text-green-600 dark:text-green-400' />
              </div>
              <div>
                <p className='text-xs md:text-sm text-green-600 dark:text-green-400 font-medium'>Completed</p>
                <p className='text-xl md:text-2xl font-bold text-gray-900 dark:text-white'>{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='border-0 shadow-sm bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20'>
          <CardContent className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 bg-red-200 dark:bg-red-900/40 rounded-xl flex items-center justify-center'>
                <XCircle className='w-5 h-5 text-red-600 dark:text-red-400' />
              </div>
              <div>
                <p className='text-xs md:text-sm text-red-600 dark:text-red-400 font-medium'>Cancelled</p>
                <p className='text-xl md:text-2xl font-bold text-gray-900 dark:text-white'>{stats.cancelled}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className='dark:bg-gray-800 dark:border-gray-700'>
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
                  className={filter === key ? `${color} text-white` : 'text-gray-600 dark:text-gray-300 dark:hover:text-white'}
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
                className='w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white dark:bg-gray-800 dark:text-white'
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointments Table */}
      <Card className='dark:bg-gray-800 dark:border-gray-700'>
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
                <thead className='bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700'>
                  <tr>
                    <th className='px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider'>#</th>
                    <th className='px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider'>Patient</th>
                    <th className='px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider'>Age</th>
                    <th
                      className='px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors'
                      onClick={() => handleSort('slotDate')}
                    >
                      <div className='flex items-center gap-1'>
                        Date & Time
                        <ArrowUpDown className='w-3 h-3' />
                      </div>
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>Doctor</th>
                    <th
                      className='px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors'
                      onClick={() => handleSort('amount')}
                    >
                      <div className='flex items-center gap-1'>
                        Fees
                        <ArrowUpDown className='w-3 h-3' />
                      </div>
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>Status</th>
                    <th className='px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>Actions</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-100 dark:divide-gray-700'>
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
                      <tr key={item?._id || index} className='hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors'>
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
                              <p className='text-sm font-medium text-gray-900 dark:text-white truncate'>{userName}</p>
                              <p className='text-xs text-gray-500 dark:text-gray-400 truncate'>{user.email || '-'}</p>
                            </div>
                          </div>
                        </td>
                        <td className='px-4 py-4 text-sm text-gray-600 dark:text-gray-300'>{safeAge(user.dob)} yrs</td>
                        <td className='px-4 py-4'>
                          <p className='text-sm font-medium text-gray-900 dark:text-white'>{dateStr}</p>
                          <p className='text-xs text-gray-500 dark:text-gray-400'>{item?.slotTime || '-'}</p>
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
                              <p className='text-sm font-medium text-gray-900 dark:text-white truncate'>{docName}</p>
                              <p className='text-xs text-gray-500 dark:text-gray-400 truncate'>{doc.speciality || '-'}</p>
                            </div>
                          </div>
                        </td>
                        <td className='px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white'>{currency}{amount}</td>
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
              <h3 className='text-sm font-medium text-gray-900 dark:text-white'>No appointments found</h3>
              <p className='mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto'>
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
          <span className='flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300'>
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
