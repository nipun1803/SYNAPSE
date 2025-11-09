import express from "express";
import { me } from "../controllers/authController.js";
import authUser from "../middleware/authuser.js";

const router = express.Router();

router.get("/me", authUser, me);

export default router;