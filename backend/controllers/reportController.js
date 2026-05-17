import { v2 as cloudinary } from "cloudinary";
import reportModel from "../models/reportModel.js";
import catchAsync from "../utils/catchAsync.js";
import fs from "fs";

// Upload a medical report (patient)
const uploadReport = catchAsync(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const file = req.file;
  if (!file) {
    return res.status(400).json({ success: false, message: "No file provided" });
  }

  const { description, category, appointmentId } = req.body || {};

  // Determine file type
  const mimeType = file.mimetype || '';
  let fileType = 'other';
  if (mimeType === 'application/pdf') {
    fileType = 'pdf';
  } else if (mimeType.startsWith('image/')) {
    fileType = 'image';
  }

  // Upload to Cloudinary
  let uploadResult;
  try {
    // For PDFs, using resource_type: "image" allows Cloudinary to serve them as PDF with correct headers
    // For others, "auto" is fine.
    const uploadOptions = {
      folder: `synapse/reports/${userId}`,
      resource_type: mimeType === 'application/pdf' ? 'image' : 'auto',
    };

    uploadResult = await cloudinary.uploader.upload(file.path, uploadOptions);
    
    // Clean up temp file
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    // Cleanup even on failure
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    return res.status(502).json({ success: false, message: "File upload failed" });
  }

  const report = await reportModel.create({
    userId,
    appointmentId: appointmentId || null,
    fileName: file.originalname,
    fileUrl: uploadResult.secure_url,
    fileType: mimeType === 'application/pdf' ? 'pdf' : (uploadResult.resource_type === 'image' ? 'image' : 'other'),
    cloudinaryId: uploadResult.public_id,
    cloudinaryResourceType: uploadResult.resource_type, // Storing this for reliable deletion
    description: description || '',
    category: category || 'other',
    fileSize: file.size || 0,
  });

  res.status(201).json({
    success: true,
    message: "Report uploaded successfully",
    report
  });
});

// Get all reports for the logged-in patient
const getMyReports = catchAsync(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const { category, page = 1, limit = 20 } = req.query;
  const query = { userId };
  if (category && category !== 'all') {
    query.category = category;
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const total = await reportModel.countDocuments(query);
  const reports = await reportModel
    .find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  res.json({
    success: true,
    reports,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum)
    }
  });
});

// Delete a report (patient)
const deleteReport = catchAsync(async (req, res) => {
  const userId = req.user?.id;
  const { id } = req.params;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const report = await reportModel.findById(id);
  if (!report) {
    return res.status(404).json({ success: false, message: "Report not found" });
  }

  if (report.userId.toString() !== userId) {
    return res.status(403).json({ success: false, message: "Unauthorized action" });
  }

  // Delete from Cloudinary
  if (report.cloudinaryId) {
    try {
      // Cloudinary destroy doesn't support 'auto'. Must be 'image', 'video' or 'raw'.
      // PDF and images are 'image' resource type in Cloudinary.
      const resourceType = report.cloudinaryResourceType === 'auto' || !report.cloudinaryResourceType
        ? (report.fileType === 'pdf' ? 'image' : 'image') 
        : report.cloudinaryResourceType;

      await cloudinary.uploader.destroy(report.cloudinaryId, {
        resource_type: resourceType
      });
    } catch (err) {
      console.error("Cloudinary deletion failed:", err?.message);
    }
  }

  await reportModel.findByIdAndDelete(id);

  res.json({ success: true, message: "Report deleted successfully" });
});

// Get patient reports (doctor access — via appointment relationship)
const getPatientReports = catchAsync(async (req, res) => {
  const docId = req.doctor?.id;
  const { userId } = req.params;

  if (!docId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  // Verify doctor has an appointment with this patient
  const appointmentModel = (await import("../models/appointmentmodel.js")).default;
  const hasRelationship = await appointmentModel.findOne({
    docId,
    userId,
    cancelled: false
  });

  if (!hasRelationship) {
    return res.status(403).json({
      success: false,
      message: "No appointment relationship with this patient"
    });
  }

  const reports = await reportModel
    .find({ userId })
    .sort({ createdAt: -1 });

  res.json({ success: true, reports });
});

// Admin: Get reports for any user
const getReportsForUser = catchAsync(async (req, res) => {
  const { userId } = req.params;

  const reports = await reportModel
    .find({ userId })
    .sort({ createdAt: -1 });

  const total = reports.length;

  res.json({ success: true, reports, total });
});

export {
  uploadReport,
  getMyReports,
  deleteReport,
  getPatientReports,
  getReportsForUser
};
