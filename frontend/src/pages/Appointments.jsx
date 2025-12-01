import React, { useContext, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Calendar, DollarSign, Loader2, ClipboardList } from 'lucide-react'
import { userService } from '../api/services'

const MyAppointments = () => {
  const { currencySymbol, slotDateFormat } = useContext(AppContext)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

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
      console.error('Appointments fetch error:', error)
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
      console.error('Cancel error:', error)
      toast.error('Failed to cancel appointment.')
    } finally {
      setCancelling(null)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [page])

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
            <Card key={item._id} className='border-gray-200 shadow-sm hover:shadow-md transition-shadow'>
              <CardContent className='p-6'>
                <div className='flex flex-col md:flex-row gap-6'>
                  <div className='flex-shrink-0'>
                    <img
                      className='w-32 h-32 rounded-lg object-cover bg-indigo-50'
                      src={item.docData?.image || assets.doctor_icon}
                      alt={item.docData?.name}
                      onError={(e) => { e.target.src = assets.doctor_icon }}
                    />
                  </div>

                  <div className='flex-1 space-y-3'>
                    <div className='flex items-start justify-between'>
                      <div>
                        <h3 className='text-xl font-semibold text-gray-900 flex items-center gap-2'>
                          {item.docData?.name}
                          {item.docData?.verified && (
                            <img src={assets.verified_icon} className='w-5 h-5' alt='Verified' />
                          )}
                        </h3>
                        <p className='text-gray-600 mt-1'>{item.docData?.speciality}</p>
                        <p className='text-sm text-gray-500 mt-1'>{item.docData?.degree}</p>
                      </div>

                      <div>
                        {item.cancelled ? (
                          <Badge variant='destructive' className='bg-red-100 text-red-700 border-red-200'>
                            Cancelled
                          </Badge>
                        ) : item.isCompleted ? (
                          <Badge className='bg-green-100 text-green-700 border-green-200 hover:bg-green-100'>
                            Completed
                          </Badge>
                        ) : (
                          <Badge className='bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100'>
                            Upcoming
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className='flex items-start gap-2 text-sm text-gray-600'>
                      <MapPin className='w-5 h-5 text-gray-400 mt-0.5' />
                      <div>
                        <p className='font-medium text-gray-700'>Address:</p>
                        <p>{item.docData?.address?.line1}</p>
                        {item.docData?.address?.line2 && <p>{item.docData?.address?.line2}</p>}
                      </div>
                    </div>

                    <div className='flex items-center gap-2 text-sm'>
                      <Calendar className='w-5 h-5 text-gray-400' />
                      <span className='font-medium text-gray-700'>Date & Time:</span>
                      <span className='text-gray-900'>
                        {slotDateFormat ? slotDateFormat(item.slotDate) : item.slotDate} at {item.slotTime}
                      </span>
                    </div>

                    <div className='flex items-center gap-2 text-sm'>
                      <DollarSign className='w-5 h-5 text-gray-400' />
                      <span className='font-medium text-gray-700'>Consultation Fee:</span>
                      <span className='text-gray-900 font-semibold'>
                        {currencySymbol}{item.amount || item.docData?.fees}
                      </span>
                    </div>
                  </div>

                  <div className='flex md:flex-col gap-3 justify-end md:justify-start md:min-w-[140px]'>
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
    </div>
  )
}

export default MyAppointments
