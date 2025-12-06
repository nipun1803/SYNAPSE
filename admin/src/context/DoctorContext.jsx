import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import api, { doctorService } from "../api/doctorService";

export const DoctorContext = createContext();

const DoctorContextProvider = ({ children }) => {
  const UNIFIED_LOGIN_URL = import.meta.env.VITE_UNIFIED_LOGIN_URL || "http://localhost:5173/unified-login";

  const [dToken, setDToken] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [dashData, setDashData] = useState(false);
  const [profileData, setProfileData] = useState(null);

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
      const { data } = await doctorService.checkAuth();
      if (data.success) {
        setDToken(true);
        setProfileData(data.profileData);
      } else {
        setDToken(null);
      }
    } catch (err) {
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
      const { data } = await doctorService.logout();
      if (data?.success) {
        setDToken(null);
        localStorage.removeItem('dToken');
        localStorage.removeItem('userType');
        toast.success("Logged out successfully");
        window.location.href = UNIFIED_LOGIN_URL;
      }
    } catch (error) {
      toast.error('Logout failed');
      setDToken(null);
      localStorage.removeItem('dToken');
      localStorage.removeItem('userType');
      window.location.href = UNIFIED_LOGIN_URL;
    }
  };


  const getAppointments = async (page = 1, limit = 5, filter = 'all', search = '') => {
    try {
      const params = {
        page,
        limit,
        ...(filter !== 'all' && { status: filter }),
        ...(search && { search })
      };

      const { data } = await doctorService.getAppointments(params);
      if (data.success) {
        setAppointments([...data.appointments].reverse());
        return data.pagination;
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
    }
  };


  const getProfileData = async () => {
    try {
      const { data } = await doctorService.getProfile();
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
      const { data } = await doctorService.cancelAppointment(appointmentId);
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
      const { data } = await doctorService.completeAppointment(appointmentId);
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
      const { data } = await doctorService.getDashboard();
      if (data.success) {
        setDashData(data.dashData);
      } else {
        setDashData(false);
      }
    } catch (err) {
      toast.error('Failed to fetch data');
      setDashData(false);
    }
  };

  const value = {
    dToken,
    setDToken,
    checkingAuth,
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