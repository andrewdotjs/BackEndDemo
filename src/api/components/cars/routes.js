import { carsController } from './controller.js';
import express from 'express';
import { authenticateToken } from '../../middleware/authenticateToken.js';

const carsRouter = express.Router();

carsRouter.get('/cars', authenticateToken, carsController.getCars);

export { carsRouter };