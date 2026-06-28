const app = require("./src/app");
const port = process.env.PORT || 3000;
const connectToDB = require('./src/config/db.connection')

/**
 * Connect to DB function
 */
connectToDB()

/**
 * Listening to server
 */
app.listen(port, () => {
  console.log(`Server is listening at PORT: ${port}`);
});
