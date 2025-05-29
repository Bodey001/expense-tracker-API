const express = require('express');
const router = express.Router();
const expenseControllers = require('../controllers/expenseControllers.js');


router.post('/add-expense', expenseControllers.createExpense);


module.exports = router;