import React, { useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'
import RelatedDoctors from '../components/RelatedDoctors'
import { AppContext } from '../context/AppContext'

const Appointment = () => {
  const { docId } = useParams()
  const navigate = useNavigate()
  const { doctors, currencySymbol, backendUrl, refreshDoctors } = useContext(AppContext)

  const [docInfo, setDocInfo] = useState(null)
  const [loadingDoc, setLoadingDoc] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [timeSlots, setTimeSlots] = useState([])
  const [slotTime, setSlotTime] = useState('')
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [booking, setBooking] = useState(false)

  const toLocalDateInputValue = (d) => {
    const off = d.getTimezoneOffset()
    const d2 = new Date(d.getTime() - off * 60 * 1000)
    return d2.toISOString().split('T')[0]
  }
  
  const minDateStr = useMemo(() => toLocalDateInputValue(new Date()), [])
  const maxDateStr = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() + 30)
    return toLocalDateInputValue(d)
  }, [])

  const makeSlotDateKey = (d) => `${d.getDate()}_${d.getMonth() + 1}_${d.getFullYear()}`
  const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

  const generateSlotsForDate = (date, bookedTimes = []) => {
    const start = new Date(date)
    const end = new Date(date)
    start.setHours(10, 0, 0, 0)
    end.setHours(21, 0, 0, 0)

    const now = new Date()
    if (sameDay(date, now)) {
      const adj = new Date(now)
      const m = adj.getMinutes()
      if (m > 0 && m <= 30) adj.setMinutes(30, 0, 0)
      else if (m > 30) adj.setHours(adj.getHours() + 1, 0, 0, 0)
      else adj.setMinutes(0, 0, 0)
      if (adj < start) adj.setHours(10, 0, 0, 0)
      if (adj >= end) return []
      start.setTime(adj.getTime())
    }

    const slots = []
    const cur = new Date(start)
    while (cur < end) {
      const timeStr = cur.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      const disabled = bookedTimes.includes(timeStr)
      slots.push({ time: timeStr, disabled })
      cur.setMinutes(cur.getMinutes() + 30)
    }
    return slots
  }

  useEffect(() => {
    const found = doctors.find(d => String(d._id) === String(docId))
    setDocInfo(found || null)
    setLoadingDoc(false)
  }, [doctors, docId])

  useEffect(() => {
    if (!docInfo) return
    setLoadingSlots(true)
    setSlotTime('')

    const key = makeSlotDateKey(selectedDate)
    const bookedTimes =
      (docInfo.slots_booked && Array.isArray(docInfo.slots_booked[key]) && docInfo.slots_booked[key]) ||
      (docInfo.slots_booked && docInfo.slots_booked[key]) ||
      []
    const slots = generateSlotsForDate(selectedDate, bookedTimes)
    setTimeSlots(slots)
    setLoadingSlots(false)
  }, [docInfo, selectedDate])

  const onDateChange = (e) => {
    const [y, m, d] = e.target.value.split('-').map(n => parseInt(n, 10))
    setSelectedDate(new Date(y, m - 1, d))
  }

  const bookAppointment = async () => {
    if (!slotTime) {
      toast.warning('Please select a time slot')
      return
    }

    if (booking) return // Prevent multiple clicks

    try {
      setBooking(true)
      const slotDate = makeSlotDateKey(selectedDate)
      
      const res = await fetch(`${backendUrl || ''}/api/users/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ docId, slotDate, slotTime })
      })
      
      const data = await res.json()
      
      if (data.success) {
        toast.success('Appointment booked successfully!')
        
        // Refreshing the doc list to check for updated availability
        if (refreshDoctors) {
          await refreshDoctors()
        }
        

        setTimeout(() => {
          navigate('/my-appointments')
        }, 1000)
      } else {
        toast.error(data.message || 'Failed to book appointment')
      }
    } catch (err) {
      console.error('Booking error:', err)
      toast.error('Failed to book appointment. Please try again.')
    } finally {
      setBooking(false)
    }
  }

  if (loadingDoc || !docInfo) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
      </div>
    )
  }

  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

  return (
    <div className='max-w-6xl mx-auto py-8'>
      <div className='flex flex-col sm:flex-row gap-6 mb-8'>
        <div>
          <img className='bg-primary w-full sm:max-w-72 rounded-lg' src={docInfo.image} alt="" />
        </div>
        <div className='flex-1 border border-gray-200 rounded-xl p-8 bg-white shadow-lg mx-2 sm:mx-0 mt-[-80px] sm:mt-0'>
          <p className='flex items-center gap-2 text-2xl font-medium text-gray-900'>
            {docInfo.name}
            <img className='w-5' src={assets.verified_icon} alt="" />
          </p>
          <div className='flex items-center gap-2 text-sm mt-1 text-gray-600'>
            <p>{docInfo.degree} - {docInfo.speciality}</p>
            <button className='py-0.5 px-2 border text-xs rounded-full'>{docInfo.experience}</button>
          </div>
          <div className='mt-3'>
            <p className='flex items-center gap-1 text-sm font-medium text-gray-900'>
              About <img className='w-3' src={assets.info_icon} alt="" />
            </p>
            <p className='text-sm text-gray-500 max-w-[700px] mt-1'>{docInfo.about}</p>
          </div>
          <div className='flex items-center justify-between mt-4'>
            <p className='text-gray-500 font-medium'>
              Appointment fee: <span className='text-gray-600'>{currencySymbol}{docInfo.fees}</span>
            </p>
            <div className='flex items-center gap-2 text-sm'>
              <span className={`w-2 h-2 rounded-full ${docInfo.available ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className={`${docInfo.available ? 'text-green-600' : 'text-red-600'}`}>
                {docInfo.available ? 'Available' : 'Not Available'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className='sm:ml-72 sm:pl-4 mt-8'>
        <h2 className='text-2xl font-bold text-gray-800 mb-6'>Book Your Appointment</h2>

        <div className='mb-6 grid gap-4 sm:grid-cols-2'>
          <div>
            <h3 className='text-lg font-semibold text-gray-700 mb-2'>Select Date</h3>
            <input
              type='date'
              className='w-full sm:w-64 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 transition-colors'
              value={toLocalDateInputValue(selectedDate)}
              onChange={onDateChange}
              min={minDateStr}
              max={maxDateStr}
            />
            <p className='mt-2 text-sm text-gray-500'>
              {daysOfWeek[selectedDate.getDay()]}, {selectedDate.toLocaleDateString()}
            </p>
          </div>
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-2'>
              <span className='inline-block w-3 h-3 rounded bg-gray-200 border'></span>
              <span className='text-sm text-gray-600'>Available</span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='inline-block w-3 h-3 rounded bg-green-600'></span>
              <span className='text-sm text-gray-600'>Selected</span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='inline-block w-3 h-3 rounded bg-red-300'></span>
              <span className='text-sm text-gray-600'>Booked</span>
            </div>
          </div>
        </div>

        <div className='mb-6'>
          <h3 className='text-lg font-semibold text-gray-700 mb-4'>Select Time</h3>
          {loadingSlots ? (
            <div className='flex items-center gap-2 text-gray-500'>
              <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600'></div>
              <span>Loading slots...</span>
            </div>
          ) : timeSlots.length === 0 ? (
            <div className='text-gray-500 p-4 bg-gray-50 rounded-lg border border-gray-200'>
              No available slots for the selected date. Please choose another date.
            </div>
          ) : (
            <div className='flex items-center gap-3 w-full overflow-x-auto pb-2 flex-wrap'>
              {timeSlots.map((slot, idx) => {
                const isSelected = slotTime === slot.time
                const base = 'text-sm font-medium flex-shrink-0 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200'
                const enabled = 'text-gray-700 border-2 border-gray-300 hover:border-green-400 hover:shadow-md'
                const selected = 'bg-green-600 text-white shadow-lg transform scale-105'
                const disabled = 'bg-red-300 text-white cursor-not-allowed opacity-70'
                return (
                  <button
                    key={idx}
                    onClick={() => !slot.disabled && setSlotTime(slot.time)}
                    disabled={slot.disabled}
                    className={`${base} ${slot.disabled ? disabled : isSelected ? selected : enabled}`}
                    title={slot.disabled ? 'Already booked' : 'Click to select'}
                  >
                    {slot.time}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className='flex justify-center'>
          <button
            onClick={bookAppointment}
            disabled={!slotTime || !docInfo.available || booking}
            className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform ${
              slotTime && docInfo.available && !booking
                ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:scale-105 active:scale-95'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {booking ? (
              <span className='flex items-center gap-2'>
                <svg className='animate-spin h-5 w-5' fill='none' viewBox='0 0 24 24'>
                  <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                  <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                </svg>
                Booking...
              </span>
            ) : !slotTime ? (
              'Select a time slot'
            ) : !docInfo.available ? (
              'Doctor not available'
            ) : (
              'Book Appointment'
            )}
          </button>
        </div>
      </div>

      <RelatedDoctors speciality={docInfo.speciality} docId={docId} />
    </div>
  )
}

export default Appointment