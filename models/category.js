const mongoose = require("mongoose");
const { Schema } = mongoose;



const categoriesSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const categorySchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      trim: true,
    },
    categories: categoriesSchema,
  },
  {
    timestamps: true,
  }
);

const Category = mongoose.model("Category", categorySchema);
module.exports = Category;