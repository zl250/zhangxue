/*
  姓名：张雪 | 学号：24001010727 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
  说明：数据库相关接口路由，统一挂载在 /api 前缀下
*/

const Zhang_express = require("express");
const Zhang_router = Zhang_express.Router();
const Zhang_databaseController = require("../controllers/Zhang_databaseController");

Zhang_router.get("/database/defaults", Zhang_databaseController.Zhang_getDefaults);
Zhang_router.post("/database/connect", Zhang_databaseController.Zhang_connect);

module.exports = Zhang_router;
