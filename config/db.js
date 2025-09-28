const mysql = require("mysql2");
require("dotenv").config();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
  charset: "utf8mb4",
  timezone: "+07:00",
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0,
};

const pool = mysql.createPool(dbConfig);
pool.getConnection((err, connection) => {
  if (err) {
    console.error(err);
    console.log(">>> Can't Connected to Database");
  } else {
    console.log(">>> Connected to Database");
    connection.release();
  }
});
module.exports = pool.promise();
