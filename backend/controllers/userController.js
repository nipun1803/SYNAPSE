import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import userModel from "../models/usermodel.js";
import doctorModel from "../models/doctormodel.js";
import appointmentModel from "../models/appointmentmodel.js";
import { v2 as cloudinary } from "cloudinary";
import getCookieOptions from "../utils/cookieUtil.js";
import catchAsync from "../utils/catchAsync.js";

// TODO: refactor this date parsing - getting messy with all the edge cases
// Converts slot date string (DD_MM_YYYY) and time to Date object
function parseSlotToDate(slotDate, slotTime) {
  try {
    const [d, m, y] = slotDate.split("_").map((n) => parseInt(n, 10));
    const date = new Date(y, m - 1, d);

    if (slotTime) {
      const [hm, ampm] = slotTime.split(" ");
      let [hh, mm] = hm.split(":").map((n) => parseInt(n, 10));
      // Handle 12-hour format conversion
      if (ampm?.toUpperCase() === "PM" && hh < 12) hh += 12;
      if (ampm?.toUpperCase() === "AM" && hh === 12) hh = 0;
      date.setHours(hh, mm || 0, 0, 0);
    } else {
      date.setHours(0, 0, 0, 0);
    }
    return date;
  } catch (err) {
    console.warn("Failed to parse slot date:", slotDate, slotTime);
    return null;
  }
}

// Real-time dashboard count updates
const emitCounts = async (emit) => {
  try {
    if (!emit) return;
    const [doctorsCount, apptsCount, usersCount] = await Promise.all([
      doctorModel.countDocuments({}),
      appointmentModel.countDocuments({}),
      userModel.countDocuments({}),
    ]);
    emit("dashboard:counts", {
      doctors: doctorsCount,
      appointments: apptsCount,
      patients: usersCount,
    });
  } catch (e) {
    // Silently fail - dashboard counts are non-critical
    console.error("emitCounts error:", e?.message || e);
  }
};

// User registration endpoint
// Register user with stronger validation
const registerUser = catchAsync(async (req, res) => {
  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "Missing Details" });
  }

  if (!validator.isEmail(email)) {
    return res
      .status(400)
      .json({ success: false, message: "Please enter a valid email" });
  }

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      success: false,
      message:
        "Password must be 8+ chars with uppercase, lowercase, number & special char",
    });
  }

  const existing = await userModel.findOne({ email });
  if (existing) {
    return res.status(409).json({
      success: false,
      message: "User already exists with this email",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await userModel.create({
    name,
    email,
    password: hashedPassword,
  });

  const token = jwt.sign(
    { id: user._id, type: "user" },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.cookie("token", token, getCookieOptions());
  res.status(201).json({ success: true, userType: "user" });
});

const loginUser = catchAsync(async (req, res) => {
  const { email, password } = req.body || {};

  const user = await userModel.findOne({ email });
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User does not exist",
    });
  }

  if (user.blocked) {
    return res.status(403).json({
      success: false,
      message: "Your account has been blocked by admin",
    });
  }

  const isMatch = await bcrypt.compare(password || "", user.password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  const token = jwt.sign(
    { id: user._id, type: "user" },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.cookie("token", token, getCookieOptions());
  res.json({ success: true, userType: "user" });
});

const unifiedLogin = catchAsync(async (req, res) => {
  const { email, password, userType } = req.body || {};

  if (!email || !password || !userType) {
    return res.status(400).json({ success: false, message: "Missing Details" });
  }

  if (userType === "admin") {
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign({ email, type: "admin" }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });
      res.cookie("aToken", token, getCookieOptions());
      return res.status(200).json({ success: true, userType: "admin" });
    }
    return res
      .status(401)
      .json({ success: false, message: "Invalid admin credentials" });
  }

  if (userType === "doctor") {
    const doctor = await doctorModel.findOne({ email });

    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor does not exist" });
    }

    const isMatch = await bcrypt.compare(password || "", doctor.password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid doctor credentials" });
    }

    const token = jwt.sign(
      { id: doctor._id, type: "doctor" },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );
    res.cookie("dToken", token, getCookieOptions());
    return res.status(200).json({ success: true, userType: "doctor" });
  }

  if (userType === "user") {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User does not exist" });
    }

    if (user.blocked) {
      return res
        .status(403)
        .json({ success: false, message: "Your account has been blocked by admin" });
    }

    const isMatch = await bcrypt.compare(password || "", user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid user credentials" });
    }

    const token = jwt.sign(
      { id: user._id, type: "user" },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );
    res.cookie("token", token, getCookieOptions());
    return res.status(200).json({ success: true, userType: "user" });
  }

  return res.status(400).json({ success: false, message: "Invalid user type" });
});

const logoutUser = catchAsync(async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });

  res.json({ success: true, message: "Logged out successfully" });
});

const getProfile = catchAsync(async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const userData = await userModel.findById(userId).select("-password");

  if (!userData) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  res.status(200).json({ success: true, userData });
});

const updateProfile = catchAsync(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const { name, phone, address, dob, gender } = req.body || {};
  const imageFile = req.file;
  if (!name || !phone || !gender) {
    return res.status(400).json({ success: false, message: "Data Missing" });
  }

  const parsedAddress =
    typeof address === "string" ? JSON.parse(address) : address;
  const update = { name, phone, gender };
  if (parsedAddress) update.address = parsedAddress;
  if (dob) {
    const d = new Date(dob);
    update.dob = isNaN(d.getTime()) ? null : d;
  }

  await userModel.findByIdAndUpdate(userId, update);

  if (imageFile) {
    const uploaded = await cloudinary.uploader.upload(imageFile.path, {
      resource_type: "image",
    });
    await userModel.findByIdAndUpdate(userId, { image: uploaded.secure_url });
  }
  res.status(200).json({ success: true, message: "Profile Updated" });
});

const bookAppointment = catchAsync(async (req, res) => {
  const userId = req.user?.id;
  const { docId, slotDate, slotTime, paymentMode, purpose } = req.body || {};

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  if (!docId || !slotDate || !slotTime) {
    return res.status(400).json({
      success: false,
      message: "Missing appointment details",
    });
  }

  // fetching doc detail
  const doc = await doctorModel.findById(docId).select("-password");
  if (!doc) {
    return res.status(404).json({
      success: false,
      message: "Doctor not found",
    });
  }

  if (!doc.available) {
    return res.status(400).json({
      success: false,
      message: "Doctor Not Available",
    });
  }

  // Validate slot time isn't in the past
  const slotDateTime = parseSlotToDate(slotDate, slotTime);
  if (!slotDateTime || slotDateTime < new Date()) {
    return res.status(400).json({
      success: false,
      message: "Cannot book a past time",
    });
  }

  // Check slot availability
  const bookedSlots = doc.slots_booked || {};
  if (bookedSlots[slotDate]) {
    if (
      Array.isArray(bookedSlots[slotDate]) &&
      bookedSlots[slotDate].includes(slotTime)
    ) {
      return res.status(409).json({
        success: false,
        message: "Slot Not Available",
      });
    } else if (Array.isArray(bookedSlots[slotDate])) {
      bookedSlots[slotDate].push(slotTime);
    } else {
      bookedSlots[slotDate] = [slotTime];
    }
  } else {
    bookedSlots[slotDate] = [slotTime];
  }

  const user = await userModel.findById(userId).select("-password");

  // Prepare doctor data without slots
  const docObj = doc.toObject();
  delete docObj.slots_booked;

  // Create appointment record (cash payment mode only - online handled by payment controller)
  if (paymentMode === "cash") {
    const appointment = new appointmentModel({
      userId,
      docId,
      userData: user,
      docData: docObj,
      amount: doc.fees,
      slotTime,
      slotDate,
      date: Date.now(),
      purpose: purpose || '',
      payment: false, // Cash payment - not paid yet
      paymentStatus: "pending",
    });
    await appointment.save();

    await doctorModel.findByIdAndUpdate(docId, { slots_booked: bookedSlots });

    // Notify admins via socket
    const emit = req.app?.locals?.emitToAdmins;
    if (emit) {
      emit("appointment:created", {
        type: "appointment:created",
        appointment: appointment.toObject(),
      });
      await emitCounts(emit);
    }

    res.status(201).json({
      success: true,
      message: "Appointment Booked",
      appointmentId: appointment._id,
    });
  } else {
    // Online payment mode - should not reach here as online payments go through payment controller
    return res.status(400).json({
      success: false,
      message: "Please use payment endpoint for online bookings",
    });
  }
});

const cancelAppointment = catchAsync(async (req, res) => {
  const userId = req.user?.id;
  const appointmentId = req.params.id || req.body.appointmentId;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  if (!appointmentId) {
    return res
      .status(400)
      .json({ success: false, message: "Missing appointmentId" });
  }

  const appointmentData = await appointmentModel.findById(appointmentId);

  if (!appointmentData) {
    return res
      .status(404)
      .json({ success: false, message: "Appointment not found" });
  }

  if (appointmentData.userId.toString() !== userId) {
    return res
      .status(403)
      .json({ success: false, message: "Unauthorized action" });
  }

  if (appointmentData.cancelled) {
    return res
      .status(409)
      .json({ success: false, message: "Appointment already cancelled" });
  }

  await appointmentModel.findByIdAndUpdate(appointmentId, {
    cancelled: true,
  });

  const { docId, slotDate, slotTime } = appointmentData;
  const doctorData = await doctorModel.findById(docId);

  if (doctorData) {
    const slots_booked = doctorData.slots_booked || {};
    if (Array.isArray(slots_booked[slotDate])) {
      slots_booked[slotDate] = slots_booked[slotDate].filter(
        (e) => e !== slotTime
      );
      await doctorModel.findByIdAndUpdate(docId, { slots_booked });
    }
  }

  const updated = await appointmentModel.findById(appointmentId).lean();
  const emit = req.app?.locals?.emitToAdmins;
  if (emit && updated) {
    emit("appointment:updated", {
      type: "appointment:updated",
      appointment: updated,
    });
    await emitCounts(emit);
  }

  res.status(200).json({ success: true, message: "Appointment Cancelled" });
});

const rescheduleAppointment = catchAsync(async (req, res) => {
  const userId = req.user?.id;
  const appointmentId = req.params.id;
  const { slotDate, slotTime } = req.body;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  if (!appointmentId || !slotDate || !slotTime) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields" });
  }

  const appointment = await appointmentModel.findById(appointmentId);

  if (!appointment) {
    return res
      .status(404)
      .json({ success: false, message: "Appointment not found" });
  }

  if (appointment.userId.toString() !== userId) {
    return res
      .status(403)
      .json({ success: false, message: "Unauthorized action" });
  }

  if (appointment.cancelled) {
    return res.status(409).json({
      success: false,
      message: "Cannot reschedule cancelled appointment",
    });
  }

  if (appointment.isCompleted) {
    return res.status(409).json({
      success: false,
      message: "Cannot reschedule completed appointment",
    });
  }

  // Check reschedule limit - only one reschedule allowed
  if (appointment.rescheduleCount >= 1) {
    return res.status(400).json({
      success: false,
      message: "Appointment can only be rescheduled once",
    });
  }

  const { docId, slotDate: oldSlotDate, slotTime: oldSlotTime } = appointment;
  const doctorData = await doctorModel.findById(docId);

  if (!doctorData) {
    return res
      .status(404)
      .json({ success: false, message: "Doctor not found" });
  }

  if (!doctorData.available) {
    return res
      .status(400)
      .json({ success: false, message: "Doctor not available" });
  }

  const slots_booked = doctorData.slots_booked || {};

  if (slots_booked[slotDate]?.includes(slotTime)) {
    return res
      .status(409)
      .json({ success: false, message: "Slot already booked" });
  }

  if (Array.isArray(slots_booked[oldSlotDate])) {
    slots_booked[oldSlotDate] = slots_booked[oldSlotDate].filter(
      (e) => e !== oldSlotTime
    );
  }

  if (slots_booked[slotDate]) {
    slots_booked[slotDate].push(slotTime);
  } else {
    slots_booked[slotDate] = [slotTime];
  }
  await doctorModel.findByIdAndUpdate(docId, { slots_booked });

  // Update appointment with new slot and increment reschedule count
  await appointmentModel.findByIdAndUpdate(appointmentId, {
    slotDate,
    slotTime,
    date: Date.now(),
    $inc: { rescheduleCount: 1 }
  });

  const updated = await appointmentModel.findById(appointmentId).lean();
  const emit = req.app?.locals?.emitToAdmins;
  if (emit && updated) {
    emit("appointment:updated", {
      type: "appointment:updated",
      appointment: updated,
    });
    await emitCounts(emit);
  }

  res
    .status(200)
    .json({ success: true, message: "Appointment rescheduled successfully" });
});

const listAppointment = catchAsync(async (req, res) => {
  const userId = req.user?.id;
  const { page = 1, limit = 10, filter, docId, date } = req.query;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const query = { userId };

  // Status Filters
  if (filter === 'upcoming') {
    query.cancelled = false;
    query.isCompleted = false;
  } else if (filter === 'completed') {
    query.isCompleted = true;
  } else if (filter === 'cancelled') {
    query.cancelled = true;
  }

  // Doctor Filter
  if (docId) {
    query.docId = docId;
  }

  // Date Filter (Expects DD_MM_YYYY format)
  if (date) {
    query.slotDate = date;
  }

  const appointments = await appointmentModel
    .find(query)
    .sort({ date: -1, _id: -1 })
    .skip(skip)
    .limit(limitNum);

  const total = await appointmentModel.countDocuments(query);

  res.status(200).json({
    success: true,
    appointments,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    },
  });
});

const getAppointmentById = catchAsync(async (req, res) => {
  const userId = req.user?.id;
  const { id } = req.params;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const appointment = await appointmentModel.findById(id);

  if (!appointment) {
    return res
      .status(404)
      .json({ success: false, message: "Appointment not found" });
  }

  if (appointment.userId.toString() !== userId) {
    return res.status(403).json({
      success: false,
      message: "Unauthorized access to this appointment",
    });
  }

  res.status(200).json({ success: true, appointment });
});



// Admin: Get all users
const getAllUsers = catchAsync(async (req, res) => {
  const users = await userModel.find({}).select('-password');
  res.json({ success: true, users });
});

// Admin: Block/Unblock user
const toggleBlockUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  const user = await userModel.findById(id);

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  user.blocked = !user.blocked;
  await user.save();

  res.json({
    success: true,
    message: user.blocked ? "User blocked successfully" : "User unblocked successfully"
  });
});

export {
  loginUser,
  registerUser,
  unifiedLogin,
  logoutUser,
  getProfile,
  updateProfile,
  bookAppointment,
  listAppointment,
  cancelAppointment,
  rescheduleAppointment,
  getAppointmentById,
  getAllUsers,
  toggleBlockUser
};
