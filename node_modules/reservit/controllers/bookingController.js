const Booking = require('../models/Bookings.js');
const OTP = require('../models/OTP');
const Event = require('../models/Event');
const {sendBookingEmail, sendOTPEmail} = require('../utils/email');

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000);
};

exports.sendBookingOtp = async (req, res) => {
    const otp = generateOTP();
    await OTP.findOneAndDelete({ email: req.user.email, action: 'event_booking' });
    await OTP.create({ email: req.user.email, otp, action: 'event_booking'});
    await sendOTPEmail(req.user.email, otp, 'event_booking');
    res.status(200).json({ message: 'OTP sent to your email for booking confirmation.' });
};

exports.bookEvent = async (req, res) => {
    const { eventId, otp } = req.body;
    const otpRecord = await OTP.findOne({ email: req.user.email, otp, action: 'event_booking' });
    if (!otpRecord) {
        return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }
    const event = await Event.findById(eventId);
    if (!event) {
        return res.status(404).json({ message: 'Event not found.' });
    }
    if(event.totalseats <= 0) {
        return res.status(400).json({ message: 'No seats available for this event.' });
    }

    const existingBooking = await Booking.findOne({ userId: req.user._id, eventId });
    if (existingBooking) {
        return res.status(400).json({ message: 'You have already booked this event.' });
    }

    const ticketAmount = event.ticketprice ?? event.ticketPrice;
    if (ticketAmount == null) {
        return res.status(500).json({ message: 'Event ticket price is missing. Please contact support.' });
    }

    const booking = await Booking.create({
        userId: req.user._id,
        eventId,
        status: 'pending',
        paymentStatus: 'non-paid',
        amount: ticketAmount
    });
    await OTP.deleteMany({ email: req.user.email, action: 'event_booking' });
    res.status(201).json({ message: 'Event booked successfully. check your email for confirmation.', booking });
};

exports.confirmBooking = async (req, res) => {
    console.log('🔍 confirmBooking called');
    console.log('   Admin user:', req.user._id, 'Role:', req.user.role);
    console.log('   Booking ID:', req.params.id);
    console.log('   Request body:', req.body);
    
    const paymentStatus = req.body.paymentStatus;
    if (!['paid', 'not_paid', 'non-paid', 'unpaid'].includes(paymentStatus)) {
    return res.status(400).json({ message: 'Invalid payment status.' });
    }
    const booking = await Booking.findById(req.params.id).populate('userId').populate('eventId');
    if (!booking) {
        console.log('   ❌ Booking not found for ID:', req.params.id);
        return res.status(404).json({ message: 'Booking not found.' });
    }
    console.log('   ✓ Booking found - Current status:', booking.status);
    if (booking.status === 'confirmed') {
        console.log('   ❌ Booking already confirmed');
        return res.status(400).json({ message: 'Booking is already confirmed.' });
    }
    
    const event = await Event.findById(booking.eventId._id);
    if (event.totalseats <= 0) {
        console.log('   ❌ No seats available for event:', event._id);
        return res.status(400).json({ message: 'No seats available for this event.' });
    }
    booking.status = 'confirmed';
    
    if(paymentStatus) {
        console.log('   💾 Setting payment status to:', paymentStatus);
        booking.paymentStatus = paymentStatus;
    }
    await booking.save();
    event.totalseats -= 1;
    await event.save();
    console.log('   ✅ Booking confirmed successfully');

    //admin confirm the booking and email sent to user
    await sendBookingEmail(booking.userId.email, booking.userId.name, booking.eventId.title);
    res.status(200).json({ message: 'Booking confirmed successfully.', booking });
};

exports.getMyBookings = async (req, res) => {
    const bookings = await Booking.find({ userId: req.user._id }).populate('eventId');
    res.status(200).json({ bookings });
}

exports.cancelBooking = async (req, res) => {

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
        return res.status(404).json({
            message: 'Booking not found.'
        });
    }

    // Allow admin OR booking owner
    if (
        booking.userId.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin'
    ) {
        return res.status(403).json({
            message: 'You are not authorized to cancel this booking.'
        });
    }

    if (booking.status === 'confirmed') {

        const event = await Event.findById(booking.eventId);

        event.totalseats += 1;

        await event.save();
    }

    booking.status = 'cancelled';

    await booking.save();

    await Booking.deleteOne({ _id: req.params.id });

    res.status(200).json({
        message: 'Booking cancelled successfully.'
    });
};

exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('userId', 'name email')
            .populate('eventId');

        res.json(bookings);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Error fetching bookings'
        });
    }
};