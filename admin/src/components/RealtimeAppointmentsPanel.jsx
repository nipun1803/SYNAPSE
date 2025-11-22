import React, { useContext, useEffect, useRef, useState } from "react";
import { AdminContext } from "../context/AdminContext";
import { useAdminSocket } from "../context/SocketProvider";

export default function RealtimeAppointmentsPanel() {
  const { socket, connected } = useAdminSocket();
  const { aToken } = useContext(AdminContext);
  const [appointments, setAppointments] = useState([]);
  const lastFetchRef = useRef(0);

  const BASE = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");
  const APPOINTMENTS_URL = `${BASE}/api/admin/appointments`;

  useEffect(() => {
    let cancelled = false;

    const snapshot = async () => {
      try {
        lastFetchRef.current = Date.now();
        const res = await fetch(APPOINTMENTS_URL, {
          headers: {
            Authorization: `Bearer ${aToken}`,
          },
          credentials: "include",
        });
        if (!res.ok) return; // for missing token
        const data = await res.json();
        if (!cancelled) setAppointments(Array.isArray(data?.appointments) ? data.appointments : []);
      } catch {
      }
    };

    snapshot();

    const onCreated = (msg) => setAppointments((prev) => [msg.appointment, ...prev]);
    const onUpdated = (msg) =>
      setAppointments((prev) => prev.map((a) => (a._id === msg.appointment._id ? msg.appointment : a)));

    socket?.on?.("appointment:created", onCreated);
    socket?.on?.("appointment:updated", onUpdated);

    // it will fallback to polling it it isn't connected
    const interval = setInterval(() => {
      if (!connected && Date.now() - lastFetchRef.current > 15000) {
        snapshot();
      }
    }, 5000);

    return () => {
      cancelled = true;
      clearInterval(interval);
      socket?.off?.("appointment:created", onCreated);
      socket?.off?.("appointment:updated", onUpdated);
    };
  }, [socket, connected, aToken, APPOINTMENTS_URL]);

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <strong>Connection:</strong> {connected ? "Live" : "Reconnecting..."}
      </div>
      <ul>
        {appointments.map((a) => (
          <li key={a._id}>
            #{a._id} — {a?.userData?.name} with {a?.docData?.name} on {a?.slotDate} at {a?.slotTime}
          </li>
        ))}
      </ul>
    </div>
  );
}