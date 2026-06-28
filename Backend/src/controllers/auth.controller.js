const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/**
 * @route POST api/auth/register
 * @description Register an user to the website
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function registerController(req, res) {
  const { name, email, password } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({
      success: false,
      message: "Enter all fields correctly !",
    });
  }
  const isUserAlreadyExist = await userModel.findOne({
    email: email,
  });
  if (isUserAlreadyExist) {
    return res.status(400).json({
      message: "User already exists !",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await userModel.create({
    name: name,
    email: email,
    password: hashedPassword,
  });

  const token = jwt.sign(
    {
      name: user.name,
      id: user.id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE,
    },
  );
  res.cookie("token", token);

  return res.status(200).json({
    success: true,
    message: "User registered successfully !",
    user:{
      id:user._id,
      name:user.name,
      email:user.email
    }
  });
}

/**
 * @route POST api/auth/login
 * @description Logins the user if the user has registered
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function loginController(req, res) {
  const { email, password } = req.body;
  //Checks whether user entered something or not !
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Fill all the fields correctly !",
    });
  }
  const user = await userModel.findOne({
    email: email.toLowerCase(),
  }).select("+password");
  if (!user) {
    return res.status(400).json({
      success: false,
      message: "User doesn't exist!",
    });
  }
  if (user.isBanned) {
    return res.status(403).json({
      success: false,
      message: "User is Banned !",
    });
  }
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return res.status(400).json({
      success: false,
      message: "Incorrect email or password !",
    });
  }

  const token = jwt.sign(
    {
      name: user.name,
      id: user.id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE,
    },
  );

  res.cookie("token", token);

  return res.status(200).json({
    success: true,
    message: "Logged in successFully !",
    user:{
      id:user._id,
      name:user.name,
      email:user.email
    }
  });
}

/**
 * @route POST api/auth/logout
 * @description Logs out user
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function logoutController(req, res) {
  res.clearCookie("token");
  return res.status(201).json({
    success: true,
    message: "Logout successfully !",
  });
}

/**
 * @route POST api/auth/get-me
 * @description Fetches the current user detail
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getMeController(req, res) {
  const { name } = req.user;
  const user = await userModel.findOne({
    name:name
  })
  if(!user){
    return res.status(404).json({
        success:false,
        message:"User not found !"
    })
  }

  return res.status(200).json({
    success:true,
    message:"User details fetched successfully !",
    user
  })
}

module.exports = {
  loginController,
  registerController,
  logoutController,
  getMeController,
};
