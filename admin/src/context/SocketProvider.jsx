import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getAdminSocket } from "../lib/socket";

const SocketCtx = createContext(null);

export function SocketProvider({ token, children }) {
  const [connected, setConnected] = useState(false);
  const socket = useMemo(() => getAdminSocket({ token }), [token]);

  useEffect(() => {
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [socket]);

  return <SocketCtx.Provider value={{ socket, connected }}>{children}</SocketCtx.Provider>;
}

export function useAdminSocket() {
  return useContext(SocketCtx);
}