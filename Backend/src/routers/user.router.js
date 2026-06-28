const { Router } = require("express");
const userRouter = Router()
const userController = require('../controllers/user.controller')
const authMiddleware = require('../middlewares/auth.middleware')

userRouter.patch(`/add-favorite/:Id`,authMiddleware.AuthenticateUser,userController.addFavoriteController)
userRouter.patch(`/add-history/:Id`,authMiddleware.AuthenticateUser,userController.addWatchHistoryController)
userRouter.patch(`/add-watchlist/:Id`,authMiddleware.AuthenticateUser,userController.addWatchlistController)
userRouter.delete(`/clear-history`,    authMiddleware.AuthenticateUser, userController.clearHistoryController); // ✅ add this


module.exports = userRouter