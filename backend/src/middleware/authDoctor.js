import jwt from "jsonwebtoken";

const authDoctor = (req, res, next) => {
  try {
    const token = req.cookies?.doctor_token;
    if (!token)
      return res.status(401).json({ message: "Doctor not authorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.doctor = decoded;
    next();
  } catch {
    return res.status(403).json({ message: "Invalid doctor token" });
  }
};

export default authDoctor;