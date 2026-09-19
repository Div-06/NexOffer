const express = require('express');
const router = express.Router();
const { analyzeSkillGap } = require('../controllers/skillGapController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.post('/analyze', analyzeSkillGap);

module.exports = router;
