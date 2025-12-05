const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

/**
 * Helper function for making API requests with error handling
 */
async function fetchAPI(url, options = {}) {
    const res = await fetch(url, {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        },
        ...options
    });

    let data = null;
    try {
        data = await res.json();
    } catch (e) {
        data = null;
    }

    if (!res.ok) {
        const msg = (data && data.message) || res.statusText || 'Request failed';
        const error = new Error(msg);
        error.status = res.status;
        error.data = data;
        throw error;
    }

    return data;
}

export const prescriptionService = {
    // Doctor endpoints
    createPrescription: (data) => fetchAPI(`${BASE_URL}/api/prescriptions/create`, {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    updatePrescription: (id, data) => fetchAPI(`${BASE_URL}/api/prescriptions/${id}/update`, {
        method: 'PATCH',
        body: JSON.stringify(data)
    }),

    cancelPrescription: (id) => fetchAPI(`${BASE_URL}/api/prescriptions/${id}/cancel`, {
        method: 'DELETE'
    }),

    // Template endpoints
    getTemplates: () => fetchAPI(`${BASE_URL}/api/prescriptions/templates`),

    createTemplate: (data) => fetchAPI(`${BASE_URL}/api/prescriptions/templates`, {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    deleteTemplate: (id) => fetchAPI(`${BASE_URL}/api/prescriptions/templates/${id}`, {
        method: 'DELETE'
    }),

    // Shared endpoints
    getPrescriptionById: (id) => fetchAPI(`${BASE_URL}/api/prescriptions/${id}`),

    getPrescriptionByAppointment: (appointmentId) =>
        fetchAPI(`${BASE_URL}/api/prescriptions/appointment/${appointmentId}`),

    // Patient endpoints
    getPatientPrescriptionHistory: (patientId) =>
        fetchAPI(`${BASE_URL}/api/prescriptions/patient/${patientId}`),

    // PDF generation (to be implemented)
    downloadPrescriptionPDF: (id) =>
        fetchAPI(`${BASE_URL}/api/prescriptions/${id}/pdf`, { responseType: 'blob' }),
};

export default prescriptionService;
