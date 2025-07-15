require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const mongoose = require('mongoose');
const { apiLimiter } = require('./core/security/rateLimiter');
const errorHandler = require('./core/middlewares/errorHandler');
const Category = require('../src/models/Product');
const { authorize } = require('./core/security/authorization');
const { authenticate } = require('./core/security/jwt');
const cookieParser = require('cookie-parser');
const logger = require('../src/services/logger');
const path = require('path');
const session = require('express-session');
const hpp = require('hpp');

const app = express();

// 1. Initial Security Middlewares
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

const corsOptions = {
  origin: (process.env.CORS_ORIGINS || 'http://localhost:3000').split(','),
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));

app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// 2. Body Parsing Middlewares (must come before sanitization)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Add session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'default_secret', // Use a secure secret from environment variables
    resave: false, // Prevent resaving session if it hasn't been modified
    saveUninitialized: false, // Don't save uninitialized sessions
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

// 3. Cookie Parser
app.use(cookieParser(process.env.COOKIE_SECRET));

// 4. Data Sanitization Middlewares (order is important)
/* Move xss-clean before custom sanitization
app.use(xss());

app.use(
  mongoSanitize({
    replaceWith: '_', // Replace prohibited characters with an underscore
  })
);*/

app.use((req, res, next) => {
  // Custom sanitizer that won't modify read-only properties
  try {
    if (req.body) sanitize(req.body);
    if (req.query) sanitize(req.query);
    next();
  } catch (err) {
    logger.warn('Sanitization warning:', err.message);
    next();
  }

  function sanitize(obj) {
    Object.keys(obj).forEach(key => {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitize(obj[key]);
      } else if (typeof obj[key] === 'string') {
        obj[key] = obj[key].replace(/[$<>]/g, '');
      }
    });
  }
});

// 5. Security Middlewares (safer alternatives)
app.use(hpp());

// 6. Rate limiting
app.use('/api/', apiLimiter);

// Database initialization
async function initializeDatabase() {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}`);
    logger.info('Connected to MongoDB');

    await Category.initializeRootCategory();
    logger.info('Database categories initialized');
  } catch (err) {
    logger.error('Database initialization failed', err);
    throw err;
  }
}

// Load routes with error handling
try {
  app.use('/api', require('./modules/user/routes'));
  app.use('/api/admin', authenticate, authorize('admin'), require('./modules/admin/routes'));
  app.use('/api/core', require('./modules/core/routes'));
  app.use('/api/costumer', authenticate, authorize('costumer', 'seller', 'moderator', 'admin'), require('./modules/costumer/routes'));
  app.use('/api/moderatorSupport', authenticate, authorize('moderator', 'admin'), require('./modules/moderatorSupport/routes'));
  app.use('/api/seller', authenticate, authorize('seller', 'moderator', 'admin'), require('./modules/seller/routes'));
} catch (err) {
  logger.error('Critical error loading routes:', err);
  process.exit(1);
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Error handling
app.use(errorHandler);

module.exports = { app, initializeDatabase };