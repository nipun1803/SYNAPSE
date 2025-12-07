import React, { useContext, useEffect, useState } from 'react';
import DashboardChart from '../../components/DashboardChart';
import { useNavigate } from 'react-router-dom';
import { assets } from '../../assets/assets';
import { AppContext } from '../../context/AppContext';
import { DoctorContext } from '../../context/DoctorContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign, Calendar, Users, TrendingUp, CheckCircle, XCircle, Clock, Settings, User, ListPlus } from 'lucide-react';

const DoctorDashboard = () => {
  const navigate = useNavigate();
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
          <p className='text-gray-500 mt-2'>No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className='p-6 max-w-7xl mx-auto space-y-8'>
      {/* Header & Quick Actions */}
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>Doctor Dashboard</h1>
          <p className='text-gray-600 dark:text-gray-400 mt-1'>Welcome back! Here's your practice overview.</p>
        </div>
        <div className='flex gap-3'>
          <Button onClick={() => navigate('/doctor-slots')} className='bg-blue-600 hover:bg-blue-700 text-white gap-2'>
            <ListPlus className='w-4 h-4' />
            Manage Slots
          </Button>
          <Button onClick={() => navigate('/doctor-profile')} variant='outline' className='gap-2'>
            <User className='w-4 h-4' />
            Profile
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <Card className='border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700 dark:border-l-green-500'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>Total Earnings</p>
                <p className='text-3xl font-bold text-gray-900 dark:text-white mt-2'>
                  {currency}{dashData?.earnings || 0}
                </p>
                <p className='text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1 font-medium'>
                  <TrendingUp className='w-3 h-3' />
                  +12% from last month
                </p>
              </div>
              <div className='w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center'>
                <DollarSign className='w-6 h-6 text-green-600 dark:text-green-400' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700 dark:border-l-blue-500'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>Appointments</p>
                <p className='text-3xl font-bold text-gray-900 dark:text-white mt-2'>
                  {dashData?.appointments || 0}
                </p>
                <p className='text-xs text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1 font-medium'>
                  <Calendar className='w-3 h-3' />
                  Total bookings
                </p>
              </div>
              <div className='w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center'>
                <Calendar className='w-6 h-6 text-blue-600 dark:text-blue-400' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700 dark:border-l-purple-500'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>Unique Patients</p>
                <p className='text-3xl font-bold text-gray-900 dark:text-white mt-2'>
                  {dashData?.patients || 0}
                </p>
                <p className='text-xs text-purple-600 dark:text-purple-400 mt-1 flex items-center gap-1 font-medium'>
                  <Users className='w-3 h-3' />
                  Registered patients
                </p>
              </div>
              <div className='w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center'>
                <Users className='w-6 h-6 text-purple-600 dark:text-purple-400' />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>



      {/* Analytics Charts */}
      {/* Analytics Charts */}
      <DashboardChart data={dashData.chartData} allAppointments={dashData.allAppointments} />

      {/* Latest Appointments */}
      <Card className='shadow-sm border-gray-200 dark:border-gray-700 dark:bg-gray-800'>
        <CardHeader className='border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50'>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2'>
              <Clock className='w-5 h-5 text-blue-600' />
              Latest Appointments
            </CardTitle>
            <Button variant='ghost' size='sm' onClick={() => navigate('/doctor-appointments')} className='text-blue-600 hover:text-blue-700'>
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent className='p-0'>
          {dashData.latestAppointments && dashData.latestAppointments.length > 0 ? (
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700'>
                  <tr>
                    <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider'>Patient</th>
                    <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider'>Date & Time</th>
                    <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider'>Status</th>
                    <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider'>Actions</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800'>
                  {dashData.latestAppointments.slice(0, 5).map((item, index) => (
                    <tr key={item._id || index} className='hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'>
                      <td className='px-6 py-4'>
                        <div className='flex items-center gap-3'>
                          <img
                            className='w-10 h-10 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm'
                            src={item.userData?.image || assets.profile_pic}
                            alt='Patient'
                          />
                          <div>
                            <p className='text-sm font-semibold text-gray-900 dark:text-white'>
                              {item.userData?.name || 'Patient'}
                            </p>
                            <p className='text-xs text-gray-500'>
                              {item.userData?.email || '-'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4'>
                        <div className='flex flex-col'>
                          <span className='text-sm font-medium text-gray-900 dark:text-gray-200'>
                            {slotDateFormat(item.slotDate)}
                          </span>
                          <span className='text-xs text-gray-500 flex items-center gap-1 mt-0.5'>
                            <Clock className='w-3 h-3' />
                            {item.slotTime}
                          </span>
                        </div>
                      </td>
                      <td className='px-6 py-4'>
                        {item.cancelled ? (
                          <Badge variant='destructive' className='bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-100 gap-1 pl-1.5'>
                            <XCircle className='w-3.5 h-3.5' />
                            Cancelled
                          </Badge>
                        ) : item.isCompleted ? (
                          <Badge className='bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 hover:bg-green-100 gap-1 pl-1.5'>
                            <CheckCircle className='w-3.5 h-3.5' />
                            Completed
                          </Badge>
                        ) : (
                          <Badge className='bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-100 gap-1 pl-1.5'>
                            <Clock className='w-3.5 h-3.5' />
                            Upcoming
                          </Badge>
                        )}
                      </td>
                      <td className='px-6 py-4'>
                        {!item.cancelled && !item.isCompleted && (
                          <div className='flex items-center gap-2'>
                            <Button
                              onClick={() => handleComplete(item._id)}
                              variant='outline'
                              size='sm'
                              className='h-8 w-8 p-0 rounded-full border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700'
                              title='Mark Complete'
                            >
                              <CheckCircle className='w-4 h-4' />
                            </Button>
                            <Button
                              onClick={() => handleCancel(item._id)}
                              variant='outline'
                              size='sm'
                              className='h-8 w-8 p-0 rounded-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700'
                              title='Cancel Appointment'
                            >
                              <XCircle className='w-4 h-4' />
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
              <div className='w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4'>
                <Calendar className='h-8 w-8 text-gray-400 dark:text-gray-500' />
              </div>
              <h3 className='text-lg font-medium text-gray-900 dark:text-white'>No appointments yet</h3>
              <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>New appointments will appear here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div >
  );
};

export default DoctorDashboard;