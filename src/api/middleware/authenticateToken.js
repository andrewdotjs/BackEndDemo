import jwt from 'jsonwebtoken';
import 'dotenv/config';
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

const authenticateToken = async (req, res, next) => {
  // Middleware that authorizes users if email and sessionID within token content matches with those in db.

  if (!req.cookies.token) {
    // Catch instances of existence of cookies but no token.
    return res.status(401).send({
      status: 401,
      message: 'Failure while authenticating token: Token cookie not found on client.'
    });
  }

  const { token } = req.cookies;
  const { sessionID, email } = jwt.verify(token, process.env.PRIVATE_KEY);

  const user = await knexClient('users')
    .where('session_token', '=', sessionID)
    .andWhere('email', '=', email);
  
  if (!user[0]) {
    // Catch instances of no user matching in database.
    return res.status(401).send({
      status: 401,
      message: 'Failure while authenticating token: Contents of token do not match with those within the database.'
    });
  }

  next();
}

export {
  authenticateToken
}