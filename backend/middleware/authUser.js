import jwt from "jsonwebtoken";

// User authentication middleware
// Checks for token in cookies first, then falls back to headers
const authUser = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    if (!token) {
      const auth = req.headers.authorization;
      if (auth && auth.startsWith("Bearer ")) {
        token = auth.slice(7).trim();
      } else if (req.headers.token) {
        token = String(req.headers.token).trim();
      }
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Please login."
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token"
      });
    }

    req.user = { id: decoded.id };
    next();
  } catch (error) {
    console.error("Auth failed:", error?.message || error);
    const msg =
      error?.name === "JsonWebTokenError"
        ? "Invalid token signature"
        : error?.name === "TokenExpiredError"
          ? "Token expired. Please login again."
          : "Authentication failed";
    res.status(401).json({ success: false, message: msg });
  }
};

export default authUser;