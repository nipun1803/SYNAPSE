import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Doctors from '../pages/Doctors'
import { AppContext } from '../context/AppContext'
import { MemoryRouter } from 'react-router-dom'

// Mock context provider
const mockContextValue = {
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
  ],
  getDoctorsData: () => {},
  currencySymbol: '$'
}

describe('Doctors List Component with MSW', () => {
  it('renders the mocked doctor from MSW context', async () => {
    render(
      <MemoryRouter>
        <AppContext.Provider value={mockContextValue}>
          <Doctors />
        </AppContext.Provider>
      </MemoryRouter>
    )

    // Check if the mocked doctor name is visible
    expect(screen.getByText('Dr. MSW Mock')).toBeInTheDocument()
    expect(screen.getByText('General physician')).toBeInTheDocument()
  })
})
