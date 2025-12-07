import { useState, useEffect, useContext } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import prescriptionService from '../api/prescriptionService';
import { AppContext } from '../context/AppContext';
import { FileText, Download, Calendar, User, Clock, CheckCircle, XCircle } from 'lucide-react';

const PrescriptionHistory = () => {
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPrescription, setSelectedPrescription] = useState(null);
    const { userData } = useContext(AppContext);
    const [searchParams] = useSearchParams();
    const appointmentId = searchParams.get('appointmentId');

    useEffect(() => {
        if (userData?._id) {
            fetchPrescriptionHistory();
        }
    }, [userData]);

    const fetchPrescriptionHistory = async () => {
        try {
            setLoading(true);
            const data = await prescriptionService.getPatientPrescriptionHistory(userData._id);
            if (data.success) {
                setPrescriptions(data.prescriptions);

                // Auto-select prescription if appointmentId is present
                if (appointmentId) {
                    const linkedPrescription = data.prescriptions.find(p => p.appointmentId?._id === appointmentId);
                    if (linkedPrescription) {
                        setSelectedPrescription(linkedPrescription._id);
                        // Scroll to the element
                        setTimeout(() => {
                            const element = document.getElementById(`prescription-${linkedPrescription._id}`);
                            if (element) {
                                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                element.classList.add('ring-2', 'ring-blue-500');
                                setTimeout(() => element.classList.remove('ring-2', 'ring-blue-500'), 2000);
                            }
                        }, 100);
                    }
                }
            }
        } catch (error) {
            toast.error(error.message || 'Failed to fetch prescription history');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            active: { color: 'bg-green-100 text-green-800', icon: <CheckCircle size={16} />, text: 'Active' },
            fulfilled: { color: 'bg-blue-100 text-blue-800', icon: <CheckCircle size={16} />, text: 'Fulfilled' },
            cancelled: { color: 'bg-red-100 text-red-800', icon: <XCircle size={16} />, text: 'Cancelled' }
        };

        const config = statusConfig[status] || statusConfig.active;
        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
                {config.icon}
                {config.text}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">My Prescriptions</h1>
                <p className="text-gray-600 dark:text-gray-400">View and download your prescription history</p>
            </div>

            {prescriptions.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
                    <FileText size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">No Prescriptions Found</h3>
                    <p className="text-gray-500 dark:text-gray-400">You don't have any prescriptions yet.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {prescriptions.map((prescription) => (
                        <div
                            key={prescription._id}
                            id={`prescription-${prescription._id}`}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-700"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">Prescription #{prescription.prescriptionNumber}</h3>
                                        {getStatusBadge(prescription.status)}
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400 mt-3">
                                        <div className="flex items-center gap-2">
                                            <User size={16} className="text-blue-600" />
                                            <span>Dr. {prescription.doctorId?.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar size={16} className="text-green-600" />
                                            <span>{formatDate(prescription.createdAt)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock size={16} className="text-orange-600" />
                                            <span>Valid till {formatDate(prescription.validUntil)}</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setSelectedPrescription(selectedPrescription?._id === prescription._id ? null : prescription._id)}
                                    className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                >
                                    <FileText size={18} />
                                    {selectedPrescription === prescription._id ? 'Hide Details' : 'View Details'}
                                </button>
                            </div>

                            {
                                selectedPrescription === prescription._id && (
                                    <div className="mt-6 pt-6 border-t">
                                        {/* Diagnosis */}
                                        <div className="mb-6">
                                            <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 text-lg">Diagnosis</h4>
                                            <p className="text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">{prescription.diagnosis}</p>
                                        </div>

                                        {/* Medications */}
                                        <div className="mb-6">
                                            <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 text-lg">Medications</h4>
                                            <div className="overflow-x-auto rounded-lg border border-gray-100 dark:border-gray-700">
                                                <table className="w-full">
                                                    <thead className="bg-gray-100 dark:bg-gray-700">
                                                        <tr>
                                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Drug Name</th>
                                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Dosage</th>
                                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Frequency</th>
                                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Duration</th>
                                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Instructions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                                                        {prescription.medications.map((med, index) => (
                                                            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                                <td className="px-4 py-3 text-gray-800 dark:text-gray-200 font-medium">{med.drugName}</td>
                                                                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{med.dosage}</td>
                                                                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{med.frequency}</td>
                                                                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{med.duration}</td>
                                                                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{med.instructions || '-'}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        {/* Notes */}
                                        {prescription.notes && (
                                            <div className="mb-6">
                                                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 text-lg">Additional Notes</h4>
                                                <p className="text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">{prescription.notes}</p>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex gap-3 mt-6">
                                            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                                <Download size={18} />
                                                Download PDF
                                            </button>
                                            <Link
                                                to={`/my-appointments`}
                                                className="flex items-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                            >
                                                View Appointments
                                            </Link>
                                        </div>
                                    </div>
                                )
                            }
                        </div >
                    ))}
                </div >
            )}
        </div >
    );
};

export default PrescriptionHistory;
