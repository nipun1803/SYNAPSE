import jwt from "jsonwebtoken";

const authUser = (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    const token = auth && auth.startsWith("Bearer ") ? auth.slice(7).trim() : null;
    if (!token) return res.status(401).json({ error: { message: "No token provided" } });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.id) return res.status(401).json({ error: { message: "Invalid token" } });

    req.user = { id: decoded.id, role: decoded.role || decoded.type || "user" };
    next();
  } catch (err) {
    const msg = err.name === "TokenExpiredError" ? "Token expired" : "Authentication failed";
    return res.status(401).json({ error: { message: msg } });
  }
};

export default authUser;