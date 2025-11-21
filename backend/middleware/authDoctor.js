import jwt from "jsonwebtoken";

const authDoctor = (req, res, next) => {
  try {
    // Read from cookie first, fallback to header
    let token = req.cookies?.dToken;
    
    if (!token) {
      const auth = req.headers.authorization;
      if (auth && auth.startsWith('Bearer ')) token = auth.slice(7).trim();
      else if (req.headers.token) token = String(req.headers.token).trim();
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "Not authorized. Please login." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.id) {
      return res.status(403).json({ success: false, message: "Not Authorized." });
    }

    req.doctor = decoded;
    next();
  } catch (error) {
    console.error('authDoctor error:', error?.message || error);
    const msg = error?.name === "TokenExpiredError"
      ? "Token expired. Please login again."
      : "Invalid or expired token";
    res.status(401).json({ success: false, message: msg });
  }
};

export default authDoctor;