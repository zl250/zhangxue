/*
  姓名：张雪 | 学号：24001010727 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
  说明：AI 聊天接口路由，统一挂载在 /api 前缀下
*/

const Zhang_express = require("express");
const Zhang_router = Zhang_express.Router();
const Zhang_aiController = require("../controllers/Zhang_aiController");

Zhang_router.post("/ai/chat", Zhang_aiController.Zhang_chat);

module.exports = Zhang_router;
