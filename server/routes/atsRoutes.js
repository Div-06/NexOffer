const express = require('express');
const router = express.Router();
const { analyzeATS } = require('../controllers/atsController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.post('/ats', analyzeATS);

module.exports = router;
