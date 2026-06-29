/**
 * Dotenv required so we can access process.env.xyz
 */

require("dotenv").config();

/**
 * Requiring all necessary modules
 */
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();

/**
 * Middlewares
 */
app.use(cookieParser());
app.use(express.json());
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URI,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. curl, Postman, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  }),
);

/**
 * Health check Route
 */
app.get("/", (req, res) => {
  console.log("Perfectly Working !");
});

/**
 * Routes
 */
const authRouter = require("./routers/auth.router");
const userRouter = require("./routers/user.router");
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

module.exports = app;
