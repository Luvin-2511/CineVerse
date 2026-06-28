const { Router } = require('express')
const authMiddleware = require('../middlewares/auth.middleware')
const authController = require('../controllers/auth.controller')
const authRouter = Router()

authRouter.post('/login',authController.loginController)
authRouter.post('/register',authController.registerController)
authRouter.post('/logout',authMiddleware.AuthenticateUser,authController.logoutController)
authRouter.get('/get-me',authMiddleware.AuthenticateUser,authController.getMeController)

module.exports = authRouter