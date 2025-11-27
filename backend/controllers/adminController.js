import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentmodel.js";
import doctorModel from "../models/doctormodel.js";
import bcrypt from "bcrypt";
import validator from "validator";
import { v2 as cloudinary } from "cloudinary";
import userModel from "../models/usermodel.js";
import getCookieOptions from "../utils/cookieUtil.js";

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign({ email, type: "admin" }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });
      res.cookie("aToken", token, getCookieOptions());

      res.status(200).json({ success: true, userType: "admin" });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const logoutAdmin = async (req, res) => {
  try {
    res.clearCookie("aToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    });

    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

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

const appointmentsAdmin = async (req, res) => {
  try {
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

    res.status(200).json({
      success: true,
      appointments: paginatedAppointments,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const appointmentCancel = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res
        .status(400)
        .json({ success: false, message: "Appointment ID is required" });
    }

    const appointment = await appointmentModel.findById(appointmentId);

    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, {
      cancelled: true,
    });
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

    const emit = req.app?.locals?.emitToAdmins;
    const updated = await appointmentModel.findById(appointmentId).lean();
    if (emit && updated) {
      emit("appointment:updated", {
        type: "appointment:updated",
        appointment: updated,
      });
      await emitCounts(emit);
    }

    res.status(200).json({ success: true, message: "Appointment Cancelled" });
  } catch (error) {
    console.log(error);

    res.status(500).json({ success: false, message: error.message });
  }
};

const addDoctor = async (req, res) => {
  try {
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
      return res
        .status(400)
        .json({ success: false, message: "Missing Details" });
    }

    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter a valid email" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter a strong password" });
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

    const doctorData = {
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
    };

    const newDoctor = new doctorModel(doctorData);
    await newDoctor.save();

    const emit = req.app?.locals?.emitToAdmins;
    if (emit) {
      const doc = newDoctor.toObject();
      delete doc.password;
      emit("doctor:created", { type: "doctor:created", doctor: doc });
      await emitCounts(emit);
    }
    res.status(201).json({ success: true, message: "Doctor Added" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const allDoctors = async (req, res) => {
  try {
    const doctors = await doctorModel.find().select("-password");

    res.status(200).json({ success: true, doctors });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const adminDashboard = async (req, res) => {
  try {
    const doctors = await doctorModel.find({});
    const users = await userModel.find({});
    const appointments = await appointmentModel.find({});

    const dashData = {
      doctors: doctors.length,
      appointments: appointments.length,
      patients: users.length,
      latestAppointments: appointments.slice().reverse(),
    };
    res.status(200).json({ success: true, dashData });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteAppointment = async (req, res) => {
  try {
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

    // Also free up the slot if it wasn't cancelled
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
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteDoctor = async (req, res) => {
  try {
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
  } catch (error) {
    console.log("deleteDoctor error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

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
};
