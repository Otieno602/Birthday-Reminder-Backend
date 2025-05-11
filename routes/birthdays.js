const express = require('express');
const router = express.Router();
const verifyApiKey = require('../middlewares/verifyApiKey');
const protect = require('../middlewares/authMiddleware');
const { getBirthdays, addBirthday, updateBirthday, deleteBirthday } = require('../controllers/birthdayController');


// Applying middleware to all birthday routes
router.use(verifyApiKey);

// Routes
router.get('/', protect, getBirthdays);
router.post('/', protect, addBirthday);
router.put('/:_id', protect, updateBirthday);
router.delete('/:_id', protect, deleteBirthday);

module.exports = router;