const express = require('express');
const app = express();

const requestCounts = new Map();
const WINDOW_SIZE_MS = 60 * 1000;   //1 minute
const MAX_REQUESTS = 5;            //Max 5 requests per minute


const customRateLimiter = (req, res, next) => {
    //Get the client's ip
    const ip = req.ip;

    //If ip is new, initialize its count
    if (!requestCounts.has(ip)) {
        requestCounts.set(ip, { count: 0, lastReset: Date.now() });
    };

    //If ip already exists
    //Retrieve the client data and the current time
    const clientData = requestCounts.get(ip);
    const currentTime = Date.now();
    const timeDifference = currentTime - clientData.lastReset;

    //Check if the window has expired
    if (timeDifference > WINDOW_SIZE_MS) {
      //Reset count and lastReset for the new window
      clientData.count = 0;
      client.lastReset = currentTime;
    }

    //Increase request count
    clientData.count++;

    if (clientData.count > MAX_REQUESTS) {
        //Calculate time to wait until reset
        const timeRemaining = clientData.lastReset + WINDOW_SIZE_MS - currentTime;
        res.set('Retry-After', Math.ceil(timeRemaining / 1000));
        return res
          .status(429)
          .json({ message: "Too many Requests. Please try again later" });
    }

    next();
}

module.exports = customRateLimiter;