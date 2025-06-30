require('dotenv').config();
const express = require('express');
const cors = require('cors');

const apiRoutes = require('./routes');

const app = express();
const port = process.env.PORT || 8080;

const allowedOrigins = [
  'http://localhost:3000',
  'https://gcp-app-frontend.vercel.app',
  'http://localhost:8080'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'), false);
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));

app.use(express.json());

// Mount the route handlers
app.use('/api', apiRoutes);

app.listen(port, () => {
  console.log(`Backend listening at http://localhost:${port}`);
});
