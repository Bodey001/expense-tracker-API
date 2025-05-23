const mongoose = require("mongoose");
const { Schema } = mongoose;
const User = require('./user.js');
const Category = require('./category.js');


const expenseSchema = new Schema({
  title: { type: String, required: true, trim: true },
  categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true },
  amount: { type: Number, required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;