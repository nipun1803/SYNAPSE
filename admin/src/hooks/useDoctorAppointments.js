import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { doctorService } from '../api/doctorService';

/**
 * Custom hook for managing doctor appointments
 * Extracts appointment fetching, filtering, and pagination logic
 */
export const useDoctorAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 5,
        pages: 1,
    });

    const fetchAppointments = useCallback(async (page = 1, limit = 5, filter = 'all', search = '') => {
        try {
            setLoading(true);
            const params = {
                page,
                limit,
                ...(filter !== 'all' && { status: filter }),
                ...(search && { search }),
            };

            const { data } = await doctorService.getAppointments(params);

            if (data.success) {
                setAppointments([...data.appointments].reverse());
                setPagination(data.pagination);
                return data.pagination;
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const cancelAppointment = useCallback(async (appointmentId, onSuccess) => {
        try {
            const { data } = await doctorService.cancelAppointment(appointmentId);
            if (data.success) {
                toast.success(data.message);
                if (onSuccess) onSuccess();
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || err.message);
        }
    }, []);

    const completeAppointment = useCallback(async (appointmentId, onSuccess) => {
        try {
            const { data } = await doctorService.completeAppointment(appointmentId);
            if (data.success) {
                toast.success(data.message);
                if (onSuccess) onSuccess();
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || err.message);
        }
    }, []);

    return {
        appointments,
        loading,
        pagination,
        fetchAppointments,
        cancelAppointment,
        completeAppointment,
    };
};
