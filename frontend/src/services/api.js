import API from '../api/endpoints';


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


export const authService = {
  login: (payload) => fetchAPI(API.AUTH.LOGIN, {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  register: (payload) => fetchAPI(API.AUTH.REGISTER, {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  logoutUser: () => fetchAPI(API.AUTH.LOGOUT_USER, { method: 'POST' })
};


export const userService = {
  getProfile: () => fetchAPI(API.USERS.PROFILE),
  updateProfile: (formData) => fetch(API.USERS.PROFILE, {
    method: 'PUT',
    credentials: 'include',
    body: formData
  }).then(r => r.json()),
  getAppointments: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${API.USERS.APPOINTMENTS}?${queryString}` : API.USERS.APPOINTMENTS;
    return fetchAPI(url);
  },
  bookAppointment: (payload) => fetchAPI(API.USERS.APPOINTMENTS, {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  cancelAppointment: (id) => fetchAPI(API.USERS.CANCEL_APPOINTMENT(id), { method: 'PATCH' })
};


export const doctorService = {
  getList: () => fetchAPI(API.DOCTORS.LIST),
  getById: (id) => fetchAPI(API.DOCTORS.BY_ID(id)),
  getAvailability: (id) => fetchAPI(API.DOCTORS.AVAILABILITY(id)),
  getProfile: () => fetchAPI(API.DOCTORS.ME_PROFILE),
  updateProfile: (formData) => fetch(API.DOCTORS.ME_PROFILE, {
    method: 'PUT',
    credentials: 'include',
    body: formData
  }).then(r => r.json()),
  getAppointments: () => fetchAPI(API.DOCTORS.ME_APPOINTMENTS),
  getDashboard: () => fetchAPI(API.DOCTORS.ME_DASHBOARD),
  updateAvailability: (payload) => fetchAPI(API.DOCTORS.ME_AVAILABILITY, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  }),
  completeAppointment: (id) => fetchAPI(API.DOCTORS.COMPLETE_APPOINTMENT(id), { method: 'PATCH' })
};


export const adminService = {
  getDashboard: () => fetchAPI(API.ADMIN.DASHBOARD),
  getAppointments: () => fetchAPI(API.ADMIN.APPOINTMENTS),
  getDoctors: () => fetchAPI(API.ADMIN.DOCTORS),
  addDoctor: (formData) => fetch(API.ADMIN.ADD_DOCTOR, {
    method: 'POST',
    credentials: 'include',
    body: formData
  }).then(r => r.json()),
  cancelAppointment: (id) => fetchAPI(API.ADMIN.CANCEL_APPOINTMENT(id), { method: 'PATCH' })
};

export default {
  auth: authService,
  user: userService,
  doctor: doctorService,
  admin: adminService
};