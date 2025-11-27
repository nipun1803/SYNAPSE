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
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    if (!dToken) return;
    const fetchData = async () => {
      setLoading(true);
      await getAppointments();
      setLoading(false);
    };
    fetchData();
  }, [dToken]);

  useEffect(() => {
    setPage(1);
  }, [filter]);

  const filteredList = appointments.filter(appt => {
    switch (filter) {
      case 'upcoming':
        return !appt.cancelled && !appt.isCompleted;
      case 'completed':
        return appt.isCompleted;
      case 'cancelled':
        return appt.cancelled;
      default:
        return true;
    }
  });

  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedList = filteredList.slice(startIndex, endIndex);

  const getRowNumber = (index) => startIndex + index + 1;

  const onCancel = async (id) => {
    const ok = window.confirm('Cancel this appointment?');
    if (ok) {
      await cancelAppointment(id);
      await getAppointments();
    }
  };

  const onComplete = async (id) => {
    const ok = window.confirm('Mark as completed?');
    if (ok) {
      await completeAppointment(id);
      await getAppointments();
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
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold text-gray-900'>My Appointments</h1>
        <p className='text-gray-600 mt-1'>Manage your patient appointments</p>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-3 gap-4'>
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
          <div className='flex gap-2 flex-wrap'>
            <Button
              onClick={() => setFilter('all')}
              variant={filter === 'all' ? 'default' : 'outline'}
              size='sm'
            >
              All
            </Button>
            <Button
              onClick={() => setFilter('upcoming')}
              variant={filter === 'upcoming' ? 'default' : 'outline'}
              size='sm'
            >
              <Clock className='w-4 h-4 mr-1' />
              Upcoming
            </Button>
            <Button
              onClick={() => setFilter('completed')}
              variant={filter === 'completed' ? 'default' : 'outline'}
              size='sm'
            >
              <CheckCircle className='w-4 h-4 mr-1' />
              Completed
            </Button>
            <Button
              onClick={() => setFilter('cancelled')}
              variant={filter === 'cancelled' ? 'default' : 'outline'}
              size='sm'
            >
              <XCircle className='w-4 h-4 mr-1' />
              Cancelled
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Appointments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Appointments List</CardTitle>
        </CardHeader>
        <CardContent>
          {paginatedList.length > 0 ? (
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-gray-50 border-b'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase'>#</th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase'>Patient</th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase'>Age</th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase'>Date & Time</th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase'>Payment</th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase'>Fee</th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase'>Status</th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase'>Actions</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-100'>
                  {paginatedList.map((item, index) => (
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
                        <Badge variant={item.payment ? 'default' : 'outline'} className='gap-1'>
                          {item.payment ? 'Online' : 'Cash'}
                        </Badge>
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
                              variant='ghost'
                              size='sm'
                              className='text-green-600 hover:text-green-700 hover:bg-green-50'
                            >
                              <CheckCircle className='w-4 h-4 mr-1' />
                              Complete
                            </Button>
                            <Button
                              onClick={() => onCancel(item._id)}
                              variant='ghost'
                              size='sm'
                              className='text-red-600 hover:text-red-700 hover:bg-red-50'
                            >
                              <XCircle className='w-4 h-4 mr-1' />
                              Cancel
                            </Button>
                          </div>
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

      {/* Pagination */}
      {totalPages > 1 && filteredList.length > 0 && (
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
  );
};

export default DoctorAppointments;