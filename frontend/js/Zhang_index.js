/*
  姓名：张雪 | 学号：24001010727 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
  说明：首页交互脚本，统计页面入口数量并请求后端健康检查接口
*/

(function () {
  "use strict";

  var Zhang_grid = document.getElementById("Zhang_navGrid");
  var Zhang_count = document.getElementById("Zhang_navCount");

  if (Zhang_grid && Zhang_count) {
    var Zhang_links = Zhang_grid.querySelectorAll("a.Zhang_card");
    Zhang_count.textContent = Zhang_links.length + " 个页面";
    console.log("[页面导航] 当前共 " + Zhang_links.length + " 个页面入口");
  }

  fetch("/api/health")
    .then(function (Zhang_response) {
      if (!Zhang_response.ok) {
        throw new Error("HTTP " + Zhang_response.status);
      }
      return Zhang_response.json();
    })
    .then(function (Zhang_result) {
      console.log("[后端响应] /api/health", Zhang_result);
    })
    .catch(function (Zhang_error) {
      console.error("[后端请求失败] /api/health", Zhang_error);
    });
})();
