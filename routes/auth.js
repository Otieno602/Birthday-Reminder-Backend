const express = require('express');
const { registration, login, recallPassword, verifyResetToken, resetPassword } = require('../controllers/authController');
const sendEmail = require('../utils/sendEmail');
const router = express.Router();

router.post('/registration', registration);
router.post('/login', login);
router.post('/recallPassword', recallPassword);
router.get('/resetPassword/:token', verifyResetToken);
router.post('/resetPassword/:token', resetPassword);

module.exports = router;