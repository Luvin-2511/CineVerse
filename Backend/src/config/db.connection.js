const mongoose = require("mongoose");

/**
 * Function to connect to Database
 */
async function connectToDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Mongo DB Connected !");
  } catch (err) {
    console.error("Error in Database connection!", err);
  }
}

module.exports = connectToDB;
