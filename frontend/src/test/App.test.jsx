import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import App from '../App';
import { AppContext } from '../context/AppContext';

// Mock context data
const mockContext = {
  token: null,
  userData: null,
  doctors: [],
  currencySymbol: '$',
  getDoctorsData: vi.fn(),
  loadUserProfileData: vi.fn(),
};

describe('App Component', () => {
  it('renders the navigation and footer', () => {
    render(
      <BrowserRouter>
        <AppContext.Provider value={mockContext}>
          <App />
        </AppContext.Provider>
      </BrowserRouter>
    );

    // Basic layout checks
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });
});
