import doctorModel from "../models/doctormodel.js";
import appointmentModel from "../models/appointmentmodel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import getCookieOptions from "../utils/cookieUtil.js";
import catchAsync from "../utils/catchAsync.js";



const loginDoctor = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const doctor = await doctorModel.findOne({ email });
  if (!doctor) {
    return res.status(404).json({
      success: false,
      message: "Doctor not found"
    });
  }

  const passwordMatch = await bcrypt.compare(password, doctor.password);
  if (!passwordMatch) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials"
    });
  }

  const token = jwt.sign(
    { id: doctor._id, role: "doctor", email: doctor.email, type: "doctor" },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie("dToken", token, getCookieOptions());
  res.json({ success: true, userType: "doctor" });
});

const logoutDoctor = catchAsync(async (req, res) => {
  res.clearCookie("dToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });

  res.status(200).json({ success: true, message: "Logged out successfully" });
});

// appointments for the doctor

const appointmentsDoctor = catchAsync(async (req, res) => {
  const docId = req.doctor.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const { status, search } = req.query;
  let query = { docId };

  // Filtering
  if (status === 'upcoming') {
    query.cancelled = false;
    query.isCompleted = false;
  } else if (status === 'completed') {
    query.isCompleted = true;
  } else if (status === 'cancelled') {
    query.cancelled = true;
  }

  // Searching
  if (search) {
    query['userData.name'] = { $regex: search, $options: 'i' };
  }

  const total = await appointmentModel.countDocuments(query);
  const appointments = await appointmentModel
    .find(query)
    .sort({ date: -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    success: true,
    appointments,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  });
});


// cancel appointment from doctor side
const appointmentCancel = catchAsync(async (req, res) => {
  const docId = req.doctor.id;
  const { appointmentId } = req.body;
  const apt = await appointmentModel.findById(appointmentId);

  if (apt && apt.docId.toString() === docId) {
    await appointmentModel.findByIdAndUpdate(appointmentId, {
      cancelled: true,
    });
    return res.json({
      success: true,
      message: "Appointment Cancelled"
    });
  }

  res.status(403).json({
    success: false,
    message: "Unable to cancel appointment"
  });
});

const appointmentComplete = catchAsync(async (req, res) => {
  const docId = req.doctor.id;
  const { appointmentId } = req.body;
  const appointmentData = await appointmentModel.findById(appointmentId);

  if (appointmentData && appointmentData.docId.toString() === docId) {
    await appointmentModel.findByIdAndUpdate(appointmentId, {
      isCompleted: true,
      payment: true,
      paymentStatus: 'completed'
    });

    return res
      .status(200)
      .json({ success: true, message: "Appointment Completed" });
  }

  res
    .status(403)
    .json({ success: false, message: "Unable to complete appointment" });
});

const doctorList = catchAsync(async (req, res) => {
  const { page = 1, limit = 6, search, speciality, sort } = req.query;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const query = {};

  if (speciality && speciality.trim()) {
    query.speciality = { $regex: new RegExp(`^${speciality.trim()}$`, 'i') };
  }

  if (search && search.trim()) {
    query.name = { $regex: search.trim(), $options: 'i' };
  }

  let sortObj = {};
  if (sort) {
    switch (sort) {
      case 'fees_asc':
        sortObj.fees = 1;
        break;
      case 'fees_desc':
        sortObj.fees = -1;
        break;
      case 'experience_asc':
        sortObj.experience = 1;
        break;
      case 'experience_desc':
        sortObj.experience = -1;
        break;
      default:
        sortObj._id = 1;
    }
  } else {
    sortObj._id = 1;
  }

  const total = await doctorModel.countDocuments(query);

  const doctors = await doctorModel
    .find(query)
    .select("-password -email")
    .sort(sortObj)
    .skip(skip)
    .limit(limitNum);

  res.status(200).json({
    success: true,
    doctors,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    },
  });
});

const changeAvailability = catchAsync(async (req, res) => {
  const docId = req.params.id || req.body?.docId;

  if (!docId) {
    return res.status(400).json({
      success: false,
      message: "Doctor ID is required",
    });
  }

  const doctor = await doctorModel.findById(docId);

  if (!doctor) {
    return res.status(404).json({
      success: false,
      message: "Doctor not found",
    });
  }

  doctor.available = !doctor.available;
  await doctor.save();

  const emit = req.app?.locals?.emitToAdmins;
  if (emit) {
    emit("doctor:updated", {
      type: "doctor:updated",
      doctor: doctor.toObject(),
    });
  }

  res.status(200).json({
    success: true,
    message: `Doctor is now ${doctor.available ? "available" : "unavailable"
      }`,
    doctor: {
      _id: doctor._id,
      available: doctor.available,
    },
  });
});

// TODO: Add more detailed dashboard analytics
const doctorDashboard = catchAsync(async (req, res) => {
  const docId = req.doctor.id;
  const appointments = await appointmentModel.find({ docId }).populate('userData').populate('docData');
  let earnings = 0;
  appointments.forEach((item) => {
    if (item.isCompleted || item.payment) {
      earnings += item.amount;
    }
  });

  let patients = [];
  appointments.forEach((item) => {
    if (!patients.includes(item.userId)) {
      patients.push(item.userId);
    }
  });

  // Chart Data (Last 6 Months)
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const chartData = [];
  const today = new Date();

  // Initialize last 6 months
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    chartData.push({
      monthKey: `${d.getMonth()}-${d.getFullYear()}`,
      name: months[d.getMonth()],
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

  const finalChartData = chartData.map(({ monthKey, ...rest }) => rest);

  const dashData = {
    earnings,
    appointments: appointments.length,
    patients: patients.length,
    latestAppointments: appointments.reverse().slice(0, 5),
    allAppointments: appointments,
    chartData: finalChartData
  };

  res.json({ success: true, dashData });
});

const doctorProfile = catchAsync(async (req, res) => {
  const docId = req.doctor.id;
  const profileData = await doctorModel.findById(docId).select("-password");
  res.status(200).json({ success: true, profileData });
});

const updateDoctorProfile = catchAsync(async (req, res) => {
  const docId = req.doctor.id;
  const { fees, address, available, about, name, phone } = req.body;

  const updateData = { fees, address, available, about };
  if (name) updateData.name = name;
  if (phone) updateData.phone = phone;

  await doctorModel.findByIdAndUpdate(docId, updateData);

  res.json({ success: true, message: "Profile Updated" });
});

const getDoctorAvailableSlots = catchAsync(async (req, res) => {
  const { id } = req.params;
  const doctor = await doctorModel.findById(id);

  if (!doctor) {
    return res
      .status(404)
      .json({ success: false, message: "Doctor not found" });
  }

  // Return both the slots the doctor has opened (available_slots) 
  // and the slots that are already booked (slots_booked)
  res.status(200).json({
    success: true,
    slots_booked: doctor.slots_booked || {},
    available_slots: doctor.available_slots || {}
  });
});

// Get doctor's own available slots configuration
const getMyAvailableSlots = catchAsync(async (req, res) => {
  const docId = req.doctor.id;
  const doctor = await doctorModel.findById(docId);

  if (!doctor) {
    return res.status(404).json({ success: false, message: "Doctor not found" });
  }

  res.status(200).json({
    success: true,
    available_slots: doctor.available_slots || {},
    slots_booked: doctor.slots_booked || {}
  });
});

// Update doctor's available slots (for one week only)
const updateDoctorSlots = catchAsync(async (req, res) => {
  const docId = req.doctor.id;
  const { available_slots } = req.body;

  if (!available_slots || typeof available_slots !== 'object') {
    return res.status(400).json({
      success: false,
      message: "Invalid slots data"
    });
  }

  // Validate that slots are within the next 7 days only
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + 7);

  const validatedSlots = {};

  for (const dateKey of Object.keys(available_slots)) {
    // Parse date key (DD_MM_YYYY format)
    const [day, month, year] = dateKey.split('_').map(n => parseInt(n, 10));
    const slotDate = new Date(year, month - 1, day);

    // Only allow slots within the next 7 days
    if (slotDate >= today && slotDate < maxDate) {
      validatedSlots[dateKey] = available_slots[dateKey];
    }
  }

  await doctorModel.findByIdAndUpdate(docId, { available_slots: validatedSlots });

  res.status(200).json({
    success: true,
    message: "Slots updated successfully",
    available_slots: validatedSlots
  });
});

// Get single appointment by ID for doctor
const getAppointmentById = catchAsync(async (req, res) => {
  const docId = req.doctor.id;
  const { id } = req.params;

  const appointment = await appointmentModel.findOne({ _id: id, docId });

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: "Appointment not found or access denied"
    });
  }

  res.json({ success: true, appointment });
});

export {
  loginDoctor,
  logoutDoctor,
  appointmentsDoctor,
  appointmentCancel,
  appointmentComplete,
  doctorList,
  changeAvailability,
  doctorDashboard,
  doctorProfile,
  updateDoctorProfile,
  getDoctorAvailableSlots,
  getMyAvailableSlots,
  updateDoctorSlots,
  getAppointmentById,
};
