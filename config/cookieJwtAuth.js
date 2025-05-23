const jwt = require('jsonwebtoken');
require("dotenv").config();
const secretKey = process.env.JWT_SECRET_KEY;

//Generate token and cookie
exports.generateJwtWithCookie = async (payload, res, expiresIn = "1h") => {
  const token = await jwt.sign(payload, secretKey, { expiresIn });
  const maxAgeInMilliseconds = parseInt(expiresIn) * 60 * 60 * 1000;

  res.cookie("authToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: maxAgeInMilliseconds,
  });

  return token;
};