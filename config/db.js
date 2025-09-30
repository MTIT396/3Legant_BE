const mysql = require("mysql2");
const fs = require("fs");

require("dotenv").config();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
  charset: "utf8mb4",
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0,
  ssl: {
    ca: fs.readFileSync("./certs/ca.pem"), // đọc từ file
    rejectUnauthorized: true,
  },
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
