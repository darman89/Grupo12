module.exports = {
  development: {
    "host": 'localhost',
    "username": 'root',
    "password": '',
    "database": 'proyectouno',
    "port": 26257,
    "dialect": "postgres"
  },
  test: {
    "host": '192.168.99.100',
    "username": 'postgres',
    "password": 'postgres',
    "database": 'proyectouno',
    "port": process.env.DB_PORT,
    "dialect": "postgres"
  },
  production: {
    "host": '192.168.99.100',
    "username": 'postgres',
    "password": 'postgres',
    "database": 'proyectouno',
    "port": process.env.DB_PORT,
    "dialect": "postgres"
  }
};
