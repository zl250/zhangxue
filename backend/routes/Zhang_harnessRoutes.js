/*
  姓名：张雪 | 学号：24001010727 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
  说明：Harness Engineering 接口路由，挂载在 /api 前缀下
*/

const Zhang_express = require("express");
const Zhang_router = Zhang_express.Router();
const Zhang_harnessController = require("../controllers/Zhang_harnessController");

Zhang_router.post("/harness/analyze", Zhang_harnessController.Zhang_analyzeReview);
Zhang_router.post(
  "/vision/analyze",
  Zhang_harnessController.Zhang_imageSingle,
  Zhang_harnessController.Zhang_analyzeImage
);

module.exports = Zhang_router;
