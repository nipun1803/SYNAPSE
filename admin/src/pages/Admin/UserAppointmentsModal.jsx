import React, { useContext, useEffect, useState } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { X, Calendar, Clock, MapPin, Receipt, AlertCircle } from 'lucide-react'
import { toast } from 'react-toastify'
import axios from 'axios'

const UserAppointmentsModal = ({ userId, isOpen, onClose }) => {
    const { backendUrl, aToken } = useContext(AdminContext)
    const [appointments, setAppointments] = useState([])
    const [loading, setLoading] = useState(false)

    const fetchUserAppointments = async () => {
        if (!userId) return

        setLoading(true)
        try {
            const config = { withCredentials: true, headers: {} }
            if (typeof aToken === 'string') {
                config.headers.token = aToken
            }

            const { data } = await axios.get(
                `${backendUrl}/api/admin/users/${userId}/appointments`,
                config
            )
            if (data.success) {
                setAppointments(data.appointments)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.error(error)
            toast.error(error.message || 'Failed to fetch history')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (isOpen && userId) {
            fetchUserAppointments()
        }
    }, [isOpen, userId])

    if (!isOpen) return null

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A'
        const [day, month, year] = dateString.split('_')
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        return `${day} ${months[parseInt(month) - 1]} ${year}`
    }

    return (
        <div className='fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-all'>
            <div className='bg-white dark:bg-gray-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fadeIn'>
                {/* Header */}
                <div className='flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-10'>
                    <div>
                        <h2 className='text-xl font-bold text-gray-900 dark:text-white'>Appointment History</h2>
                        <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>Viewing past bookings for selected user</p>
                    </div>
                    <button
                        onClick={onClose}
                        className='p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600'
                    >
                        <X className='w-5 h-5' />
                    </button>
                </div>

                {/* Content */}
                <div className='flex-1 overflow-y-auto p-6 bg-gray-50/50 dark:bg-gray-900/50'>
                    {loading ? (
                        <div className='flex flex-col justify-center items-center h-60 gap-4'>
                            <div className='animate-spin rounded-full h-10 w-10 border-[3px] border-blue-500 border-t-transparent'></div>
                            <p className='text-sm text-gray-500 animate-pulse'>Loading history...</p>
                        </div>
                    ) : appointments.length === 0 ? (
                        <div className='flex flex-col items-center justify-center h-64 text-center p-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800'>
                            <div className='w-16 h-16 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4'>
                                <Calendar className='w-8 h-8 text-gray-300 dark:text-gray-500' />
                            </div>
                            <h3 className='text-lg font-medium text-gray-900 dark:text-white'>No Appointments Yet</h3>
                            <p className='text-gray-500 dark:text-gray-400 mt-1 max-w-xs'>This user hasn't booked any appointments with doctors yet.</p>
                        </div>
                    ) : (
                        <div className='space-y-4'>
                            {appointments.map((item, index) => (
                                <div key={index} className='group bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden'>
                                    {/* Status Stripe */}
                                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${item.cancelled ? 'bg-red-500' : item.isCompleted ? 'bg-green-500' : 'bg-blue-500'
                                        }`}></div>

                                    <div className='flex flex-col sm:flex-row justify-between gap-4 pl-3'>
                                        {/* Doctor Info */}
                                        <div className='flex gap-4'>
                                            <div className='w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0 border-2 border-white dark:border-gray-600 shadow-sm'>
                                                <img
                                                    className='w-full h-full object-cover'
                                                    src={item.docData?.image}
                                                    alt={item.docData?.name}
                                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/48' }}
                                                />
                                            </div>
                                            <div>
                                                <p className='font-bold text-gray-900 dark:text-white text-lg'>Dr. {item.docData?.name}</p>
                                                <p className='text-sm font-medium text-blue-600 dark:text-blue-400 mb-2'>{item.docData?.speciality}</p>
                                                <div className='flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400'>
                                                    {item.docData?.address?.line1 && (
                                                        <span className='flex items-center gap-1'>
                                                            <MapPin className='w-3 h-3' />
                                                            {item.docData.address.line1}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Date & Status */}
                                        <div className='flex flex-col sm:items-end gap-3 min-w-[140px] border-t sm:border-0 border-gray-50 dark:border-gray-700 pt-3 sm:pt-0 mt-2 sm:mt-0'>
                                            <div className='space-y-1.5'>
                                                <div className='flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 px-3 py-1 rounded-md w-fit sm:w-full sm:justify-end'>
                                                    <Calendar className='w-4 h-4 text-gray-400 dark:text-gray-500' />
                                                    <span className='font-medium'>{formatDate(item.slotDate)}</span>
                                                </div>
                                                <div className='flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 px-3 py-1 rounded-md w-fit sm:w-full sm:justify-end'>
                                                    <Clock className='w-4 h-4 text-gray-400 dark:text-gray-500' />
                                                    <span className='font-medium'>{item.slotTime}</span>
                                                </div>
                                            </div>

                                            <div className='flex items-center justify-between sm:justify-end w-full gap-3 pt-2 sm:pt-0'>
                                                <span className='text-sm font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-600'>
                                                    ₹{item.amount}
                                                </span>

                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${item.cancelled
                                                    ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-800'
                                                    : item.isCompleted
                                                        ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-100 dark:border-green-800'
                                                        : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800'
                                                    }`}>
                                                    {item.cancelled ? 'Cancelled' : item.isCompleted ? 'Completed' : 'Upcoming'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {item.cancelled && (
                                        <div className='mt-4 flex items-center gap-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded ml-3'>
                                            <AlertCircle className='w-4 h-4' />
                                            <span>This appointment was cancelled.</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className='p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-end gap-2'>
                    <button
                        onClick={onClose}
                        className='px-6 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white transition-all shadow-sm active:scale-95'
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}

export default UserAppointmentsModal
