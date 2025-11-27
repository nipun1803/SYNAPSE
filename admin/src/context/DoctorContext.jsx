import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

export const DoctorContext = createContext();

const DoctorContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
  const UNIFIED_LOGIN_URL = import.meta.env.VITE_UNIFIED_LOGIN_URL || "http://localhost:5173/unified-login";

  const [dToken, setDToken] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [dashData, setDashData] = useState(false);
  const [profileData, setProfileData] = useState(null);

  const api = axios.create({
    baseURL: backendUrl,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  api.interceptors.response.use(
    (res) => res,
    (error) => {
      if (error?.response?.status === 401 && window.location.pathname.startsWith('/doctor')) {
        toast.error("Session expired. Please login again.");
        setDToken(null);
        localStorage.removeItem('dToken');
        localStorage.removeItem('userType');
        window.location.href = UNIFIED_LOGIN_URL;
      }
      return Promise.reject(error);
    }
  );

  const checkAuth = async () => {
    try {
      setCheckingAuth(true);
      const { data } = await api.get(`/api/doctors/me/profile`);
      if (data.success) {
        setDToken(true);
        setProfileData(data.profileData);
      } else {
        setDToken(null);
      }
    } catch (err) {
      if (window.location.pathname.startsWith('/doctor')) {
        console.error('Doctor auth check failed:', err);
      }
      setDToken(null);
    } finally {
      setCheckingAuth(false);
    }
  };

  useEffect(() => {
    if (window.location.pathname.startsWith('/doctor') || window.location.pathname === '/') {
      checkAuth();
    } else {
      setCheckingAuth(false);
    }
  }, []);


  const logoutDoctor = async () => {
    try {
      const { data } = await api.post('/api/auth/logout/doctor');
      if (data?.success) {
        setDToken(null);
        localStorage.removeItem('dToken');
        localStorage.removeItem('userType');
        toast.success("Logged out successfully");
        window.location.href = UNIFIED_LOGIN_URL;
      }
    } catch (error) {
      console.error('Logout error:', error);
      setDToken(null);
      localStorage.removeItem('dToken');
      localStorage.removeItem('userType');
      window.location.href = UNIFIED_LOGIN_URL;
    }
  };


  const getAppointments = async (page = 1, limit = 5) => {
    try {
      const { data } = await api.get(`/api/doctors/me/appointments?page=${page}&limit=${limit}`);
      if (data.success) {
        setAppointments([...data.appointments].reverse());
        return data.pagination; // Return pagination info
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
    }
  };


  const getProfileData = async () => {
    try {
      const { data } = await api.get(`/api/doctors/me/profile`);
      if (data.success) {
        setProfileData(data.profileData);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await api.patch(`/api/doctors/me/appointments/${appointmentId}/cancel`, { appointmentId });
      if (data.success) {
        toast.success(data.message);
        getAppointments();
        getDashData();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
    }
  };


  const completeAppointment = async (appointmentId) => {
    try {
      const { data } = await api.patch(`/api/doctors/me/appointments/${appointmentId}/complete`, { appointmentId });
      if (data.success) {
        toast.success(data.message);
        getAppointments();
        getDashData();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
    }
  };


  const getDashData = async () => {
    try {
      const { data } = await api.get(`/api/doctors/me/dashboard`);
      if (data.success) {
        setDashData(data.dashData);
      } else {
        setDashData(false);
      }
    } catch (err) {
      console.error(err);
      setDashData(false);
    }
  };

  const value = {
    dToken,
    setDToken,
    checkingAuth,
    backendUrl,
    appointments,
    setAppointments,
    getAppointments,
    cancelAppointment,
    completeAppointment,
    dashData,
    setDashData,
    getDashData,
    profileData,
    setProfileData,
    getProfileData,
    logoutDoctor,
  };

  return <DoctorContext.Provider value={value}>{children}</DoctorContext.Provider>;
};

export default DoctorContextProvider;