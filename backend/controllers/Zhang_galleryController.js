/*
  姓名：张雪 | 学号：24001010727 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
  说明：科技图文控制器，返回图文列表
*/

const Zhang_galleryModel = require("../models/Zhang_galleryModel");

async function Zhang_getGalleryList(req, res) {
  try {
    const Zhang_list = await Zhang_galleryModel.Zhang_getGalleryList();

    res.json({
      code: 0,
      msg: "获取科技图文列表成功",
      data: {
        total: Zhang_list.length,
        list: Zhang_list
      }
    });
  } catch (Zhang_error) {
    console.error("[科技图文查询失败]", Zhang_error.code, Zhang_error.message);

    res.json({
      code: 5003,
      msg: "图文数据查询失败，请检查数据库是否已初始化。",
      data: {
        errorCode: Zhang_error.code || "UNKNOWN"
      }
    });
  }
}

module.exports = {
  Zhang_getGalleryList: Zhang_getGalleryList
};
