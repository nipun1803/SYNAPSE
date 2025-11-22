import { createContext, useState, useEffect, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AdminContext = createContext();

const AdminContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
  const UNIFIED_LOGIN_URL = import.meta.env.VITE_UNIFIED_LOGIN_URL || "http://localhost:5173/unified-login";

  const [aToken, setAToken] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [dashData, setDashData] = useState(false);

  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: backendUrl,
      withCredentials: true,
    });

    instance.interceptors.response.use(
      (res) => res,
      (error) => {
        const status = error?.response?.status;
        if (status === 401) {
          toast.error("Session expired. Please login again.");
          setAToken(null);
          localStorage.removeItem('aToken');
          localStorage.removeItem('userType');
          window.location.href = UNIFIED_LOGIN_URL;
        }
        return Promise.reject(error);
      }
    );

    return instance;
  }, [backendUrl, UNIFIED_LOGIN_URL]);

  const checkAuth = async () => {
    try {
      setCheckingAuth(true);
      const { data } = await api.get(`/api/admin/dashboard`);
      if (data?.success) {
        setAToken(true);
      } else {
        setAToken(null);
      }
    } catch (err) {
      if (window.location.pathname.startsWith('/admin')) {
        console.error('Admin auth check failed:', err);
      }
      setAToken(null);
    } finally {
      setCheckingAuth(false);
    }
  };

  useEffect(() => {
    if (window.location.pathname.startsWith('/admin') || window.location.pathname === '/') {
      checkAuth();
    } else {
      setCheckingAuth(false);
    }
  }, []);

  // Logout function
  const logoutAdmin = async () => {
    try {
      const { data } = await api.post('/api/auth/logout/admin');
      if (data?.success) {
        setAToken(null);
        localStorage.removeItem('aToken');
        localStorage.removeItem('userType');
        toast.success("Logged out successfully");
        window.location.href = UNIFIED_LOGIN_URL;
      }
    } catch (error) {
      console.error('Logout error:', error);
      setAToken(null);
      localStorage.removeItem('aToken');
      localStorage.removeItem('userType');
      window.location.href = UNIFIED_LOGIN_URL;
    }
  };

  // Get all doctors
  const getAllDoctors = async () => {
    try {
      const { data } = await api.get(`/api/admin/doctors`);
      if (data?.success) {
        setDoctors(data.doctors || []);
      } else {
        toast.error(data?.message || "Failed to load doctors");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Failed to load doctors");
    }
  };

  // Change doctor availability - FIXED: Send proper request
  const changeAvailability = async (docId) => {
    try {
      ('Changing availability for doctor:', docId);
      
      // Send BOTH in URL params AND body for maximum compatibility
      const { data } = await api.patch(
        `/api/admin/doctors/${docId}/availability`, 
        { docId: docId }  // Send docId in body
      );
      
      // console.log('Change availability response:', data);
      
      if (data?.success) {
        toast.success(data.message || "Availability Changed");
        getAllDoctors();
      } else {
        toast.error(data?.message || "Failed to change availability");
      }
    } catch (err) {
      console.error('Change availability error:', err);
      toast.error(err?.response?.data?.message || err.message || "Failed to change availability");
    }
  };

  // Get all appointments
  const getAllAppointments = async () => {
    try {
      const { data } = await api.get(`/api/admin/appointments`);
      if (data?.success) {
        setAppointments([...data.appointments].reverse());
      } else {
        toast.error(data?.message || "Failed to load appointments");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Failed to load appointments");
    }
  };

  // Cancel appointment
  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await api.patch(`/api/admin/appointments/${appointmentId}/cancel`, { appointmentId });
      if (data?.success) {
        toast.success(data.message || "Appointment Cancelled");
        getAllAppointments();
      } else {
        toast.error(data?.message || "Failed to cancel appointment");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Failed to cancel appointment");
    }
  };

  // Get dashboard data
  const getDashData = async () => {
    try {
      const { data } = await api.get(`/api/admin/dashboard`);
      if (data?.success) {
        setDashData(data.dashData);
      } else {
        toast.error(data?.message || "Failed to load dashboard data");
      }
    } catch (err) {
      console.error('Dashboard error:', err);
      toast.error(err?.response?.data?.message || err.message || "Failed to load dashboard");
    }
  };

  const value = {
    aToken,
    setAToken,
    checkingAuth,
    backendUrl,
    doctors,
    getAllDoctors,
    changeAvailability,
    appointments,
    setAppointments,
    getAllAppointments,
    cancelAppointment,
    dashData,
    getDashData,
    logoutAdmin,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export default AdminContextProvider;