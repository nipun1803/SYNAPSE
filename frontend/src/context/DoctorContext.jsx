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
  });

  api.interceptors.response.use(
    (res) => res,
    (error) => {
      if (error?.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        setDToken(null);
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
      console.error('Doctor auth check failed:', err);
      setDToken(null);
    } finally {
      setCheckingAuth(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const getAppointments = async () => {
    try {
      const { data } = await api.get(`/api/doctors/me/appointments`);
      if (data.success) setAppointments([...data.appointments].reverse());
      else toast.error(data.message);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const getProfileData = async () => {
    try {
      const { data } = await api.get(`/api/doctors/me/profile`);
      if (data.success) setProfileData(data.profileData);
      else toast.error(data.message);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const cancelAppointment = async (id) => {
    try {
      const { data } = await api.patch(`/api/doctors/me/appointments/${id}/cancel`);
      if (data.success) {
        toast.success(data.message);
        getAppointments();
        getDashData();
      } else toast.error(data.message);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const completeAppointment = async (id) => {
    try {
      const { data } = await api.patch(`/api/doctors/me/appointments/${id}/complete`);
      if (data.success) {
        toast.success(data.message);
        getAppointments();
        getDashData();
      } else toast.error(data.message);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const getDashData = async () => {
    try {
      const { data } = await api.get(`/api/doctors/me/dashboard`);
      if (data.success) setDashData(data.dashData);
      else toast.error(data.message);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const logoutDoctor = async () => {
    try {
      await api.post(`/api/auth/logout/doctor`);
      setDToken(null);
      window.location.href = UNIFIED_LOGIN_URL;
    } catch (err) {
      console.error('Logout error:', err);
      setDToken(null);
      window.location.href = UNIFIED_LOGIN_URL;
    }
  };

  return (
    <DoctorContext.Provider value={{
      dToken,
      setDToken,
      checkingAuth,
      checkAuth,
      appointments,
      getAppointments,
      dashData,
      getDashData,
      profileData,
      setProfileData,
      getProfileData,
      cancelAppointment,
      completeAppointment,
      logoutDoctor,
    }}>
      {children}
    </DoctorContext.Provider>
  );
};

export default DoctorContextProvider;