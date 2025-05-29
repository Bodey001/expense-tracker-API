const Category = require('../../models/category.js');
const User = require("../../models/user.js");
const { verifyTokenFromCookie } = require("../../config/cookieJwtAuth.js");
const transporter = require("../../config/nodemailer.js");

const findUser = async (email) => {
  return await User.findOne({ email });
};

const findCategoryByUserId = async (user) => {
  return await Category.find({ userId: "user.id" });
};

const findCategoryTitle = async (user, title) => {
  return await Category.aggregate([
    { $match: { userId: user.id, "categories.title": title } },
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
    if (!title) {
      return res.status(400).json({ message: "Title field cannot be empty" });
    }

    //Find user by email
    const email = token.email;
    const user = await findUser(email);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    //Check if category exists
    const checkCategory = await findCategoryByUserId(user);
    if (checkCategory.length != 0) {
      return res.status(400).json({ message: `Category already exists` });
    }
    const checkCategoryTitle = await findCategoryTitle(user, title);
    if (checkCategoryTitle.length != 0) {
      return res.status(400).json({ message: "Title already exists" });
    }

    //If category does not exist
    const newCategory = {
      userId: user.id,
      categories: { title, description },
    };

    await Category.insertOne(newCategory);

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

    return res.status(201).json({ message: `New Category "${title}" added` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};