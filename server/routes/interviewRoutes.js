const express = require('express');
const router = express.Router();
const { generateInterviewPrep } = require('../controllers/interviewController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.post('/generate', generateInterviewPrep);

module.exports = router;
