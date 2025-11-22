import React, { useContext, useEffect, useState } from "react";
import { AdminContext } from "../context/AdminContext";
import { useAdminSocket } from "../context/SocketProvider";

export default function DoctorsManager() {
  const { socket } = useAdminSocket();
  const { aToken } = useContext(AdminContext);
  const [doctors, setDoctors] = useState([]);

  const BASE = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");
  const DOCTORS_URL = `${BASE}/api/admin/doctors`;

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch(DOCTORS_URL, {
          headers: {
            Authorization: `Bearer ${aToken}`,
          },
          credentials: "include",
        });
        if (!res.ok) return; // for missing token 
        const data = await res.json();
        if (!cancelled) setDoctors(Array.isArray(data?.doctors) ? data.doctors : []);
      } catch {
      }
    };

    load();

    const onCreated = (msg) => setDoctors((prev) => [msg.doctor, ...prev]);
    const onUpdated = (msg) =>
      setDoctors((prev) => prev.map((d) => (d._id === msg.doctor._id ? msg.doctor : d)));
    const onDeleted = (msg) => setDoctors((prev) => prev.filter((d) => d._id !== msg.id));

    socket?.on?.("doctor:created", onCreated);
    socket?.on?.("doctor:updated", onUpdated);
    socket?.on?.("doctor:deleted", onDeleted);

    return () => {
      cancelled = true;
      socket?.off?.("doctor:created", onCreated);
      socket?.off?.("doctor:updated", onUpdated);
      socket?.off?.("doctor:deleted", onDeleted);
    };
  }, [socket, aToken, DOCTORS_URL]);

  return (
    <div>
      <ul>
        {doctors.map((d) => (
          <li key={d._id}>
            {d.name} — {d.speciality} {d.available === false ? "(inactive)" : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}