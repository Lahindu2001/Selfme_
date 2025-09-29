const express = require('express');
const router = express.Router();
const expenseController = require('../../Controllers/FinanceManager/expenseController');

router.get('/', expenseController.getExpenses);
router.post('/', expenseController.createExpense);
router.put('/:id', expenseController.updateExpense);
router.delete('/:id', expenseController.deleteExpense);

module.exports = router;