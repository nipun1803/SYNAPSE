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
import { doctorService, reviewService, userService } from '../api/services'

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
  const [reviews, setReviews] = useState([])
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [booking, setBooking] = useState(false)
  const [paymentMode, setPaymentMode] = useState('online') // 'online' or 'cash'
  const [purpose, setPurpose] = useState('')

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

  const makeSlotDateKey = (date) => {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}_${month}_${year}`
  }

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
      const timeStr = currentSlot.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
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

  const fetchReviews = async () => {
    try {
      const data = await reviewService.getReviews(docId)
      if (data.success) {
        setReviews(data.reviews)
      }
    } catch (error) {
      console.error('Failed to load reviews')
    }
  }

  const handleAddReview = async () => {
    if (!reviewComment.trim()) {
      toast.error('Please enter a comment')
      return
    }

    try {
      setSubmittingReview(true)
      const data = await reviewService.addReview({
        docId,
        rating: reviewRating,
        comment: reviewComment
      })

      if (data.success) {
        toast.success('Review added successfully')
        setReviewComment('')
        setReviewRating(5)
        fetchReviews()
        // Refresh doctor info to update avg rating if needed
        // fetchDocInfo() 
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error('Failed to add review')
    } finally {
      setSubmittingReview(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [docId])

  useEffect(() => {
    if (!docInfo) return

    const fetchSlots = async () => {
      setLoadingSlots(true)
      setSlotTime('')

      try {
        const data = await doctorService.getAvailability(docId)
        const dateKey = makeSlotDateKey(selectedDate)

        // Get booked slots for the date
        let bookedTimes = []
        if (data.success && data.slots_booked) {
          bookedTimes = Array.isArray(data.slots_booked[dateKey]) ? data.slots_booked[dateKey] : []
        }

        // Get available slots the doctor has opened
        let availableSlots = []
        if (data.success && data.available_slots && data.available_slots[dateKey]) {
          availableSlots = Array.isArray(data.available_slots[dateKey]) ? data.available_slots[dateKey] : []
        }

        // Check if doctor is using the slot management feature (has set slots for any day)
        const hasManagedSlots = data.success && data.available_slots && Object.keys(data.available_slots).length > 0

        if (hasManagedSlots) {
          // If managing slots, strictly use what's available (even if empty for this day)
          // Filter out past slots if selected date is today
          const now = new Date()
          const isToday = isSameDay(selectedDate, now)

          const validSlots = availableSlots.filter(time => {
            if (!isToday) return true

            const [timeStr, period] = time.split(' ')
            let [hours, minutes] = timeStr.split(':').map(Number)

            if (period === 'PM' && hours !== 12) hours += 12
            if (period === 'AM' && hours === 12) hours = 0

            const slotTime = new Date(selectedDate)
            slotTime.setHours(hours, minutes, 0, 0)

            return slotTime > now
          })

          const slots = validSlots.map(time => ({
            time,
            disabled: bookedTimes.includes(time)
          }))
          setTimeSlots(slots)
        } else {
          // Fallback: generate all slots only if doctor hasn't set ANY slots yet
          const slots = generateSlotsForDate(selectedDate, bookedTimes)
          setTimeSlots(slots)
        }
      } catch (error) {
        const dateKey = makeSlotDateKey(selectedDate)
        const bookedTimes = Array.isArray(docInfo.slots_booked?.[dateKey]) ? docInfo.slots_booked[dateKey] : []
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
        const data = await userService.bookAppointment({ docId, slotDate, slotTime, paymentMode: 'cash', purpose })

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
        body: JSON.stringify({ docId, slotDate, slotTime, purpose })
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
                slotTime,
                purpose
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
        {/* Reviews Section */}
        <div className='mt-12'>
          <h3 className='text-2xl font-bold text-gray-900 mb-6'>Patient Reviews</h3>

          {/* Add Review Form */}
          <Card className='mb-8 border-gray-200 shadow-sm'>
            <CardContent className='p-6'>
              <h4 className='text-lg font-semibold mb-4'>Write a Review</h4>
              <div className='flex flex-col gap-4'>
                <div className='flex items-center gap-2'>
                  <span className='text-sm font-medium text-gray-700'>Rating:</span>
                  <div className='flex gap-1'>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className={`text-2xl focus:outline-none transition-colors ${star <= reviewRating ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-200'
                          }`}
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
                  className='w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent min-h-[100px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400'
                />
                <div className='flex justify-end'>
                  <Button
                    onClick={handleAddReview}
                    disabled={submittingReview}
                    className='bg-primary hover:bg-primary/90 text-white'
                  >
                    {submittingReview ? (
                      <>
                        <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                        Submitting...
                      </>
                    ) : (
                      'Submit Review'
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reviews List */}
          <div className='space-y-4'>
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review._id} className='bg-white p-6 rounded-xl border border-gray-100 shadow-sm'>
                  <div className='flex items-start justify-between mb-2'>
                    <div className='flex items-center gap-3'>
                      <div className='w-10 h-10 bg-gray-200 rounded-full overflow-hidden'>
                        {review.userData?.image ? (
                          <img src={review.userData.image} alt={review.userData.name} className='w-full h-full object-cover' />
                        ) : (
                          <div className='w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold'>
                            {review.userData?.name?.charAt(0) || 'U'}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className='font-semibold text-gray-900'>{review.userData?.name}</p>
                        <p className='text-xs text-gray-500'>{new Date(review.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className='flex text-yellow-500 text-sm'>
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < review.rating ? 'fill-current' : 'text-gray-300'}>★</span>
                      ))}
                    </div>
                  </div>
                  <p className='text-gray-600 mt-2 leading-relaxed'>{review.comment}</p>
                </div>
              ))
            ) : (
              <div className='text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300'>
                <p className='text-gray-500'>No reviews yet. Be the first to review!</p>
              </div>
            )}
          </div>
        </div>
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

        <Card className='flex-1 border-gray-200 dark:border-gray-700 shadow-lg bg-white dark:bg-gray-800'>
          <CardContent className='p-6 sm:p-8'>
            <div className='flex items-start justify-between gap-4 mb-4'>
              <div>
                <div className='flex items-center gap-2 text-3xl font-bold text-gray-900 dark:text-white'>
                  {docInfo.name}
                  {docInfo.verified && (
                    <img src={assets.verified_icon} className='w-6 h-6' alt='Verified' title='Verified Doctor' />
                  )}
                </div>
                <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mt-1'>
                  <p>{docInfo.degree} - {docInfo.speciality}</p>
                  <span className='py-0.5 px-2 border border-gray-200 dark:border-gray-600 text-xs rounded-full'>{docInfo.experience}</span>
                </div>
                <div className='flex items-center gap-1 mt-2'>
                  <div className='flex text-yellow-500'>
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < Math.round(docInfo.rating || 0) ? 'fill-current' : 'text-gray-300'}>★</span>
                    ))}
                  </div>
                  <span className='text-sm font-medium text-gray-700 ml-1'>
                    {docInfo.rating ? docInfo.rating.toFixed(1) : 'New'}
                  </span>
                  <span className='text-sm text-gray-500 ml-1'>
                    ({docInfo.reviewCount || 0} reviews)
                  </span>
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
                <p className='flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white mb-2'>
                  <Info className='w-4 h-4' />
                  About
                </p>
                <p className='text-sm text-gray-600 dark:text-gray-300 leading-relaxed'>{docInfo.about}</p>
              </div>

              <div className='pt-4 border-t border-gray-200 dark:border-gray-700'>
                <p className='text-gray-600 dark:text-gray-400 text-sm'>
                  Appointment fee: <span className='text-lg font-semibold text-gray-900 dark:text-white'>{currencySymbol}{docInfo.fees}</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className='border-gray-200 dark:border-gray-700 shadow-lg bg-white dark:bg-gray-800'>
        <CardContent className='p-6 sm:p-8'>
          <h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2'>
            <Calendar className='w-6 h-6 text-blue-600 dark:text-blue-400' />
            Book Your Appointment
          </h2>

          <div className='mb-8'>
            <h3 className='text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2'>
              <Calendar className='w-5 h-5' />
              Select Date
            </h3>
            <input
              type='date'
              className='w-full sm:w-auto px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-gray-900 dark:text-white bg-white dark:bg-gray-700 color-scheme-dark'
              value={toLocalDateInputValue(selectedDate)}
              onChange={handleDateChange}
              min={minDateStr}
              max={maxDateStr}
            />
            <p className='mt-2 text-sm text-gray-500 dark:text-gray-400 font-medium'>
              {daysOfWeek[selectedDate.getDay()]}, {selectedDate.toLocaleDateString('en-US', {
                month: 'long', day: 'numeric', year: 'numeric'
              })}
            </p>
          </div>

          <div className='flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg'>
            <div className='flex items-center gap-2'>
              <span className='inline-block w-3 h-3 rounded bg-gray-200 dark:bg-gray-600 border-2 border-gray-300 dark:border-gray-500'></span>
              <span className='text-xs sm:text-sm text-gray-600 dark:text-gray-300'>Available</span>
            </div>
            <div className='flex items-center gap-2'>
              <CheckCircle2 className='w-3 h-3 text-green-600 dark:text-green-400' />
              <span className='text-xs sm:text-sm text-gray-600 dark:text-gray-300'>Selected</span>
            </div>
            <div className='flex items-center gap-2'>
              <XCircle className='w-3 h-3 text-red-400' />
              <span className='text-xs sm:text-sm text-gray-600 dark:text-gray-300'>Booked</span>
            </div>
          </div>

          <div className='mb-8'>
            <h3 className='text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2'>
              <Clock className='w-5 h-5' />
              Select Time
            </h3>

            {loadingSlots ? (
              <div className='flex items-center gap-2 text-gray-500 p-4'>
                <Loader2 className='w-5 h-5 animate-spin' />
                <span>Loading available slots...</span>
              </div>
            ) : timeSlots.length === 0 ? (
              <div className='text-gray-500 p-8 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-center flex flex-col items-center justify-center'>
                <Clock className='w-10 h-10 text-gray-300 mb-3' />
                <p className='font-medium text-gray-600'>No slots available for this date</p>
                <p className='text-sm mt-1'>Please try selecting another date or check back later.</p>
              </div>
            ) : (
              <div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3'>
                {timeSlots.map((slot, index) => (
                  <button
                    key={index}
                    onClick={() => !slot.disabled && setSlotTime(slot.time)}
                    disabled={slot.disabled}
                    className={`
                      relative py-3 px-2 rounded-xl text-sm font-medium transition-all duration-200 border
                      ${slot.disabled
                        ? 'bg-gray-50 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border-gray-100 dark:border-gray-600 cursor-not-allowed opacity-60'
                        : slotTime === slot.time
                          ? 'bg-primary text-white border-primary shadow-md transform scale-105 z-10'
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:border-primary dark:hover:border-blue-400 hover:text-primary dark:hover:text-blue-400 hover:shadow-sm'
                      }
                    `}
                    title={slot.disabled ? 'Already booked' : 'Click to select'}
                  >
                    {slot.time}
                    {slotTime === slot.time && (
                      <div className='absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center'>
                        <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Appointment Purpose/Reason */}
          <div className='mb-8'>
            <h3 className='text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2'>
              <Info className='w-5 h-5' />
              Reason for Visit
            </h3>
            <textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder='Please describe your symptoms or reason for the appointment (e.g., fever, headache, regular checkup, follow-up visit...)'
              className='w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-gray-900 dark:text-white bg-white dark:bg-gray-700 min-h-[100px] resize-none placeholder:text-gray-400'
              maxLength={500}
            />
            <p className='text-sm text-gray-500 mt-1'>{purpose.length}/500 characters</p>
          </div>

          {/* Payment Mode Selection */}
          <div className='mb-8'>
            <h3 className='text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2'>
              <CreditCard className='w-5 h-5' />
              Payment Mode
            </h3>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <button
                onClick={() => setPaymentMode('online')}
                className={`p-4 border-2 rounded-xl transition-all ${paymentMode === 'online'
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30'
                  : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 bg-white dark:bg-gray-700'
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
                    <p className='font-semibold text-gray-900 dark:text-white'>Online Payment</p>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>Pay securely via Razorpay</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setPaymentMode('cash')}
                className={`p-4 border-2 rounded-xl transition-all ${paymentMode === 'cash'
                  ? 'border-green-600 bg-green-50 dark:bg-green-900/30'
                  : 'border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-500 bg-white dark:bg-gray-700'
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
                    <p className='font-semibold text-gray-900 dark:text-white'>Cash Payment</p>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>Pay at the clinic</p>
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