import jwt from "jsonwebtoken";

// Combined authentication middleware
// Checks for BOTH user and doctor tokens and populates req.user and req.doctor accordingly
const authCombined = async (req, res, next) => {
    try {
        let userToken = req.cookies?.token;
        let doctorToken = req.cookies?.dToken;

        // Header fallbacks
        if (!userToken && !doctorToken) {
            const auth = req.headers.authorization;
            if (auth && auth.startsWith("Bearer ")) {
                // Ambiguous if using Bearer token, assume it could be either? 
                // For now, let's assume Bearer is mostly used for one or the other in specific contexts.
                // But here we rely on cookies primarily.
                userToken = auth.slice(7).trim();
            } else if (req.headers.token) {
                userToken = String(req.headers.token).trim();
            }

            // Note: dToken header fallback is tricky if they share the same header name.
            // Assuming cookies are the primary method for this web app.
            if (req.headers.dtoken) {
                doctorToken = String(req.headers.dtoken).trim();
            }
        }

        let authenticated = false;

        // Verify User Token
        if (userToken) {
            try {
                const decodedUser = jwt.verify(userToken, process.env.JWT_SECRET);
                if (decodedUser?.id) {
                    req.user = { id: decodedUser.id };
                    authenticated = true;
                }
            } catch (e) {
                // Ignore invalid user token, just don't set req.user
            }
        }

        // Verify Doctor Token
        if (doctorToken) {
            try {
                const decodedDoctor = jwt.verify(doctorToken, process.env.JWT_SECRET);
                if (decodedDoctor?.id) {
                    req.doctor = { id: decodedDoctor.id };
                    authenticated = true;
                }
            } catch (e) {
                // Ignore invalid doctor token, just don't set req.doctor
            }
        }

        if (!authenticated) {
            return res.status(401).json({ success: false, message: "Not authorized. Please login." });
        }

        next();

    } catch (error) {
        console.error("Auth Combined failed:", error);
        res.status(401).json({ success: false, message: "Authentication failed" });
    }
};

export default authCombined;
