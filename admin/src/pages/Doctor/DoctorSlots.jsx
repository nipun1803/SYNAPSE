import React, { useState, useEffect, useContext } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, Calendar, Check, X, Loader2 } from 'lucide-react'
import { toast } from 'react-toastify'

const DoctorSlots = () => {
    const { dToken } = useContext(DoctorContext)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [availableSlots, setAvailableSlots] = useState({})
    const [bookedSlots, setBookedSlots] = useState({})

    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'

    // Generate time slots from 9AM to 6PM
    const generateTimeSlots = () => {
        const slots = []
        for (let hour = 9; hour <= 18; hour++) {
            slots.push(`${hour}:00 AM`.replace(/^(\d):/, '0$1:').replace('12:00 AM', '12:00 PM').replace(/1[3-9]:00 AM|2[0-4]:00 AM/g, (m) => {
                const h = parseInt(m)
                return `${h - 12}:00 PM`
            }))
            if (hour < 18) {
                slots.push(`${hour}:30 AM`.replace(/^(\d):/, '0$1:').replace(/1[3-9]:30 AM|2[0-4]:30 AM/g, (m) => {
                    const h = parseInt(m)
                    return `${h - 12}:30 PM`
                }))
            }
        }
        // Correct time format
        return [
            '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
            '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
            '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM'
        ]
    }

    const timeSlots = generateTimeSlots()

    // Generate next 7 days
    const generateWeekDates = () => {
        const dates = []
        const today = new Date()
        for (let i = 0; i < 7; i++) {
            const date = new Date(today)
            date.setDate(today.getDate() + i)
            const day = String(date.getDate()).padStart(2, '0')
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const year = date.getFullYear()
            dates.push({
                key: `${day}_${month}_${year}`,
                display: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
                dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
                date
            })
        }
        return dates
    }

    const weekDates = generateWeekDates()

    // Check if a slot time has already passed for today
    const isSlotPast = (dateInfo, time) => {
        const now = new Date()
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // Only check for today's date
        if (dateInfo.date.toDateString() !== today.toDateString()) {
            return false
        }

        // Parse time (e.g., "09:00 AM", "02:30 PM")
        const [timePart, period] = time.split(' ')
        let [hours, minutes] = timePart.split(':').map(Number)

        if (period === 'PM' && hours !== 12) hours += 12
        if (period === 'AM' && hours === 12) hours = 0

        const slotTime = new Date()
        slotTime.setHours(hours, minutes, 0, 0)

        return slotTime <= now
    }

    // Fetch current slots
    useEffect(() => {
        const fetchSlots = async () => {
            try {
                setLoading(true)
                const response = await fetch(`${backendUrl}/api/doctors/me/slots`, {
                    credentials: 'include'
                })
                const data = await response.json()
                if (data.success) {
                    setAvailableSlots(data.available_slots || {})

                    // Normalize booked slots keys AND values
                    const rawBooked = data.slots_booked || {}
                    const normalizedBooked = {}

                    Object.keys(rawBooked).forEach(key => {
                        const parts = key.split('_')
                        if (parts.length === 3) {
                            const [d, m, y] = parts
                            const paddedKey = `${String(d).padStart(2, '0')}_${String(m).padStart(2, '0')}_${y}`

                            // Normalize times (ensure 09:00 AM format)
                            const normalizedTimes = (rawBooked[key] || []).map(time => {
                                if (!time.includes(' ')) return time
                                let [t, period] = time.split(' ')
                                let [h, min] = t.split(':')
                                return `${h.padStart(2, '0')}:${min} ${period.toUpperCase()}`
                            })

                            if (normalizedBooked[paddedKey]) {
                                normalizedBooked[paddedKey] = [...new Set([...normalizedBooked[paddedKey], ...normalizedTimes])]
                            } else {
                                normalizedBooked[paddedKey] = normalizedTimes
                            }
                        }
                    })

                    setBookedSlots(normalizedBooked)
                }
            } catch (error) {
                toast.error('Failed to load slots')
            } finally {
                setLoading(false)
            }
        }
        fetchSlots()
    }, [dToken])

    // Toggle a slot
    const toggleSlot = (dateInfo, time) => {
        const dateKey = dateInfo.key

        // Check if slot is already booked
        if (bookedSlots[dateKey]?.includes(time)) {
            toast.warning('This slot is already booked by a patient')
            return
        }

        // Check if slot has already passed
        if (isSlotPast(dateInfo, time)) {
            toast.warning('This time slot has already passed')
            return
        }

        setAvailableSlots(prev => {
            const newSlots = { ...prev }
            if (!newSlots[dateKey]) {
                newSlots[dateKey] = []
            }

            if (newSlots[dateKey].includes(time)) {
                newSlots[dateKey] = newSlots[dateKey].filter(t => t !== time)
            } else {
                newSlots[dateKey] = [...newSlots[dateKey], time]
            }

            return newSlots
        })
    }

    // Toggle all slots for a day
    const toggleAllDay = (dateInfo) => {
        const dateKey = dateInfo.key
        const bookedForDay = bookedSlots[dateKey] || []
        const availableForDay = availableSlots[dateKey] || []

        // Filter out booked and past slots
        const selectableSlots = timeSlots.filter(t =>
            !bookedForDay.includes(t) && !isSlotPast(dateInfo, t)
        )
        const allSelected = selectableSlots.every(t => availableForDay.includes(t))

        setAvailableSlots(prev => {
            const newSlots = { ...prev }
            if (allSelected) {
                // Deselect all
                newSlots[dateKey] = []
            } else {
                // Select all selectable slots
                newSlots[dateKey] = selectableSlots
            }
            return newSlots
        })
    }

    // Save slots
    const saveSlots = async () => {
        try {
            setSaving(true)
            const response = await fetch(`${backendUrl}/api/doctors/me/slots`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ available_slots: availableSlots })
            })
            const data = await response.json()
            if (data.success) {
                toast.success('Slots saved successfully!')
                setAvailableSlots(data.available_slots)
            } else {
                toast.error(data.message || 'Failed to save slots')
            }
        } catch (error) {
            toast.error('Failed to save slots')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className='flex justify-center items-center min-h-[60vh]'>
                <Loader2 className='w-12 h-12 text-blue-600 animate-spin' />
            </div>
        )
    }

    return (
        <div className='max-w-7xl mx-auto p-4 sm:p-6'>
            <div className='mb-6'>
                <h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>Manage Available Slots</h1>
                <p className='text-gray-600 mt-1'>Set your availability for the next 7 days. Patients will only see slots you've opened.</p>
            </div>

            {/* Legend */}
            <div className='flex flex-wrap gap-6 mb-8 p-6 bg-white border border-gray-100 shadow-sm rounded-xl'>
                <div className='flex items-center gap-3'>
                    <div className='w-5 h-5 bg-green-600 rounded-md shadow-sm'></div>
                    <span className='text-sm font-medium text-gray-700'>Available</span>
                </div>
                <div className='flex items-center gap-3'>
                    <div className='w-5 h-5 bg-white border border-gray-200 rounded-md'></div>
                    <span className='text-sm font-medium text-gray-700'>Not Available</span>
                </div>
                <div className='flex items-center gap-3'>
                    <div className='w-5 h-5 bg-red-50 border border-red-100 rounded-md flex items-center justify-center'>
                        <div className='w-2 h-2 bg-red-400 rounded-full'></div>
                    </div>
                    <span className='text-sm font-medium text-gray-700'>Booked</span>
                </div>
                <div className='flex items-center gap-3'>
                    <div className='w-5 h-5 bg-gray-100 border border-gray-200 rounded-md opacity-60'></div>
                    <span className='text-sm font-medium text-gray-500'>Time Passed</span>
                </div>
            </div>

            <div className='grid gap-6 pb-24'>
                {weekDates.map((dateInfo) => (
                    <Card key={dateInfo.key} className='border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200'>
                        <CardContent className='p-6'>
                            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6'>
                                <div className='flex items-center gap-4'>
                                    <div className='w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center'>
                                        <Calendar className='w-6 h-6 text-blue-600' />
                                    </div>
                                    <div>
                                        <h3 className='text-lg font-bold text-gray-900'>{dateInfo.dayName}</h3>
                                        <p className='text-sm font-medium text-gray-500'>{dateInfo.display}</p>
                                    </div>
                                </div>
                                <Button
                                    variant='outline'
                                    size='sm'
                                    onClick={() => toggleAllDay(dateInfo)}
                                    className='border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-colors'
                                >
                                    Toggle All Slots
                                </Button>
                            </div>

                            <div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3'>
                                {timeSlots.map((time) => {
                                    const isBooked = bookedSlots[dateInfo.key]?.includes(time)
                                    const isAvailable = availableSlots[dateInfo.key]?.includes(time)
                                    const isPast = isSlotPast(dateInfo, time)

                                    return (
                                        <button
                                            key={time}
                                            onClick={() => toggleSlot(dateInfo, time)}
                                            disabled={isBooked || isPast}
                                            className={`
                                                relative px-1 py-3 text-xs font-semibold rounded-xl border transition-all duration-200 flex items-center justify-center
                                                ${isPast
                                                    ? 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed opacity-50'
                                                    : isBooked
                                                        ? 'bg-red-50 text-red-400 border-red-100 cursor-not-allowed'
                                                        : isAvailable
                                                            ? 'bg-green-600 text-white border-green-600 shadow-md transform scale-105 z-10'
                                                            : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600 hover:shadow-sm'
                                                }
                                            `}
                                            title={isPast ? 'Time has passed' : isBooked ? 'Already booked by patient' : isAvailable ? 'Click to remove' : 'Click to add'}
                                        >
                                            {time}
                                            {isAvailable && !isBooked && !isPast && (
                                                <div className='absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full flex items-center justify-center shadow-sm'>
                                                    <div className='w-1.5 h-1.5 bg-green-500 rounded-full'></div>
                                                </div>
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Save Button */}
            <div className='fixed bottom-6 right-6 z-50'>
                <Button
                    onClick={saveSlots}
                    disabled={saving}
                    className='bg-blue-600 hover:bg-blue-700 text-white shadow-xl px-8 py-6 rounded-full text-lg font-semibold transition-transform hover:scale-105 active:scale-95'
                >
                    {saving ? (
                        <>
                            <Loader2 className='w-5 h-5 mr-2 animate-spin' />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Check className='w-5 h-5 mr-2' />
                            Save Changes
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}

export default DoctorSlots
