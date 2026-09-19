require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const atsRoutes = require('./routes/atsRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const resumeQuestionsRoutes = require('./routes/resumeQuestionsRoutes');
const skillGapRoutes = require('./routes/skillGapRoutes');
const companyRoutes = require('./routes/companyRoutes');
const roadmapRoutes = require('./routes/roadmapRoutes');
const fastTrackRoutes = require('./routes/fastTrackRoutes');
const lastMinuteRoutes = require('./routes/lastMinuteRoutes');
const chatRoutes = require('./routes/chatRoutes');
const bookmarkRoutes = require('./routes/bookmarkRoutes');
const historyRoutes = require('./routes/historyRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static directory for uploaded resumes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health Check & Root
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'NexOffer API is running smoothly.',
    version: '1.0.0',
    tagline: 'Your Next Offer Starts Here.',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/resume', atsRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/resume-questions', resumeQuestionsRoutes);
app.use('/api/skill-gap', skillGapRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/fast-track', fastTrackRoutes);
app.use('/api/last-minute', lastMinuteRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/history', historyRoutes);

// Catch 404 for unhandled API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} not found on this server.`,
  });
});

// Global Centralized Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 NexOffer Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
});
