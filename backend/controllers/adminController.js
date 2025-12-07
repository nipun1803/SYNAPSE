import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentmodel.js";
import doctorModel from "../models/doctormodel.js";
import bcrypt from "bcrypt";
import validator from "validator";
import { v2 as cloudinary } from "cloudinary";
import userModel from "../models/usermodel.js";
import getCookieOptions from "../utils/cookieUtil.js";
import catchAsync from "../utils/catchAsync.js";

// Admin login - hardcoded credentials for now
// FIXME: Move to database with proper admin user model
const loginAdmin = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  if (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASSWORD
  ) {
    const token = jwt.sign({ email, type: "admin" }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.cookie("aToken", token, getCookieOptions());

    res.json({ success: true, userType: "admin" });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

const logoutAdmin = catchAsync(async (req, res) => {
  res.clearCookie("aToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });

  res.status(200).json({ success: true, message: "Logged out successfully" });
});

// Real-time count updates for admin dashboard
const emitCounts = async (emit) => {
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
};

//  filtering, search
const appointmentsAdmin = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, status, search } = req.query;
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const query = {};
  if (status === "upcoming") {
    query.cancelled = false;
    query.isCompleted = false;
  } else if (status === "completed") {
    query.isCompleted = true;
  } else if (status === "cancelled") {
    query.cancelled = true;
  }

  let appointments = await appointmentModel
    .find(query)
    .sort({ date: -1, _id: -1 });

  // Client-side search filtering (not ideal but works for now)
  // TODO: Move search to database query for better performance
  if (search) {
    const searchLower = search.toLowerCase();
    appointments = appointments.filter((apt) => {
      const patientName = apt.userData?.name?.toLowerCase() || "";
      const doctorName = apt.docData?.name?.toLowerCase() || "";
      return (
        patientName.includes(searchLower) || doctorName.includes(searchLower)
      );
    });
  }

  const total = appointments.length;
  const paginatedAppointments = appointments.slice(skip, skip + limitNum);

  res.json({
    success: true,
    appointments: paginatedAppointments,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    },
  });
});

const appointmentCancel = catchAsync(async (req, res) => {
  const { appointmentId } = req.body;

  if (!appointmentId) {
    return res.status(400).json({
      success: false,
      message: "Appointment ID is required"
    });
  }

  const apt = await appointmentModel.findById(appointmentId);

  if (!apt) {
    return res.status(404).json({
      success: false,
      message: "Appointment not found"
    });
  }

  await appointmentModel.findByIdAndUpdate(appointmentId, {
    cancelled: true,
  });

  const { docId, slotDate, slotTime } = apt;
  const doc = await doctorModel.findById(docId);

  // Free up the slot
  if (doc) {
    const bookedSlots = doc.slots_booked || {};
    if (Array.isArray(bookedSlots[slotDate])) {
      bookedSlots[slotDate] = bookedSlots[slotDate].filter(
        (e) => e !== slotTime
      );
      await doctorModel.findByIdAndUpdate(docId, { slots_booked: bookedSlots });
    }
  }

  const emit = req.app?.locals?.emitToAdmins;
  const updated = await appointmentModel.findById(appointmentId).lean();
  if (emit && updated) {
    emit("appointment:updated", {
      type: "appointment:updated",
      appointment: updated,
    });
    await emitCounts(emit);
  }

  res.json({ success: true, message: "Appointment Cancelled" });
});

// Add new doctor to the system
const addDoctor = catchAsync(async (req, res) => {
  const {
    name,
    email,
    password,
    speciality,
    degree,
    experience,
    about,
    fees,
    address,
  } = req.body;
  const imageFile = req.file;


  if (
    !name ||
    !email ||
    !password ||
    !speciality ||
    !degree ||
    !experience ||
    !about ||
    !fees ||
    !address
  ) {
    return res.status(400).json({
      success: false,
      message: "Missing Details"
    });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Please enter a valid email"
    });
  }


  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      success: false,
      message: "Password must be 8+ chars with uppercase, lowercase, number & special char"
    });
  }

  const exists = await doctorModel.findOne({ email });
  if (exists) {
    return res.status(409).json({
      success: false,
      message: "Doctor already exists with this email",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  let imageUrl = "";
  if (imageFile) {
    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      resource_type: "image",
    });
    imageUrl = imageUpload.secure_url;
  }

  let parsedAddress =
    typeof address === "string" ? JSON.parse(address) : address;

  const newDoc = new doctorModel({
    name,
    email,
    image: imageUrl,
    password: hashedPassword,
    speciality,
    degree,
    experience,
    about,
    fees,
    address: parsedAddress,
    date: Date.now(),
    available: true,
  });
  await newDoc.save();

  const emit = req.app?.locals?.emitToAdmins;
  if (emit) {
    const doc = newDoc.toObject();
    delete doc.password;
    emit("doctor:created", { type: "doctor:created", doctor: doc });
    await emitCounts(emit);
  }

  res.status(201).json({
    success: true,
    message: "Doctor Added",
    doctorId: newDoc._id
  });
});

const allDoctors = catchAsync(async (req, res) => {
  const doctors = await doctorModel.find().select("-password");
  res.status(200).json({ success: true, doctors });
});

const adminDashboard = catchAsync(async (req, res) => {
  const doctors = await doctorModel.find({});
  const users = await userModel.find({});
  const appointments = await appointmentModel.find({}).populate('docData');

  // Calculate Chart Data (Last 6 Months)
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const chartData = [];
  const today = new Date();

  // Initialize last 6 months
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    chartData.push({
      monthKey: `${d.getMonth()}-${d.getFullYear()}`, // accurate key
      name: months[d.getMonth()], // display name
      revenue: 0,
      appointments: 0
    });
  }

  appointments.forEach((appt) => {
    if (!appt.date) return;
    const d = new Date(appt.date);
    const key = `${d.getMonth()}-${d.getFullYear()}`;

    const period = chartData.find(p => p.monthKey === key);
    if (period) {
      period.appointments += 1;
      if (appt.isCompleted || appt.payment) {
        period.revenue += (appt.amount || 0);
      }
    }
  });

  // Remove helper keys before sending
  const finalChartData = chartData.map(({ monthKey, ...rest }) => rest);

  const dashData = {
    doctors: doctors.length,
    appointments: appointments.length,
    patients: users.length,
    latestAppointments: appointments.slice().reverse(),
    allAppointments: appointments,
    chartData: finalChartData
  };
  res.status(200).json({ success: true, dashData });
});

const deleteAppointment = catchAsync(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res
      .status(400)
      .json({ success: false, message: "Appointment ID is required" });
  }

  const appointment = await appointmentModel.findById(id);
  if (!appointment) {
    return res
      .status(404)
      .json({ success: false, message: "Appointment not found" });
  }

  await appointmentModel.findByIdAndDelete(id);


  if (!appointment.cancelled) {
    const { docId, slotDate, slotTime } = appointment;
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
  }

  res
    .status(200)
    .json({ success: true, message: "Appointment deleted successfully" });
});

const deleteDoctor = catchAsync(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res
      .status(400)
      .json({ success: false, message: "Doctor ID is required" });
  }

  const doctor = await doctorModel.findById(id);

  if (!doctor) {
    return res
      .status(404)
      .json({ success: false, message: "Doctor not found" });
  }

  // Check if doctor has any appointments
  const appointmentCount = await appointmentModel.countDocuments({
    docId: id,
  });

  if (appointmentCount > 0) {
    return res.status(409).json({
      success: false,
      message: `Cannot delete doctor with ${appointmentCount} appointment(s). Please cancel or complete them first.`,
    });
  }

  await doctorModel.findByIdAndDelete(id);

  res
    .status(200)
    .json({ success: true, message: "Doctor deleted successfully" });
});

// Get all appointments for a specific user
const getUserAppointments = catchAsync(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ success: false, message: "User ID is required" });
  }

  const appointments = await appointmentModel
    .find({ userId: id })
    .sort({ date: -1 })
    .populate('docData', 'name image speciality');

  res.json({ success: true, appointments });
});

export {
  addDoctor,
  loginAdmin,
  logoutAdmin,
  allDoctors,
  appointmentsAdmin,
  appointmentCancel,
  adminDashboard,
  deleteAppointment,
  deleteDoctor,
  getUserAppointments
};
