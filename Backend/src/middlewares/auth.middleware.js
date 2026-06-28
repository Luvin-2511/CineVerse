const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
/**
 * @route Middleware
 * @description Checks whether user is authenticated or not
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function AuthenticateUser(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    res.status(403).json({
      success: false,
      message: "Unauthorized User !",
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    const user = await userModel.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }

    if (user.isBanned) {
      return res.status(403).json({ message: "Your account has been banned." });
    }
    next();
  } catch (err) {
    return res.status(401).json({
      message: "Unauthorized User !",
    });
  }
}

/**
 * @route Middleware
 * @description Checks whether user is admin or not
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function isAdminOnly(req, res, next) {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({
      message: "You are not the admin",
    });
  }
}

module.exports = { AuthenticateUser, isAdminOnly };
