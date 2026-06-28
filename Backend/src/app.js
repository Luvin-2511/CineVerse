/**
 * Dotenv required so we can access process.env.xyz
 */

require("dotenv").config();

/**
 * Requiring all necessary modules
 */

const express = require("express");
const cookieParser = require('cookie-parser')
const cors = require('cors')
const app = express();

/**
 * Middlewares
 */
app.use(cookieParser())
app.use(express.json())
app.use(cors({
    origin: "http://localhost:5173",
    credentials:true
}))

/**
 * Routes
 */
const authRouter = require("./routers/auth.router");
const userRouter = require("./routers/user.router");
app.use('/api/auth',authRouter)
app.use('/api/user',userRouter)

module.exports = app;
