const express = require('express');
const router = express.Router();
const expenseControllers = require('../controllers/expenseControllers.js');


router.post('/add-expense', expenseControllers.createExpense);
router.post('/find-expenses', expenseControllers.getExpensesByCategoryTitle);
router.post("/update-expense", expenseControllers.updateExpense);
router.post('/delete-expense', expenseControllers.deleteExpense);


module.exports = router;