/*
  姓名：张雪 | 学号：24001010727 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
  说明：数据库连接控制器，提供默认配置读取与连接测试
*/

const Zhang_databaseModel = require("../models/Zhang_databaseModel");

const Zhang_errorMessages = {
  ER_ACCESS_DENIED_ERROR: "用户名或密码错误，请重新输入。",
  ER_DBACCESS_DENIED_ERROR: "当前账号没有访问权限。",
  ECONNREFUSED: "MySQL 服务未启动或端口不可达，请先启动 MySQL。",
  ETIMEDOUT: "连接超时，请检查 MySQL 服务是否正常运行。",
  ENOTFOUND: "无法解析数据库主机地址。",
  ER_NOT_SUPPORTED_AUTH_MODE: "MySQL 认证方式不受支持，请检查账号配置。"
};

function Zhang_getDefaults(req, res) {
  res.json({
    code: 0,
    msg: "获取默认配置成功",
    data: {
      username: process.env.DB_USER || "",
      password: process.env.DB_PASSWORD || "",
      host: process.env.DB_HOST || "localhost",
      port: 3306
    }
  });
}

async function Zhang_connect(req, res) {
  const Zhang_username = typeof req.body.username === "string" ? req.body.username.trim() : "";
  const Zhang_password = typeof req.body.password === "string" ? req.body.password : "";

  if (!Zhang_username || !Zhang_password) {
    res.json({
      code: 400,
      msg: "用户名和密码不能为空。",
      data: null
    });
    return;
  }

  try {
    const Zhang_info = await Zhang_databaseModel.Zhang_testConnection({
      host: process.env.DB_HOST || "localhost",
      port: 3306,
      user: Zhang_username,
      password: Zhang_password
    });

    res.json({
      code: 0,
      msg: "数据库连接成功",
      data: {
        version: Zhang_info.version,
        hostname: Zhang_info.hostname,
        port: Number(Zhang_info.port)
      }
    });
  } catch (Zhang_error) {
    console.error("[数据库连接失败]", Zhang_error.code, Zhang_error.message);

    res.json({
      code: 5001,
      msg:
        Zhang_errorMessages[Zhang_error.code] ||
        "连接失败：" + (Zhang_error.message || "未知错误"),
      data: {
        errorCode: Zhang_error.code || "UNKNOWN"
      }
    });
  }
}

module.exports = {
  Zhang_getDefaults: Zhang_getDefaults,
  Zhang_connect: Zhang_connect
};
