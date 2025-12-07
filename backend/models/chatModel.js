import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'appointment',
        required: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    senderModel: {
        type: String,
        required: true,
        enum: ['user', 'doctor']
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    receiverModel: {
        type: String,
        required: true,
        enum: ['user', 'doctor']
    },
    message: {
        type: String,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    image: {
        type: String, // URL for image attachments if we add them later
        default: ""
    }
}, { timestamps: true });

const chatModel = mongoose.models.chat || mongoose.model("chat", chatSchema);

export default chatModel;
