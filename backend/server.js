import express from "express";
import cors from "cors";
import "dotenv/config.js";
import connectDB from "./src/config/mongodb.js";
import authRoutes from "./src/routes/auth.js";
import userRoutes from "./src/routes/users.js";

const app = express();
const PORT = process.env.PORT || 4000;

connectDB();

app.use(express.json());
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:5173"],
    credentials: true,
  })
);

// Health
app.get("/", (req, res) => res.send("API is running"));

// v1 APIs
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));