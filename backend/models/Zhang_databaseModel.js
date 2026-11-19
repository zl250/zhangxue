/*
  姓名：张雪 | 学号：24001010727 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
  说明：数据库连接模型，使用 mysql2 建立临时连接并读取服务信息
*/

const Zhang_mysql = require("mysql2/promise");

async function Zhang_testConnection(Zhang_options) {
  const Zhang_connection = await Zhang_mysql.createConnection({
    host: Zhang_options.host,
    port: Zhang_options.port,
    user: Zhang_options.user,
    password: Zhang_options.password,
    connectTimeout: 5000
  });

  try {
    const [Zhang_rows] = await Zhang_connection.query(
      "SELECT VERSION() AS version, @@hostname AS hostname, @@port AS port"
    );
    return Zhang_rows[0];
  } finally {
    await Zhang_connection.end();
  }
}

module.exports = {
  Zhang_testConnection: Zhang_testConnection
};
