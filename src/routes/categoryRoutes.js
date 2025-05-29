const express = require('express');
const router = express.Router();
const categoryControllers = require('../controllers/categoryControllers.js');

router.post('/create-category', categoryControllers.createCategory);

module.exports = router;