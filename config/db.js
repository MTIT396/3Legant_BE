const mysql = require("mysql2");
const fs = require("fs");

require("dotenv").config();
if (process.env.NODE_ENV === "production") {
  const caPath = path.join(__dirname, "certs/ca.pem");

  // Kiểm tra file tồn tại
  if (fs.existsSync(caPath)) {
    sslConfig = {
      ca: fs.readFileSync(caPath),
      rejectUnauthorized: true,
    };
  } else {
    console.error("⚠️ CA certificate not found at:", caPath);
    // Fallback nếu không có file
    sslConfig = {
      rejectUnauthorized: false,
    };
  }
}
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.DB_PORT),
  charset: "utf8mb4",
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0,
  connectTimeout: 30000,
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
