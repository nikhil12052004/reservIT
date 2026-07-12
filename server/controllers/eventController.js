const Event = require('../models/Event');
const { generateTags, generateDescription } = require('../services/aiTagging');
const { semanticSearch } = require('../services/aiSearch');

// ========== GET ALL EVENTS ==========
exports.getAllEvents = async (req, res) => {
    try {
        const filters = {};
        
        // Check for semantic search
        const isSemanticSearch = req.query.semantic === 'true' && req.query.search;
        
        // Regular filters (only for non-semantic search)
        if (req.query.search && !isSemanticSearch) {
            filters.title = { $regex: req.query.search, $options: 'i' };
        }
        
        if (req.query.category) {
            filters.category = req.query.category;
        }
        
        if (req.query.ticketprice) {
            filters.ticketprice = req.query.ticketprice;
        }

        // Get events from database
        let events = await Event.find(filters);
        console.log('📊 Events found in DB:', events.length);
        
        // 🔥 SEMANTIC SEARCH
        if (isSemanticSearch && req.query.search) {
            console.log('🔍 Performing semantic search for:', req.query.search);
            const results = await semanticSearch(req.query.search, events);
            console.log('📊 Semantic results count:', results.length);
            
            // 🔥🔥🔥 YAHAN MAIN CHANGE HAI 🔥🔥🔥
            // Results ko JSON string mein convert karke wapas parse karo
            // Isse saare hidden properties clean ho jayenge
            const cleanResults = JSON.parse(JSON.stringify(results));
            
            console.log('✅ Clean results count:', cleanResults.length);
            if (cleanResults.length > 0) {
                console.log('📊 First clean result:', cleanResults[0].title);
            }
            
            return res.status(200).json(cleanResults);
        }
        
        // Normal search response
        console.log('📊 Returning normal results:', events.length);
        res.status(200).json(events);
        
    } catch (error) {
        console.error('❌ Error fetching events:', error);
        res.status(500).json({ 
            message: 'Server Error', 
            error: error.message 
        });
    }
};

// ========== GET EVENT BY ID ==========
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

// ========== CREATE EVENT ==========
exports.createEvent = async (req, res) => {
    try {
        const totalSeats = req.body.totalseats ?? req.body.totalSeats;
        const availableSeats = req.body.availableSeats ?? totalSeats;
        const imageUrl = req.body.imageUrl ?? req.body.imageURL ?? req.body.imageurl;
        const ticketprice = req.body.ticketprice ?? req.body.ticketPrice;
        const { title, description, date, location, category } = req.body;
        const useAI = req.body.useAI !== undefined ? req.body.useAI : true;

        const missingFields = [];
        if (!title) missingFields.push('title');
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

        let finalDescription = description;
        let aiDescription = false;
        let aiTags = [];
        let aiTagsGenerated = false;

        if (useAI) {
            if (!description || description.length < 10) {
                finalDescription = await generateDescription(title);
                aiDescription = true;
            }
            aiTags = await generateTags(title, finalDescription);
            aiTagsGenerated = true;
        }

        const event = await Event.create({
            title,
            description: finalDescription,
            date,
            location,
            category,
            totalseats: totalSeats,
            availableSeats,
            ticketprice,
            imageUrl,
            createdBY: req.user._id,
            tags: aiTags,
            aiGeneratedTags: aiTagsGenerated,
            aiGeneratedDescription: aiDescription
        });
        
        res.status(201).json({
            success: true,
            event,
            aiGenerated: {
                description: aiDescription,
                tags: aiTagsGenerated,
                tagsList: aiTags
            }
        });
    } catch (error) {
        console.error('Create event error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// ========== UPDATE EVENT ==========
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

// ========== DELETE EVENT ==========
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

// ========== AI: GENERATE DESCRIPTION PREVIEW ==========
exports.generateDescriptionOnly = async (req, res) => {
    try {
        const { title } = req.body;
        
        if (!title || title.length < 3) {
            return res.status(400).json({
                success: false,
                error: 'Please provide a title (minimum 3 characters)'
            });
        }
        
        const description = await generateDescription(title);
        
        res.json({
            success: true,
            title,
            description,
            generated: true
        });
    } catch (error) {
        console.error('Generate description error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// ========== AI: GET RELATED EVENTS ==========
exports.getRelatedEvents = async (req, res) => {
    try {
        const { id } = req.params;
        const limit = parseInt(req.query.limit) || 4;
        
        const originalEvent = await Event.findById(id);
        if (!originalEvent) {
            return res.status(404).json({ message: 'Event not found' });
        }
        
        const query = `${originalEvent.title} ${originalEvent.description} ${originalEvent.category} ${originalEvent.tags?.join(' ') || ''}`;
        
        const otherEvents = await Event.find({
            _id: { $ne: id },
            date: { $gte: new Date() }
        });
        
        if (otherEvents.length === 0) {
            return res.json({ results: [] });
        }
        
        const results = await semanticSearch(query, otherEvents);
        
        res.json({
            success: true,
            results: results.slice(0, limit)
        });
    } catch (error) {
        console.error('Related events error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};