import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'appointment',
    default: null
  },
  fileName: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    enum: ['pdf', 'image', 'other'],
    required: true
  },
  // Cloudinary public_id for deletion
  cloudinaryId: {
    type: String,
    default: null
  },
  cloudinaryResourceType: {
    type: String,
    default: 'auto'
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: ['lab_report', 'prescription', 'imaging', 'discharge_summary', 'other'],
    default: 'other'
  },
  fileSize: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Index for efficient queries
reportSchema.index({ userId: 1, createdAt: -1 });

const reportModel = mongoose.models.report || mongoose.model("report", reportSchema);
export default reportModel;
