const express = require('express');
const router = express.Router();
const {
  getHistory,
  deleteHistoryItem,
  clearHistory,
} = require('../controllers/historyController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getHistory);
router.delete('/:id', deleteHistoryItem);
router.delete('/', clearHistory);

module.exports = router;
