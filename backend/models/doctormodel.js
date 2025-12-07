import mongoose from "mongoose";

// FIXME: Consider adding specialization subcategories
const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  image: { type: String, default: "" },
  password: { type: String, required: true },
  speciality: { type: String, required: true },
  degree: { type: String, required: true },
  experience: { type: String, required: true },
  about: { type: String, required: true },
  fees: { type: Number, required: true },
  address: { type: Object, required: true },
  available: { type: Boolean, default: true },
  // Slots that have been booked by patients: { "DD_MM_YYYY": ["10:00 AM", "11:30 AM"] }
  slots_booked: { type: Object, default: {} },
  // Slots that the doctor has opened for booking (1 week only): { "DD_MM_YYYY": ["10:00 AM", "10:30 AM", ...] }
  available_slots: { type: Object, default: {} },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  date: { type: Number, required: true },
});

const doctorModel = mongoose.models.doctor || mongoose.model("doctor", doctorSchema);
export default doctorModel;