const Event = require('../models/Event');

exports.getAllEvents = async (req, res) => {
    try {
        const filters = {};
        
        // Handle search by title
        if (req.query.search) {
            filters.title = { $regex: req.query.search, $options: 'i' }; // Case-insensitive search
        }
        
        if (req.query.category) {
            filters.category = req.query.category;
        }
        
        if (req.query.ticketprice) {
            filters.ticketprice = req.query.ticketprice;
        }

        const events = await Event.find(filters);
        res.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.createEvent = async (req, res) => {
    try {
        const totalSeats = req.body.totalseats ?? req.body.totalSeats;
        const availableSeats = req.body.availableSeats ?? totalSeats;
        const imageUrl = req.body.imageUrl ?? req.body.imageURL ?? req.body.imageurl;
        const ticketprice = req.body.ticketprice ?? req.body.ticketPrice;
        const { title, description, date, location, category } = req.body;

        const missingFields = [];
        if (!title) missingFields.push('title');
        if (!description) missingFields.push('description');
        if (!date) missingFields.push('date');
        if (!location) missingFields.push('location');
        if (!category) missingFields.push('category');
        if (totalSeats == null) missingFields.push('totalseats or totalSeats');
        if (ticketprice == null) missingFields.push('ticketprice or ticketPrice');
        if (!imageUrl) missingFields.push('imageUrl or imageURL');

        if (missingFields.length) {
            return res.status(400).json({
                message: 'Missing required event fields',
                missingFields
            });
        }

        const event = await Event.create({
            title,
            description,
            date,
            location,
            category,
            totalseats: totalSeats,
            availableSeats,
            ticketprice,
            imageUrl,
            createdBY: req.user._id
        });
        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.updateEvent = async (req, res) => {
    const totalSeats = req.body.totalseats ?? req.body.totalSeats;
    const imageUrl = req.body.imageUrl ?? req.body.imageURL ?? req.body.imageurl;
    const ticketprice = req.body.ticketprice ?? req.body.ticketPrice;
    const { title, description, date, location, category, availableSeats } = req.body;
    try {
        const event = await Event.findByIdAndUpdate(req.params.id, {
            title,
            description,
            date,
            location,
            category,
            totalseats: totalSeats,
            availableSeats,
            ticketprice,
            imageUrl
        }, { new: true });
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};