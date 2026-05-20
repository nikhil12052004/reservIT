import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/axios';
import {
    FaCalendarAlt,
    FaMapMarkerAlt,
    FaSearch,
    FaRegClock,
    FaTicketAlt,
    FaShieldAlt
} from 'react-icons/fa';

const Home = () => {
    const [events, setEvents] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchEvents();
        }, 400);

        return () => clearTimeout(timeoutId);
    }, [search]);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/events?search=${search}`);
            setEvents(data);
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Main Container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Hero Section */}
                <section className="py-8 md:py-12">
                    <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=3000&auto=format&fit=crop')] bg-cover bg-center filter brightness-50"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>

                        <div className="relative z-10 px-6 py-12 md:py-16 lg:py-20">
                            <div className="flex flex-col md:flex-row items-center gap-10">
                                <div className="md:w-1/2 text-center md:text-left">
                                    <span className="inline-block bg-white/10 text-white backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-6 border border-white/10">
                                        Welcome to reservIT
                                    </span>

                                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-4">
                                        Find Your Next <span className="text-blue-600">Unforgettable</span> Experience
                                    </h1>

                                    <p className="text-gray-200 text-base md:text-lg mb-6 max-w-xl mx-auto md:mx-0 font-light">
                                        Discover top conferences, music festivals, and hands-on workshops
                                        in your area. Book quickly and securely — make memories that last.
                                    </p>

                                    <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
                                        <Link to="/events" className="px-5 py-2.5 rounded-xl bg-gray-900 text-white font-semibold hover:bg-black transition shadow-sm">Explore Events</Link>
                                        <Link to="/register" className="px-4 py-2 rounded-lg bg-white text-gray-900 font-semibold hover:bg-gray-100 transition">Get Started</Link>
                                    </div>
                                </div>

                                <div className="md:w-1/2">
                                    <div className="w-full h-64 md:h-56 lg:h-64 rounded-xl overflow-hidden shadow-xl border border-gray-200">
                                        {/* decorative image */}
                                        <img src="https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1600&q=80" alt="events" className="w-full h-full object-cover" />
                                    </div>
                                </div>
                            </div>

                            {/* Search Bar beneath hero on small screens */}
                            <div className="mt-8 w-full max-w-2xl mx-auto">
                                <div className="relative flex items-center bg-white rounded-full shadow-lg px-4 py-3">
                                    <FaSearch className="text-gray-400 text-lg mr-3" />
                                    <input
                                        type="text"
                                        placeholder="Search events by title..."
                                        className="w-full pl-2 pr-3 py-2 rounded-full text-base text-gray-800 bg-transparent focus:outline-none"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="-mt-6 relative z-20 pb-16">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                        {/* Fast Booking */}
                        <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 p-6 flex flex-col items-start text-left hover:-translate-y-1 hover:shadow-xl transition duration-300">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-500 text-white rounded-lg flex items-center justify-center text-xl mb-4 shadow">
                                <FaRegClock />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Fast Booking</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">Secure your tickets instantly with our streamlined booking experience.</p>
                        </div>

                        {/* Seamless Access */}
                        <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 p-6 flex flex-col items-start text-left hover:-translate-y-1 hover:shadow-xl transition duration-300">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-500 text-white rounded-lg flex items-center justify-center text-xl mb-4 shadow">
                                <FaTicketAlt />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Seamless Access</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">Download tickets instantly or manage them from your dashboard.</p>
                        </div>

                        {/* Secure Platform */}
                        <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 p-6 flex flex-col items-start text-left hover:-translate-y-1 hover:shadow-xl transition duration-300">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-500 text-white rounded-lg flex items-center justify-center text-xl mb-4 shadow">
                                <FaShieldAlt />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Platform</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">All transactions and registrations are protected with cutting-edge security.</p>
                        </div>
                    </div>
                </section>

                {/* Events Section */}
                <section className="py-12 md:py-16">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-4 border-b border-gray-200">
                        <h2 className="text-3xl font-extrabold text-gray-900">
                            Upcoming Events
                        </h2>
                        <div className="text-gray-500 font-medium">
                            {events.length} results found
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-20 text-xl font-semibold text-gray-600">
                            Loading events...
                        </div>
                    ) : events.length === 0 ? (
                        <div className="text-center py-20 text-xl text-gray-500">
                            No events found matching your search.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {events.map((event) => (
                                <div
                                    key={event._id}
                                    className="bg-white rounded-3xl overflow-hidden shadow-md border border-gray-100 flex flex-col hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
                                >
                                    {/* Event Image */}
                                    <div className="h-48 bg-gray-200 overflow-hidden relative">
                                        {event.imageUrl ? (
                                            <img
                                                src={event.imageUrl}
                                                alt={event.title}
                                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-600 font-bold text-2xl">
                                                {event.category || 'Event'}
                                            </div>
                                        )}
                                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                                            {event.ticketprice === 0 ? (
                                                <span className="text-green-600">FREE</span>
                                            ) : (
                                                <span className="text-gray-900">₹{event.ticketprice}</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Event Content */}
                                    <div className="p-6 flex-grow flex flex-col">
                                        <div className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                            {event.category}
                                        </div>

                                        <h3 className="text-xl font-bold text-gray-800 mb-3">
                                            {event.title}
                                        </h3>

                                        <div className="flex flex-col gap-2 mb-4 text-gray-600 text-sm">
                                            <div className="flex items-center gap-2">
                                                <FaCalendarAlt className="text-gray-400" />
                                                <span>
                                                    {new Date(event.date).toLocaleDateString(
                                                        undefined,
                                                        {
                                                            weekday: 'long',
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        }
                                                    )}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <FaMapMarkerAlt className="text-gray-400" />
                                                <span>{event.location}</span>
                                            </div>
                                        </div>

                                        {/* Seats Progress */}
                                        <div className="mt-auto">
                                            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                                <div
                                                    className="bg-blue-600 h-2 rounded-full"
                                                    style={{
                                                        width: `${
                                                            event.totalseats > 0
                                                                ? (event.availableSeats / event.totalseats) * 100
                                                                : 0
                                                        }%`
                                                    }}
                                                ></div>
                                            </div>

                                            <p className="text-xs text-gray-500 mb-4">{event.availableSeats} of {event.totalseats} seats remaining</p>

                                            <Link to={`/events/${event._id}`} className="block w-full text-center px-5 py-3 rounded-xl bg-gray-900 text-white font-semibold hover:bg-black transition shadow-sm">View Details</Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            {/* Footer */}
            <footer className="py-16 border-t border-gray-200 bg-white text-center mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-center items-center gap-2 mb-4">
                        <FaTicketAlt className="text-gray-800 text-2xl" />
                        <span className="text-xl font-bold text-gray-900">
                            reservIT
                        </span>
                    </div>

                    <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
                        The simplest, most dynamic way to manage, discover, and
                        host world-class events in your local city. Let's make
                        memories together.
                    </p>

                    <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                        &copy; {new Date().getFullYear()} reservIT Platform. All
                        rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;