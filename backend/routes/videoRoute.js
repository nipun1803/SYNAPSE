import express from "express";
import authCombined from "../middleware/authCombined.js";
import {
  generateStreamToken,
  endStreamCall,
} from "../controllers/streamVideoController.js";

const router = express.Router();

// POST /api/video/token — Generate Stream Video token
// Uses combined auth so both users and doctors can request tokens
router.post("/token", authCombined, generateStreamToken);

// POST /api/video/end — End a video call
router.post("/end", authCombined, endStreamCall);

export default router;
