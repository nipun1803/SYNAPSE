import React, { useContext, useEffect, useState } from 'react';
import { assets } from '../../assets/assets';
import { AppContext } from '../../context/AppContext';
import { DoctorContext } from '../../context/DoctorContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, CheckCircle, XCircle, Search, Users } from 'lucide-react';

const DoctorAppointments = () => {
  const { dToken, appointments, getAppointments, cancelAppointment, completeAppointment } =
    useContext(DoctorContext);

  const { slotDateFormat, calculateAge, currency } = useContext(AppContext);

  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!dToken) return;
    const fetchData = async () => {
      setLoading(true);
      const pagination = await getAppointments(page, itemsPerPage, filter, search);
      if (pagination) {
        setTotalPages(pagination.pages);
      }
      setLoading(false);
    };

    // Debounce search
    const timeoutId = setTimeout(() => {
      fetchData();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [dToken, page, filter, search]);

  // Reset page when filter or search changes
  useEffect(() => {
    setPage(1);
  }, [filter, search]);

  const startIndex = (page - 1) * itemsPerPage;
  const getRowNumber = (index) => startIndex + index + 1;

  const [actionLoading, setActionLoading] = useState({ id: null, type: null });

  const onCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      setActionLoading({ id, type: 'cancel' });
      await cancelAppointment(id);

      const pagination = await getAppointments(page, itemsPerPage, filter, search);
      if (pagination) setTotalPages(pagination.pages);
    } catch (error) {
      // Error handled silently
    } finally {
      setActionLoading({ id: null, type: null });
    }
  };

  const onComplete = async (id) => {
    if (!window.confirm('Mark as completed?')) return;
    try {
      setActionLoading({ id, type: 'complete' });
      await completeAppointment(id);

      const pagination = await getAppointments(page, itemsPerPage, filter, search);
      if (pagination) setTotalPages(pagination.pages);
    } catch (error) {
      // Error handled silently
    } finally {
      setActionLoading({ id: null, type: null });
    }
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
      </div>
    );
  }

  const upcomingCount = appointments.filter(a => !a.cancelled && !a.isCompleted).length;
  const completedCount = appointments.filter(a => a.isCompleted).length;
  const cancelledCount = appointments.filter(a => a.cancelled).length;

  return (
    <div className='p-6 max-w-7xl mx-auto space-y-6'>

      <div>
        <h1 className='text-3xl font-bold text-gray-900'>My Appointments</h1>
        <p className='text-gray-600 mt-1'>Manage your patient appointments</p>
      </div>


      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
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

      {/* filtering */}
      <Card>
        <CardContent className='p-4'>
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
        </CardContent>
      </Card>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search patients by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* appointment table */}
      <Card>
        <CardHeader>
          <CardTitle>Appointments List</CardTitle>
        </CardHeader>
        <CardContent>
          {appointments.length > 0 ? (
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-gray-50 border-b'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase'>#</th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase'>Patient</th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase'>Age</th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase'>Date & Time</th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase'>Reason for Visit</th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase'>Payment</th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase'>Fee</th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase'>Status</th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase'>Actions</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-100'>
                  {appointments.map((item, index) => (
                    <tr key={item._id || index} className='hover:bg-gray-50'>
                      <td className='px-6 py-4 text-sm font-medium text-gray-900'>{getRowNumber(index)}</td>
                      <td className='px-6 py-4'>
                        <div className='flex items-center gap-3'>
                          <img
                            src={item.userData?.image || assets.profile_pic}
                            className='w-10 h-10 rounded-full object-cover'
                            alt='Patient'
                          />
                          <div>
                            <p className='text-sm font-medium text-gray-900'>{item.userData?.name || 'Unknown'}</p>
                            <p className='text-xs text-gray-500'>{item.userData?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4 text-sm text-gray-700'>
                        {calculateAge(item.userData?.dob) || '-'}
                      </td>
                      <td className='px-6 py-4'>
                        <p className='text-sm font-medium text-gray-900'>{slotDateFormat(item.slotDate)}</p>
                        <p className='text-xs text-gray-500'>{item.slotTime}</p>
                      </td>
                      <td className='px-6 py-4'>
                        <p className='text-sm text-gray-700 max-w-[200px] truncate' title={item.purpose || 'Not specified'}>
                          {item.purpose ? item.purpose : <span className='text-gray-400 italic'>Not specified</span>}
                        </p>
                      </td>
                      <td className='px-6 py-4'>
                        <div className='flex flex-col gap-1'>
                          {item.payment ? (
                            item.paymentStatus === 'completed' ? (
                              <Badge className='bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100 gap-1'>
                                <CheckCircle className='w-3 h-3' />
                                Paid Online
                              </Badge>
                            ) : item.paymentStatus === 'refunded' ? (
                              <Badge className='bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100 gap-1'>
                                Refunded
                              </Badge>
                            ) : (
                              <Badge variant='outline' className='gap-1'>
                                Payment Pending
                              </Badge>
                            )
                          ) : (
                            <Badge className='bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100 gap-1'>
                              Cash (Pending)
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className='px-6 py-4 text-sm font-semibold text-gray-900'>{currency}{item.amount}</td>
                      <td className='px-6 py-4'>
                        {item.cancelled ? (
                          <Badge variant='destructive' className='gap-1'>
                            <XCircle className='w-3 h-3' />
                            Cancelled
                          </Badge>
                        ) : item.isCompleted ? (
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
                        {!item.cancelled && !item.isCompleted && (
                          <div className='flex items-center gap-2'>
                            <Button
                              onClick={() => onComplete(item._id)}
                              disabled={actionLoading.id === item._id}
                              variant='ghost'
                              size='sm'
                              className='text-green-600 hover:text-green-700 hover:bg-green-50'
                            >
                              {actionLoading.id === item._id && actionLoading.type === 'complete' ? (
                                <div className='w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin' />
                              ) : (
                                <>
                                  <CheckCircle className='w-4 h-4 mr-1' />
                                  Complete
                                </>
                              )}
                            </Button>
                            <Button
                              onClick={() => onCancel(item._id)}
                              disabled={actionLoading.id === item._id}
                              variant='ghost'
                              size='sm'
                              className='text-red-600 hover:text-red-700 hover:bg-red-50'
                            >
                              {actionLoading.id === item._id && actionLoading.type === 'cancel' ? (
                                <div className='w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin' />
                              ) : (
                                <>
                                  <XCircle className='w-4 h-4 mr-1' />
                                  Cancel
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                        {item.isCompleted && !item.prescriptionId && (
                          <Button
                            size='sm'
                            onClick={() => window.location.href = `/doctor/create-prescription?appointmentId=${item._id}&patientId=${item.userId}`}
                            className='bg-blue-600 hover:bg-blue-700 text-white'
                          >
                            Create Prescription
                          </Button>
                        )}
                        {item.prescriptionId && (
                          <Button
                            size='sm'
                            onClick={() => window.location.href = `/doctor/view-prescription?appointmentId=${item._id}`}
                            className='bg-green-600 hover:bg-green-700 text-white'
                          >
                            View Prescription
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className='text-center py-12'>
              <Calendar className='mx-auto h-12 w-12 text-gray-400' />
              <h3 className='mt-2 text-sm font-medium text-gray-900'>No appointments found</h3>
              <p className='mt-1 text-sm text-gray-500'>
                {filter !== 'all' ? `No ${filter} appointments` : 'Appointments will appear here'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>


      {
        totalPages > 1 && (
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
        )
      }
    </div >
  );
};

export default DoctorAppointments;