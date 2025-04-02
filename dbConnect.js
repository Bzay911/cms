// external imports
const {createDefaultAdmin} = require('./controllers/adminController')
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
console.log("MongoDB URI:", process.env.MONGO_URI);

async function dbConnect() {
  // use mongoose to connect this app to our database on mongoDB using the DB_URL (connection string)
  mongoose
    .connect(
        process.env.MONGO_URI,
      {
        //   these are options to ensure that the connection is done properly
        useNewUrlParser: true,
        useUnifiedTopology: true,
       
      }
      
    )
    .then(() => {
      console.log("Successfully connected to MongoDB Atlas!");
      createDefaultAdmin();
    })
    .catch((error) => {
      console.log("Unable to connect to MongoDB Atlas!");
      console.error(error);
    });
}

module.exports = dbConnect;