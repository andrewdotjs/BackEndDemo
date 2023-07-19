import knex from 'knex';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { updateToken, createToken } from '../../../utilities/token.js';

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

const signin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    // Catch instances of incomplete requests.
    res.status(400).send({
      status: 400,
      message: 'Incomplete request received.'
    });
  }

  const user = await getUser(email, password);

  if (!user) {
    // Catch instances of wrong emails or passwords.
    res.status(401).send({
      status: 401,
      message: 'Invalid email or password.'
    });
  }

  // Create token and update token in database.
  const { token, sessionID } = await createToken(email);
  updateToken(email, true, { sessionID: sessionID });

  // Set cookies.
  res.status(200).cookie('token', token).send({
    status: 200,
    message: 'User found, cookie set.'
  });
}
  

const signout = async (req, res) => {
  const { token } = req.cookies;
  const { email } = jwt.verify(token, process.env.PRIVATE_KEY);
  updateToken(email, false);

  res.status(200).send({
    status: 200,
    message: 'Session token removed from database.'
  });
}

const register = async (req, res) => {
  const { email, password, first_name, last_name, birth_date } = req.body;

  if (!email || !password || !first_name || !last_name || !birth_date) {
    // Ensure that the user doesn't feed the server a bad request.
    res.status(400).send({
      status: 400,
      message: 'Bad request received.'
    });
  }

  const result = await postUser(email, password, first_name, last_name, birth_date);

  if (!result) {
    // Ensure that user doesn't input an email that already exists in the db.
    res.status(400).send({
      status: 400,
      message: 'Email already exists.'
    });
  } else {
    res.status(200).send({
      status: 200,
      message: 'User created'
    });
  }
}

const getUser = async (email, password) => {
  // Return user that matches with given email and password in the db.
  const user = await knexClient('users')
    .select('*')
    .where('email', '=', email)
    .andWhere('password', '=', knexClient.raw(`crypt('${password}', password)`));

  return user[0];
}

const postUser = async (email, password, first_name, last_name, birth_date) => {
  // Get current date.
  const today = new Date();

  // Get year, month, and day and format them into yyyy-mm-dd 
  const year = today.getFullYear();
  const month = (today.getMonth() + 1) < 10 ? '0' + (today.getMonth() + 1) : (today.getMonth() + 1);
  const day = today.getDate() < 10 ? '0' + today.getDate() : today.getDate();
  const formattedDate = `${year}-${month}-${day}`;

  // Insert new user, return null if user already exists.
  const result = await knexClient('users')
    .insert({
      user_id: knexClient.raw('gen_random_uuid()'),
      first_name: first_name,
      last_name: last_name,
      email: email,
      password: knexClient.raw(`crypt('${password}', gen_salt('bf'))`),
      birth_date: birth_date,
      date_created: formattedDate,
      session_token: null,
      seller: false,
      seller_id: knexClient.raw('gen_random_uuid()')
    })
    .catch((err) => {
      console.error( `DB INSERTION ERROR (${err.code}): ${err.detail}`);

      return null;
    });

  return result;
}

export const usersController = {
  signin,
  signout,
  register
}