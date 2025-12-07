import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    docId: { type: mongoose.Schema.Types.ObjectId, ref: 'doctor', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    userData: {
        name: { type: String, required: true },
        image: { type: String }
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    date: { type: Number, required: true }
})

const reviewModel = mongoose.models.review || mongoose.model('review', reviewSchema)

export default reviewModel
