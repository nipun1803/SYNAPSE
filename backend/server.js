import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config.js";
import connectDB from "./src/config/mongodb.js";
import authRoutes from "./src/routes/auth.js";
import userRoutes from "./src/routes/users.js";

const app = express();
const PORT = process.env.PORT || 4000;


connectDB();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://synapse-seven-theta.vercel.app"
    ],
    credentials: true,
  })
);

app.get("/", (req, res) => res.send("Synapse API Running"));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));