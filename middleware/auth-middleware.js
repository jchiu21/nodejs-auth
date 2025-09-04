const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided. Please login to continue.",
    });
  }
  // decode token
  try {
    // .verify() throws an error if JWT is invalid
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // Attach decoded user info to req object, makes it available to subsequent middleware
    req.userInfo = decodedToken;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Access denied. Invalid token. Please login to continue.",
    });
  }
};

module.exports = authMiddleware;
