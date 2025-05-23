const mongoose = require("mongoose");
require("dotenv").config();

const uri = `mongodb://${process.env.DB_HOST}/${process.env.DB_NAME}`;

const connectDB = async () => {
  try {
    console.log("Attempting to connect to mongoDB");
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Optional: Handle Mongoose connection events
mongoose.connection.on("connected", () => {
  console.log(
    "Mongoose default connection open to " + mongoose.connection.host
  );
});

mongoose.connection.on("error", (err) => {
  console.error("Mongoose default connection error: " + err);
});

mongoose.connection.on("disconnected", () => {
  console.log("Mongoose default connection disconnected");
});

// If the Node process ends, close the Mongoose connection
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log(
    "Mongoose default connection disconnected through app termination"
  );
  process.exit(0);
});

// Export the connection function
module.exports = connectDB;
