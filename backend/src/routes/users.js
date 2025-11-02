import { Router } from "express";
import authUser from "../middleware/authUser.js";
import { me } from "../controllers/authController.js";

const router = Router();

router.get("/me", authUser, me);

export default router;