import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { FileText, Calendar, User, Clock, X } from 'lucide-react';
import { toast } from 'react-toastify';

const ViewPrescription = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const appointmentId = searchParams.get('appointmentId');

    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

    const [prescription, setPrescription] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (appointmentId) {
            fetchPrescription();
        }
    }, [appointmentId]);

    const fetchPrescription = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(
                `${backendUrl}/api/prescriptions/appointment/${appointmentId}`,
                { withCredentials: true }
            );
            if (data.success) {
                setPrescription(data.prescription);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch prescription');
            navigate(-1);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!prescription) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <FileText size={64} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Prescription Found</h3>
                    <p className="text-gray-500">This appointment doesn't have a prescription yet.</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold mb-2">Prescription</h1>
                            <p className="text-blue-100">#{prescription.prescriptionNumber}</p>
                        </div>
                        <button
                            onClick={() => navigate(-1)}
                            className="text-white hover:bg-blue-500 p-2 rounded-lg transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Patient & Date Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                            <User className="text-blue-600" size={20} />
                            <div>
                                <p className="text-xs text-gray-500">Patient</p>
                                <p className="font-semibold text-gray-800">{prescription.patientId?.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="text-green-600" size={20} />
                            <div>
                                <p className="text-xs text-gray-500">Issued On</p>
                                <p className="font-semibold text-gray-800">{formatDate(prescription.createdAt)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="text-orange-600" size={20} />
                            <div>
                                <p className="text-xs text-gray-500">Valid Until</p>
                                <p className="font-semibold text-gray-800">{formatDate(prescription.validUntil)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Diagnosis */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                            <FileText size={20} className="text-blue-600" />
                            Diagnosis
                        </h3>
                        <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-600">
                            <p className="text-gray-700">{prescription.diagnosis}</p>
                        </div>
                    </div>

                    {/* Medications */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Medications</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b-2">Drug Name</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b-2">Dosage</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b-2">Frequency</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b-2">Duration</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b-2">Instructions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {prescription.medications.map((med, index) => (
                                        <tr key={index} className="border-b hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium text-gray-800">{med.drugName}</td>
                                            <td className="px-4 py-3 text-gray-600">{med.dosage}</td>
                                            <td className="px-4 py-3 text-gray-600">{med.frequency}</td>
                                            <td className="px-4 py-3 text-gray-600">{med.duration}</td>
                                            <td className="px-4 py-3 text-gray-600">{med.instructions || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Notes */}
                    {prescription.notes && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Additional Notes</h3>
                            <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                                <p className="text-gray-700">{prescription.notes}</p>
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                            <p>Status: <span className={`font-semibold ${prescription.status === 'active' ? 'text-green-600' : 'text-gray-600'}`}>
                                {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
                            </span></p>
                        </div>
                        <button
                            onClick={() => navigate(-1)}
                            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewPrescription;
