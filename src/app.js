const express = require('express');
require('dotenv').config();
const PORT = process.env.PORT;
const cookieParser = require("cookie-parser");

//Test Mongo Connection
const connectDB = require("../config/mongoose.js");
connectDB();


const app = express();
app.use(express.json());
app.use(cookieParser());


app.get("/", (req, res) => {
  console.log("Cookies: ", req.cookies); // Log the cookies to the console
  res.send("Hello World!");
});


//Import Routes
const userRoutes = require("./routes/user.js");
app.use(userRoutes);




app.listen(PORT, async (req, res) => {
  try {
    console.log(`Server is running on http://localhost:${PORT}`);
  } catch (error) {
    console.error(error);
  }
});
