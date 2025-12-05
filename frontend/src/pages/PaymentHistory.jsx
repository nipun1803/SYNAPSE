import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CreditCard, Download, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';

const PaymentHistory = () => {
    const { backendUrl } = useContext(AppContext);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPaymentHistory();
    }, []);

    const fetchPaymentHistory = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${backendUrl}/api/payment/history`, {
                credentials: 'include'
            });
            const data = await res.json();

            if (data.success) {
                setPayments(data.payments || []);
            } else {
                toast.error(data.message || 'Failed to load payment history');
            }
        } catch (error) {
            console.error('Payment history error:', error);
            toast.error('Failed to load payment history');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'completed':
                return <Badge className='bg-green-100 text-green-700 border-green-200 hover:bg-green-100'>\u2713 Completed</Badge>;
            case 'refunded':
                return <Badge className='bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100'>Refunded</Badge>;
            case 'failed':
                return <Badge className='bg-red-100 text-red-700 border-red-200 hover:bg-red-100'>Failed</Badge>;
            default:
                return <Badge className='bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100'>Pending</Badge>;
        }
    };

    if (loading) {
        return (
            <div className='flex justify-center items-center min-h-screen'>
                <Loader2 className='w-12 h-12 text-blue-600 animate-spin' />
            </div>
        );
    }

    return (
        <div className='max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8'>
            <div className='mb-8'>
                <h1 className='text-3xl font-bold text-gray-900 flex items-center gap-2'>
                    <CreditCard className='w-8 h-8 text-blue-600' />
                    Payment History
                </h1>
                <p className='text-gray-600 mt-2'>View all your appointment payment transactions</p>
            </div>

            {payments.length === 0 ? (
                <Card>
                    <CardContent className='p-12 text-center'>
                        <CreditCard className='w-16 h-16 text-gray-400 mx-auto mb-4' />
                        <h3 className='text-lg font-semibold text-gray-900 mb-2'>No Payment History</h3>
                        <p className='text-gray-600'>You haven't made any payments yet.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className='space-y-4'>
                    {payments.map((payment) => (
                        <Card key={payment._id} className='border-gray-200 shadow-sm hover:shadow-md transition-shadow'>
                            <CardContent className='p-6'>
                                <div className='flex flex-col md:flex-row gap-6'>
                                    <div className='flex-shrink-0'>
                                        <img
                                            className='w-24 h-24 rounded-lg object-cover bg-blue-50'
                                            src={payment.docData?.image}
                                            alt={payment.docData?.name}
                                        />
                                    </div>

                                    <div className='flex-1 space-y-3'>
                                        <div className='flex items-start justify-between'>
                                            <div>
                                                <h3 className='text-xl font-semibold text-gray-900'>
                                                    Dr. {payment.docData?.name}
                                                </h3>
                                                <p className='text-gray-600 mt-1'>{payment.docData?.speciality}</p>
                                            </div>
                                            {getStatusBadge(payment.paymentStatus)}
                                        </div>

                                        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm'>
                                            <div>
                                                <p className='text-gray-600'>Payment ID</p>
                                                <p className='font-mono text-xs text-gray-900'>
                                                    {payment.razorpayPaymentId?.slice(0, 20)}...
                                                </p>
                                            </div>
                                            <div>
                                                <p className='text-gray-600'>Date</p>
                                                <p className='font-medium text-gray-900'>{formatDate(payment.date)}</p>
                                            </div>
                                            <div>
                                                <p className='text-gray-600'>Amount</p>
                                                <p className='font-semibold text-lg text-gray-900'>\u20B9{payment.amount}</p>
                                            </div>
                                        </div>

                                        <div className='flex items-center gap-2 text-sm text-gray-600'>
                                            <Calendar className='w-4 h-4' />
                                            <span>Appointment: {payment.slotDate} at {payment.slotTime}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PaymentHistory;
