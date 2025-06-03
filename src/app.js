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



//Import Routes
const userRoutes = require("./routes/userRoutes.js");
app.use('/v1', userRoutes);
const categoryRoutes = require('./routes/categoryRoutes.js');
app.use("/v1", categoryRoutes);
const expenseRoutes = require('./routes/expenseRoutes.js');
app.use("/v1", expenseRoutes);



app.listen(PORT, async (req, res) => {
  try {
    console.log(`Server is running on http://localhost:${PORT}`);
  } catch (error) {
    console.error(error);
  }
});
