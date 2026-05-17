import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import App from '../App';
import AdminContextProvider from '../context/AdminContext';
import DoctorContextProvider from '../context/DoctorContext';
import AppContextProvider from '../context/AppContext';

describe('Admin App Component', () => {
  it('renders the layout correctly', () => {
    render(
      <BrowserRouter>
        <AdminContextProvider>
          <DoctorContextProvider>
            <AppContextProvider>
              <App />
            </AppContextProvider>
          </DoctorContextProvider>
        </AdminContextProvider>
      </BrowserRouter>
    );

    // Should render toast container and login page if not authenticated
    expect(document.querySelector('.Toastify')).toBeInTheDocument();
  });
});
