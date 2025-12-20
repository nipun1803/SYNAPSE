import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import prescriptionService from '../api/prescriptionService'
import axios from 'axios'
import ReviewModal from '../components/ReviewModal'
import ChatWindow from '../components/ChatWindow'
import { toast } from 'react-toastify'
import { userService, doctorService, reviewService } from '../api/services'
import { MapPin, Calendar, Clock, DollarSign, CreditCard, Loader2, ClipboardList, CheckCircle, CheckCircle2, FileText, X, RefreshCw, MessageSquare, User, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'

const Appointments = () => {
  const navigate = useNavigate()
  const { currencySymbol, slotDateFormat, backendUrl, token, getDoctorsData } = useContext(AppContext)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // 'all', 'upcoming', 'completed', 'cancelled'
  const [filterDocId, setFilterDocId] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [doctors, setDoctors] = useState([])
  const [cancelling, setCancelling] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedPrescription, setSelectedPrescription] = useState(null)
  const [loadingPrescription, setLoadingPrescription] = useState(false)
  const [rescheduleModal, setRescheduleModal] = useState(null)
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [rescheduleTime, setRescheduleTime] = useState('')
  const [rescheduling, setRescheduling] = useState(false)
  const [availableSlots, setAvailableSlots] = useState([])
  const [reviewModal, setReviewModal] = useState(null)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  const handleViewPrescription = async (prescriptionId) => {
    try {
      setLoadingPrescription(true)
      if (!prescriptionId) {
        toast.error('Invalid prescription ID')
        return
      }
      const data = await prescriptionService.getPrescriptionById(prescriptionId)
      if (data.success) {
        setSelectedPrescription(data.prescription)
      } else {
        toast.error(data.message || 'Prescription not found')
      }
    } catch (error) {
      toast.error('Failed to load prescription details')
    } finally {
      setLoadingPrescription(false)
    }
  }

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      setLoading(true)
      // Convert date from YYYY-MM-DD to DD_MM_YYYY for backend if present
      let formattedDate = ''
      if (filterDate) {
        const [y, m, d] = filterDate.split('-')
        formattedDate = `${d}_${m}_${y}`
      }

      const params = { page, limit: 5, filter }
      if (filterDocId) params.docId = filterDocId
      if (formattedDate) params.date = formattedDate

      const data = await userService.getAppointments(params)

      if (data.success) {
        setAppointments(data.appointments || [])
        if (data.pagination) {
          setTotalPages(data.pagination.pages)
        }
      } else {
        toast.error(data.message || 'Failed to load appointments')
      }
    } catch (error) {
      toast.error('Failed to load appointments.')
    } finally {
      setLoading(false)
    }
  }

  const cancelAppointment = async (id) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return

    try {
      setCancelling(id)
      const data = await userService.cancelAppointment(id)

      if (data.success) {
        toast.success(data.message || 'Appointment cancelled successfully')
        await fetchAppointments()
      } else {
        toast.error(data.message || 'Failed to cancel appointment')
      }
    } catch (error) {
      toast.error('Failed to cancel appointment.')
    } finally {
      setCancelling(null)
    }
  }

  const deleteAppointment = async (id) => {
    if (!confirm('Are you sure you want to delete this appointment? This action cannot be undone.')) return

    try {
      setDeleting(id)
      const data = await userService.deleteAppointment(id)

      if (data.success) {
        toast.success(data.message || 'Appointment deleted successfully')
        await fetchAppointments()
      } else {
        toast.error(data.message || 'Failed to delete appointment')
      }
    } catch (error) {
      toast.error('Failed to delete appointment.')
    } finally {
      setDeleting(null)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [page, filter, filterDocId, filterDate])

  // Fetch doctors for the filter dropdown
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const data = await doctorService.getList()
        if (data.success) {
          setDoctors(data.doctors)
        }
      } catch (error) {
        console.error("Failed to load doctors list")
      }
    }
    fetchDoctors()
  }, [])

  const handleFilterChange = (newFilter) => {
    if (newFilter === filter) return
    setFilter(newFilter)
    setPage(1)
  }

  const clearFilters = () => {
    setFilter('all')
    setFilterDocId('')
    setFilterDate('')
    setPage(1)
  }

  // Generate available time slots
  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 9; hour <= 17; hour++) {
      slots.push(`${hour}:00`)
      if (hour < 17) slots.push(`${hour}: 30`)
    }
    return slots
  }

  // Generate available dates (next 7 days)
  const generateAvailableDates = () => {
    const dates = []
    const today = new Date()
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = date.getFullYear()
      dates.push(`${day}_${month}_${year}`)
    }
    return dates
  }

  const handleReschedule = async () => {
    if (!rescheduleDate || !rescheduleTime) {
      toast.error('Please select both date and time')
      return
    }

    try {
      setRescheduling(true)
      const data = await userService.rescheduleAppointment(rescheduleModal._id, {
        slotDate: rescheduleDate,
        slotTime: rescheduleTime
      })

      if (data.success) {
        toast.success(data.message || 'Appointment rescheduled successfully')
        setRescheduleModal(null)
        setRescheduleDate('')
        setRescheduleTime('')
        await fetchAppointments()
      } else {
        toast.error(data.message || 'Failed to reschedule appointment')
      }
    } catch (error) {
      toast.error('Failed to reschedule appointment.')
    } finally {
      setRescheduling(false)
    }
  }

  const openRescheduleModal = async (appointment) => {
    setRescheduleModal(appointment)
    setRescheduleDate('')
    setRescheduleTime('')
    setAvailableSlots([])

    // Fetch doctor's availability when modal opens
    try {
      const docId = appointment.docData?._id
      if (docId) {
        const data = await doctorService.getAvailability(docId)
        if (data.success) {
          // Store availability data in state or ref to use when date is selected
          setDoctorAvailability(data)
        }
      }
    } catch (error) {
      console.error('Failed to fetch doctor availability', error)
      toast.error('Could not load doctor availability')
    }
  }

  const [doctorAvailability, setDoctorAvailability] = useState(null)

  const handleOpenReviewModal = (appointment) => {
    setReviewModal(appointment)
    setReviewRating(5)
    setReviewComment('')
  }

  const handleSubmitReview = async () => {
    if (!reviewComment.trim()) {
      toast.error('Please enter a comment')
      return
    }

    try {
      setSubmittingReview(true)
      const data = await reviewService.addReview({
        docId: reviewModal.docData._id,
        rating: reviewRating,
        comment: reviewComment
      })

      if (data.success) {
        toast.success('Review added successfully')
        setReviewModal(null)
        // Optionally refresh appointments or just close
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error('Failed to add review')
    } finally {
      setSubmittingReview(false)
    }
  }

  // Update slots when date changes
  useEffect(() => {
    if (rescheduleDate && doctorAvailability && rescheduleModal) {
      const dateKey = rescheduleDate // Already in DD_MM_YYYY format from selection

      const available = doctorAvailability.available_slots?.[dateKey] || []
      const booked = doctorAvailability.slots_booked?.[dateKey] || []

      // Filter available slots
      const now = new Date()
      const [d, m, y] = dateKey.split('_')
      const selectedDateObj = new Date(y, m - 1, d)
      const isToday = selectedDateObj.toDateString() === now.toDateString()

      const validSlots = available.filter(time => {
        // Filter booked slots
        if (booked.includes(time)) return false

        // Filter past slots if today
        if (isToday) {
          const [timeStr, period] = time.split(' ')
          let [hours, minutes] = timeStr.split(':').map(Number)
          if (period === 'PM' && hours !== 12) hours += 12
          if (period === 'AM' && hours === 12) hours = 0

          const slotTime = new Date(selectedDateObj)
          slotTime.setHours(hours, minutes, 0, 0)
          return slotTime > now
        }
        return true
      })

      setAvailableSlots(validSlots)
      setRescheduleTime('') // Reset time when date changes
    }
  }, [rescheduleDate, doctorAvailability])



  if (loading) {
    return (
      <div className='max-w-6xl mx-auto py-8 px-4 space-y-4'>
        <div className='mb-8'>
          <Skeleton className='h-10 w-64 mb-2' />
          <Skeleton className='h-5 w-96' />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className='border border-gray-200 rounded-lg p-6 flex flex-col md:flex-row gap-6'>
            <Skeleton className='w-full md:w-48 h-48 rounded-lg' />
            <div className='flex-1 space-y-4'>
              <div className='flex justify-between'>
                <div className='space-y-2'>
                  <Skeleton className='h-6 w-48' />
                  <Skeleton className='h-4 w-32' />
                </div>
                <Skeleton className='h-6 w-24 rounded-full' />
              </div>
              <div className='space-y-2'>
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-4 w-3/4' />
              </div>
              <div className='flex justify-end gap-2 mt-4'>
                <Skeleton className='h-10 w-32' />
                <Skeleton className='h-10 w-32' />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className='max-w-6xl mx-auto py-8 px-4'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>My Appointments</h1>
        <p className='text-gray-600 dark:text-gray-400 mt-2'>Manage your upcoming and past appointments</p>
      </div>

      {/* Filter Tabs */}
      <div className='flex flex-wrap gap-2 mb-6'>
        {[
          { id: 'all', label: 'All Appointments' },
          { id: 'upcoming', label: 'Upcoming' },
          { id: 'completed', label: 'Completed' },
          { id: 'cancelled', label: 'Cancelled' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleFilterChange(tab.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 
              ${filter === tab.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              } `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Advanced Filters */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6 transition-all duration-300">
        <div className="flex flex-col md:flex-row gap-4 items-end">

          <div className="w-full md:flex-1">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
              <User size={14} className="text-blue-500" />
              Filter by Doctor
            </label>
            <div className="relative">
              <select
                value={filterDocId}
                onChange={(e) => { setFilterDocId(e.target.value); setPage(1); }}
                className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
              >
                <option value="">All Doctors</option>
                {doctors.map(doc => (
                  <option key={doc._id} value={doc._id}>{doc.name} - {doc.speciality}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-gray-400">
                <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
              </div>
            </div>
          </div>

          <div className="w-full md:flex-1">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
              <Calendar size={14} className="text-blue-500" />
              Filter by Date
            </label>
            <Input
              type="date"
              value={filterDate}
              onChange={(e) => { setFilterDate(e.target.value); setPage(1); }}
              className="w-full"
            />
          </div>

          {(filter !== 'all' || filterDocId || filterDate) && (
            <div className="w-full md:w-auto">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full md:w-auto text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-900/30 gap-2 h-10"
              >
                <X size={16} /> Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>

      {appointments.length > 0 ? (
        <div className='space-y-4'>
          {appointments.map((item) => (
            <Card key={item._id} className='group border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden bg-white dark:bg-gray-800'>
              <CardContent className='p-0'>
                <div className='flex flex-col md:flex-row'>
                  {/* Doctor Image Section */}
                  <div className='w-full md:w-48 h-48 md:h-auto relative bg-indigo-50 dark:bg-indigo-900/20 flex-shrink-0'>
                    <img
                      className='w-full h-full object-cover object-top'
                      src={item.docData?.image || assets.doctor_icon}
                      alt={item.docData?.name}
                      onError={(e) => { e.target.src = assets.doctor_icon }}
                    />
                    <div className='absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity' />
                  </div>

                  {/* Content Section */}
                  <div className='flex-1 p-6 flex flex-col justify-between'>
                    <div>
                      <div className='flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4'>
                        <div>
                          <h3 className='text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors'>
                            {item.docData?.name}
                            {item.docData?.verified && (
                              <img src={assets.verified_icon} className='w-5 h-5' alt='Verified' title='Verified Doctor' />
                            )}
                          </h3>
                          <p className='text-gray-600 dark:text-gray-300 font-medium'>{item.docData?.speciality}</p>
                          <p className='text-sm text-gray-500 dark:text-gray-400'>{item.docData?.degree}</p>
                        </div>

                        <div className='flex flex-wrap gap-2'>
                          {item.cancelled ? (
                            <Badge variant='destructive' className='bg-red-50 text-red-700 border-red-200 hover:bg-red-100'>
                              Cancelled
                            </Badge>
                          ) : item.isCompleted ? (
                            <Badge className='bg-green-50 text-green-700 border-green-200 hover:bg-green-100'>
                              Completed
                            </Badge>
                          ) : (
                            <Badge className='bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'>
                              Upcoming
                            </Badge>
                          )}

                          {/* Payment Status Badges */}
                          {item.payment ? (
                            item.paymentStatus === 'completed' ? (
                              <Badge className='bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 gap-1'>
                                <CheckCircle className='w-3 h-3' />
                                Paid
                              </Badge>
                            ) : item.paymentStatus === 'refunded' ? (
                              <Badge className='bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'>
                                Refunded
                              </Badge>
                            ) : (
                              <Badge variant='outline' className='text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600'>
                                Payment Pending
                              </Badge>
                            )
                          ) : !item.cancelled && (
                            <Badge className='bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100 gap-1'>
                              <DollarSign className='w-3 h-3' />
                              Pay at Clinic
                            </Badge>
                          )}
                        </div>
                      </div>

                      {!item.cancelled && (
                        <div className='flex gap-2 w-full sm:w-auto'>
                          <button
                            onClick={() => navigate(`/chat/${item._id}`)}
                            className='flex-1 sm:flex-none text-sm text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-all px-4 py-2 flex items-center justify-center gap-1'
                          >
                            <MessageSquare size={16} /> Chat
                          </button>

                          {!item.isCompleted ? (
                            <button className='flex-1 sm:flex-none text-sm text-stone-500 border rounded hover:bg-primary hover:text-white transition-all px-4 py-2'>
                              Pay Online
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenReviewModal(item)}
                              className='flex-1 sm:flex-none text-sm text-primary border border-primary rounded hover:bg-primary hover:text-white transition-all px-4 py-2'
                            >
                              Rate Doctor
                            </button>
                          )}
                        </div>
                      )}

                      {item.cancelled && (
                        <button className='sm:min-w-48 py-2 border border-red-500 rounded text-red-500'>Appointment cancelled</button>
                      )}

                      {/* Appointment Timeline */}
                      {!item.cancelled && (
                        <div className='mb-6 px-2'>
                          <div className='flex items-center justify-between relative'>
                            {/* Progress Line */}
                            <div className='absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-100 -z-10 rounded-full'></div>
                            <div
                              className='absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-green-500 -z-10 rounded-full transition-all duration-500'
                              style={{
                                width: item.isCompleted ? '100%' : item.payment || item.paymentStatus === 'completed' ? '50%' : '0%'
                              }}
                            ></div>

                            {/* Steps */}
                            <div className='flex flex-col items-center gap-1'>
                              <div className='w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold shadow-sm ring-4 ring-white'>
                                <CheckCircle2 className='w-4 h-4' />
                              </div>
                              <span className='text-xs font-medium text-gray-700 dark:text-gray-300'>Booked</span>
                            </div>

                            <div className='flex flex-col items-center gap-1'>
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ring-4 ring-white dark: ring-gray-800 transition-colors duration-300 ${item.payment || item.paymentStatus === 'completed' || item.isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                                } `}>
                                {item.payment || item.paymentStatus === 'completed' || item.isCompleted ? <CheckCircle2 className='w-4 h-4' /> : '2'}
                              </div>
                              <span className={`text-xs font-medium ${item.payment || item.paymentStatus === 'completed' || item.isCompleted ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'} `}>Paid</span>
                            </div>

                            <div className='flex flex-col items-center gap-1'>
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ring-4 ring-white dark: ring-gray-800 transition-colors duration-300 ${item.isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                                } `}>
                                {item.isCompleted ? <CheckCircle2 className='w-4 h-4' /> : '3'}
                              </div>
                              <span className={`text-xs font-medium ${item.isCompleted ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'} `}>Completed</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4'>
                      </div>

                      <div className='grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 mb-6'>
                        <div className='flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300'>
                          <div className='w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0'>
                            <Calendar className='w-4 h-4 text-blue-600' />
                          </div>
                          <div>
                            <p className='text-xs text-gray-500 font-medium uppercase tracking-wide'>Date & Time</p>
                            <p className='font-semibold'>
                              {slotDateFormat(item.slotDate)} | {item.slotTime}
                            </p>
                          </div>
                        </div>

                        <div className='flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300'>
                          <div className='w-8 h-8 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0'>
                            <MapPin className='w-4 h-4 text-green-600' />
                          </div>
                          <div>
                            <p className='text-xs text-gray-500 font-medium uppercase tracking-wide'>Location</p>
                            <p className='font-medium truncate max-w-[200px]' title={item.docData?.address?.line1}>
                              {item.docData?.address?.line1}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Reason for Visit */}
                      {item.purpose && (
                        <div className='mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100'>
                          <p className='text-xs text-blue-600 font-medium uppercase tracking-wide mb-1'>Reason for Visit</p>
                          <p className='text-sm text-gray-700 dark:text-gray-300'>{item.purpose}</p>
                        </div>
                      )}
                    </div>

                    <div className='pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4'>
                      <div className='flex items-center gap-2'>
                        <div className='p-2 bg-gray-50 dark:bg-gray-700 rounded-lg'>
                          <CreditCard className='w-5 h-5 text-gray-600 dark:text-gray-300' />
                        </div>
                        <div>
                          <p className='text-xs text-gray-500 font-medium uppercase'>Amount</p>
                          <p className='text-lg font-bold text-gray-900 dark:text-white'>{currencySymbol}{item.amount || item.docData?.fees}</p>
                        </div>
                      </div>

                      <div className='flex flex-wrap gap-2 justify-end md:justify-start'>
                        {/* View Prescription button-for completed appointments with prescription */}
                        {item.isCompleted && item.prescriptionId && (
                          <Button
                            onClick={() => handleViewPrescription(item.prescriptionId)}
                            disabled={loadingPrescription}
                            variant='outline'
                            className='border-2 border-green-500 text-green-600 hover:bg-green-50'
                          >
                            {loadingPrescription ? (
                              <Loader2 className='w-4 h-4 animate-spin' />
                            ) : (
                              <>
                                <FileText className='w-4 h-4 mr-1' />
                                View Prescription
                              </>
                            )}
                          </Button>
                        )}

                        {/* Rate Doctor button-for completed appointments */}
                        {item.isCompleted && (
                          <Button
                            onClick={() => handleOpenReviewModal(item)}
                            variant='outline'
                            className='border-2 border-yellow-500 text-yellow-600 hover:bg-yellow-50'
                          >
                            <span className='mr-1'>★</span>
                            Rate Doctor
                          </Button>
                        )}

                        {/* Reschedule button-for upcoming appointments, only if not already rescheduled */}
                        {!item.cancelled && !item.isCompleted && (!item.rescheduleCount || item.rescheduleCount < 1) && (
                          <Button
                            onClick={() => openRescheduleModal(item)}
                            variant='outline'
                            className='border-2 border-blue-500 text-blue-600 hover:bg-blue-50'
                          >
                            <RefreshCw className='w-4 h-4 mr-1' />
                            Reschedule
                          </Button>
                        )}

                        {/* Cancel button-for upcoming appointments */}
                        {!item.cancelled && !item.isCompleted && (
                          <Button
                            onClick={() => cancelAppointment(item._id)}
                            disabled={cancelling === item._id}
                            variant='outline'
                            className='border-2 border-red-500 text-red-600 hover:bg-red-50'
                          >
                            {cancelling === item._id ? (
                              <>
                                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                                Cancelling...
                              </>
                            ) : (
                              'Cancel'
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {totalPages > 1 && (
            <div className='flex justify-center gap-4 mt-6'>
              <Button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                variant='outline'
              >
                Previous
              </Button>
              <span className='flex items-center'>Page {page} of {totalPages}</span>
              <Button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                variant='outline'
              >
                Next
              </Button>
            </div>
          )}
        </div>
      ) : (
        <Card className='border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'>
          <CardContent className='text-center py-16'>
            <div className='w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4'>
              <ClipboardList className='w-8 h-8 text-gray-400 dark:text-gray-500' />
            </div>
            <h3 className='text-lg font-medium text-gray-900 dark:text-white'>No appointments yet</h3>
            <p className='mt-2 text-sm text-gray-500 dark:text-gray-400'>Start by booking an appointment with a doctor.</p>
            <Button
              onClick={() => window.location.href = '/doctors'}
              className='mt-6 bg-blue-600 hover:bg-blue-700 text-white'
            >
              Browse Doctors
            </Button>
          </CardContent>
        </Card>
      )}


      {/* Prescription Modal */}
      {selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Prescription Details</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">#{selectedPrescription.prescriptionNumber || selectedPrescription._id}</p>
              </div>
              <button
                onClick={() => setSelectedPrescription(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Doctor & Date Info */}
              <div className="flex flex-col sm:flex-row justify-between gap-4 bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <img
                      src={selectedPrescription.doctorId?.image || assets.doctor_icon}
                      alt="Doctor"
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => { e.target.src = assets.doctor_icon }}
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Dr. {selectedPrescription.doctorId?.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedPrescription.doctorId?.speciality}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
                  <p className="font-medium text-gray-900 dark:text-white">{slotDateFormat(selectedPrescription.createdAt)}</p>
                </div>
              </div>

              {/* Diagnosis */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Diagnosis</h3>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-100 dark:border-gray-600">
                  <p className="text-gray-700 dark:text-gray-300">{selectedPrescription.diagnosis}</p>
                </div>
              </div>

              {/* Medications */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Medications</h3>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-4 py-3">Drug Name</th>
                        <th className="px-4 py-3">Dosage</th>
                        <th className="px-4 py-3">Frequency</th>
                        <th className="px-4 py-3">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedPrescription.medications?.map((med, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{med.drugName}</td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{med.dosage}</td>
                          <td className="px-4 py-3">
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                              {med.frequency}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{med.duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Notes */}
              {selectedPrescription.notes && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Doctor's Notes</h3>
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-yellow-800">
                    <p>{selectedPrescription.notes}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
              <Button
                onClick={() => window.print()}
                variant="outline"
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Print Prescription
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Reschedule Appointment</h2>
                <p className="text-sm text-gray-500">with Dr. {rescheduleModal.docData?.name}</p>
              </div>
              <button
                onClick={() => setRescheduleModal(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
                <select
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose a date</option>
                  {generateAvailableDates().map(date => {
                    const [d, m, y] = date.split('_')
                    const displayDate = new Date(y, m - 1, d).toLocaleDateString('en-US', {
                      weekday: 'short', month: 'short', day: 'numeric'
                    })
                    return (
                      <option key={date} value={date}>{displayDate}</option>
                    )
                  })}
                </select>
              </div>

              {/* Time Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Time</label>
                <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                  {availableSlots.map(slot => (
                    <button
                      key={slot}
                      onClick={() => setRescheduleTime(slot)}
                      className={`px-3 py-2 text-sm rounded-lg border transition-colors ${rescheduleTime === slot
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'
                        } `}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <Button
                onClick={() => setRescheduleModal(null)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={handleReschedule}
                disabled={rescheduling || !rescheduleDate || !rescheduleTime}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {rescheduling ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Rescheduling...
                  </>
                ) : (
                  'Confirm Reschedule'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Rate & Review</h2>
                <p className="text-sm text-gray-500">Dr. {reviewModal.docData?.name}</p>
              </div>
              <button
                onClick={() => setReviewModal(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className='flex flex-col gap-4'>
                <div className='flex items-center justify-center gap-2'>
                  <div className='flex gap-2'>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className={`text-3xl focus: outline-none transition-colors ${star <= reviewRating ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-200'
                          } `}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder='Share your experience with this doctor...'
                  className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent min-h-[120px]'
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <Button
                onClick={() => setReviewModal(null)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitReview}
                disabled={submittingReview}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                {submittingReview ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Review'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Appointments
