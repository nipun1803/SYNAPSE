import { http, HttpResponse } from 'msw'

export const handlers = [
  // Mock Admin Login
  http.post('*/api/admin/login', () => {
    return HttpResponse.json({
      success: true,
      userType: 'admin',
      token: 'admin-mock-token'
    })
  }),

  // Mock Get Appointments for Admin
  http.get('*/api/admin/appointments', () => {
    return HttpResponse.json({
      success: true,
      appointments: [
        {
          _id: 'app-1',
          userData: { name: 'Patient X' },
          docData: { name: 'Dr. Y' },
          slotDate: '20_12_2026',
          slotTime: '10:00 AM',
          amount: 500,
          cancelled: false,
          payment: true
        }
      ]
    })
  })
]
