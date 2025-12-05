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
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const doctorList = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select("-password -email");

    res.status(200).json({ success: true, doctors });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

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
      message: `Doctor is now ${
        doctor.available ? "available" : "unavailable"
      }`,
      doctor: {
        _id: doctor._id,
        available: doctor.available,
      },
    });
  } catch (error) {
    console.error("Change availability error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to change availability",
    });
  }
};

// TODO: Add more detailed dashboard analytics
const doctorDashboard = catchAsync(async (req, res) => {
  const docId = req.doctor.id;
  const appointments = await appointmentModel.find({ docId });
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

  const dashData = {
    earnings,
    appointments: appointments.length,
    patients: patients.length,
    latestAppointments: appointments.reverse().slice(0, 5),
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

  let today = new Date();
  let allSlots = {};

  for (let i = 0; i < 7; i++) {
    let currentDate = new Date(today);
    currentDate.setDate(today.getDate() + i);

    let endTime = new Date();
    endTime.setDate(today.getDate() + i);
    endTime.setHours(21, 0, 0, 0);

    if (today.getDate() === currentDate.getDate()) {
      currentDate.setHours(
        currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10
      );
      currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0);
    } else {
      currentDate.setHours(10);
      currentDate.setMinutes(0);
    }

    let timeSlots = [];

    while (currentDate < endTime) {
      let formattedTime = currentDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      let day = currentDate.getDate();
      let month = currentDate.getMonth() + 1;
      let year = currentDate.getFullYear();
      let slotDate = `${day}_${month}_${year}`;

      const isBooked =
        doctor.slots_booked &&
        doctor.slots_booked[slotDate] &&
        doctor.slots_booked[slotDate].includes(formattedTime);

      if (!isBooked) {
        timeSlots.push({
          datetime: new Date(currentDate),
          time: formattedTime,
        });
      }

      currentDate.setMinutes(currentDate.getMinutes() + 30);
    }
  }

  res.status(200).json({ success: true, slots_booked: doctor.slots_booked });
});

export {
  loginDoctor,
  logoutDoctor,
  appointmentsDoctor,
  appointmentCancel,
  appointmentComplete,
  doctorList,
  getDoctorById,
  changeAvailability,
  doctorDashboard,
  doctorProfile,
  updateDoctorProfile,
  getDoctorAvailableSlots,
};
