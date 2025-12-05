import React, { useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'
import RelatedDoctors from '../components/RelatedDoctors'
import { AppContext } from '../context/AppContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, CheckCircle2, XCircle, Loader2, Info, CreditCard } from 'lucide-react'
import { doctorService, userService } from '../api/services'

const Appointment = () => {
  const { docId } = useParams()
  const navigate = useNavigate()
  const { doctors, currencySymbol, backendUrl, refreshDoctors, userData } = useContext(AppContext)

  const [docInfo, setDocInfo] = useState(null)
  const [loadingDoc, setLoadingDoc] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [timeSlots, setTimeSlots] = useState([])
  const [slotTime, setSlotTime] = useState('')
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [booking, setBooking] = useState(false)
  const [paymentMode, setPaymentMode] = useState('online') // 'online' or 'cash'

  const toLocalDateInputValue = (d) => {
    const offset = d.getTimezoneOffset()
    const adjusted = new Date(d.getTime() - offset * 60 * 1000)
    return adjusted.toISOString().split('T')[0]
  }

  const minDateStr = useMemo(() => toLocalDateInputValue(new Date()), [])
  const maxDateStr = useMemo(() => {
    const maxDate = new Date()
    maxDate.setDate(maxDate.getDate() + 30)
    return toLocalDateInputValue(maxDate)
  }, [])

  const makeSlotDateKey = (date) => `${date.getDate()}_${date.getMonth() + 1}_${date.getFullYear()}`

  const isSameDay = (date1, date2) => {
    return date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
  }

  const generateSlotsForDate = (date, bookedTimes = []) => {
    const startTime = new Date(date)
    const endTime = new Date(date)
    startTime.setHours(10, 0, 0, 0)
    endTime.setHours(21, 0, 0, 0)

    const now = new Date()
    if (isSameDay(date, now)) {
      const adjustedTime = new Date(now)
      const minutes = adjustedTime.getMinutes()

      if (minutes > 0 && minutes <= 30) {
        adjustedTime.setMinutes(30, 0, 0)
      } else if (minutes > 30) {
        adjustedTime.setHours(adjustedTime.getHours() + 1, 0, 0, 0)
      } else {
        adjustedTime.setMinutes(0, 0, 0)
      }

      if (adjustedTime < startTime) adjustedTime.setHours(10, 0, 0, 0)
      if (adjustedTime >= endTime) return []

      startTime.setTime(adjustedTime.getTime())
    }

    const slots = []
    const currentSlot = new Date(startTime)

    while (currentSlot < endTime) {
      const timeStr = currentSlot.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      slots.push({ time: timeStr, disabled: bookedTimes.includes(timeStr) })
      currentSlot.setMinutes(currentSlot.getMinutes() + 30)
    }

    return slots
  }

  useEffect(() => {
    const foundDoctor = doctors.find(doc => String(doc._id) === String(docId))
    setDocInfo(foundDoctor || null)
    setLoadingDoc(false)
  }, [doctors, docId])

  useEffect(() => {
    if (!docInfo) return

    const fetchSlots = async () => {
      setLoadingSlots(true)
      setSlotTime('')

      try {
        const data = await doctorService.getAvailability(docId)

        const dateKey = makeSlotDateKey(selectedDate)
        let bookedTimes = []

        if (data.success && data.slots_booked) {
          bookedTimes = (data.slots_booked && Array.isArray(data.slots_booked[dateKey]) && data.slots_booked[dateKey]) || []
        } else {
          bookedTimes =
            (docInfo.slots_booked && Array.isArray(docInfo.slots_booked[dateKey]) && docInfo.slots_booked[dateKey]) ||
            (docInfo.slots_booked && docInfo.slots_booked[dateKey]) || []
        }

        const slots = generateSlotsForDate(selectedDate, bookedTimes)
        setTimeSlots(slots)
      } catch (error) {
        console.error("Error fetching slots", error);
        const dateKey = makeSlotDateKey(selectedDate)
        const bookedTimes =
          (docInfo.slots_booked && Array.isArray(docInfo.slots_booked[dateKey]) && docInfo.slots_booked[dateKey]) ||
          (docInfo.slots_booked && docInfo.slots_booked[dateKey]) || []
        const slots = generateSlotsForDate(selectedDate, bookedTimes)
        setTimeSlots(slots)
      } finally {
        setLoadingSlots(false)
      }
    }

    fetchSlots()
  }, [docInfo, selectedDate, backendUrl, docId])

  const handleDateChange = (e) => {
    const [year, month, day] = e.target.value.split('-').map(num => parseInt(num, 10))
    setSelectedDate(new Date(year, month - 1, day))
  }

  const bookAppointment = async () => {
    if (!slotTime) {
      toast.warning('Please select a time slot')
      return
    }
    if (booking) return

    try {
      setBooking(true)
      const slotDate = makeSlotDateKey(selectedDate)

      // If cash payment mode, book directly without payment
      if (paymentMode === 'cash') {
        const data = await userService.bookAppointment({ docId, slotDate, slotTime, paymentMode: 'cash' })

        if (data.success) {
          toast.success('Appointment booked successfully! Pay at the clinic.')
          if (refreshDoctors) await refreshDoctors()
          setTimeout(() => navigate('/my-appointments'), 1000)
        } else {
          toast.error(data.message || 'Failed to book appointment')
        }
        setBooking(false)
        return
      }

      // Online payment mode - Create Razorpay order
      const orderResponse = await fetch(`${backendUrl}/api/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ docId, slotDate, slotTime })
      })

      const orderData = await orderResponse.json()

      if (!orderData.success) {
        toast.error(orderData.message || 'Failed to create order')
        setBooking(false)
        return
      }

      // Razorpay checkout options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'SYNAPSE',
        description: `Appointment with Dr. ${orderData.doctorName}`,
        order_id: orderData.order.id,
        handler: async function (response) {
          try {
            // Verify payment on backend
            const verifyResponse = await fetch(`${backendUrl}/api/payment/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                docId,
                slotDate,
                slotTime
              })
            })

            const verifyData = await verifyResponse.json()

            if (verifyData.success) {
              toast.success('Payment successful! Appointment booked.')
              if (refreshDoctors) await refreshDoctors()
              setTimeout(() => navigate('/my-appointments'), 1500)
            } else {
              toast.error(verifyData.message || 'Payment verification failed')
            }
          } catch (error) {
            console.error('Payment verification error:', error)
            toast.error('Payment verification failed. Please contact support.')
          } finally {
            setBooking(false)
          }
        },
        prefill: {
          name: userData?.name || '',
          email: userData?.email || '',
          contact: userData?.phone || ''
        },
        theme: {
          color: '#2563eb'
        },
        modal: {
          ondismiss: function () {
            setBooking(false)
            toast.info('Payment cancelled')
          }
        }
      }

      // Load Razorpay script and open checkout
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => {
        const razorpay = new window.Razorpay(options)
        razorpay.open()
      }
      script.onerror = () => {
        toast.error('Failed to load payment gateway')
        setBooking(false)
      }
      document.body.appendChild(script)

    } catch (error) {
      console.error('Booking error:', error)
      toast.error('Failed to book appointment. Please try again.')
      setBooking(false)
    }
  }

  if (loadingDoc || !docInfo) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <Loader2 className='w-12 h-12 text-blue-600 animate-spin' />
      </div>
    )
  }

  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

  return (
    <div className='max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8'>
      <div className='flex flex-col sm:flex-row gap-6 mb-8'>
        <div className='flex-shrink-0'>
          <img
            className='w-full sm:w-72 h-auto rounded-2xl object-cover shadow-lg'
            src={docInfo.image}
            alt={docInfo.name}
          />
        </div>

        <Card className='flex-1 border-gray-200 shadow-lg'>
          <CardContent className='p-6 sm:p-8'>
            <div className='flex items-start justify-between gap-4 mb-4'>
              <div>
                <h1 className='flex items-center gap-2 text-2xl font-bold text-gray-900 mb-2'>
                  {docInfo.name}
                  <img className='w-5 h-5' src={assets.verified_icon} alt='Verified' />
                </h1>
                <div className='flex flex-wrap items-center gap-2 text-sm text-gray-600'>
                  <span>{docInfo.degree} - {docInfo.speciality}</span>
                  <Badge variant='outline' className='text-xs'>{docInfo.experience}</Badge>
                </div>
              </div>

              <Badge
                variant={docInfo.available ? 'default' : 'destructive'}
                className={docInfo.available ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}
              >
                <span className={`w-2 h-2 rounded-full mr-1.5 ${docInfo.available ? 'bg-green-500' : 'bg-red-500'}`}></span>
                {docInfo.available ? 'Available' : 'Not Available'}
              </Badge>
            </div>

            <div className='space-y-4'>
              <div>
                <p className='flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2'>
                  <Info className='w-4 h-4' />
                  About
                </p>
                <p className='text-sm text-gray-600 leading-relaxed'>{docInfo.about}</p>
              </div>

              <div className='pt-4 border-t border-gray-200'>
                <p className='text-gray-600 text-sm'>
                  Appointment fee: <span className='text-lg font-semibold text-gray-900'>{currencySymbol}{docInfo.fees}</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className='border-gray-200 shadow-lg'>
        <CardContent className='p-6 sm:p-8'>
          <h2 className='text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2'>
            <Calendar className='w-6 h-6 text-blue-600' />
            Book Your Appointment
          </h2>

          <div className='mb-8'>
            <h3 className='text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2'>
              <Calendar className='w-5 h-5' />
              Select Date
            </h3>
            <input
              type='date'
              className='w-full sm:w-auto px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-gray-900'
              value={toLocalDateInputValue(selectedDate)}
              onChange={handleDateChange}
              min={minDateStr}
              max={maxDateStr}
            />
            <p className='mt-2 text-sm text-gray-500 font-medium'>
              {daysOfWeek[selectedDate.getDay()]}, {selectedDate.toLocaleDateString('en-US', {
                month: 'long', day: 'numeric', year: 'numeric'
              })}
            </p>
          </div>

          <div className='flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg'>
            <div className='flex items-center gap-2'>
              <span className='inline-block w-3 h-3 rounded bg-gray-200 border-2 border-gray-300'></span>
              <span className='text-xs sm:text-sm text-gray-600'>Available</span>
            </div>
            <div className='flex items-center gap-2'>
              <CheckCircle2 className='w-3 h-3 text-green-600' />
              <span className='text-xs sm:text-sm text-gray-600'>Selected</span>
            </div>
            <div className='flex items-center gap-2'>
              <XCircle className='w-3 h-3 text-red-400' />
              <span className='text-xs sm:text-sm text-gray-600'>Booked</span>
            </div>
          </div>

          <div className='mb-8'>
            <h3 className='text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2'>
              <Clock className='w-5 h-5' />
              Select Time
            </h3>

            {loadingSlots ? (
              <div className='flex items-center gap-2 text-gray-500 p-4'>
                <Loader2 className='w-5 h-5 animate-spin' />
                <span>Loading available slots...</span>
              </div>
            ) : timeSlots.length === 0 ? (
              <div className='text-gray-600 p-6 bg-gray-50 rounded-xl border border-gray-200 text-center'>
                <XCircle className='w-8 h-8 text-gray-400 mx-auto mb-2' />
                <p>No available slots for this date. Please choose another date.</p>
              </div>
            ) : (
              <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3'>
                {timeSlots.map((slot, index) => (
                  <Button
                    key={index}
                    onClick={() => !slot.disabled && setSlotTime(slot.time)}
                    disabled={slot.disabled}
                    variant={slotTime === slot.time ? 'default' : 'outline'}
                    className={`h-12 font-medium transition-all ${slot.disabled
                      ? 'bg-red-100 text-red-400 border-red-200 cursor-not-allowed hover:bg-red-100'
                      : slotTime === slot.time
                        ? 'bg-green-600 hover:bg-green-700 text-white border-green-600 shadow-md'
                        : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                      }`}
                    title={slot.disabled ? 'Already booked' : 'Click to select'}
                  >
                    {slot.time}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Payment Mode Selection */}
          <div className='mb-8'>
            <h3 className='text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2'>
              <CreditCard className='w-5 h-5' />
              Payment Mode
            </h3>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <button
                onClick={() => setPaymentMode('online')}
                className={`p-4 border-2 rounded-xl transition-all ${paymentMode === 'online'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
                  }`}
              >
                <div className='flex items-center gap-3'>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMode === 'online' ? 'border-blue-600' : 'border-gray-300'
                    }`}>
                    {paymentMode === 'online' && (
                      <div className='w-3 h-3 rounded-full bg-blue-600'></div>
                    )}
                  </div>
                  <div className='text-left'>
                    <p className='font-semibold text-gray-900'>Online Payment</p>
                    <p className='text-sm text-gray-600'>Pay securely via Razorpay</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setPaymentMode('cash')}
                className={`p-4 border-2 rounded-xl transition-all ${paymentMode === 'cash'
                  ? 'border-green-600 bg-green-50'
                  : 'border-gray-200 hover:border-green-300'
                  }`}
              >
                <div className='flex items-center gap-3'>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMode === 'cash' ? 'border-green-600' : 'border-gray-300'
                    }`}>
                    {paymentMode === 'cash' && (
                      <div className='w-3 h-3 rounded-full bg-green-600'></div>
                    )}
                  </div>
                  <div className='text-left'>
                    <p className='font-semibold text-gray-900'>Cash Payment</p>
                    <p className='text-sm text-gray-600'>Pay at the clinic</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className='flex justify-center pt-6'>
            <Button
              onClick={bookAppointment}
              disabled={!slotTime || !docInfo.available || booking}
              size='lg'
              className={`px-8 h-12 rounded-xl font-semibold text-lg transition-all ${slotTime && docInfo.available && !booking
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl hover:scale-105'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed hover:bg-gray-200'
                }`}
            >
              {booking ? (
                <>
                  <Loader2 className='w-5 h-5 mr-2 animate-spin' />
                  Booking...
                </>
              ) : !slotTime ? (
                'Select a time slot'
              ) : !docInfo.available ? (
                'Doctor not available'
              ) : (
                <>
                  <CheckCircle2 className='w-5 h-5 mr-2' />
                  Book Appointment
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className='mt-12'>
        <RelatedDoctors speciality={docInfo.speciality} docId={docId} />
      </div>
    </div>
  )
}

export default Appointment