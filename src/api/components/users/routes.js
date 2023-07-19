import { usersController } from "./controller.js";
import express from 'express';
import { authenticateToken } from "../../middleware/authenticateToken.js";

const usersRouter = express.Router();
  
usersRouter.get('/users/sign-in', usersController.signin);
usersRouter.get('/users/sign-out', authenticateToken, usersController.signout);
usersRouter.post('/users/register', usersController.register);

export { usersRouter };