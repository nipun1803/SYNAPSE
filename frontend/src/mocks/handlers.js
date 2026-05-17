import { http, HttpResponse } from 'msw'

export const handlers = [
  // Mock login endpoint
  http.post('*/api/user/login', () => {
    return HttpResponse.json({
      success: true,
      userType: 'user',
      token: 'mock-token'
    })
  }),

  // Mock get doctors list
  http.get('*/api/doctor/list', () => {
    return HttpResponse.json({
      success: true,
      doctors: [
        {
          _id: '1',
          name: 'Dr. MSW Mock',
          speciality: 'General physician',
          degree: 'MBBS',
          experience: '4 Years',
          about: 'MSW Mocked Doctor',
          fees: 50,
          image: 'mock-img-url',
          available: true
        }
      ]
    })
  })
]
