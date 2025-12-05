import axios from 'axios';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

const api = axios.create({
    baseURL: backendUrl,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const doctorService = {
    // Auth
    checkAuth: () => api.get('/api/doctors/me/profile'),
    logout: () => api.post('/api/auth/logout/doctor'),

    // Appointments
    getAppointments: (params) => {
        const queryParams = new URLSearchParams(params);
        return api.get(`/api/doctors/me/appointments?${queryParams}`);
    },
    cancelAppointment: (appointmentId) =>
        api.patch(`/api/doctors/me/appointments/${appointmentId}/cancel`, { appointmentId }),
    completeAppointment: (appointmentId) =>
        api.patch(`/api/doctors/me/appointments/${appointmentId}/complete`, { appointmentId }),

    // Dashboard & Profile
    getDashboard: () => api.get('/api/doctors/me/dashboard'),
    getProfile: () => api.get('/api/doctors/me/profile'),
};

export default api;
