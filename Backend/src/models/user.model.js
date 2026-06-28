const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    require: [true, "Enter name in the field"],
  },
  email: {
    type: String,
    require: [true, "Enter email in the field"],
    unique: [true, "Account with email already exists !"],
  },
  password: {
    type: String,
    require: [true, "Enter email in the field"],
    select: false,
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
  favorites: [
    {
      movieId: { type: String },
      title: { type: String },
      posterPath: { type: String, default: "" },
      mediaType: { type: String, enum: ["movie", "tv"], default: "movie" },
      rating: { type: Number, default: 0 },
      year: { type: String, default: "" },
      addedAt: { type: Date, default: Date.now },
    },
  ],

  watchlist: [
    {
      movieId: { type: String },
      title: { type: String },
      posterPath: { type: String, default: "" },
      mediaType: {
        type: String,
        enum: ["movie", "tv", "person"],
        default: "movie",
      },
      rating: { type: Number, default: 0 },
      year: { type: String, default: "" },
      addedAt: { type: Date, default: Date.now },
    },
  ],

  watchHistory: [
    {
      movieId: { type: String },
      title: { type: String },
      posterPath: { type: String, default: "" },
      mediaType: { type: String, enum: ["movie", "tv"], default: "movie" },
      rating: { type: Number, default: 0 },
      year: { type: String, default: "" },
      watchedAt: { type: String, default: () => new Date().toISOString() },
    },
  ],
  isBanned: {
    type: Boolean,
    default: false,
  },
});

const userModel = mongoose.model("user", userSchema);

module.exports = userModel;
