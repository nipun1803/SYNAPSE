
import { io } from "socket.io-client";

// Use backend base URL if provided; fallback to same-origin (works when admin and API are hosted together)
const BASE = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");

let socket;
export function getAdminSocket({ token }) {
  if (socket && socket.connected) return socket;

  const namespace = BASE ? `${BASE}/admin` : "/admin";

  socket = io(namespace, {
    path: "/socket.io",
    auth: { token },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 500,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    withCredentials: true,
  });

  return socket;
}
