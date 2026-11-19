/*
  姓名：张雪 | 学号：24001010727 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
  说明：MySQL 连接池配置，凭据全部来自 backend/.env
*/

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const Zhang_mysql = require("mysql2/promise");

const Zhang_pool = Zhang_mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: "utf8mb4"
});

module.exports = Zhang_pool;
