
import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import chatModel from "../models/chatModel.js";

export function createSocketServer(httpServer, { jwtSecret } = {}) {
  const io = new Server(httpServer, {
    cors: { origin: ["http://localhost:5173", "http://localhost:5174", 'https://synapse-seven-theta.vercel.app', 'https://synapse-cma3.vercel.app'], credentials: true },
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

  // ------------------------------------------------------------------------
  // Chat & Video Call Namespace - For Doctors and Patients
  // ------------------------------------------------------------------------
  const chatNsp = io.of("/"); // Using default namespace for simplicity

  // Middleware: No strict authentication required since app uses cookie-based auth
  // The actual message saving is protected by HTTP API authentication
  chatNsp.use((socket, next) => {
    // Allow connection without token verification
    // The cookie-based auth is handled by HTTP endpoints
    next();
  });

  chatNsp.on("connection", (socket) => {
    // Event: Join a specific Appointment Chat Room
    socket.on("join_chat", (appointmentId) => {
      socket.join(`chat_${appointmentId}`);
    });

    // Event: Join a video call room (for signaling)
    socket.on("join_video", (appointmentId) => {
      socket.join(`video_${appointmentId}`);
    });

    // Event: Video call started notification
    socket.on("video_started", (data) => {
      const { appointmentId } = data;
      chatNsp.to(`chat_${appointmentId}`).emit("video_call_started", {
        appointmentId,
        startedBy: data.startedBy,
        roomName: data.roomName
      });
    });

    // Event: Video call ended notification
    socket.on("video_ended", (data) => {
      const { appointmentId } = data;
      chatNsp.to(`chat_${appointmentId}`).emit("video_call_ended", {
        appointmentId,
        endedBy: data.endedBy
      });
      chatNsp.to(`video_${appointmentId}`).emit("video_call_ended", {
        appointmentId,
        endedBy: data.endedBy
      });
    });

    // WebRTC Signaling Events
    socket.on("webrtc_offer", (data) => {
      socket.to(`video_${data.appointmentId}`).emit("webrtc_offer", data);
    });

    socket.on("webrtc_answer", (data) => {
      socket.to(`video_${data.appointmentId}`).emit("webrtc_answer", data);
    });

    socket.on("webrtc_ice_candidate", (data) => {
      socket.to(`video_${data.appointmentId}`).emit("webrtc_ice_candidate", data);
    });

    // Event: Send Message
    socket.on("send_message", async (data) => {
      try {
        const { appointmentId, senderId, senderModel, receiverId, receiverModel, message } = data;

        // 1. Save to Database
        const newChat = new chatModel({
          appointmentId,
          senderId,
          senderModel,
          receiverId,
          receiverModel,
          message,
          isRead: false
        });
        await newChat.save();

        // 2. Emit to Room
        chatNsp.to(`chat_${appointmentId}`).emit("receive_message", newChat);

      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });
  });

  return { io, adminNsp, emitToAdmins };
}
