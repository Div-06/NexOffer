const express = require('express');
const router = express.Router();
const { generateResumeQuestions } = require('../controllers/resumeQuestionsController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.post('/generate', generateResumeQuestions);

module.exports = router;
