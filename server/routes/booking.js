const express = require('express');
const router = express.Router();

const { protect, admin } = require('../middleware/auth');

const {
    bookEvent,
    sendBookingOtp,
    getMyBookings,
    getAllBookings,
    confirmBooking,
    cancelBooking
} = require('../controllers/bookingController');

router.post('/', protect, bookEvent);

router.post('/send-otp', protect, sendBookingOtp);

router.get('/my-bookings', protect, getMyBookings);

router.get('/my', protect, getMyBookings);

// ADMIN: get all bookings
router.get('/', protect, admin, getAllBookings);

router.put('/:id/confirm', protect, admin, confirmBooking);

router.delete('/:id', protect, cancelBooking);

module.exports = router;