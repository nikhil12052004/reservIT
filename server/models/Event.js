const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: { 
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    totalseats: {
        type: Number,
        required: true
    },
    availableSeats: {
        type: Number,
        required: true
    },
    ticketprice: {
        type: Number,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    createdBY: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    // ========== AI FIELDS ==========
    tags: {
        type: [String],
        default: []
    },
    aiGeneratedTags: {
        type: Boolean,
        default: false
    },
    aiGeneratedDescription: {
        type: Boolean,
        default: false
    }
    
}, { timestamps: true });

module.exports = mongoose.model('Event', EventSchema);