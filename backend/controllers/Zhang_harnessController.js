/*
  姓名：张雪 | 学号：24001010727 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
  说明：Harness Engineering 控制器，处理商业评论结构化抽取与图像识别/OCR
*/

const Zhang_multer = require("multer");
const Zhang_harnessModel = require("../models/Zhang_harnessModel");

const Zhang_uploader = Zhang_multer({
  storage: Zhang_multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: function (Zhang_req, Zhang_file, Zhang_cb) {
    if (!/^image\//.test(Zhang_file.mimetype || "")) {
      Zhang_req.Zhang_badImage = true;
      Zhang_cb(null, false);
      return;
    }

    Zhang_cb(null, true);
  }
});

function Zhang_imageSingle(Zhang_req, Zhang_res, Zhang_next) {
  Zhang_uploader.single("image")(Zhang_req, Zhang_res, function (Zhang_error) {
    if (Zhang_error) {
      const Zhang_msg =
        Zhang_error.code === "LIMIT_FILE_SIZE"
          ? "图片不能超过 8MB。"
          : "图片上传失败：" + Zhang_error.message;

      return Zhang_res.status(400).json({
        code: 6001,
        msg: Zhang_msg,
        data: null
      });
    }

    Zhang_next();
  });
}

function Zhang_decodeName(Zhang_name) {
  if (!Zhang_name) {
    return "未命名图片";
  }

  if (/[^\x00-\xff]/.test(Zhang_name)) {
    return Zhang_name;
  }

  const Zhang_decoded = Buffer.from(Zhang_name, "latin1").toString("utf8");

  return Zhang_decoded.indexOf("\ufffd") === -1 ? Zhang_decoded : Zhang_name;
}

async function Zhang_analyzeReview(Zhang_req, Zhang_res) {
  const Zhang_text =
    Zhang_req.body && typeof Zhang_req.body.text === "string"
      ? Zhang_req.body.text.trim()
      : "";

  if (!Zhang_text) {
    return Zhang_res.status(400).json({
      code: 6002,
      msg: "text 不能为空，请提供要抽取的商业评论文本。",
      data: null
    });
  }

  if (Zhang_text.length > 2000) {
    return Zhang_res.status(400).json({
      code: 6003,
      msg: "评论内容不能超过 2000 个字符。",
      data: null
    });
  }

  try {
    console.log("[评论抽取] 收到文本，长度 " + Zhang_text.length);

    const Zhang_data = await Zhang_harnessModel.Zhang_analyzeReview(Zhang_text);

    Zhang_res.json({
      code: 0,
      msg: "结构化抽取成功",
      data: Zhang_data
    });
  } catch (Zhang_error) {
    console.error("[评论抽取失败]", Zhang_error.status || "", Zhang_error.message);

    if (Zhang_error.name === "TimeoutError") {
      return Zhang_res.json({
        code: 5006,
        msg: "大模型响应超时，请稍后重试。",
        data: null
      });
    }

    if (Zhang_error.status === 401) {
      return Zhang_res.json({
        code: 5004,
        msg: "API 密钥无效，请检查 backend/.env 中的 SILICONFLOW_API_KEY。",
        data: null
      });
    }

    Zhang_res.json({
      code: 6004,
      msg: "结构化抽取失败：" + Zhang_error.message,
      data: null
    });
  }
}

async function Zhang_analyzeImage(Zhang_req, Zhang_res) {
  if (Zhang_req.Zhang_badImage) {
    return Zhang_res.status(400).json({
      code: 6005,
      msg: "只支持上传图片文件（image/*）。",
      data: null
    });
  }

  if (!Zhang_req.file) {
    return Zhang_res.status(400).json({
      code: 6006,
      msg: "请选择要识别的图片，表单字段名为 image。",
      data: null
    });
  }

  const Zhang_file = Zhang_req.file;
  const Zhang_fileName = Zhang_decodeName(Zhang_file.originalname);

  try {
    console.log(
      "[图像识别] 收到图片：" +
        Zhang_fileName +
        "，类型 " +
        Zhang_file.mimetype +
        "，大小 " +
        Zhang_file.size +
        " 字节"
    );

    const Zhang_data = await Zhang_harnessModel.Zhang_analyzeImage(
      Zhang_file.buffer,
      Zhang_file.mimetype
    );

    Zhang_data.meta.fileName = Zhang_fileName;
    Zhang_data.meta.size = Zhang_file.size;
    Zhang_data.meta.mime = Zhang_file.mimetype;

    Zhang_res.json({
      code: 0,
      msg: "图像识别成功",
      data: Zhang_data
    });
  } catch (Zhang_error) {
    console.error("[图像识别失败]", Zhang_error.status || "", Zhang_error.message);

    if (Zhang_error.name === "TimeoutError") {
      return Zhang_res.json({
        code: 5006,
        msg: "视觉模型响应超时，请稍后重试。",
        data: null
      });
    }

    Zhang_res.json({
      code: 6007,
      msg: "图像识别失败：" + Zhang_error.message,
      data: null
    });
  }
}

module.exports = {
  Zhang_imageSingle: Zhang_imageSingle,
  Zhang_analyzeReview: Zhang_analyzeReview,
  Zhang_analyzeImage: Zhang_analyzeImage
};
