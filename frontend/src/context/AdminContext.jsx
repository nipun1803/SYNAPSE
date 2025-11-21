import { createContext, useState, useEffect, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AdminContext = createContext();

const AdminContextProvider = ({ children }) => {
  const backendUrl = ""; // Use Vite proxy (empty = relative URLs)
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
          toast.error(error?.response?.data?.message || "Session expired. Please login again.");
          setAToken(null);
          window.location.href = UNIFIED_LOGIN_URL;
        }
        return Promise.reject(error);
      }
    );

    return instance;
  }, [backendUrl]);

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
      console.error('Auth check failed:', err);
      setAToken(null);
    } finally {
      setCheckingAuth(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const getAllDoctors = async () => {
    try {
      const { data } = await api.get(`/api/admin/all-doctors`);
      if (data?.success) setDoctors(data.doctors || []);
      else toast.error(data?.message || "Failed to load doctors");
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Failed to load doctors");
    }
  };

  const changeAvailability = async (docId) => {
    try {
      const { data } = await api.post(`/api/admin/change-availability`, { docId });
      if (data?.success) {
        toast.success(data.message || "Availability Changed");
        getAllDoctors();
      } else {
        toast.error(data?.message || "Failed to change availability");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Failed to change availability");
    }
  };

  const getAllAppointments = async () => {
    try {
      const { data } = await api.get(`/api/admin/appointments`);
      if (data?.success) setAppointments([...data.appointments].reverse());
      else toast.error(data?.message || "Failed to load appointments");
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Failed to load appointments");
    }
  };

  const cancelAppointment = async (id) => {
    try {
      const { data } = await api.post(`/api/admin/cancel-appointment`, { appointmentId: id });
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

  const getDashData = async () => {
    try {
      const { data } = await api.get(`/api/admin/dashboard`);
      if (data?.success) setDashData(data.dashData);
      else toast.error(data?.message || "Failed to load dashboard");
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Failed to load dashboard");
    }
  };

  const logoutAdmin = async () => {
    try {
      await api.post(`/api/admin/logout`);
      setAToken(null);
      window.location.href = UNIFIED_LOGIN_URL;
    } catch (err) {
      console.error('Logout error:', err);
      setAToken(null);
      window.location.href = UNIFIED_LOGIN_URL;
    }
  };

  return (
    <AdminContext.Provider
      value={{
        aToken,
        setAToken,
        checkingAuth,
        checkAuth,
        doctors,
        getAllDoctors,
        changeAvailability,
        appointments,
        getAllAppointments,
        cancelAppointment,
        dashData,
        getDashData,
        logoutAdmin,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export default AdminContextProvider;