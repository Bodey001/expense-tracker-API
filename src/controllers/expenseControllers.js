const Category = require('../../models/category.js');
const Expense = require('../../models/expense.js');
const User = require('../../models/user.js');
const { verifyTokenFromCookie } = require("../../config/cookieJwtAuth.js");



const findUser = async (email) => {
  return await User.findOne({ email });
};

const findCategoryByUserId = async (user) => {
  return await Category.findOne({ userId: user.id });
};

const findTitleInCategory = async (user, title) => {
  return await Category.aggregate([{
    $match: {
    userId: user.id, "categories.title": title
  }}])
};




//                  Create an Expense
exports.createExpense = async (req, res) => {
  const { title, amount, description } = req.body;

  try {
    //Retrieve the token and decode it
    const token = await verifyTokenFromCookie(req, res);
    if (token === "error") {
      return res
        .status(404)
        .json({ message: `User not found. Kindly login first` });
    }
    if (!title || !amount) {
      return res
        .status(400)
        .json({ message: "Title and amount fields cannot be empty" });
    }

    //Find user by email from the decoded token
    const email = token.email;
    const user = await findUser(email);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    //Search for the Categories based on the user's ID
    const categories = await findCategoryByUserId(user);
    if (!categories) {
      return res
        .status(404)
        .json({ message: "User does not have any existing categories" });
    }

    //Check if title exists amongst the categories for the user
    const titleStatus = await findTitleInCategory(user, title);
    console.log(titleStatus);
    if (titleStatus.length === 0) {
      return res
        .status(404)
        .json({ message: `${title} category not found. Kindly add it up.` });
    }

    //Add a new expense
    const newExpense = {
      title,
      amount,
      description,
      categoryIdByUser: categories.id,
    };

    await Expense.insertOne(newExpense);
    return res.status(200).json({ message: "Expense successfully added" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};





//                  Get Expenses by Category
exports.getExpensesByCategoryTitle = async (req, res) => {
  const { title } = req.body;

  try {
    const token = await verifyTokenFromCookie(req, res);
    if (token === "error") {
      return res
        .status(404)
        .json({ message: `User not found. Kindly login first` });
    }
    if (!title) {
      return res
        .status(400)
        .json({ message: "Title and amount fields cannot be empty" });
    }

    //Find user by email from the decoded token
    const email = token.email;
    const user = await findUser(email);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    //Search for the Categories based on the user's ID
    const categories = await findCategoryByUserId(user);
    console.log(categories);
    if (!categories) {
      return res
        .status(404)
        .json({ message: "User does not have any existing categories" });
    }

    const results = await Expense.find({
      categoryIdByUser: categories.id,
      title
    });

    if (results.length === 0) {
      return res.status(404).json({ message: `No expenses on on ${title}` });
    };
    return res
      .status(200)
      .json({ message: `${title} expenses found`, results });
    
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: `Internal Server Error` });
  }
};


//                Update an Expense
