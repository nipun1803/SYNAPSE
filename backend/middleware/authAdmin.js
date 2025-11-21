import jwt from "jsonwebtoken";

const authAdmin = (req, res, next) => {
  try {
    let token = req.cookies?.aToken;
    if (!token) {
      const auth = req.headers.authorization;
      if (auth && auth.startsWith('Bearer ')) token = auth.slice(7).trim();
      else if (req.headers.token) token = String(req.headers.token).trim();
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "Not authorized. Please login." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || decoded.email !== process.env.ADMIN_EMAIL) {
      return res.status(403).json({ success: false, message: "Not Authorized. Admin only." });
    }

    req.admin = decoded; 
    next();
  } catch (error) {
    console.error('authAdmin error:', error?.message || error);
    const msg = error?.name === "TokenExpiredError" 
      ? "Token expired. Please login again."
      : "Invalid or expired token";
    res.status(401).json({ success: false, message: msg });
  }
};

export default authAdmin;