import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { X, Plus, Save, Download } from 'lucide-react';
import { jsPDF } from "jspdf";

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

    const generatePDF = () => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.setTextColor(22, 163, 74); // Green color
        doc.text("SYNAPSE MEDICAL GROUP", 105, 20, { align: 'center' });

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("100 Health Valley Dr, Suite 200, San Francisco, CA 94107", 105, 28, { align: 'center' });

        doc.setLineWidth(0.5);
        doc.line(20, 35, 190, 35);

        // Doctor & Patient Info
        doc.setFontSize(12);
        doc.setTextColor(0);

        doc.text(`Dr. ${'Doctor'}`, 20, 50); // In real app, get from context
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 50);

        if (appointmentData?.userData) {
            doc.text(`Patient: ${appointmentData.userData.name}`, 20, 60);
            doc.text(`Age: ${25}`, 150, 60); // In real app, calculate age
        }

        // Diagnosis
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text("Diagnosis:", 20, 80);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.text(formData.diagnosis || 'N/A', 20, 90);

        // Rx
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text("Rx (Medications):", 20, 110);

        let yPos = 120;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');

        formData.medications.forEach((med, index) => {
            const text = `${index + 1}. ${med.drugName} - ${med.dosage}`;
            doc.text(text, 20, yPos);
            doc.text(`${med.frequency} for ${med.duration}`, 120, yPos);
            if (med.instructions) {
                yPos += 7;
                doc.setFontSize(9);
                doc.setTextColor(100);
                doc.text(`Note: ${med.instructions}`, 25, yPos);
                doc.setTextColor(0);
                doc.setFontSize(11);
            }
            yPos += 10;
        });

        // Notes
        if (formData.notes) {
            yPos += 10;
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text("Additional Notes:", 20, yPos);
            yPos += 8;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(11);
            doc.text(formData.notes, 20, yPos);
        }

        // Footer
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text("Digitally generated by Synapse Platform", 105, 280, { align: 'center' });

        doc.save(`Prescription_${appointmentId}.pdf`);
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

                navigate('/doctor-appointments');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create prescription');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500 dark:text-gray-400 transition-colors"
                        >
                            <X size={20} />
                        </button>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Create Prescription</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={generatePDF}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                        >
                            <Download size={16} />
                            Download PDF
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
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="bg-blue-50 dark:bg-blue-900/20 px-6 py-4 border-b border-blue-100 dark:border-blue-800">
                                <h2 className="font-semibold text-blue-900 dark:text-blue-100">Patient Details</h2>
                            </div>
                            <div className="p-6">
                                {appointmentData ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold text-xl">
                                                {appointmentData.userData?.name?.[0] || 'P'}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{appointmentData.userData?.name}</h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Patient ID: #{appointmentData.userData?._id?.slice(-6)}</p>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-gray-100 dark:border-gray-700 space-y-3">
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Appointment Date</p>
                                                <p className="text-gray-900 dark:text-gray-200 font-medium">{appointmentData.slotDate} at {appointmentData.slotTime}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Reason / Notes</p>
                                                <p className="text-gray-700 dark:text-gray-300 text-sm italic">"Regular checkup"</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="animate-pulse space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                                            <div className="space-y-2">
                                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Template Quick Fill */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Fill Template</h3>
                            <select
                                value={selectedTemplate}
                                onChange={handleTemplateSelect}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            >
                                <option value="">Select a template...</option>
                                {templates.map(template => (
                                    <option key={template._id} value={template._id}>{template.templateName}</option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                Selecting a template will overwrite current diagnosis and medications.
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Prescription Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Diagnosis Section */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
                                    Diagnosis
                                </h3>
                                <textarea
                                    value={formData.diagnosis}
                                    onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
                                    rows="3"
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all resize-none"
                                    placeholder="Enter clinical diagnosis..."
                                    required
                                />
                            </div>

                            {/* Medications Section */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700/50">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        <span className="w-1 h-6 bg-green-600 rounded-full"></span>
                                        Medications
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={addMedication}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 border border-green-600 text-green-700 dark:text-green-500 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 text-sm font-medium transition-colors"
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
                                                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                                                required
                                                            />
                                                            <input
                                                                type="text"
                                                                placeholder="Instructions..."
                                                                value={med.instructions}
                                                                onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                                                                className="w-full mt-2 px-3 py-1.5 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-xs focus:border-blue-500 outline-none text-gray-600 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500"
                                                            />
                                                        </td>
                                                        <td className="p-2 align-top">
                                                            <input
                                                                type="text"
                                                                placeholder="500mg"
                                                                value={med.dosage}
                                                                onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                                                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                                                required
                                                            />
                                                        </td>
                                                        <td className="p-2 align-top">
                                                            <input
                                                                type="text"
                                                                placeholder="BID"
                                                                value={med.frequency}
                                                                onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                                                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                                                required
                                                            />
                                                        </td>
                                                        <td className="p-2 align-top">
                                                            <input
                                                                type="text"
                                                                placeholder="7 days"
                                                                value={med.duration}
                                                                onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                                                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
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
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wide">Additional Notes</h3>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                        rows="4"
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                        placeholder="Dietary advice, follow-up instructions..."
                                    />
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wide">Validity</h3>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="number"
                                                value={formData.validityDays}
                                                onChange={(e) => setFormData(prev => ({ ...prev, validityDays: parseInt(e.target.value) || 30 }))}
                                                className="w-24 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium text-center text-gray-900 dark:text-white"
                                                min="1"
                                            />
                                            <span className="text-gray-600 dark:text-gray-400">Days</span>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                                        <div className="flex items-start gap-3">
                                            <input
                                                type="checkbox"
                                                checked={saveAsTemplate}
                                                onChange={(e) => setSaveAsTemplate(e.target.checked)}
                                                className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                                id="saveTemplate"
                                            />
                                            <div className="flex-1">
                                                <label htmlFor="saveTemplate" className="font-medium text-gray-900 dark:text-white block mb-1 cursor-pointer">Save as Template</label>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Save this prescription structure for future use.</p>

                                                {saveAsTemplate && (
                                                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                                                        <input
                                                            type="text"
                                                            placeholder="Template Name (e.g. Viral Fever)"
                                                            value={templateName}
                                                            onChange={(e) => setTemplateName(e.target.value)}
                                                            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                                        />
                                                        <input
                                                            type="text"
                                                            placeholder="Condition Tag"
                                                            value={templateCondition}
                                                            onChange={(e) => setTemplateCondition(e.target.value)}
                                                            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
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
