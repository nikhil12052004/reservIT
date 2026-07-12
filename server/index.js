const express = require('express');
const cors = require('cors');  // ✅ Sirf ek baar import
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events.js');
const bookingRoutes = require('./routes/booking.js');

// 🔥 AI Warmup Import
const { warmupAI } = require('./services/aiWarmup');

dotenv.config();

const app = express();

// 🔥🔥🔥 CORS - YEH SAHI TARIKA HAI 🔥🔥🔥
app.use(cors({
    origin: ['https://reservitt.netlify.app', 'http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log('✅ Connected to MongoDB !!');
    warmupAI();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`);
    });
})
.catch((error) => console.error('❌ Error connecting to MongoDB:', error));