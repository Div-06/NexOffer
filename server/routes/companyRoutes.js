const express = require('express');
const router = express.Router();
const { researchCompany } = require('../controllers/companyController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.post('/research', researchCompany);

module.exports = router;
