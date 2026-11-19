/*
  姓名：张雪 | 学号：24001010727 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
  说明：科技新闻控制器，返回新闻列表
*/

const Zhang_newsModel = require("../models/Zhang_newsModel");

async function Zhang_getNewsList(req, res) {
  try {
    const Zhang_list = await Zhang_newsModel.Zhang_getNewsList();

    res.json({
      code: 0,
      msg: "获取科技新闻列表成功",
      data: {
        total: Zhang_list.length,
        list: Zhang_list
      }
    });
  } catch (Zhang_error) {
    console.error("[科技新闻查询失败]", Zhang_error.code, Zhang_error.message);

    res.json({
      code: 5002,
      msg: "新闻数据查询失败，请检查数据库是否已初始化。",
      data: {
        errorCode: Zhang_error.code || "UNKNOWN"
      }
    });
  }
}

module.exports = {
  Zhang_getNewsList: Zhang_getNewsList
};
