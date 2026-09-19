const express = require('express');
const router = express.Router();
const { generateFastTrack } = require('../controllers/fastTrackController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.post('/generate', generateFastTrack);

module.exports = router;
