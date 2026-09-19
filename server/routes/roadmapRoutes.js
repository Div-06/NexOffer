const express = require('express');
const router = express.Router();
const { generateRoadmap } = require('../controllers/roadmapController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.post('/generate', generateRoadmap);

module.exports = router;
