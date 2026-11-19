/*
  姓名：张雪 | 学号：24001010727 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
  说明：首页控制器，统一返回 { code, msg, data } 结构
*/

const Zhang_homeModel = require("../models/Zhang_homeModel");

function Zhang_getHealth(req, res) {
  const Zhang_data = Zhang_homeModel.Zhang_getServiceInfo();
  res.json({
    code: 0,
    msg: "服务运行正常",
    data: Zhang_data
  });
}

module.exports = {
  Zhang_getHealth: Zhang_getHealth
};
