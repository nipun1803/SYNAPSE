import React, { useContext, useEffect, useState } from 'react';
import { assets } from '../../assets/assets';
import { AppContext } from '../../context/AppContext';
import { DoctorContext } from '../../context/DoctorContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign, Calendar, Users, TrendingUp, CheckCircle, XCircle, Clock } from 'lucide-react';

const DoctorDashboard = () => {
  const { dToken, dashData, getDashData, cancelAppointment, completeAppointment } = useContext(DoctorContext);
  const { slotDateFormat, currency } = useContext(AppContext);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (dToken) {
      setLoading(true);
      getDashData().finally(() => setLoading(false));
    }
  }, [dToken]);

  const handleCancel = async (id) => {
    if (!confirm('Cancel this appointment?')) return;
    await cancelAppointment(id);
    await getDashData();
  };

  const handleComplete = async (id) => {
    if (!confirm('Mark as completed?')) return;
    await completeAppointment(id);
    await getDashData();
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
      </div>
    );
  }

  if (!dashData) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className='text-center'>
          <svg className='mx-auto h-12 w-12 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
          </svg>
          <p className='text-gray-500 mt-2'>No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className='p-6 max-w-7xl mx-auto space-y-6'>
      <div>
        <h1 className='text-3xl font-bold text-gray-900'>Doctor Dashboard</h1>
        <p className='text-gray-600 mt-1'>Welcome back! Here's your practice overview.</p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <Card className='border-l-4 border-l-green-500'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>Earnings</p>
                <p className='text-3xl font-bold text-gray-900 mt-2'>
                  {currency}{dashData?.earnings || 0}
                </p>
                <p className='text-xs text-gray-500 mt-1 flex items-center gap-1'>
                  <TrendingUp className='w-3 h-3' />
                  Total revenue
                </p>
              </div>
              <div className='w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center'>
                <DollarSign className='w-6 h-6 text-green-600' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='border-l-4 border-l-blue-500'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>Appointments</p>
                <p className='text-3xl font-bold text-gray-900 mt-2'>
                  {dashData?.appointments || 0}
                </p>
                <p className='text-xs text-gray-500 mt-1 flex items-center gap-1'>
                  <TrendingUp className='w-3 h-3' />
                  Total bookings
                </p>
              </div>
              <div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center'>
                <Calendar className='w-6 h-6 text-blue-600' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='border-l-4 border-l-purple-500'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>Patients</p>
                <p className='text-3xl font-bold text-gray-900 mt-2'>
                  {dashData?.patients || 0}
                </p>
                <p className='text-xs text-gray-500 mt-1 flex items-center gap-1'>
                  <TrendingUp className='w-3 h-3' />
                  Unique patients
                </p>
              </div>
              <div className='w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center'>
                <Users className='w-6 h-6 text-purple-600' />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>


      <Card>
        <CardHeader>
          <CardTitle>Latest Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          {dashData.latestAppointments && dashData.latestAppointments.length > 0 ? (
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-gray-50 border-b'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase'>#</th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase'>Patient</th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase'>Date & Time</th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase'>Status</th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase'>Actions</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-100'>
                  {dashData.latestAppointments.slice(0, 5).map((item, index) => (
                    <tr key={item._id || index} className='hover:bg-gray-50'>
                      <td className='px-6 py-4 text-sm font-medium text-gray-900'>{index + 1}</td>
                      <td className='px-6 py-4'>
                        <div className='flex items-center gap-3'>
                          <img
                            className='w-10 h-10 rounded-full object-cover'
                            src={item.userData?.image || assets.profile_pic}
                            alt='Patient'
                          />
                          <div>
                            <p className='text-sm font-medium text-gray-900'>
                              {item.userData?.name || 'Patient'}
                            </p>
                            <p className='text-xs text-gray-500'>
                              {item.userData?.email || '-'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4'>
                        <p className='text-sm font-medium text-gray-900'>
                          {slotDateFormat(item.slotDate)}
                        </p>
                        <p className='text-xs text-gray-500'>{item.slotTime}</p>
                      </td>
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
                              onClick={() => handleComplete(item._id)}
                              variant='ghost'
                              size='sm'
                              className='text-green-600 hover:text-green-700 hover:bg-green-50'
                            >
                              <CheckCircle className='w-4 h-4 mr-1' />
                              Complete
                            </Button>
                            <Button
                              onClick={() => handleCancel(item._id)}
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
              <h3 className='mt-2 text-sm font-medium text-gray-900'>No appointments yet</h3>
              <p className='mt-1 text-sm text-gray-500'>Appointments will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorDashboard;