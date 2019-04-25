require('dotenv').config();
module.exports = {
  development: {
    "host": `${process.env.COCKROACH_HOST}`,
    "username": `${process.env.COCKROACH_USER}`,
    "password": `${process.env.COCKROACH_PASS}`,
    "database": `${process.env.COCKROACH_DB}`,
    "port": 26257,
    "dialect": "postgres"
  },
  test: {
    "host": `${process.env.COCKROACH_HOST}`,
    "username": `${process.env.COCKROACH_USER}`,
    "password": `${process.env.COCKROACH_PASS}`,
    "database": `${process.env.COCKROACH_DB}`,
    "port": 26257,
    "dialect": "postgres"
  },
  production: {
    "host": `${process.env.COCKROACH_HOST}`,
    "username": `${process.env.COCKROACH_USER}`,
    "password": `${process.env.COCKROACH_PASS}`,
    "database": `${process.env.COCKROACH_DB}`,
    "port": 26257,
    "dialect": "postgres"
  }
};
