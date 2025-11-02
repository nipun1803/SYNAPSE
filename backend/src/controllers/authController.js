import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

export const register = async (req, res) => {
  try {
    const { name, email, password, role = "user" } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: { message: "Missing required fields" } });
    }
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: { message: "Email already in use" } });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role });

    const token = signToken({ id: user._id, role: user.role });
    return res.status(201).json({ token, user: { id: user._id, name, email, role } });
  } catch (err) {
    return res.status(500).json({ error: { message: err.message } });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: { message: "Missing email or password" } });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: { message: "Invalid credentials" } });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: { message: "Invalid credentials" } });

    const token = signToken({ id: user._id, role: user.role });
    return res.json({ token, user: { id: user._id, name: user.name, email, role: user.role } });
  } catch (err) {
    return res.status(500).json({ error: { message: err.message } });
  }
};

export const me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ error: { message: "User not found" } });
    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ error: { message: err.message } });
  }
};