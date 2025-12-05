
import jwt from "jsonwebtoken";
import { Server } from "socket.io";

export function createSocketServer(httpServer, { jwtSecret } = {}) {
  const io = new Server(httpServer, {
    cors: { origin: ["http://localhost:5173", "http://localhost:5174",'https://synapse-seven-theta.vercel.app','https://synapse-cma3.vercel.app'], credentials: true },
    transports: ["websocket", "polling"],
  });

  const adminNsp = io.of("/admin");

  adminNsp.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) return next(new Error("Unauthorized"));
      const payload = jwt.verify(token, jwtSecret);
      if (payload?.type !== "admin") return next(new Error("Forbidden"));
      socket.user = payload;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  adminNsp.on("connection", (socket) => {
    socket.join("admins");
  });

  const emitToAdmins = (event, payload) => {
    adminNsp.to("admins").emit(event, payload);
  };

  return { io, adminNsp, emitToAdmins };
}
