const isAdmin = (req, res, next) => {
  // since we did req.userInfo = decodedTokenInfo in auth middleware,
  // we can access .userInfo in req now
  if (req.userInfo.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied! Admin rights required.",
    });
  }

  next();
};

module.exports = isAdmin;
