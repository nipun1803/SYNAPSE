import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { X, Plus, Save } from 'lucide-react';

const CreatePrescription = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const appointmentId = searchParams.get('appointmentId');
    const patientId = searchParams.get('patientId');

    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

    const [appointmentData, setAppointmentData] = useState(null);
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState('');

    const [formData, setFormData] = useState({
        diagnosis: '',
        notes: '',
        validityDays: 30,
        medications: [{ drugName: '', dosage: '', frequency: '', duration: '', instructions: '' }]
    });

    const [saving, setSaving] = useState(false);
    const [saveAsTemplate, setSaveAsTemplate] = useState(false);
    const [templateName, setTemplateName] = useState('');
    const [templateCondition, setTemplateCondition] = useState('');

    useEffect(() => {
        if (appointmentId) {
            fetchAppointmentDetails();
        }
        fetchTemplates();
    }, [appointmentId]);

    const fetchAppointmentDetails = async () => {
        try {
            const { data } = await axios.get(
                `${backendUrl}/api/doctors/me/appointments`,
                { withCredentials: true }
            );
            const appointment = data.appointments?.find(apt => apt._id === appointmentId);
            if (appointment) {
                setAppointmentData(appointment);
            }
        } catch (error) {
            console.error('Error fetching appointment:', error);
        }
    };

    const fetchTemplates = async () => {
        try {
            const { data } = await axios.get(
                `${backendUrl}/api/prescriptions/templates`,
                { withCredentials: true }
            );
            if (data.success) {
                setTemplates(data.templates);
            }
        } catch (error) {
            console.error('Error fetching templates:', error);
        }
    };

    const handleTemplateSelect = (e) => {
        const templateId = e.target.value;
        setSelectedTemplate(templateId);

        if (templateId) {
            const template = templates.find(t => t._id === templateId);
            if (template) {
                setFormData(prev => ({
                    ...prev,
                    diagnosis: template.condition,
                    medications: [...template.medications]
                }));
            }
        }
    };

    const addMedication = () => {
        setFormData(prev => ({
            ...prev,
            medications: [...prev.medications, { drugName: '', dosage: '', frequency: '', duration: '', instructions: '' }]
        }));
    };

    const removeMedication = (index) => {
        setFormData(prev => ({
            ...prev,
            medications: prev.medications.filter((_, i) => i !== index)
        }));
    };

    const updateMedication = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            medications: prev.medications.map((med, i) =>
                i === index ? { ...med, [field]: value } : med
            )
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.diagnosis || formData.medications.some(m => !m.drugName || !m.dosage || !m.frequency || !m.duration)) {
            toast.error('Please fill all required fields');
            return;
        }

        try {
            setSaving(true);

            // Create prescription
            const prescriptionData = {
                appointmentId,
                patientId,
                ...formData
            };

            const { data } = await axios.post(
                `${backendUrl}/api/prescriptions/create`,
                prescriptionData,
                { withCredentials: true }
            );

            if (data.success) {
                toast.success('Prescription created successfully');

                // Save as template if requested
                if (saveAsTemplate && templateName && templateCondition) {
                    try {
                        await axios.post(
                            `${backendUrl}/api/prescriptions/templates`,
                            {
                                templateName,
                                condition: templateCondition,
                                medications: formData.medications,
                                isPublic: false
                            },
                            { withCredentials: true }
                        );
                        toast.success('Also saved as template');
                    } catch (err) {
                        console.error('Error saving template:', err);
                    }
                }

                navigate('/doctor/appointments');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create prescription');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                        >
                            <X size={20} />
                        </button>
                        <h1 className="text-xl font-bold text-gray-900">Create Prescription</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={saving}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 shadow-sm"
                        >
                            <Save size={16} />
                            {saving ? 'Saving...' : 'Save Prescription'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Patient Context */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Patient Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
                                <h2 className="font-semibold text-blue-900">Patient Details</h2>
                            </div>
                            <div className="p-6">
                                {appointmentData ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                                                {appointmentData.userData?.name?.[0] || 'P'}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900">{appointmentData.userData?.name}</h3>
                                                <p className="text-sm text-gray-500">Patient ID: #{appointmentData.userData?._id?.slice(-6)}</p>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-gray-100 space-y-3">
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 uppercase">Appointment Date</p>
                                                <p className="text-gray-900 font-medium">{appointmentData.slotDate} at {appointmentData.slotTime}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 uppercase">Reason / Notes</p>
                                                <p className="text-gray-700 text-sm italic">"Regular checkup"</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="animate-pulse space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                                            <div className="space-y-2">
                                                <div className="h-4 bg-gray-200 rounded w-32"></div>
                                                <div className="h-3 bg-gray-200 rounded w-20"></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Template Quick Fill */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Quick Fill Template</h3>
                            <select
                                value={selectedTemplate}
                                onChange={handleTemplateSelect}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            >
                                <option value="">Select a template...</option>
                                {templates.map(template => (
                                    <option key={template._id} value={template._id}>{template.templateName}</option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-2">
                                Selecting a template will overwrite current diagnosis and medications.
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Prescription Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Diagnosis Section */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
                                    Diagnosis
                                </h3>
                                <textarea
                                    value={formData.diagnosis}
                                    onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
                                    rows="3"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                                    placeholder="Enter clinical diagnosis..."
                                    required
                                />
                            </div>

                            {/* Medications Section */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <span className="w-1 h-6 bg-green-600 rounded-full"></span>
                                        Medications
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={addMedication}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-green-600 text-green-700 rounded-lg hover:bg-green-50 text-sm font-medium transition-colors"
                                    >
                                        <Plus size={16} /> Add Drug
                                    </button>
                                </div>

                                <div className="p-6">
                                    <div className="overflow-x-auto">
                                        <table className="w-full min-w-[600px]">
                                            <thead>
                                                <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                    <th className="pb-3 pl-2 w-[30%]">Drug Name</th>
                                                    <th className="pb-3 w-[20%]">Dosage</th>
                                                    <th className="pb-3 w-[20%]">Frequency</th>
                                                    <th className="pb-3 w-[20%]">Duration</th>
                                                    <th className="pb-3 w-[10%]"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="space-y-3">
                                                {formData.medications.map((med, index) => (
                                                    <tr key={index} className="group">
                                                        <td className="p-2 align-top">
                                                            <input
                                                                type="text"
                                                                placeholder="e.g. Amoxicillin"
                                                                value={med.drugName}
                                                                onChange={(e) => updateMedication(index, 'drugName', e.target.value)}
                                                                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                                                required
                                                            />
                                                            <input
                                                                type="text"
                                                                placeholder="Instructions..."
                                                                value={med.instructions}
                                                                onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                                                                className="w-full mt-2 px-3 py-1.5 bg-white border-b border-gray-200 text-xs focus:border-blue-500 outline-none text-gray-600 placeholder-gray-400"
                                                            />
                                                        </td>
                                                        <td className="p-2 align-top">
                                                            <input
                                                                type="text"
                                                                placeholder="500mg"
                                                                value={med.dosage}
                                                                onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                                                                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                                                required
                                                            />
                                                        </td>
                                                        <td className="p-2 align-top">
                                                            <input
                                                                type="text"
                                                                placeholder="BID"
                                                                value={med.frequency}
                                                                onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                                                                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                                                required
                                                            />
                                                        </td>
                                                        <td className="p-2 align-top">
                                                            <input
                                                                type="text"
                                                                placeholder="7 days"
                                                                value={med.duration}
                                                                onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                                                                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                                                required
                                                            />
                                                        </td>
                                                        <td className="p-2 align-top text-center">
                                                            {formData.medications.length > 1 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeMedication(index)}
                                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                                    title="Remove"
                                                                >
                                                                    <X size={18} />
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Additional Notes</h3>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                        rows="4"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
                                        placeholder="Dietary advice, follow-up instructions..."
                                    />
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                        <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Validity</h3>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="number"
                                                value={formData.validityDays}
                                                onChange={(e) => setFormData(prev => ({ ...prev, validityDays: parseInt(e.target.value) || 30 }))}
                                                className="w-24 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium text-center"
                                                min="1"
                                            />
                                            <span className="text-gray-600">Days</span>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
                                        <div className="flex items-start gap-3">
                                            <input
                                                type="checkbox"
                                                checked={saveAsTemplate}
                                                onChange={(e) => setSaveAsTemplate(e.target.checked)}
                                                className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                                id="saveTemplate"
                                            />
                                            <div className="flex-1">
                                                <label htmlFor="saveTemplate" className="font-medium text-gray-900 block mb-1 cursor-pointer">Save as Template</label>
                                                <p className="text-xs text-gray-500 mb-3">Save this prescription structure for future use.</p>

                                                {saveAsTemplate && (
                                                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                                                        <input
                                                            type="text"
                                                            placeholder="Template Name (e.g. Viral Fever)"
                                                            value={templateName}
                                                            onChange={(e) => setTemplateName(e.target.value)}
                                                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                        />
                                                        <input
                                                            type="text"
                                                            placeholder="Condition Tag"
                                                            value={templateCondition}
                                                            onChange={(e) => setTemplateCondition(e.target.value)}
                                                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreatePrescription;
