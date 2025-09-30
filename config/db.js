const mysql = require("mysql2");
const fs = require("fs");

require("dotenv").config();
if (process.env.NODE_ENV === "production") {
  const fs = require("fs");
  sslConfig = {
    ca: fs.readFileSync(__dirname + "/certs/ca.pem"),
    rejectUnauthorized: true,
  };
}

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
  ssl: sslConfig,
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
