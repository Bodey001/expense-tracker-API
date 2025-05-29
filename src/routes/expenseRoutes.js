const express = require('express');
const router = express.Router();
const expenseControllers = require('../controllers/expenseControllers.js');


router.post('/add-expense', expenseControllers.createExpense);
router.post('/find-expenses', expenseControllers.getExpensesByCategoryTitle);


module.exports = router;