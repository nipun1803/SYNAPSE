import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Calendar, Clock, DollarSign, CreditCard, Loader2, ClipboardList, CheckCircle, FileText, X, RefreshCw } from 'lucide-react'
import { userService } from '../api/services'
import prescriptionService from '../api/prescriptionService'

const MyAppointments = () => {
  const navigate = useNavigate()
  const { currencySymbol, slotDateFormat } = useContext(AppContext)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
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
      const data = await userService.getAppointments({ page, limit: 5 })

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
  }, [page])

  // Generate available time slots
  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 9; hour <= 17; hour++) {
      slots.push(`${hour}:00`)
      if (hour < 17) slots.push(`${hour}:30`)
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

  const openRescheduleModal = (appointment) => {
    setRescheduleModal(appointment)
    setRescheduleDate('')
    setRescheduleTime('')
    setAvailableSlots(generateTimeSlots())
  }

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-[60vh]'>
        <Loader2 className='w-12 h-12 text-blue-600 animate-spin' />
      </div>
    )
  }

  return (
    <div className='max-w-6xl mx-auto py-8 px-4'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900'>My Appointments</h1>
        <p className='text-gray-600 mt-2'>Manage your upcoming and past appointments</p>
      </div>

      {appointments.length > 0 ? (
        <div className='space-y-4'>
          {appointments.map((item) => (
            <Card key={item._id} className='group border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden'>
              <CardContent className='p-0'>
                <div className='flex flex-col md:flex-row'>
                  {/* Doctor Image Section */}
                  <div className='w-full md:w-48 h-48 md:h-auto relative bg-indigo-50 flex-shrink-0'>
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
                          <h3 className='text-xl font-bold text-gray-900 flex items-center gap-2 group-hover:text-blue-600 transition-colors'>
                            {item.docData?.name}
                            {item.docData?.verified && (
                              <img src={assets.verified_icon} className='w-5 h-5' alt='Verified' title='Verified Doctor' />
                            )}
                          </h3>
                          <p className='text-gray-600 font-medium'>{item.docData?.speciality}</p>
                          <p className='text-sm text-gray-500'>{item.docData?.degree}</p>
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
                              <Badge variant='outline' className='text-gray-600 border-gray-300'>
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

                      <div className='grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 mb-6'>
                        <div className='flex items-center gap-3 text-sm text-gray-700'>
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

                        <div className='flex items-center gap-3 text-sm text-gray-700'>
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
                          <p className='text-sm text-gray-700'>{item.purpose}</p>
                        </div>
                      )}
                    </div>

                    <div className='pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4'>
                      <div className='flex items-center gap-2'>
                        <div className='p-2 bg-gray-50 rounded-lg'>
                          <CreditCard className='w-5 h-5 text-gray-600' />
                        </div>
                        <div>
                          <p className='text-xs text-gray-500 font-medium uppercase'>Amount</p>
                          <p className='text-lg font-bold text-gray-900'>{currencySymbol}{item.amount || item.docData?.fees}</p>
                        </div>
                      </div>

                      <div className='flex flex-wrap gap-2 justify-end md:justify-start'>
                        {/* View Prescription button - for completed appointments with prescription */}
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

                        {/* Reschedule button - for upcoming appointments, only if not already rescheduled */}
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

                        {/* Cancel button - for upcoming appointments */}
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
        <Card className='border-gray-200'>
          <CardContent className='text-center py-16'>
            <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <ClipboardList className='w-8 h-8 text-gray-400' />
            </div>
            <h3 className='text-lg font-medium text-gray-900'>No appointments yet</h3>
            <p className='mt-2 text-sm text-gray-500'>Start by booking an appointment with a doctor.</p>
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
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Prescription Details</h2>
                <p className="text-sm text-gray-500">#{selectedPrescription.prescriptionNumber || selectedPrescription._id}</p>
              </div>
              <button
                onClick={() => setSelectedPrescription(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
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
                    <p className="font-semibold text-gray-900">Dr. {selectedPrescription.doctorId?.name}</p>
                    <p className="text-sm text-gray-600">{selectedPrescription.doctorId?.speciality}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium text-gray-900">{slotDateFormat(selectedPrescription.createdAt)}</p>
                </div>
              </div>

              {/* Diagnosis */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Diagnosis</h3>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <p className="text-gray-700">{selectedPrescription.diagnosis}</p>
                </div>
              </div>

              {/* Medications */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Medications</h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3">Drug Name</th>
                        <th className="px-4 py-3">Dosage</th>
                        <th className="px-4 py-3">Frequency</th>
                        <th className="px-4 py-3">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedPrescription.medications?.map((med, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 font-medium text-gray-900">{med.drugName}</td>
                          <td className="px-4 py-3 text-gray-600">{med.dosage}</td>
                          <td className="px-4 py-3">
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                              {med.frequency}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{med.duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Notes */}
              {selectedPrescription.notes && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Doctor's Notes</h3>
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
                        }`}
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
    </div>
  )
}

export default MyAppointments
