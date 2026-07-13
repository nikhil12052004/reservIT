const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// ========== ROUTES ==========
router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.post('/verify-otp', authController.verifyOtp);
router.post('/send-registration-otp', authController.sendRegistrationOTP);

module.exports = router;