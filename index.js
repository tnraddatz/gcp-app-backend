require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');

const app = express();
const port = process.env.PORT || 8080;

// Session Middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_very_secret_session_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production' } // Use secure cookies in production
}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// CORS Configuration
// Allow requests from your frontend origins
const allowedOrigins = [
  'http://localhost:3000',
  'https://gcp-app-frontend.vercel.app',
  'http://localhost:8080' // For local backend testing
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Allow cookies to be sent
}));

app.use(express.json());

// Passport Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.NODE_ENV === 'production' 
      ? 'https://gcp-app-backend-530548492160.us-central1.run.app/auth/google/callback' 
      : 'http://localhost:8080/auth/google/callback',
    scope: ['profile', 'email']
  },
  function(accessToken, refreshToken, profile, cb) {
    // In a real application, you would find or create a user in your database here.
    // For this example, we'll just pass the profile.
    return cb(null, profile);
  }
));

// Serialize and Deserialize User
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Authentication Routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication, redirect to frontend or send success response
    // In a real app, you might redirect to a dashboard or a specific page
    res.redirect(process.env.NODE_ENV === 'production' ? 'https://gcp-app-frontend.vercel.app' : 'http://localhost:3000');
  }
);

app.get('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) { return next(err); }
    req.session.destroy(() => {
      res.clearCookie('connect.sid'); // Clear session cookie
      res.redirect(process.env.NODE_ENV === 'production' ? 'https://gcp-app-frontend.vercel.app' : 'http://localhost:3000');
    });
  });
});

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
}

// Basic route for testing (unauthenticated)
app.get('/api/message', (req, res) => {
  res.json({ message: 'Hello from backend! (Unauthenticated)' });
});

// Protected route
app.get('/api/user', isAuthenticated, (req, res) => {
  res.json({ user: req.user, message: 'User data (Authenticated)' });
});

app.listen(port, () => {
  console.log(`Backend listening at http://localhost:${port}`);
});