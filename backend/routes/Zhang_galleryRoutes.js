/*
  姓名：张雪 | 学号：24001010727 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
  说明：科技图文接口路由，统一挂载在 /api 前缀下
*/

const Zhang_express = require("express");
const Zhang_router = Zhang_express.Router();
const Zhang_galleryController = require("../controllers/Zhang_galleryController");

Zhang_router.get("/gallery", Zhang_galleryController.Zhang_getGalleryList);

module.exports = Zhang_router;
