const express = require('express');
const router = express.Router();
const userControllers = require('../controllers/userController.js');


router.post('/create-user', userControllers.createUser);

router.post('/login', userControllers.userLogin);


module.exports = router;