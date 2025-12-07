import express from 'express';
import { getChatHistory, markChatRead } from '../controllers/chatController.js';
import authCombined from '../middleware/authCombined.js';

// Chat routes protected by combined auth (accessible by both users and doctors)
const chatRouter = express.Router();

chatRouter.get('/history/:appointmentId', authCombined, getChatHistory);
chatRouter.post('/read', authCombined, markChatRead);

export default chatRouter;
