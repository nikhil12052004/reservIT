const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');

const {
    bookEvent,
    sendBookingOtp,
    getMyBookings,
    getAllBookings,
    confirmBooking,
    cancelBooking,
    storeOTP,
    confirmBookingWithOTP
} = require('../controllers/bookingController');

// ========== USER ROUTES ==========
router.post('/', protect, bookEvent);
router.post('/send-otp', protect, sendBookingOtp);
router.get('/my-bookings', protect, getMyBookings);
router.get('/my', protect, getMyBookings);

// ========== ADMIN ROUTES ==========
router.get('/', protect, admin, getAllBookings);
router.put('/:id/confirm', protect, admin, confirmBooking);
router.delete('/:id', protect, cancelBooking);

// ========== EMAILJS ROUTES (OTP through EmailJS) ==========
router.post('/store-otp', protect, storeOTP);
router.post('/confirm-booking', protect, confirmBookingWithOTP);

module.exports = router;