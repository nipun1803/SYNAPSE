import React, { useContext, useEffect, useState } from 'react';
import { assets } from '../../assets/assets';
import { AppContext } from '../../context/AppContext';
import { DoctorContext } from '../../context/DoctorContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, CheckCircle, XCircle, Search, Users, MessageSquare, Video, FolderOpen, MapPin } from 'lucide-react';
import PatientReportsViewer from './PatientReportsViewer';

const DoctorAppointments = () => {
  const { dToken, appointments, apptCounts, getAppointments, cancelAppointment, completeAppointment } =
    useContext(DoctorContext);
  const navigate = useNavigate();

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

  const handleFilterChange = (newFilter) => {
    if (newFilter === filter) return;
    setFilter(newFilter);
    setPage(1);
  };

  const handleSearchChange = (val) => {
    setSearch(val);
    setPage(1);
  };

  const startIndex = (page - 1) * itemsPerPage;
  const getRowNumber = (index) => startIndex + index + 1;

  const [actionLoading, setActionLoading] = useState({ id: null, type: null });
  const [viewReportsFor, setViewReportsFor] = useState(null);

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

  const upcomingCount = apptCounts?.upcoming || 0;
  const completedCount = apptCounts?.completed || 0;
  const cancelledCount = apptCounts?.cancelled || 0;

  return (
    <div className='p-6 max-w-7xl mx-auto space-y-6'>

      <div>
        <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>My Appointments</h1>
        <p className='text-gray-600 dark:text-gray-400 mt-1'>Manage your patient appointments</p>
      </div>


      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        <Card className='dark:bg-gray-800 dark:border-gray-700'>
          <CardContent className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center'>
                <Clock className='w-5 h-5 text-blue-600 dark:text-blue-400' />
              </div>
              <div>
                <p className='text-sm text-gray-600 dark:text-gray-400'>Upcoming</p>
                <p className='text-2xl font-bold text-gray-900 dark:text-white'>{upcomingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='dark:bg-gray-800 dark:border-gray-700'>
          <CardContent className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center'>
                <CheckCircle className='w-5 h-5 text-green-600 dark:text-green-400' />
              </div>
              <div>
                <p className='text-sm text-gray-600 dark:text-gray-400'>Completed</p>
                <p className='text-2xl font-bold text-gray-900 dark:text-white'>{completedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='dark:bg-gray-800 dark:border-gray-700'>
          <CardContent className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center'>
                <XCircle className='w-5 h-5 text-red-600 dark:text-red-400' />
              </div>
              <div>
                <p className='text-sm text-gray-600 dark:text-gray-400'>Cancelled</p>
                <p className='text-2xl font-bold text-gray-900 dark:text-white'>{cancelledCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* filtering */}
      <Card className='dark:bg-gray-800 dark:border-gray-700'>
        <CardContent className='p-4'>
          <div className='flex gap-2 flex-wrap'>
            <Button
              onClick={() => handleFilterChange('all')}
              variant={filter === 'all' ? 'default' : 'outline'}
              className={filter === 'all' ? 'bg-gray-900 text-white hover:bg-gray-800' : ''}
              size='sm'
            >
              All
            </Button>
            <Button
              onClick={() => handleFilterChange('upcoming')}
              variant={filter === 'upcoming' ? 'default' : 'outline'}
              className={filter === 'upcoming' ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
              size='sm'
            >
              <Clock className='w-4 h-4 mr-1' />
              Upcoming
            </Button>
            <Button
              onClick={() => handleFilterChange('completed')}
              variant={filter === 'completed' ? 'default' : 'outline'}
              className={filter === 'completed' ? 'bg-green-600 text-white hover:bg-green-700' : ''}
              size='sm'
            >
              <CheckCircle className='w-4 h-4 mr-1' />
              Completed
            </Button>
            <Button
              onClick={() => handleFilterChange('cancelled')}
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
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
        <input
          type="text"
          placeholder="Search patients by name..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 dark:text-white"
        />
      </div>

      {/* appointment table */}
      <Card className='dark:bg-gray-800 dark:border-gray-700'>
        <CardHeader>
          <CardTitle>Appointments List</CardTitle>
        </CardHeader>
        <CardContent>
          {appointments.length > 0 ? (
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase'>#</th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase'>Patient</th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase'>Age</th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase'>Date & Time</th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase'>Reason for Visit</th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase'>Payment</th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase'>Fee</th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase'>Status</th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase'>Actions</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-100 dark:divide-gray-700'>
                  {appointments.map((item, index) => (
                    <tr key={item._id || index} className='hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'>
                      <td className='px-6 py-4 text-sm font-medium text-gray-900 dark:text-white'>{getRowNumber(index)}</td>
                      <td className='px-6 py-4'>
                        <div className='flex items-center gap-3'>
                          <img
                            src={item.userData?.image || assets.profile_pic}
                            className='w-10 h-10 rounded-full object-cover border-2 border-white dark:border-gray-600'
                            alt='Patient'
                          />
                          <div>
                            <p className='text-sm font-medium text-gray-900 dark:text-white'>{item.userData?.name || 'Unknown'}</p>
                            <p className='text-xs text-gray-500 dark:text-gray-400'>{item.userData?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4 text-sm text-gray-700 dark:text-gray-300'>
                        {calculateAge(item.userData?.dob) || '-'}
                      </td>
                      <td className='px-6 py-4'>
                        <p className='text-sm font-medium text-gray-900 dark:text-white'>{slotDateFormat(item.slotDate)}</p>
                        <p className='text-xs text-gray-500 dark:text-gray-400'>{item.slotTime}</p>
                      </td>
                      <td className='px-6 py-4'>
                        <p className='text-sm text-gray-700 dark:text-gray-300 max-w-[200px] truncate' title={item.purpose || 'Not specified'}>
                          {item.purpose ? item.purpose : <span className='text-gray-400 dark:text-gray-500 italic'>Not specified</span>}
                        </p>
                      </td>
                      <td className='px-6 py-4'>
                        <div className='flex flex-col gap-1'>
                          {item.payment ? (
                            item.paymentStatus === 'completed' ? (
                              <Badge className='bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 gap-1 w-max'>
                                <CheckCircle className='w-3 h-3' />
                                Paid Online
                              </Badge>
                            ) : item.paymentStatus === 'refunded' ? (
                              <Badge className='bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800 hover:bg-orange-100 gap-1 w-max'>
                                Refunded
                              </Badge>
                            ) : (
                              <Badge variant='outline' className='gap-1 dark:border-gray-600 dark:text-gray-300 w-max'>
                                Payment Pending
                              </Badge>
                            )
                          ) : (
                            <Badge className='bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800 hover:bg-yellow-100 gap-1 w-max'>
                              Cash (Pending)
                            </Badge>
                          )}

                          {/* Consultation Mode Badge */}
                          {item.consultationMode === 'online' ? (
                            <Badge className='bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 gap-1 w-max mt-1'>
                              <Video className='w-3 h-3 mr-1' /> Online Consult
                            </Badge>
                          ) : (
                            <Badge className='bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 gap-1 w-max mt-1'>
                              <MapPin className='w-3 h-3 mr-1' /> In-Clinic Visit
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className='px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white'>{currency}{item.amount}</td>
                      <td className='px-6 py-4'>
                        {item.cancelled ? (
                          <Badge variant='destructive' className='gap-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-100'>
                            <XCircle className='w-3 h-3' />
                            Cancelled
                          </Badge>
                        ) : item.isCompleted ? (
                          <Badge className='bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 hover:bg-green-100 gap-1'>
                            <CheckCircle className='w-3 h-3' />
                            Completed
                          </Badge>
                        ) : (
                          <Badge className='bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-100 gap-1'>
                            <Clock className='w-3 h-3' />
                            Upcoming
                          </Badge>
                        )}
                      </td>
                      <td className='px-6 py-4'>
                        <div className='flex items-center gap-2 flex-wrap'>
                          {!item.cancelled && !item.isCompleted && (
                            <>
                              <Button
                                onClick={() => onComplete(item._id)}
                                disabled={actionLoading.id === item._id}
                                variant='ghost'
                                size='sm'
                                className='text-green-600 dark:text-green-400 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/30'
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
                                className='text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30'
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
                            </>
                          )}

                          {!item.cancelled && (
                            <Button
                              size='sm'
                              variant='ghost'
                              onClick={() => navigate(`/doctor/chat/${item._id}`)}
                              className='text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30'
                            >
                              <MessageSquare className='w-4 h-4 mr-1' />
                              Chat
                            </Button>
                          )}

                          {!item.cancelled && !item.isCompleted && item.consultationMode === 'online' && (
                            <Button
                              size='sm'
                              variant='ghost'
                              onClick={() => navigate(`/doctor/video-call/${item._id}`)}
                              className='text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'
                            >
                              <Video className='w-4 h-4 mr-1' />
                              Video Call
                            </Button>
                          )}

                          <Button
                            size='sm'
                            variant='ghost'
                            onClick={() => setViewReportsFor({ userId: item.userId, name: item.userData?.name })}
                            className='text-purple-600 dark:text-purple-400 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/30'
                          >
                            <FolderOpen className='w-4 h-4 mr-1' />
                            Reports
                          </Button>

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
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className='text-center py-12'>
              <Calendar className='mx-auto h-12 w-12 text-gray-400 dark:text-gray-500' />
              <h3 className='mt-2 text-sm font-medium text-gray-900 dark:text-white'>No appointments found</h3>
              <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
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
            <span className='flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300'>
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

      {/* Patient Reports Viewer Modal */}
      {viewReportsFor && (
        <PatientReportsViewer
          userId={viewReportsFor.userId}
          patientName={viewReportsFor.name}
          onClose={() => setViewReportsFor(null)}
        />
      )}

    </div >
  );
};

export default DoctorAppointments;