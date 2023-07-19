// Import required libraries
import express from 'express';
import cookieParser from 'cookie-parser';
import { usersRouter } from './api/components/users/index.js';
import { carsRouter } from './api/components/cars/index.js';
import 'dotenv/config';

const PORT = process.env.PORT || 3000;
const app = express();

// Required Middleware
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Imported Routes
app.use('/', usersRouter);
app.use('/', carsRouter);

app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
})