const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Event = require('./models/Event');
const Booking = require('./models/Bookings');

dotenv.config();

// ================= USERS =================
const users = [
    { name: 'Admin User', email: 'admin@reservit.com', password: 'password123', role: 'admin' },
    { name: 'Demo User', email: 'user@reservit.com', password: 'password123', role: 'user' },
    { name: 'Nikhil Thakur', email: 'nikhil@reservit.com', password: 'password123', role: 'user' },
    { name: 'Aarav Sharma', email: 'aarav@reservit.com', password: 'password123', role: 'user' },
    { name: 'Priya Verma', email: 'priya@reservit.com', password: 'password123', role: 'user' },
    { name: 'Rohan Gupta', email: 'rohan@reservit.com', password: 'password123', role: 'user' },
    { name: 'Ananya Singh', email: 'ananya@reservit.com', password: 'password123', role: 'user' },
    { name: 'Karan Malhotra', email: 'karan@reservit.com', password: 'password123', role: 'user' },
    { name: 'Sneha Kapoor', email: 'sneha@reservit.com', password: 'password123', role: 'user' },
    { name: 'Aditya Mehta', email: 'aditya@reservit.com', password: 'password123', role: 'user' },
    { name: 'Ishita Jain', email: 'ishita@reservit.com', password: 'password123', role: 'user' }
];

// ================= EVENTS =================
const events = [
    {
        title: 'Delhi Tech Summit 2026',
        description: 'A premier technology conference featuring AI, Web Development, Cloud Computing and Cyber Security.',
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        location: 'Pragati Maidan, New Delhi',
        category: 'Technology',
        totalseats: 300,
        ticketprice: 0,
        imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Sunburn Goa Music Festival',
        description: 'India’s biggest electronic music festival with world-famous DJs and beach parties.',
        date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        location: 'Vagator Beach, Goa',
        category: 'Music',
        totalseats: 1000,
        ticketprice: 3500,
        imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Startup India Innovation Summit',
        description: 'Meet entrepreneurs, investors, and industry leaders discussing the future of Indian startups.',
        date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        location: 'Bangalore International Exhibition Centre, Bengaluru',
        category: 'Business',
        totalseats: 250,
        ticketprice: 2000,
        imageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Jaipur Art & Culture Festival',
        description: 'Explore traditional and contemporary Indian art, handicrafts, and live performances.',
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        location: 'Jawahar Kala Kendra, Jaipur',
        category: 'Art',
        totalseats: 400,
        ticketprice: 250,
        imageUrl: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'IIT Delhi Hackathon 2026',
        description: 'A 24-hour coding challenge where developers build innovative solutions.',
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        location: 'IIT Delhi, New Delhi',
        category: 'Technology',
        totalseats: 500,
        ticketprice: 100,
        imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Cloud & DevOps Conference India',
        description: 'Learn about Kubernetes, AWS, Docker, and CI/CD pipelines from industry experts.',
        date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        location: 'HITEX Exhibition Center, Hyderabad',
        category: 'Technology',
        totalseats: 200,
        ticketprice: 1500,
        imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800'
    }
];

// ================= SEED FUNCTION =================
const seedDatabase = async () => {
    try {
        await mongoose.connect(
            process.env.MONGO_URI || 'mongodb://localhost:27017/reservit'
        );
        console.log('\n✅ MongoDB connection open...');

        // Clear existing data
        await User.deleteMany({});
        await Event.deleteMany({});
        await Booking.deleteMany({});
        console.log('🗑️ Cleared existing data.');

        // Hash passwords
        const salt = await bcrypt.genSalt(10);
        const hashedUsers = users.map(user => ({
            ...user,
            password: bcrypt.hashSync(user.password, salt),
            isVerified: true
        }));

        // Insert users
        const createdUsers = await User.insertMany(hashedUsers);
        const adminUser = createdUsers.find(user => user.role === 'admin');
        const normalUsers = createdUsers.filter(user => user.role === 'user');

        console.log(`👤 Created ${createdUsers.length} users.`);

        // Insert events
        const eventsWithAdmin = events.map(event => ({
            ...event,
            availableSeats: event.totalseats,
            createdBY: adminUser._id
        }));

        const createdEvents = await Event.insertMany(eventsWithAdmin);
        console.log(`🎉 Created ${createdEvents.length} events.`);

        // Generate random bookings
        const bookingsData = [];

        for (const event of createdEvents) {
            const randomCount = Math.floor(Math.random() * 4) + 3; // 3 to 6 users

            const shuffledUsers = [...normalUsers].sort(
                () => 0.5 - Math.random()
            );

            const selectedUsers = shuffledUsers.slice(0, randomCount);

            for (const user of selectedUsers) {
                const statuses = ['pending', 'confirmed', 'cancelled'];
                const status =
                    statuses[Math.floor(Math.random() * statuses.length)];

                let paymentStatus = 'non-paid';

                if (status === 'confirmed') {
                    paymentStatus = 'paid';

                    // Reduce available seats if possible
                    if (event.availableSeats > 0) {
                        event.availableSeats -= 1;
                    }
                }

                bookingsData.push({
                    userId: user._id,
                    eventId: event._id,
                    status,
                    paymentStatus,
                    amount: event.ticketprice
                });
            }

            await event.save();
        }

        // Insert bookings
        await Booking.insertMany(bookingsData);
        console.log(`🎫 Inserted ${bookingsData.length} bookings.`);

        console.log('\n🚀 Database seeded successfully!');
        console.log('-------------------------------------------');
        console.log('Admin Email: admin@reservit.com');
        console.log('User Email:  user@reservit.com');
        console.log('Password for all users: password123');
        console.log('-------------------------------------------\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
};

seedDatabase();
