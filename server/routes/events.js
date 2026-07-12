const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const { 
    getAllEvents, 
    getEventById, 
    createEvent, 
    updateEvent, 
    deleteEvent,
    generateDescriptionOnly,
    getRelatedEvents
} = require('../controllers/eventController');

// ========== GET ALL EVENTS ==========
router.get('/', getAllEvents);

// ========== GET EVENT BY ID ==========
router.get('/:id', getEventById);

// ========== AI: GENERATE DESCRIPTION PREVIEW ==========
router.post('/generate-description', protect, generateDescriptionOnly);

// ========== AI: GET RELATED EVENTS ==========
router.get('/:id/related', getRelatedEvents);

// ========== CREATE EVENT (Admin only) ==========
router.post('/', protect, admin, createEvent);

// ========== UPDATE EVENT (Admin only) ==========
router.put('/:id', protect, admin, updateEvent);

// ========== DELETE EVENT (Admin only) ==========
router.delete('/:id', protect, admin, deleteEvent);

module.exports = router;