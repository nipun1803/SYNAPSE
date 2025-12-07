import axios from "axios";
import { createContext, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

export const AdminContext = createContext();

const AdminContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
  const UNIFIED_LOGIN_URL = import.meta.env.VITE_UNIFIED_LOGIN_URL || "http://localhost:5173/unified-login";

  const [aToken, setAToken] = useState(localStorage.getItem('aToken') || null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [dashData, setDashData] = useState(false);

  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: backendUrl,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Interceptor to handle session expiry automatically
    // This is a bit complex but ensures we don't get stuck with invalid tokens
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
        // If API succeeds, it means cookie token is valid.
        // We set aToken to true so the app knows we are logged in.
        if (!aToken) {
          setAToken(true);
        }
      } else {
        setAToken(null);
        localStorage.removeItem('aToken');
      }
    } catch (err) {
      // If 401, interceptor handles it. For other errors, maybe don't kill session immediately?
      // But if dashboard fails, safe to assume auth issue or server down.
      // console.error(err); 
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
      toast.error('Logout failed');
      setAToken(null);
      localStorage.removeItem('aToken');
      localStorage.removeItem('userType');
      window.location.href = UNIFIED_LOGIN_URL;
    }
  };


  const getAllDoctors = async () => {
    // Using promise chain here for variety
    api.get(`/api/admin/doctors`)
      .then(({ data }) => {
        if (data?.success) {
          setDoctors(data.doctors || []);
        } else {
          toast.error(data?.message || "Failed to load doctors");
        }
      })
      .catch(err => {
        toast.error(err?.response?.data?.message || err.message || "Failed to load doctors");
      })
  };


  const changeAvailability = async (docId) => {
    try {
      // DEBUG: Tracking availability changes
      // Debug logging removed

      const { data } = await api.patch(
        `/api/admin/doctors/${docId}/availability`,
        { docId: docId }
      );

      if (data?.success) {
        toast.success(data.message || "Availability Changed");
        getAllDoctors();
      } else {
        toast.error(data?.message || "Failed to change availability");
      }
    } catch (err) {
      toast.error('Failed to update availability');
    }
  };


  const getAllAppointments = async (page = 1, limit = 5) => {
    try {
      const { data } = await api.get(`/api/admin/appointments?page=${page}&limit=${limit}`);
      if (data?.success) {
        setAppointments([...data.appointments].reverse());
        return data.pagination;
      } else {
        toast.error(data?.message || "Failed to load appointments");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Failed to load appointments");
    }
  };


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


  const getDashData = async () => {
    try {
      const { data } = await api.get(`/api/admin/dashboard`);
      if (data?.success) {
        setDashData(data.dashData);
      } else {
        toast.error(data?.message || "Failed to load dashboard data");
      }
    } catch (err) {
      toast.error('Failed to fetch dashboard data');
    }
  };

  const [users, setUsers] = useState([]);

  const getAllUsersList = async () => {
    try {
      const { data } = await api.get('/api/admin/users');
      if (data?.success) {
        setUsers(data.users);
      } else {
        toast.error(data?.message || "Failed to fetch users");
      }
    } catch (err) {
      toast.error('Failed to load users');
    }
  };

  const changeUserStatus = async (userId) => {
    try {
      const { data } = await api.patch(`/api/admin/users/${userId}/block`);
      if (data?.success) {
        toast.success(data.message);
        getAllUsersList();
      } else {
        toast.error(data?.message || "Failed to update user status");
      }
    } catch (err) {
      toast.error('Failed to update user status');
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
    users,
    getAllUsers: getAllUsersList,
    changeUserStatus
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export default AdminContextProvider;
