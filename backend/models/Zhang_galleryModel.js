/*
  姓名：张雪 | 学号：24001010727 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
  说明：科技图文数据模型，从 Zhang_gallery 表读取图文列表
*/

const Zhang_pool = require("../config/Zhang_db");

async function Zhang_getGalleryList() {
  const [Zhang_rows] = await Zhang_pool.query(
    "SELECT Zhang_id, Zhang_title, Zhang_desc, Zhang_image, Zhang_tag, Zhang_likes, " +
      "DATE_FORMAT(Zhang_create_time, '%Y-%m-%d') AS Zhang_time " +
      "FROM Zhang_gallery ORDER BY Zhang_create_time DESC"
  );
  return Zhang_rows;
}

module.exports = {
  Zhang_getGalleryList: Zhang_getGalleryList
};
