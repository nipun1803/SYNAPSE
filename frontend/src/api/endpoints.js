const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

export const API = {
  AUTH: {
    LOGIN: `${BASE_URL}/api/auth/login`,
    REGISTER: `${BASE_URL}/api/auth/register`,
    LOGOUT_USER: `${BASE_URL}/api/auth/logout/user`,
    LOGOUT_DOCTOR: `${BASE_URL}/api/auth/logout/doctor`,
    LOGOUT_ADMIN: `${BASE_URL}/api/auth/logout/admin`
  },

  USERS: {
    PROFILE: `${BASE_URL}/api/users/profile`,
    APPOINTMENTS: `${BASE_URL}/api/users/appointments`,
    CANCEL_APPOINTMENT: (id) => `${BASE_URL}/api/users/appointments/${id}/cancel`
  },

  DOCTORS: {
    LIST: `${BASE_URL}/api/doctors`,
    BY_ID: (id) => `${BASE_URL}/api/doctors/${id}`,
    ME_PROFILE: `${BASE_URL}/api/doctors/me/profile`,
    ME_APPOINTMENTS: `${BASE_URL}/api/doctors/me/appointments`,
    ME_DASHBOARD: `${BASE_URL}/api/doctors/me/dashboard`,
    ME_AVAILABILITY: `${BASE_URL}/api/doctors/me/availability`,
    COMPLETE_APPOINTMENT: (id) => `${BASE_URL}/api/doctors/me/appointments/${id}/complete`,
    CANCEL_APPOINTMENT: (id) => `${BASE_URL}/api/doctors/me/appointments/${id}/cancel`
  },

  APPOINTMENTS: {
    CREATE: `${BASE_URL}/api/appointments`,
    LIST: `${BASE_URL}/api/appointments`,
    CANCEL: (id) => `${BASE_URL}/api/appointments/${id}/cancel`,
    COMPLETE: (id) => `${BASE_URL}/api/appointments/${id}/complete`
  },

  ADMIN: {
    DASHBOARD: `${BASE_URL}/api/admin/dashboard`,
    APPOINTMENTS: `${BASE_URL}/api/admin/appointments`,
    DOCTORS: `${BASE_URL}/api/admin/doctors`,
    ADD_DOCTOR: `${BASE_URL}/api/admin/doctors`,
    CANCEL_APPOINTMENT: (id) => `${BASE_URL}/api/admin/appointments/${id}/cancel`,
    DOCTOR_AVAILABILITY: (id) => `${BASE_URL}/api/admin/doctors/${id}/availability`
  },

  LEGACY: {
    BOOK_APPOINTMENT: `${BASE_URL}/api/user/book-appointment`,
    CANCEL_APPOINTMENT: `${BASE_URL}/api/user/cancel-appointment`,
    USER_APPOINTMENTS: `${BASE_URL}/api/user/appointments`
  }
};

export default API;