/*
  姓名：张雪 | 学号：24001010727 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
  说明：首页路由，所有接口统一挂载在 /api 前缀下
*/

const Zhang_express = require("express");
const Zhang_router = Zhang_express.Router();
const Zhang_homeController = require("../controllers/Zhang_homeController");

Zhang_router.get("/health", Zhang_homeController.Zhang_getHealth);

module.exports = Zhang_router;
