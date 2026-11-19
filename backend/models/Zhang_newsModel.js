/*
  姓名：张雪 | 学号：24001010727 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
  说明：科技新闻数据模型，从 Zhang_news 表读取新闻列表
*/

const Zhang_pool = require("../config/Zhang_db");

async function Zhang_getNewsList() {
  const [Zhang_rows] = await Zhang_pool.query(
    "SELECT Zhang_id, Zhang_title, Zhang_summary, Zhang_source, " +
      "Zhang_category, DATE_FORMAT(Zhang_publish_time, '%Y-%m-%d %H:%i') AS Zhang_time, " +
      "Zhang_views FROM Zhang_news ORDER BY Zhang_publish_time DESC"
  );
  return Zhang_rows;
}

module.exports = {
  Zhang_getNewsList: Zhang_getNewsList
};
