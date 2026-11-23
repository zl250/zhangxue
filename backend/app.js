/*
  姓名：张雪 | 学号：24001010727 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
  说明：Express 服务入口，端口固定 727，托管 frontend/ 静态资源，开启全部跨域
*/

const Zhang_path = require("path");
require("dotenv").config({ path: Zhang_path.join(__dirname, ".env") });

const Zhang_express = require("express");
const Zhang_cors = require("cors");
const Zhang_homeRoutes = require("./routes/Zhang_homeRoutes");
const Zhang_databaseRoutes = require("./routes/Zhang_databaseRoutes");
const Zhang_newsRoutes = require("./routes/Zhang_newsRoutes");
const Zhang_galleryRoutes = require("./routes/Zhang_galleryRoutes");
const Zhang_aiRoutes = require("./routes/Zhang_aiRoutes");
const Zhang_kbRoutes = require("./routes/Zhang_kbRoutes");
const Zhang_harnessRoutes = require("./routes/Zhang_harnessRoutes");

const Zhang_app = Zhang_express();
const Zhang_PORT = 727;

Zhang_app.use(Zhang_cors());
Zhang_app.use(Zhang_express.json());
Zhang_app.use(Zhang_express.urlencoded({ extended: true }));

Zhang_app.use("/api", Zhang_homeRoutes);
Zhang_app.use("/api", Zhang_databaseRoutes);
Zhang_app.use("/api", Zhang_newsRoutes);
Zhang_app.use("/api", Zhang_galleryRoutes);
Zhang_app.use("/api", Zhang_aiRoutes);
Zhang_app.use("/api", Zhang_kbRoutes);
Zhang_app.use("/api", Zhang_harnessRoutes);

Zhang_app.use(
  Zhang_express.static(Zhang_path.join(__dirname, "..", "frontend"))
);

Zhang_app.use("/api", function (req, res) {
  res.status(404).json({
    code: 404,
    msg: "接口不存在",
    data: null
  });
});

Zhang_app.use(function (err, req, res, next) {
  console.error("[服务器错误]", err);
  res.status(500).json({
    code: 500,
    msg: "服务器内部错误",
    data: null
  });
});

Zhang_app.listen(Zhang_PORT, function () {
  console.log("服务已启动：http://localhost:" + Zhang_PORT);
});
