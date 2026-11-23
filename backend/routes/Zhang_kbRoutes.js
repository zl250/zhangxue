/*
  姓名：张雪 | 学号：24001010727 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
  说明：知识库 RAG 接口路由，统一挂载在 /api 前缀下
*/

const Zhang_express = require("express");
const Zhang_router = Zhang_express.Router();
const Zhang_kbController = require("../controllers/Zhang_kbController");

Zhang_router.post(
  "/kb/upload",
  Zhang_kbController.Zhang_uploadSingle,
  Zhang_kbController.Zhang_upload
);
Zhang_router.get("/kb/documents", Zhang_kbController.Zhang_list);
Zhang_router.delete("/kb/documents/:id", Zhang_kbController.Zhang_remove);
Zhang_router.post("/kb/ask", Zhang_kbController.Zhang_ask);

module.exports = Zhang_router;
