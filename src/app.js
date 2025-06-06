const express = require('express');
require('dotenv').config();
const PORT = process.env.PORT;
const cookieParser = require("cookie-parser");
const customRateLimiter = require("../config/rateLimiter.js");

//Test Mongo Connection
const connectDB = require("../config/mongoose.js");
connectDB();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(customRateLimiter);

//Import Routes
const userRoutes = require("./routes/userRoutes.js");
app.use("/users/v1", userRoutes);
const categoryRoutes = require("./routes/categoryRoutes.js");
app.use("/v1/categories/", categoryRoutes);
const expenseRoutes = require("./routes/expenseRoutes.js");
app.use("/v1/expenses", expenseRoutes);

app.listen(PORT, async (req, res) => {
  try {
    console.log(`Server is running on http://localhost:${PORT}`);
  } catch (error) {
    console.error(error);
  }
});