import reviewModel from "../models/reviewModel.js";
import doctorModel from "../models/doctormodel.js";
import userModel from "../models/usermodel.js";
import catchAsync from "../utils/catchAsync.js";

// Add a review
const addReview = catchAsync(async (req, res) => {
    const { docId, rating, comment } = req.body;
    const userId = req.user.id;

    const user = await userModel.findById(userId);
    const doctor = await doctorModel.findById(docId);

    if (!doctor) {
        return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    const reviewData = {
        docId,
        userId,
        userData: {
            name: user.name,
            image: user.image
        },
        rating: Number(rating),
        comment,
        date: Date.now()
    };

    const newReview = new reviewModel(reviewData);
    await newReview.save();

    // Update doctor's average rating
    const reviews = await reviewModel.find({ docId });
    const totalRating = reviews.reduce((acc, item) => acc + item.rating, 0);
    const avgRating = totalRating / reviews.length;

    await doctorModel.findByIdAndUpdate(docId, {
        rating: avgRating,
        reviewCount: reviews.length
    });

    res.json({ success: true, message: "Review added successfully" });
});

// Get reviews for a doctor
const getDoctorReviews = catchAsync(async (req, res) => {
    const { docId } = req.params;

    const reviews = await reviewModel.find({ docId }).sort({ date: -1 });

    res.json({ success: true, reviews });
});

export { addReview, getDoctorReviews };
