const express = require('express');
const router = express.Router();
const { generateLastMinuteGuide } = require('../controllers/lastMinuteController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.post('/generate', generateLastMinuteGuide);

module.exports = router;
