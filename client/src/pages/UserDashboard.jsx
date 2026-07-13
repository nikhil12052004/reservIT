import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/axios';
import { Link, useNavigate } from 'react-router-dom';
import { FaTicketAlt, FaTimesCircle, FaEnvelope } from 'react-icons/fa';
import { sendBookingOTP } from '../utils/emailjs';

const UserDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showOTPModal, setShowOTPModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [otp, setOtp] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchBookings();
    }, [user, navigate]);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/bookings/my-bookings');
            console.log("Bookings API response:", data);

            if (Array.isArray(data)) {
                setBookings(data);
            } else if (Array.isArray(data.bookings)) {
                setBookings(data.bookings);
            } else {
                setBookings([]);
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
            setBookings([]);
        } finally {
            setLoading(false);
        }
    };

    const cancelBooking = async (id) => {
        if (window.confirm('Are you sure you want to cancel this booking request?')) {
            try {
                await api.delete(`/bookings/${id}`);
                fetchBookings();
            } catch (error) {
                alert(error.response?.data?.message || 'Error cancelling booking');
            }
        }
    };

    const handleSendOTP = async (booking) => {
        setSelectedBooking(booking);
        setOtpLoading(true);
        
        try {
            const generatedOTP = Math.floor(100000 + Math.random() * 900000);
            
            const sent = await sendBookingOTP(
                user?.email,
                generatedOTP,
                user?.name,
                booking.eventId?.title || 'ReservIT Booking'
            );
            
            if (sent) {
                await api.post('/bookings/store-otp', {
                    email: user.email,
                    otp: generatedOTP
                });
                
                setOtpSent(true);
                setShowOTPModal(true);
                alert('✅ OTP sent to your email!');
            } else {
                alert('❌ Failed to send OTP. Try again.');
            }
        } catch (error) {
            console.error('Error sending OTP:', error);
            alert('❌ Failed to send OTP');
        } finally {
            setOtpLoading(false);
        }
    };

    const handleConfirmBooking = async () => {
        if (!otp || otp.length !== 6) {
            alert('Please enter a valid 6-digit OTP');
            return;
        }

        setOtpLoading(true);
        try {
            const response = await api.post('/bookings/confirm-booking', {
                bookingId: selectedBooking._id,
                otp: otp
            });

            if (response.data.success) {
                alert('✅ Booking confirmed successfully!');
                setShowOTPModal(false);
                setOtp('');
                setOtpSent(false);
                fetchBookings();
            }
        } catch (error) {
            alert(error.response?.data?.message || '❌ Invalid OTP or booking failed');
        } finally {
            setOtpLoading(false);
        }
    };

    if (loading) return <div className="text-center py-20 text-xl font-semibold">Loading dashboard...</div>;

    return (
        <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 mb-8 border border-gray-100 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-6">
                <div className="w-20 h-20 bg-gray-200 text-gray-900 rounded-full flex items-center justify-center text-3xl font-bold uppercase tracking-widest shrink-0">
                    {user?.name?.charAt(0)}
                </div>
                <div className="flex flex-col items-center sm:items-start">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">Welcome, {user?.name}!</h1>
                    <p className="text-gray-500 flex items-center justify-center sm:justify-start gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span> User Dashboard
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2 sm:gap-3">
                    <FaTicketAlt className="text-gray-700" /> My Bookings
                </h2>
            </div>

            {bookings.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaTicketAlt className="text-gray-300 text-3xl" />
                    </div>
                    <p className="text-xl text-gray-500 mb-6 mt-4 font-medium">You haven't booked any events yet.</p>
                    <Link to="/" className="inline-block bg-gray-900 hover:bg-black text-white font-bold py-3 px-8 rounded-lg transition shadow-md">
                        Browse Events
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.isArray(bookings) && bookings.map((booking) => (
                        <div key={booking._id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition border border-gray-100 flex flex-col">
                            <div className="p-6 border-b border-gray-50 flex-grow">
                                {booking.eventId ? (
                                    <>
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="text-lg font-bold text-gray-900 leading-tight">{booking.eventId.title}</h3>
                                            <div className="flex flex-col gap-1 items-end">
                                                <span className={`px-2 py-1 text-[10px] font-black rounded uppercase tracking-wider ${
                                                    booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                                    booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                    {booking.status}
                                                </span>
                                                {booking.status !== 'cancelled' && (
                                                    <span className={`px-2 py-1 text-[10px] font-black rounded uppercase tracking-wider ${
                                                        booking.paymentStatus === 'paid' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                                    }`}>
                                                        {booking.paymentStatus.replace('_', ' ')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-500 mb-4 space-y-1">
                                            <p><strong className="text-gray-700">Date:</strong> {new Date(booking.eventId.date).toLocaleDateString()}</p>
                                            <p><strong className="text-gray-700">Amount:</strong> {booking.amount === 0 ? 'Free' : `₹${booking.amount}`}</p>
                                            <p><strong className="text-gray-700">Requested:</strong> {new Date(booking.createdAt).toLocaleDateString()}</p>
                                        </div>

                                        {booking.status === 'pending' && (
                                            <button
                                                onClick={() => handleSendOTP(booking)}
                                                disabled={otpLoading}
                                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                                            >
                                                {otpLoading ? '⏳ Sending OTP...' : <><FaEnvelope /> Confirm Booking</>}
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <p className="text-red-500 italic">Event details unavailable</p>
                                )}
                            </div>
                            <div className="p-4 bg-gray-50 flex justify-between items-center shrink-0">
                                {booking.eventId && booking.status !== 'cancelled' ? (
                                    <>
                                        <Link to={`/events/${booking.eventId._id}`} className="text-gray-900 font-semibold text-sm hover:underline">
                                            View Event
                                        </Link>
                                        <button
                                            onClick={() => cancelBooking(booking._id)}
                                            className="text-red-500 font-semibold text-sm hover:text-red-700 transition flex items-center gap-1"
                                        >
                                            <FaTimesCircle /> Cancel
                                        </button>
                                    </>
                                ) : (
                                    <div className="w-full text-center text-sm text-gray-500 italic">Booking Cancelled</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showOTPModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
                        <h3 className="text-2xl font-bold mb-4 text-center">🔐 Verify OTP</h3>
                        <p className="text-gray-600 text-center mb-4">
                            Enter the 6-digit OTP sent to <strong>{user?.email}</strong>
                        </p>
                        <input
                            type="text"
                            maxLength="6"
                            placeholder="Enter OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                            className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-center text-2xl font-bold tracking-widest focus:outline-none focus:border-blue-500 mb-4"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowOTPModal(false);
                                    setOtp('');
                                    setOtpSent(false);
                                }}
                                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-lg transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmBooking}
                                disabled={otpLoading || otp.length !== 6}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
                            >
                                {otpLoading ? '⏳ Verifying...' : '✅ Verify OTP'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDashboard;