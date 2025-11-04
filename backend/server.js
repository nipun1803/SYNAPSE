import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config.js";
import connectDB from "./src/config/mongodb.js";
import authRoutes from "./src/routes/auth.js";
import userRoutes from "./src/routes/users.js";

const app = express();
const PORT = process.env.PORT || 4000;

// Connect to DB
connectDB();

app.use(express.json());
app.use(cookieParser());

//  CORS (use env-configured frontend origin)
const allowedOrigins = [
  "http://localhost:5173",
  "https://synapse-seven-theta.vercel.app",
  "https://synapse-3bauz8ecu-nipuns-projects-01a674c1.vercel.app", // your new frontend URL
];


app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

//  Handle OPTIONS preflight globally
app.options("*", cors({
  origin: allowedOrigin,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));


app.get("/", (req, res) => res.send(" Synapse API Running with CORS configured"));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);


app.listen(PORT, () => console.log(` Server running on port ${PORT}`));