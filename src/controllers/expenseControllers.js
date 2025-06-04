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

// const extracTitleFromCategory = async (user, title) => {
//   return await Category.aggregate([
//     {
//       $match: {
//         userId: user.id,
//         "categories.title": title,
//       },
//     },
//     { $unwind: "$categories" },
//     { $match: { "categories.title": title } },
//   ]);
// };

const findExpenseById = async (id) => {
  return await Expense.findById({ _id: id });
}


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

    //Find user by email from the decoded token
    const email = token.email;
    const user = await findUser(email);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (!title || !amount) {
      return res
        .status(400)
        .json({ message: "Title and amount fields cannot be empty" });
    }

    //Search for the Categories based on the user's ID
    const findCategories = await findCategoryByUserId(user);
    if (!findCategories) {
      return res
        .status(404)
        .json({ message: "User does not have any existing categories" });
    }

    //Check if title exists amongst the categories for the user
    const category = await findTitleInCategory(user, title);

    if (category.length === 0) {
      return res
        .status(404)
        .json({ message: `${title} category does not exist.` });
    }

    //Add a new expense
    const newExpense = {
      title,
      amount,
      description,
      categoryIdByUser: category[0]._id.toString(),
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

    //Find user by email from the decoded token
    const email = token.email;
    const user = await findUser(email);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (!title) {
      return res
        .status(400)
        .json({ message: "Title and amount fields cannot be empty" });
    }

    //Search for the Categories based on the user's ID
    const categories = await findCategoryByUserId(user);
    if (!categories) {
      return res
        .status(404)
        .json({ message: "User does not have any existing categories" });
    }

    //Find the expense
    const results = await Expense.find({
      categoryIdByUser: categories.id,
      title,
    });

    if (results.length === 0) {
      return res.status(404).json({ message: `No expenses on ${title}` });
    }
    return res
      .status(200)
      .json({ message: `${title} expenses found`, results });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: `Internal Server Error` });
  }
};

//                  Update an Expense by Id
exports.updateExpense = async (req, res) => {
  let { id, newTitle, newDescription, newAmount } = req.body;
  try {
    const token = await verifyTokenFromCookie(req, res);
    if (token === "error") {
      return res
        .status(404)
        .json({ message: `User not found. Kindly login first` });
    }

    //Find user by email from the decoded token
    const email = token.email;
    const user = await findUser(email);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    //Check empty fields
    if (!id) {
      return res.status(400).json({ message: "Id field cannot be empty" });
    }
    if (!newTitle && !newDescription && !newAmount) {
      return res.status(400).json({ message: "All fields cannot be empty" });
    }

    //Retrieve the expense by Id
    const retrievedExpense = await findExpenseById(id);
    const categoryIdByUser = retrievedExpense.categoryIdByUser.toString();

    if (!retrievedExpense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    //Check if the selected expense belongs to the user
    const category = await findCategoryByUserId(user);
    const categoryId = category._id.toString();

    if (categoryIdByUser != categoryId) {
      return res.status(404).json({ message: 'Unauthorised Access' });
    } 

    if (!newTitle) {
      newTitle = retrievedExpense.title;
    }
    if (!newDescription) {
      newDescription = retrievedExpense.description;
    }
    if (!newAmount) {
      newAmount = retrievedExpense.amount;
    }

    //Update the expense
    await Expense.updateOne(
      { _id: id },
      {
        $set: {
          title: newTitle,
          description: newDescription,
          amount: newAmount,
        },
      }
    );

    const updatedExpense = await Expense.findById({ _id: id });
    return res
      .status(200)
      .json({ message: "Expense successfully updated", updatedExpense });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

//                  Delete an Expense by Id
exports.deleteExpense = async (req, res) => {
  const { id } = req.body;

  try {
    const token = await verifyTokenFromCookie(req, res);
    if (token === "error") {
      return res
        .status(404)
        .json({ message: `User not found. Kindly login first` });
    }

    //Find user by email from the decoded token
    const email = token.email;
    const user = await findUser(email);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    //Check empty fields
    if (!id) {
      return res.status(404).json({ message: "Id field cannot be empty" });
    }

    //Check if the expense exists
    const retrievedExpense = await findExpenseById(id);
    const categoryIdByUser = retrievedExpense.categoryIdByUser.toString();

    if (!retrievedExpense) {
      return res.status(404).json({ message: 'Expense not found' });
    };

    //Check if the expense belongs to the user
    const category = await findCategoryByUserId(user);
    const categoryId = category._id.toString();

    if (categoryId != categoryIdByUser) {
      return res.status(400).json({ message: 'Unauthorised Access' });
    }

    const expenseId = retrievedExpense._id.toString();
    await Expense.deleteOne({ _id: expenseId });

    return res.status(200).json({ message: 'Expense has been successfully deleted' });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}