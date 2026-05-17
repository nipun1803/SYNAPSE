import appointmentModel from "../models/appointmentmodel.js";
import catchAsync from "../utils/catchAsync.js";
import getStreamClient from "../config/stream.js";

/**
 * Generate a Stream Video token for an authenticated user.
 * The token is scoped to a specific appointment, creating a 1:1 call room.
 *
 * Route: POST /api/video/token
 * Auth: authCombined (user OR doctor)
 */
const generateStreamToken = catchAsync(async (req, res) => {
  const { appointmentId } = req.body;
  const userId = req.user?.id || req.doctor?.id;
  const userType = req.user ? "user" : "doctor";

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  if (!appointmentId) {
    return res
      .status(400)
      .json({ success: false, message: "Appointment ID is required" });
  }

  // Validate appointment exists and user has access
  const appointment = await appointmentModel.findById(appointmentId);
  if (!appointment) {
    return res
      .status(404)
      .json({ success: false, message: "Appointment not found" });
  }

  // Authorization: only the patient or doctor for this appointment can join
  const hasAccess =
    userType === "user"
      ? appointment.userId.toString() === userId
      : appointment.docId.toString() === userId;

  if (!hasAccess) {
    return res.status(403).json({
      success: false,
      message: "You are not authorized to join this consultation",
    });
  }

  // Validate appointment state
  if (appointment.cancelled) {
    return res.status(400).json({
      success: false,
      message: "Cannot join call for a cancelled appointment",
    });
  }

  if (appointment.isCompleted) {
    return res.status(400).json({
      success: false,
      message: "This appointment has already been completed",
    });
  }

  // Get Stream client
  const client = getStreamClient();
  if (!client) {
    return res.status(503).json({
      success: false,
      message: "Video service is not configured. Contact administrator.",
    });
  }

  // Generate the Stream user ID (prefixed to avoid collisions)
  const streamUserId = `${userType}_${userId}`;

  // Determine display name and role
  const displayName =
    userType === "user"
      ? appointment.userData?.name || "Patient"
      : appointment.docData?.name || "Doctor";

  // Upsert user in Stream (creates if not exists)
  try {
    await client.upsertUsers([
      {
        id: streamUserId,
        name: displayName,
        role: "user",
        custom: {
          userType,
          appointmentId,
        },
      },
    ]);
  } catch (err) {
    console.error("[Stream] Failed to upsert user:", err.message);
    // Non-fatal: token generation can still proceed
  }

  // Generate token with 1-hour expiry
  const expiresAt = Math.floor(Date.now() / 1000) + 3600;
  const issuedAt = Math.floor(Date.now() / 1000) - 10; // 10-second clock skew allowance

  let token;
  try {
    // Try modern API first, fall back to legacy
    if (typeof client.generateUserToken === 'function') {
      token = client.generateUserToken({
        user_id: streamUserId,
        exp: expiresAt,
        iat: issuedAt,
      });
    } else {
      token = client.createToken(streamUserId, expiresAt);
    }
  } catch (err) {
    console.error('[Stream] Token generation failed:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate video token',
    });
  }

  // Construct the call ID from the appointment
  const callId = `consultation_${appointmentId}`;

  // Update appointment video status if it's the first join
  if (appointment.videoCallStatus === "idle") {
    await appointmentModel.findByIdAndUpdate(appointmentId, {
      videoCallStatus: "active",
      videoCallStartedAt: new Date(),
    });

    // Emit socket event
    const emit = req.app?.locals?.emitToAdmins;
    if (emit) {
      emit("video:started", {
        type: "video:started",
        appointmentId,
        startedBy: userType,
      });
    }
  }

  res.json({
    success: true,
    token,
    apiKey: process.env.STREAM_API_KEY,
    callId,
    userId: streamUserId,
    userName: displayName,
    userType,
  });
});

/**
 * End a Stream Video call and update appointment status.
 *
 * Route: POST /api/video/end
 * Auth: authCombined (user OR doctor)
 */
const endStreamCall = catchAsync(async (req, res) => {
  const { appointmentId } = req.body;
  const userId = req.user?.id || req.doctor?.id;
  const userType = req.user ? "user" : "doctor";

  if (!userId || !appointmentId) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields",
    });
  }

  const appointment = await appointmentModel.findById(appointmentId);
  if (!appointment) {
    return res
      .status(404)
      .json({ success: false, message: "Appointment not found" });
  }

  // Authorization check
  const hasAccess =
    userType === "user"
      ? appointment.userId.toString() === userId
      : appointment.docId.toString() === userId;

  if (!hasAccess) {
    return res
      .status(403)
      .json({ success: false, message: "Unauthorized access" });
  }

  await appointmentModel.findByIdAndUpdate(appointmentId, {
    videoCallStatus: "ended",
    videoCallEndedAt: new Date(),
  });

  const emit = req.app?.locals?.emitToAdmins;
  if (emit) {
    emit("video:ended", {
      type: "video:ended",
      appointmentId,
      endedBy: userType,
    });
  }

  res.json({ success: true, message: "Video call ended" });
});

export { generateStreamToken, endStreamCall };
