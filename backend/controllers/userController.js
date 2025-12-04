import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import userModel from "../models/usermodel.js";
import doctorModel from "../models/doctormodel.js";
import appointmentModel from "../models/appointmentmodel.js";
import { v2 as cloudinary } from "cloudinary";

import getCookieOptions from "../utils/cookieUtil.js";

const parseSlotToDate = (slotDate, slotTime) => {
  try {
    const [d, m, y] = slotDate.split("_").map((n) => parseInt(n, 10));
    const date = new Date(y, m - 1, d);

    if (slotTime) {
      const [hm, ampm] = slotTime.split(" ");
      let [hh, mm] = hm.split(":").map((n) => parseInt(n, 10));
      if (ampm?.toUpperCase() === "PM" && hh < 12) hh += 12;
      if (ampm?.toUpperCase() === "AM" && hh === 12) hh = 0;
      date.setHours(hh, mm || 0, 0, 0);
    } else {
      date.setHours(0, 0, 0, 0);
    }
    return date;
  } catch {
    return null;
  }
};

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
    console.error("emitCounts error:", e?.message || e);
  }
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
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
    const existing = await userModel.findOne({ email });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const created = await userModel.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { id: created._id, type: "user" },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.cookie("token", token, getCookieOptions());
    res.status(201).json({ success: true, userType: "user" });
  } catch (error) {
    console.log("registerUser error:", error);

    res.status(500).json({ success: false, message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    const user = await userModel.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password || "", user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, type: "user" },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.cookie("token", token, getCookieOptions());

    res.status(200).json({ success: true, userType: "user" });
  } catch (error) {
    console.log("loginUser error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const unifiedLogin = async (req, res) => {
  try {
    const { email, password, userType } = req.body || {};

    if (!email || !password || !userType) {
      return res
        .status(400)
        .json({ success: false, message: "Missing Details" });
    }

    if (userType === "admin") {
      if (
        email === process.env.ADMIN_EMAIL &&
        password === process.env.ADMIN_PASSWORD
      ) {
        const token = jwt.sign(
          { email, type: "admin" },
          process.env.JWT_SECRET,
          {
            expiresIn: "1d",
          }
        );
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

    return res
      .status(400)
      .json({ success: false, message: "Invalid user type" });
  } catch (error) {
    console.log("unifiedLogin error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const logoutUser = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    });

    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.log("logoutUser error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const userData = await userModel.findById(userId).select("-password");

    if (!userData) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, userData });
  } catch (error) {
    console.log("getProfile error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { name, phone, address, dob, gender, weight } = req.body || {};
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
    if (weight) {
      update.weight = parseFloat(weight) || null;
    }

    await userModel.findByIdAndUpdate(userId, update);

    if (imageFile) {
      const uploaded = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
      });
      await userModel.findByIdAndUpdate(userId, { image: uploaded.secure_url });
    }
    res.status(200).json({ success: true, message: "Profile Updated" });
  } catch (error) {
    console.log("updateProfile error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const bookAppointment = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { docId, slotDate, slotTime } = req.body || {};

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!docId || !slotDate || !slotTime) {
      return res
        .status(400)
        .json({ success: false, message: "Missing appointment details" });
    }

    const docData = await doctorModel.findById(docId).select("-password");

    if (!docData) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }

    if (!docData.available) {
      return res
        .status(400)
        .json({ success: false, message: "Doctor Not Available" });
    }

    const slotDateTime = parseSlotToDate(slotDate, slotTime);
    if (!slotDateTime || slotDateTime < new Date()) {
      return res
        .status(400)
        .json({ success: false, message: "Cannot book a past time" });
    }

    const slots_booked = docData.slots_booked || {};
    if (slots_booked[slotDate]) {
      if (
        Array.isArray(slots_booked[slotDate]) &&
        slots_booked[slotDate].includes(slotTime)
      ) {
        return res
          .status(409)
          .json({ success: false, message: "Slot Not Available" });
      } else if (Array.isArray(slots_booked[slotDate])) {
        slots_booked[slotDate].push(slotTime);
      } else {
        slots_booked[slotDate] = [slotTime];
      }
    } else {
      slots_booked[slotDate] = [slotTime];
    }

    const userData = await userModel.findById(userId).select("-password");

    const docObj = docData.toObject();
    delete docObj.slots_booked;

    const appointmentData = {
      userId,
      docId,
      userData,
      docData: docObj,
      amount: docData.fees,
      slotTime,
      slotDate,
      date: Date.now(),
    };

    const newAppointment = new appointmentModel(appointmentData);
    await newAppointment.save();

    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    const emit = req.app?.locals?.emitToAdmins;
    if (emit) {
      emit("appointment:created", {
        type: "appointment:created",
        appointment: newAppointment.toObject(),
      });
      await emitCounts(emit);
    }
    res.status(201).json({ success: true, message: "Appointment Booked" });
  } catch (error) {
    console.log("bookAppointment error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const cancelAppointment = async (req, res) => {
  try {
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
  } catch (error) {
    console.log("cancelAppointment error:", error);

    res.status(500).json({ success: false, message: error.message });
  }
};

const rescheduleAppointment = async (req, res) => {
  try {
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

    // Check if new slot is available
    if (slots_booked[slotDate]?.includes(slotTime)) {
      return res
        .status(409)
        .json({ success: false, message: "Slot already booked" });
    }

    // Free old slot
    if (Array.isArray(slots_booked[oldSlotDate])) {
      slots_booked[oldSlotDate] = slots_booked[oldSlotDate].filter(
        (e) => e !== oldSlotTime
      );
    }

    // Book new slot
    if (slots_booked[slotDate]) {
      slots_booked[slotDate].push(slotTime);
    } else {
      slots_booked[slotDate] = [slotTime];
    }
    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    // Updating the appointment
    await appointmentModel.findByIdAndUpdate(appointmentId, {
      slotDate,
      slotTime,
      date: Date.now(),
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
  } catch (error) {
    console.log("rescheduleAppointment error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const listAppointment = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { page = 1, limit = 10 } = req.query;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const appointments = await appointmentModel
      .find({ userId })
      .sort({ date: -1, _id: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await appointmentModel.countDocuments({ userId });

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
  } catch (error) {
    console.log("listAppointment error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAppointmentById = async (req, res) => {
  try {
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
  } catch (error) {
    console.log("getAppointmentById error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Delete all appointments associated with the user
    await appointmentModel.deleteMany({ userId });

    // Delete the user
    await userModel.findByIdAndDelete(userId);

    // Clear cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    });

    res.status(200).json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    console.log("deleteAccount error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteAppointment = async (req, res) => {
  try {
    const userId = req.user?.id;
    const appointmentId = req.params.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!appointmentId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing appointmentId" });
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

    // Free the slot if appointment is not cancelled
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

    await appointmentModel.findByIdAndDelete(appointmentId);

    const emit = req.app?.locals?.emitToAdmins;
    if (emit) {
      emit("appointment:deleted", {
        type: "appointment:deleted",
        appointmentId,
      });
    }

    res.status(200).json({ success: true, message: "Appointment deleted successfully" });
  } catch (error) {
    console.log("deleteAppointment error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

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
  deleteAccount,
  deleteAppointment,
};
