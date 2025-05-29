const express = require('express');
const app = express();
const cookieParser = require("cookie-parser");
app.use(cookieParser());

const jwt = require('jsonwebtoken');
require("dotenv").config();
const secretKey = process.env.JWT_SECRET_KEY;



//Generate token and cookie
exports.generateJwtWithCookie = async (payload, res, expiresIn = "1h") => {
  const token = await jwt.sign(payload, secretKey, { expiresIn });
  const maxAgeInMilliseconds = parseInt(expiresIn) * 60 * 60 * 1000;
  // console.log(token);

  res.cookie("authToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: maxAgeInMilliseconds,
  });
    

  return token;
};

exports.verifyTokenFromCookie = async (req, res) => {
  let payload;
  try {
    const jwtToken = await req.cookies.authToken; //Retrieve the authToken cookie
    payload = await jwt.verify(jwtToken, secretKey);
  } catch (error) {
    console.error("Token verification failed: ", error.message);
    payload = "error";
  } finally {
    return payload;
  }
};