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

const getCars = async (req, res) => {
  // Gets all cars from database
  const queries = req.query;

  // If queries exist, search through database as a filter.
  if (!queries) {
    const carsArray = await knexClient('cars');
    res.status(200).send(carsArray);
  } else {
    const carsArray = await knexClient('cars')
      .where((builder) => {
        // Asssemble query.
        for (const [key, value] of Object.entries(queries)) {
          if (key === 'moreThan') {
            builder.andWhere('price', '>', value);
          } else if (key === 'lessThan') {
            builder.andWhere('price', '<', value);
          } else {
            builder.andWhere(key, '=', value);
          }
        }
      });

    res.status(200).send(carsArray);
  }
}

export const carsController = {
  getCars
}