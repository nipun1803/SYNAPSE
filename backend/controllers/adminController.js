import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentmodel.js";
import doctorModel from "../models/doctormodel.js";
import bcrypt from "bcrypt";
import validator from "validator";
import { v2 as cloudinary } from "cloudinary";
import userModel from "../models/usermodel.js";

const shouldUseSecureCookies = (() => {
  const isProd = process.env.NODE_ENV === 'production';
  const isLocalHost = [process.env.FRONTEND_URL, process.env.ADMIN_URL]
    .filter(Boolean)
    .some((url) => url.includes('localhost') || url.includes('127.0.0.1'));
  if (process.env.COOKIE_SECURE?.toLowerCase() === 'true') return true;
  if (process.env.COOKIE_SECURE?.toLowerCase() === 'false') return false;
  return isProd && !isLocalHost;
})();

const getCookieOptions = () => ({
  httpOnly: true,
  secure: shouldUseSecureCookies,
  sameSite: shouldUseSecureCookies ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
});

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign({ email, type: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1d' });
      res.cookie('aToken', token, getCookieOptions());
      
      res.status(200).json({ success: true, userType: 'admin' });
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
    res.clearCookie('aToken', { path: '/' });
    
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
    const appointments = await appointmentModel.find({}).sort({ date: -1, _id: -1 });
    
    res.status(200).json({ success: true, appointments });
  } catch (error) {
    console.log(error);

    res.status(500).json({ success: false, message: error.message });
  }
};

const appointmentCancel = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    
    if (!appointmentId) {
      return res.status(400).json({ success: false, message: "Appointment ID is required" });
    }
    
    const appointment = await appointmentModel.findById(appointmentId);
    
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }
    
    await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });

    const emit = req.app?.locals?.emitToAdmins;
    const updated = await appointmentModel.findById(appointmentId).lean();
    if (emit && updated) {
      emit("appointment:updated", { type: "appointment:updated", appointment: updated });
      await emitCounts(emit);
    }

    res.status(200).json({ success: true, message: 'Appointment Cancelled' });
  } catch (error) {
    console.log(error);

    res.status(500).json({ success: false, message: error.message });
  }
};

const addDoctor = async (req, res) => {
  try {
    const { name, email, password, speciality, degree, experience, about, fees, address } = req.body;
    const imageFile = req.file;

    if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address) {
      return res.status(400).json({ success: false, message: "Missing Details" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Please enter a valid email" });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Please enter a strong password" });
    }

    const exists = await doctorModel.findOne({ email });
  
    if (exists) {
      return res.status(409).json({ success: false, message: "Doctor already exists with this email" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let imageUrl = "";
    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
      imageUrl = imageUpload.secure_url;
    }

    let parsedAddress = typeof address === "string" ? JSON.parse(address) : address;

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
    res.status(201).json({ success: true, message: 'Doctor Added' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const allDoctors = async (req, res) => {
  try {
    const doctors = await doctorModel.find().select('-password');
    
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
      latestAppointments: appointments.slice().reverse()
    };
    res.status(200).json({ success: true, dashData });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  loginAdmin,
  logoutAdmin,
  appointmentsAdmin,
  appointmentCancel,
  addDoctor,
  allDoctors,
  adminDashboard
};