
const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

/**
 * Helper function for making API requests with error handling
 * @param {string} url
 * @param {object} options
 */
async function fetchAPI(url, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };

    const res = await fetch(url, {
        credentials: 'include',
        headers,
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


export const authService = {
    login: (payload) => fetchAPI(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        body: JSON.stringify(payload)
    }),

    // POST /api/auth/register
    register: (payload) => fetchAPI(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        body: JSON.stringify(payload)
    }),

    // POST /api/auth/logout/user
    logoutUser: () => fetchAPI(`${BASE_URL}/api/auth/logout/user`, {
        method: 'POST'
    })
};



export const userService = {
    // GET /api/users/profile
    getProfile: () => fetchAPI(`${BASE_URL}/api/users/profile`),

    // PUT /api/users/profile (with file upload)
    updateProfile: (formData) => fetch(`${BASE_URL}/api/users/profile`, {
        method: 'PUT',
        credentials: 'include',
        body: formData
    }).then(r => r.json()),

    // GET /api/users/appointments?page=1&limit=5
    getAppointments: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString
            ? `${BASE_URL}/api/users/appointments?${queryString}`
            : `${BASE_URL}/api/users/appointments`;
        return fetchAPI(url);
    },

    // POST /api/users/appointments
    bookAppointment: (payload) => fetchAPI(`${BASE_URL}/api/users/appointments`, {
        method: 'POST',
        body: JSON.stringify(payload)
    }),

    // PATCH /api/users/appointments/:id/cancel
    cancelAppointment: (id) => fetchAPI(`${BASE_URL}/api/users/appointments/${id}/cancel`, {
        method: 'PATCH'
    }),

    // PATCH /api/users/appointments/:id/reschedule
    rescheduleAppointment: (id, payload) => fetchAPI(`${BASE_URL}/api/users/appointments/${id}/reschedule`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
    }),

    // DELETE /api/users/profile
    deleteAccount: () => fetchAPI(`${BASE_URL}/api/users/profile`, {
        method: 'DELETE'
    }),

    // DELETE /api/users/appointments/:id
    deleteAppointment: (id) => fetchAPI(`${BASE_URL}/api/users/appointments/${id}`, {
        method: 'DELETE'
    })
};




export const doctorService = {
    // GET /api/doctors
    getList: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString
            ? `${BASE_URL}/api/doctors?${queryString}`
            : `${BASE_URL}/api/doctors`;
        return fetchAPI(url);
    },

    // GET /api/doctors/:id
    getById: (id) => fetchAPI(`${BASE_URL}/api/doctors/${id}`),

    // GET /api/doctors/:id/available
    getAvailability: (id) => fetchAPI(`${BASE_URL}/api/doctors/${id}/available`),

    // GET /api/doctors/me/profile
    getProfile: () => fetchAPI(`${BASE_URL}/api/doctors/me/profile`),

    // PUT /api/doctors/me/profile (with file upload)
    updateProfile: (formData) => fetch(`${BASE_URL}/api/doctors/me/profile`, {
        method: 'PUT',
        credentials: 'include',
        body: formData
    }).then(r => r.json()),

    // GET /api/doctors/me/appointments
    getAppointments: () => fetchAPI(`${BASE_URL}/api/doctors/me/appointments`),

    // GET /api/doctors/me/dashboard
    getDashboard: () => fetchAPI(`${BASE_URL}/api/doctors/me/dashboard`),

    // PATCH /api/doctors/me/availability
    updateAvailability: (payload) => fetchAPI(`${BASE_URL}/api/doctors/me/availability`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
    }),

    // PATCH /api/doctors/me/appointments/:id/complete
    completeAppointment: (id) => fetchAPI(`${BASE_URL}/api/doctors/me/appointments/${id}/complete`, {
        method: 'PATCH'
    })
};




export const adminService = {
    // GET /api/admin/dashboard
    getDashboard: () => fetchAPI(`${BASE_URL}/api/admin/dashboard`),

    // GET /api/admin/appointments
    getAppointments: () => fetchAPI(`${BASE_URL}/api/admin/appointments`),

    // GET /api/admin/doctors
    getDoctors: () => fetchAPI(`${BASE_URL}/api/admin/doctors`),

    // POST /api/admin/doctors (with file upload)
    addDoctor: (formData) => fetch(`${BASE_URL}/api/admin/doctors`, {
        method: 'POST',
        credentials: 'include',
        body: formData
    }).then(r => r.json()),

    // PATCH /api/admin/appointments/:id/cancel
    cancelAppointment: (id) => fetchAPI(`${BASE_URL}/api/admin/appointments/${id}/cancel`, {
        method: 'PATCH'
    })
};



export default {
    auth: authService,
    user: userService,
    doctor: doctorService,
    admin: adminService
};
