import { useState, useEffect } from 'react';
import EventCard from '../components/EventCard';

function Events() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    // Fetch events
    const fetchEvents = async (query = '') => {
        setLoading(true);
        try {
            let url = 'http://localhost:5000/api/events';
            if (query.trim()) {
                url += `?search=${encodeURIComponent(query)}&semantic=true`;
            }
            const response = await fetch(url);
            const data = await response.json();
            setEvents(data);
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    // 🔥 Smart Search Handler
    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        await fetchEvents(searchQuery);
        setIsSearching(false);
    };

    return (
        <div className="container mx-auto px-6 py-8">
            <h2 className="text-3xl font-bold mb-6 text-center">Upcoming Events</h2>

            {/* 🔥 Smart Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-2 mb-8 max-w-2xl mx-auto">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search events... (try 'tech workshops' or 'music festivals')"
                    className="flex-1 border p-3 rounded-lg"
                />
                <button
                    type="submit"
                    disabled={isSearching}
                    className="bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-lg transition disabled:opacity-50"
                >
                    {isSearching ? '🔍 Searching...' : ' Search'}
                </button>
            </form>

            {/* Loading State */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-500">Loading events...</p>
                </div>
            ) : events.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No events found. Try a different search!</p>
                </div>
            ) : (
                /* Events Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
                    {events.map(event => (
                        <EventCard key={event._id} event={event} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default Events;