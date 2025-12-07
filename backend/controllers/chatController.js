import chatModel from "../models/chatModel.js";
import catchAsync from "../utils/catchAsync.js";

// Fetch chat history for a specific appointment
const getChatHistory = catchAsync(async (req, res) => {
    const { appointmentId } = req.params;

    if (!appointmentId) {
        return res.status(400).json({ success: false, message: "Appointment ID is required" });
    }

    const chats = await chatModel
        .find({ appointmentId })
        .sort({ createdAt: 1 }); // Oldest first

    res.json({ success: true, chats });
});

// Mark messages as read (optional API endpoint, can also be done via socket)
const markChatRead = catchAsync(async (req, res) => {
    const { appointmentId, userId, role } = req.body; // userId is the one READING the message

    // Update all messages in this appointment where receiverId is the current user and isRead is false
    await chatModel.updateMany(
        { appointmentId, receiverId: userId, isRead: false },
        { isRead: true }
    );

    res.json({ success: true, message: "Messages marked as read" });
});

export { getChatHistory, markChatRead };
