const User = require('../../models/user.js');
const bcrypt = require("bcrypt");
require("dotenv").config();
const saltRounds = Number(process.env.SALTROUNDS);
const transporter = require("../../config/nodemailer.js");
const {
  generateJwtWithCookie,
  verifyTokenFromCookie,
} = require("../../config/cookieJwtAuth.js");

const findUser = async (email) => {
  return await User.findOne({ email });
};

const findByUsername = async (username) => {
  return await User.findOne({ username });
};

const checkUsername = async (username) => {
  return await User.findOne({ username });
};

const hashPassword = async (password, saltRounds) => {
  return await bcrypt.hash(password, saltRounds);
};

const checkPassword = async (user, pass) => {
  const hashedPassword = user.password;
  return await bcrypt.compare(pass, hashedPassword);
};

const jwtPayload = async (param) => {
  const user = (await findUser(param)) || (await findByUsername(param));
  console.log(user);
  const payload = {
    username: user.username,
    email: user.email,
  };
  return payload;
};

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

    await User.insertOne(newUser);

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
    res.status(500).json({ message: `Internal Server Error` });
  }
};

//              User Logging
exports.userLogin = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    if ((!username && !email) || !password) {
      return res.status(400).json({ message: "Empty fields must be filled" });
    }
    if (email) {
      if (email.includes("@") === false) {
        return res
          .status(400)
          .json({ message: `Enter a valid email address` });
      }
    }

    //Find user by email or username
    const user = (await findUser(email)) || (await findByUsername(username));

    if (!user) {
      return res.status(404).json({ message: "User does not exist" });
    }

    //Verify Password
    const verifyPassword = await checkPassword(user, password);
    if (verifyPassword === false) {
      return res.status(400).json({ message: "Incorrect Credentials" });
    }

    //Generate payload
    const payload = await jwtPayload(user.email || user.username);
    //Generate token and cookie
    await generateJwtWithCookie(payload, res); //The cookie is set

    //Send a login mail
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Login Detected",
      text: `Hi ${username}, you have been successfully logged in to Expense-Tracker`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending welcome email: ", error);
      } else {
        console.log(`Login email sent to ${email}`, " ", info.response);
      }
    });

    return res.status(200).json({ message: "Login Successful" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: `Internal Server Error` });
  }
};

//              Update a User Information
exports.updateUserInformation = async (req, res) => {
  let { username, email, password } = req.body;

  try {
    //Retrieve the token and decode it
    const token = await verifyTokenFromCookie(req, res);
    if (token === "error") {
      return res
        .status(404)
        .json({ message: `User not found. Kindly login first` });
    }

    //Check for empty fields
    if (!username && !email && !password) {
      return res
        .status(400)
        .json({ message: "Choose the field you want to update" });
    }

    //Keep the changes for unedited fields
    const user = await findUser(token.email);
    if (!username) {
      username = user.username
    };
    if (!email) {
      email = user.email
    };
    if (!password) {
      password = user.password
    };

    //Hash the password
    const hashedPassword = await hashPassword(password, saltRounds);

    //Update the information
    await User.updateOne(
      { email: token.email },
      {
        $set: {
          username,
          email,
          password: hashedPassword,
        },
      }
    );

    //Find the user
    const updatedUser = await findUser(email);

    //Send a update mail
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: updatedUser.email,
      subject: "Information on Update",
      text: `Hi ${username}, you have been successfully updated your details in to Expense-Tracker`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending update email: ", error);
      } else {
        console.log(`Update email sent to ${email}`, " ", info.response);
      }
    });

    return res
      .status(200)
      .json({ messagr: "User details successfully updated", user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};