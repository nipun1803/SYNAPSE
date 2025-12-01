import React, { useContext, useEffect, useState } from 'react'
import { assets } from '../../assets/assets'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'
import { resolveImageUrl } from '../../lib/resolveImageUrl'
import { toast } from 'react-toastify'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Users, Clock, CheckCircle, XCircle, Search, Trash2 } from 'lucide-react'

const AllAppointments = () => {
  const { aToken, appointments, cancelAppointment, getAllAppointments } = useContext(AdminContext)
  const { slotDateFormat, calculateAge, currency, backendUrl } = useContext(AppContext)

  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    if (aToken) {
      const fetchData = async () => {
        setLoading(true)
        const paginationData = await getAllAppointments(page, 5)
        if (paginationData) {
          setTotalPages(paginationData.pages)
        }
        setLoading(false)
      }
      fetchData()
    }
  }, [aToken, page])

  const safeAge = (dob) => {
    try { return calculateAge(dob) } catch { return '-' }
  }

  const toSrc = (img, fallback) => {
    const src = resolveImageUrl(img, backendUrl)
    return src && !/^data:\s*$/i.test(src) ? src : fallback
  }

  const [cancelling, setCancelling] = useState(null)

  const handleCancel = async (id) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return
    try {
      setCancelling(id)
      await cancelAppointment(id)
    } catch (error) {
      console.error(error)
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
        credentials: 'include'
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Appointment deleted successfully')
        getAllAppointments()
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
        <h1 className='text-3xl font-bold text-gray-900'>All Appointments</h1>
        <p className='text-gray-600 mt-1'>Manage and track all patient appointments</p>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center'>
                <Calendar className='w-5 h-5 text-gray-600' />
              </div>
              <div>
                <p className='text-sm text-gray-600'>Total</p>
                <p className='text-2xl font-bold text-gray-900'>{appointments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

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
                placeholder='Search by patient or doctor name...'
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
          <CardTitle>Appointments List</CardTitle>
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
                      <tr key={item?._id || index} className='hover:bg-gray-50'>
                        <td className='px-6 py-4 text-sm font-medium text-gray-900'>{(page - 1) * 5 + index + 1}</td>
                        <td className='px-6 py-4'>
                          <div className='flex items-center gap-3'>
                            <img src={userImg} className='w-10 h-10 rounded-full object-cover' alt='' />
                            <div>
                              <p className='text-sm font-medium text-gray-900'>{userName}</p>
                              <p className='text-xs text-gray-500'>{user.email || '-'}</p>
                            </div>
                          </div>
                        </td>
                        <td className='px-6 py-4 text-sm text-gray-700'>{safeAge(user.dob)} yrs</td>
                        <td className='px-6 py-4'>
                          <p className='text-sm font-medium text-gray-900'>{dateStr}</p>
                          <p className='text-xs text-gray-500'>{item?.slotTime || '-'}</p>
                        </td>
                        <td className='px-6 py-4'>
                          <div className='flex items-center gap-3'>
                            <img src={docImg} className='w-10 h-10 rounded-full object-cover' alt='' />
                            <div>
                              <p className='text-sm font-medium text-gray-900'>{docName}</p>
                              <p className='text-xs text-gray-500'>{doc.speciality || '-'}</p>
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
                        <td className='px-6 py-4'>
                          <div className='flex gap-2'>
                            {!item?.cancelled && !item?.isCompleted && (
                              <Button
                                onClick={() => handleCancel(item?._id)}
                                disabled={cancelling === item?._id}
                                variant='ghost'
                                size='sm'
                                className='text-red-600 hover:text-red-700 hover:bg-red-50'
                              >
                                {cancelling === item?._id ? (
                                  <div className='w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin' />
                                ) : (
                                  <>
                                    <XCircle className='w-4 h-4 mr-1' />
                                    Cancel
                                  </>
                                )}
                              </Button>
                            )}
                            <Button
                              onClick={() => handleDelete(item?._id)}
                              disabled={deleting === item?._id}
                              variant='ghost'
                              size='sm'
                              className='text-gray-600 hover:text-gray-700 hover:bg-gray-50'
                            >
                              {deleting === item?._id ? (
                                <div className='w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin' />
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
            <div className='text-center py-12'>
              <Calendar className='mx-auto h-12 w-12 text-gray-400' />
              <h3 className='mt-2 text-sm font-medium text-gray-900'>No appointments found</h3>
              <p className='mt-1 text-sm text-gray-500'>
                {searchTerm
                  ? `No results for "${searchTerm}"`
                  : filter === 'all'
                    ? 'No appointments yet.'
                    : `No ${filter} appointments found.`}
              </p>
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
