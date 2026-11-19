/*
  姓名：张雪 | 学号：24001010727 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
  说明：首页相关数据模型
*/

const Zhang_packageInfo = require("../package.json");

function Zhang_getServiceInfo() {
  return {
    service: Zhang_packageInfo.name,
    version: Zhang_packageInfo.version,
    port: 727,
    database: "MySQL",
    time: new Date().toISOString()
  };
}

module.exports = {
  Zhang_getServiceInfo: Zhang_getServiceInfo
};
