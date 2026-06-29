const userModel = require("../models/user.model");

async function addFavoriteController(req, res) {
  const { Id } = req.params;
  const { id } = req.user;
  const { title, posterPath, mediaType, year, rating } = req.body;

  if (!Id) {
    return res.status(400).json({ success: false, message: "No movie found!" });
  }

  try {
    const user = await userModel.findById(id); 

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isAlreadyFavorite = user.favorites.some((fav) => fav.movieId === Id); 

    let updatedUser;

    if (isAlreadyFavorite) {
      updatedUser = await userModel.findByIdAndUpdate(
        id,
        { $pull: { favorites: { movieId: Id } } },
        { new: true }
      );
      return res.status(200).json({
        success: true,
        message: "Removed from favorites",
        data: updatedUser.favorites,
      });
    } else {
      updatedUser = await userModel.findByIdAndUpdate(
        id,
        {
          $push: {
            favorites: {
              movieId: Id,
              title,
              posterPath,
              mediaType,
              year,
              rating,
              addedAt: new Date(),
            },
          },
        },
        { new: true }
      );
      return res.status(200).json({
        success: true,
        message: "Added to favorites",
        data: updatedUser,
      });
    }
  } catch (error) {
    console.error(error); 
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

async function addWatchHistoryController(req, res) {
  const { Id } = req.params;
  const { id } = req.user;
  const { title, posterPath, mediaType, year } = req.body;

  if (!Id) {
    return res.status(400).json({ success: false, message: "No movie found!" });
  }

  try {
    await userModel.findByIdAndUpdate(id, {
      $pull: { watchHistory: { movieId: Id } },
    });

    const user = await userModel.findByIdAndUpdate(
      id,
      {
        $push: {
          watchHistory: {
            $each: [{ movieId: Id, title, posterPath, mediaType, year, watchedAt: new Date() }],
            $position: 0,
          },
        },
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Watch history updated",
      data: user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

async function addWatchlistController(req, res) {
  const { Id } = req.params;
  const { id } = req.user;
  const { title, posterPath, mediaType, year, rating } = req.body;

  if (!Id) {
    return res.status(400).json({ success: false, message: "No movie found!" });
  }

  try {
    const user = await userModel.findById(id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const exists = user.watchlist.some((item) => item.movieId === Id);

    let updatedUser;

    if (exists) {
      updatedUser = await userModel.findByIdAndUpdate(
        id,
        { $pull: { watchlist: { movieId: Id } } },
        { new: true }
      );
      return res.status(200).json({
        success: true,
        message: "Removed from watchlist",
        data: updatedUser,
      });
    } else {
      updatedUser = await userModel.findByIdAndUpdate(
        id,
        {
          $push: {
            watchlist: {
              movieId: Id,
              title,
              posterPath,
              mediaType,
              year,
              rating,
              addedAt: new Date(),
            },
          },
        },
        { new: true }
      );
      return res.status(200).json({
        success: true,
        message: "Added to watchlist",
        data: updatedUser.watchlist,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

async function clearHistoryController(req, res) {
  const { id } = req.user;
  try {
    const user = await userModel.findByIdAndUpdate(
      id,
      { $set: { watchHistory: [] } },
      { new: true }
    );
    return res.status(200).json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}


module.exports = {
  addFavoriteController,
  addWatchHistoryController,
  addWatchlistController,
  clearHistoryController
};