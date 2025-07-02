import 'dotenv/config';
import express, { Express } from 'express';
import cors, { CorsOptions } from 'cors';
import apiRoutes from './routes';

const app: Express = express();
const port: string | number = process.env.PORT || 8080;

const allowedOrigins: string[] = [
  'http://localhost:3000',
  'https://gcp-app-frontend.vercel.app',
  'http://localhost:8080'
];

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Mount the route handlers
app.use('/api', apiRoutes);

app.listen(port, () => {
  console.log(`✅ Backend listening at http://localhost:${port}`);
});