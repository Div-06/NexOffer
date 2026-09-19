const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  uploadResume,
  clearResume,
} = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);

router.get('/', getProfile);
router.put('/', updateProfile);
router.post('/resume/upload', upload.single('resume'), uploadResume);
router.delete('/resume', clearResume);

module.exports = router;
