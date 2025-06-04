const Category = require('../../models/category.js');
const User = require("../../models/user.js");
const { verifyTokenFromCookie } = require("../../config/cookieJwtAuth.js");
const transporter = require("../../config/nodemailer.js");
const Expense = require('../../models/expense.js');

const findUser = async (email) => {
  return await User.findOne({ email });
};

const findCategoryByUserId = async (user) => {
  return await Category.find({ userId: user.id });
};


const findTitleInCategory = async (user, inputTitle) => {
  return await Category.aggregate([
    {
      $match: {
        userId: user.id,
        "categories.title": inputTitle,
      },
    },
    { $unwind: "$categories" },
    { $match: { "categories.title": inputTitle } },
  ]);
};

//              Create a category
exports.createCategory = async (req, res) => {
  const { title, description } = req.body;

  try {
    //Retrieve the token
    const token = await verifyTokenFromCookie(req, res);
    if (token === "error") {
      return res
        .status(404)
        .json({ message: `User not found. Kindly login first` });
    }

    //Find user by email
    const email = token.email;
    const user = await findUser(email);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (!title) {
      return res.status(400).json({ message: "Title field cannot be empty" });
    }

    //Check if title exists in category
    const checkTitleInCategory = await findTitleInCategory(user, title);
    console.log(checkTitleInCategory);
    if (checkTitleInCategory.length != 0) {
      return res.status(400).json({ message: "Title already exists" });
    }

    //Add title if it doesn't exist in the category
    const categorySchema = {
      title,
      description,
    };

    await Category.updateOne(
      { userId: user.id },
      { $push: { categories: categorySchema } },
      { upsert: true }
    );

    const username = user.username;
    //Send a welcome email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "New Category Added",
      text: `Hi ${username}, you've just created a new category: ${title}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email: ", error);
      } else {
        console.log(`Update email sent to ${email}`, " ", info.response);
      }
    });

    return res.status(201).json({ message: `New Category \'${title}'\ added` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

//               Get categories by userId
exports.getCategories = async (req, res) => {
  try {
    //Retrieve the token
    const token = await verifyTokenFromCookie(req, res);
    if (token === "error") {
      return res
        .status(404)
        .json({ message: `User not found. Kindly login first` });
    }

    //Find user by email
    const email = token.email;
    const user = await findUser(email);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    //Get the categories
    const categories = await findCategoryByUserId(user);
    if (categories.length === 0) {
      return res
        .status(404)
        .json({ message: "This user does not have any category saved" });
    }

    return res
      .status(200)
      .json({ message: "Categories retrieved successfully", categories });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

//               Update a Category's title or description
exports.updateCategory = async (req, res) => {
  let { title, newTitle, description } = req.body;

  try {
    //Retrieve the token
    const token = await verifyTokenFromCookie(req, res);
    if (token === "error") {
      return res
        .status(404)
        .json({ message: `User not found. Kindly login first` });
    }

    //Find user by email
    const email = token.email;
    const user = await findUser(email);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    //Check for title
    if (title.length === 0) {
      return res.status(400).json({ message: "Title field cannot be empty" });
    }

    //Find Category by userId
    //Check if title exists in category
    const checkTitleInCategory = await findTitleInCategory(user, title);
    if (checkTitleInCategory.length === 0) {
      return res.status(400).json({ message: "Title does not exist" });
    }

    //All fields cannot be empty
    if (!newTitle && !description) {
      return res
        .status(400)
        .json({ message: "Both title and description fields cannot be empty" });
    }

    //Retrieve current title and description then define the changes
    const data = await findTitleInCategory(user, title);
    if (!newTitle) {
      newTitle = data[0].categories.title;
    }
    if (!description) {
      description = data[0].categories.description;
    }

    await Category.updateOne(
      { userId: user.id },
      {
        $set: {
          "categories.$[element].title": newTitle,
          "categories.$[element].description": description,
        },
      },
      { arrayFilters: [{ "element.title": title }] }
    );

    await Expense.updateMany(
      { title },
      { $set: { title: newTitle } }
    );

    const updatedCategory = await findTitleInCategory(user, newTitle);
    return res.status(200).json({
      messsage: `Category has been successfully updated`,
      updatedCategory,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

//              Remove a Category Title
exports.deleteCategory = async (req, res) => {
  const { title } = req.body;

  try {
    //Retrieve the token
    const token = await verifyTokenFromCookie(req, res);
    if (token === "error") {
      return res
        .status(404)
        .json({ message: `User not found. Kindly login first` });
    }

    //Find user by email
    const email = token.email;
    const user = await findUser(email);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (title.length === 0) {
      return res.status(400).json({ message: "Title field cannot be empty" });
    }

    //Find Category by userId
    //Check if title exists in category
    const checkTitleInCategory = await findTitleInCategory(user, title);
    if (checkTitleInCategory.length === 0) {
      return res.status(400).json({ message: "Title does not exist" });
    }

    //Update the Category
    await Category.updateOne(
      { userId: user.id },
      {
        $pull: { categories: { title } },
      }
    );
    //Update the Expense
    await Expense.deleteMany({ title });

    const updatedCategory = await findCategoryByUserId(user);
    return res
      .status(200)
      .json({ message: `${title} successfully removed`, updatedCategory });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};