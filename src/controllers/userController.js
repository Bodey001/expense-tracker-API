const User = require('../../models/user.js');
const bcrypt = require("bcrypt");
require("dotenv").config();
const saltRounds = Number(process.env.SALTROUNDS);
const transporter = require("../../config/nodemailer.js");




const findUser = async (email) => {
  return await User.findOne({ email }, { password: 0 });
};

const checkUsername = async (username) => {
  return await User.findOne({ username: `${username}` }, {password: 0});
};

const hashPassword = async (password, saltRounds) => {
  return await bcrypt.hash(password, saltRounds);
};

const checkPassword = async (email, pass) => {
  const user = await User.findOne({ email });
  const hashedPassword = user.password;
  // console.log(hashedPassword);
  return await bcrypt.compare(pass, hashedPassword);
}



// checkPassword("oyewunmi1010@gmail.com", "hfbjhfdufhfg");


//              Register a user
exports.createUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Empty fields must be filled" });
    }
    if (email.includes("@") === false) {
      return res
        .status(400)
        .json({ message: `Invalid email address: ${email}` });
    }
    if (await findUser(email)) {
      return res.status(400).json({ message: `User already exists` });
    }

    if (await checkUsername(username)) {
      return res.status(400).json({ message: `Username already exists` });
    }

    const hashedPassword = await hashPassword(password, saltRounds);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });
    await newUser.save();

    //Send a welcome email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Welcome",
      text: `Hi ${username}, welcome to Expense-Tracker`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending welcome email: ", error);
      } else {
        console.log(`Welcome email sent to ${email}`, " ", info.response);
      }
    });

    const savedUser = await findUser(email);
    return res
      .status(201)
      .json({ message: `User registered successfully`, savedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Internal Server Error ${error.message}` });
  }
};



