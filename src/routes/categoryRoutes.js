const express = require('express');
const router = express.Router();
const categoryControllers = require('../controllers/categoryControllers.js');

router.post('/create-category', categoryControllers.createCategory);
router.get("/get-categories", categoryControllers.getCategories);
router.post('/update-category', categoryControllers.updateCategory);
router.post('/delete-category-title', categoryControllers.deleteCategory);

module.exports = router;