import emailjs from '@emailjs/browser';

// 🔥 EmailJS Dashboard se COPY karo
const SERVICE_ID = 'service_t0bn43j';
const REGISTRATION_TEMPLATE_ID = 'template_reg_xxxxx'; // Registration wali template ID
const BOOKING_TEMPLATE_ID = 'template_book_xxxxx'; // Booking wali template ID
const PUBLIC_KEY = 'your_public_key'; // Integration tab se copy karo

// 🔥 Registration OTP (Sign-up ke liye)
export const sendRegistrationOTP = async (userEmail, otp, userName) => {
    try {
        const templateParams = {
            to_email: userEmail,
            user_name: userName || 'User',
            otp: otp
        };

        const response = await emailjs.send(
            SERVICE_ID,
            REGISTRATION_TEMPLATE_ID,
            templateParams,
            PUBLIC_KEY
        );
        
        console.log('✅ Registration OTP sent:', response);
        return true;
    } catch (error) {
        console.error('❌ Registration OTP error:', error);
        return false;
    }
};

// 🔥 Booking OTP (Event booking ke liye)
export const sendBookingOTP = async (userEmail, otp, userName, eventName) => {
    try {
        const templateParams = {
            to_email: userEmail,
            user_name: userName || 'User',
            otp: otp,
            event_name: eventName || 'ReservIT Booking'
        };

        const response = await emailjs.send(
            SERVICE_ID,
            BOOKING_TEMPLATE_ID,
            templateParams,
            PUBLIC_KEY
        );
        
        console.log('✅ Booking OTP sent:', response);
        return true;
    } catch (error) {
        console.error('❌ Booking OTP error:', error);
        return false;
    }
};