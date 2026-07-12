import { Link } from 'react-router-dom';

function EventCard({ event }) {
    return (
        <div className="bg-white rounded-lg shadow hover:shadow-lg transition p-4 border">
            <img 
                src={event.imageUrl || 'https://via.placeholder.com/400x200'} 
                alt={event.title}
                className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <h3 className="text-xl font-bold mb-2">{event.title}</h3>
            <p className="text-gray-600 text-sm mb-3">{event.description?.slice(0, 100)}...</p>
            
            {/* 🔥 AI Tags Display */}
            {event.tags && event.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                    {event.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                            #{tag}
                        </span>
                    ))}
                    {event.aiGeneratedTags && (
                        <span className="text-xs text-gray-400 ml-1">🧠 AI</span>
                    )}
                </div>
            )}
            
            <div className="flex justify-between items-center mt-4">
                <div>
                    <p className="text-sm text-gray-500">{event.location}</p>
                    <p className="text-sm text-gray-500">{new Date(event.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                    <p className="text-lg font-bold">₹{event.ticketprice}</p>
                    <Link 
                        to={`/events/${event._id}`}
                        className="text-blue-600 hover:underline text-sm"
                    >
                        View Details →
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default EventCard;