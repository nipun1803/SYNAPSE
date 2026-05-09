import appointmentModel from "../models/appointmentmodel.js";
import catchAsync from "../utils/catchAsync.js";

// Generate a unique Jitsi room name for an appointment
function generateRoomName(appointmentId) {
  return `synapse-consultation-${appointmentId}`;
}

// Start a video call (patient or doctor)
const startVideoCall = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id || req.doctor?.id;
  const userType = req.user ? 'user' : 'doctor';

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const appointment = await appointmentModel.findById(id);
  if (!appointment) {
    return res.status(404).json({ success: false, message: "Appointment not found" });
  }

  // Verify access
  const hasAccess = userType === 'user'
    ? appointment.userId.toString() === userId
    : appointment.docId.toString() === userId;

  if (!hasAccess) {
    return res.status(403).json({ success: false, message: "Unauthorized access" });
  }

  // Only allow video call for upcoming, non-cancelled appointments
  if (appointment.cancelled) {
    return res.status(400).json({ success: false, message: "Cannot start call for cancelled appointment" });
  }

  if (appointment.isCompleted) {
    return res.status(400).json({ success: false, message: "Appointment already completed" });
  }

  // Update video call status
  await appointmentModel.findByIdAndUpdate(id, {
    videoCallStatus: 'active',
    videoCallStartedAt: new Date()
  });

  const roomName = generateRoomName(id);

  // Emit socket event to notify the other party
  const emit = req.app?.locals?.emitToAdmins;
  if (emit) {
    emit("video:started", {
      type: "video:started",
      appointmentId: id,
      startedBy: userType,
      roomName
    });
  }

  res.json({
    success: true,
    roomName,
    appointmentId: id,
    jitsiDomain: "meet.jit.si"
  });
});

// End a video call
const endVideoCall = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id || req.doctor?.id;
  const userType = req.user ? 'user' : 'doctor';

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const appointment = await appointmentModel.findById(id);
  if (!appointment) {
    return res.status(404).json({ success: false, message: "Appointment not found" });
  }

  const hasAccess = userType === 'user'
    ? appointment.userId.toString() === userId
    : appointment.docId.toString() === userId;

  if (!hasAccess) {
    return res.status(403).json({ success: false, message: "Unauthorized access" });
  }

  await appointmentModel.findByIdAndUpdate(id, {
    videoCallStatus: 'ended',
    videoCallEndedAt: new Date()
  });

  const emit = req.app?.locals?.emitToAdmins;
  if (emit) {
    emit("video:ended", {
      type: "video:ended",
      appointmentId: id,
      endedBy: userType
    });
  }

  res.json({ success: true, message: "Video call ended" });
});

// Get video call status for an appointment
const getVideoCallStatus = catchAsync(async (req, res) => {
  const { id } = req.params;

  const appointment = await appointmentModel.findById(id)
    .select('videoCallStatus videoCallStartedAt videoCallEndedAt');

  if (!appointment) {
    return res.status(404).json({ success: false, message: "Appointment not found" });
  }

  res.json({
    success: true,
    videoCallStatus: appointment.videoCallStatus,
    videoCallStartedAt: appointment.videoCallStartedAt,
    videoCallEndedAt: appointment.videoCallEndedAt,
    roomName: appointment.videoCallStatus === 'active' ? generateRoomName(id) : null
  });
});

export {
  startVideoCall,
  endVideoCall,
  getVideoCallStatus
};
