import 'dotenv/config';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import knex from 'knex';

const knexClient = knex({
  client: 'pg',
  connection: {
    host: '127.0.0.1',
    port: 1227,
    user: 'demo_user',
    password: 'demo_password',
    database: 'demo_user'
  }
});

const createToken = async (email) => {
  const sessionID = uuidv4();
  const token = await jwt.sign({ email: email, sessionID: sessionID }, process.env.PRIVATE_KEY, { expiresIn: '30d' });
  
  return { 
    token: token, 
    sessionID: sessionID 
  };
}

const updateToken = async (email, bool, options = undefined) => {
  // Allows server to update session token in db. If bool === false, removes token from db. Otherwise, updates token in db for user.

  if (bool && !options.sessionID) {
    console.error('Failure within updateToken(): bool was set to true but options.sessionID was not defined ');
    return false;
  }

  await knexClient('users')
    .where('email', '=', email)
    .update({session_token: bool ? options.sessionID : null});

  return true;
}

export {
  createToken,
  updateToken
}