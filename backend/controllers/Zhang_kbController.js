/*
  姓名：张雪 | 学号：24001010727 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
  说明：知识库 RAG 控制器，处理文件上传、文档管理、基于知识库的问答
*/

const Zhang_path = require("path");
const Zhang_fs = require("fs");
const Zhang_multer = require("multer");
const Zhang_kbModel = require("../models/Zhang_kbModel");

const Zhang_ALLOWED_EXTS = [
  ".doc",
  ".docx",
  ".ppt",
  ".pptx",
  ".pdf",
  ".txt",
  ".md"
];

const Zhang_UPLOAD_DIR = Zhang_path.join(__dirname, "..", "uploads");

if (!Zhang_fs.existsSync(Zhang_UPLOAD_DIR)) {
  Zhang_fs.mkdirSync(Zhang_UPLOAD_DIR, { recursive: true });
}

const Zhang_storage = Zhang_multer.diskStorage({
  destination: function (Zhang_req, Zhang_file, Zhang_cb) {
    Zhang_cb(null, Zhang_UPLOAD_DIR);
  },
  filename: function (Zhang_req, Zhang_file, Zhang_cb) {
    const Zhang_ext = Zhang_path
      .extname(Zhang_file.originalname)
      .toLowerCase();
    const Zhang_name =
      "kb_" +
      Date.now() +
      "_" +
      Math.random().toString(36).slice(2, 8) +
      Zhang_ext;
    Zhang_cb(null, Zhang_name);
  }
});

function Zhang_fileFilter(Zhang_req, Zhang_file, Zhang_cb) {
  const Zhang_ext = Zhang_path
    .extname(Zhang_file.originalname)
    .toLowerCase();

  if (Zhang_ALLOWED_EXTS.indexOf(Zhang_ext) === -1) {
    Zhang_req.Zhang_badExt = Zhang_ext || "未知";
    Zhang_cb(null, false);
    return;
  }

  Zhang_cb(null, true);
}

const Zhang_uploader = Zhang_multer({
  storage: Zhang_storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: Zhang_fileFilter
});

function Zhang_uploadSingle(Zhang_req, Zhang_res, Zhang_next) {
  Zhang_uploader.single("file")(Zhang_req, Zhang_res, function (Zhang_error) {
    if (Zhang_error) {
      const Zhang_msg =
        Zhang_error.code === "LIMIT_FILE_SIZE"
          ? "文件大小不能超过 20MB。"
          : "文件上传失败：" + Zhang_error.message;

      return Zhang_res.status(400).json({
        code: 4001,
        msg: Zhang_msg,
        data: null
      });
    }

    Zhang_next();
  });
}

/* multer 对中文文件名按 latin1 解析，这里还原为 UTF-8 */
function Zhang_decodeName(Zhang_name) {
  if (!Zhang_name) {
    return "未命名文件";
  }

  if (/[^\x00-\xff]/.test(Zhang_name)) {
    return Zhang_name;
  }

  const Zhang_decoded = Buffer.from(Zhang_name, "latin1").toString("utf8");

  return Zhang_decoded.indexOf("\ufffd") === -1 ? Zhang_decoded : Zhang_name;
}

function Zhang_removeFile(Zhang_filePath) {
  try {
    if (Zhang_filePath && Zhang_fs.existsSync(Zhang_filePath)) {
      Zhang_fs.unlinkSync(Zhang_filePath);
    }
  } catch (Zhang_error) {
    console.error("[知识库] 删除文件失败", Zhang_error.message);
  }
}

async function Zhang_upload(Zhang_req, Zhang_res) {
  if (Zhang_req.Zhang_badExt) {
    return Zhang_res.status(400).json({
      code: 4002,
      msg:
        "不支持的文件类型：" +
        Zhang_req.Zhang_badExt +
        "。仅支持 doc、docx、ppt、pptx、pdf、txt、md。",
      data: null
    });
  }

  if (!Zhang_req.file) {
    return Zhang_res.status(400).json({
      code: 4003,
      msg: "请选择要上传的文件，表单字段名为 file。",
      data: null
    });
  }

  const Zhang_file = Zhang_req.file;
  const Zhang_ext = Zhang_path.extname(Zhang_file.originalname).toLowerCase();
  const Zhang_originalName = Zhang_decodeName(Zhang_file.originalname);

  console.log(
    "[知识库上传] 收到文件：" +
      Zhang_originalName +
      "，类型 " +
      Zhang_ext +
      "，大小 " +
      Zhang_file.size +
      " 字节"
  );

  try {
    const Zhang_text = await Zhang_kbModel.Zhang_parseFile(
      Zhang_file.path,
      Zhang_ext
    );
    const Zhang_chunks = Zhang_kbModel.Zhang_chunkText(Zhang_text);

    if (Zhang_chunks.length === 0) {
      Zhang_removeFile(Zhang_file.path);
      return Zhang_res.status(400).json({
        code: 4005,
        msg: "未能从该文件中解析出文本内容，请确认文件不是纯图片扫描件。",
        data: null
      });
    }

    console.log(
      "[知识库上传] 解析成功，字符数 " +
        Zhang_text.length +
        "，分块数 " +
        Zhang_chunks.length
    );

    const Zhang_vectors = await Zhang_kbModel.Zhang_embedTexts(Zhang_chunks);

    const Zhang_docId = await Zhang_kbModel.Zhang_createDocument({
      name: Zhang_originalName,
      ext: Zhang_ext,
      size: Zhang_file.size,
      path: Zhang_file.path,
      charCount: Zhang_text.length,
      chunks: Zhang_chunks,
      vectors: Zhang_vectors
    });

    console.log("[知识库上传] 入库完成，文档 ID：" + Zhang_docId);

    Zhang_res.json({
      code: 0,
      msg: "上传并入库成功",
      data: {
        id: Zhang_docId,
        name: Zhang_originalName,
        ext: Zhang_ext,
        size: Zhang_file.size,
        charCount: Zhang_text.length,
        chunkCount: Zhang_chunks.length,
        preview: Zhang_chunks[0].slice(0, 160)
      }
    });
  } catch (Zhang_error) {
    Zhang_removeFile(Zhang_file.path);
    console.error("[知识库上传失败]", Zhang_error.message);

    Zhang_res.json({
      code: 5008,
      msg: "文件解析或向量化失败：" + Zhang_error.message,
      data: null
    });
  }
}

async function Zhang_list(Zhang_req, Zhang_res) {
  try {
    const Zhang_docs = await Zhang_kbModel.Zhang_listDocuments();
    let Zhang_totalChunks = 0;

    const Zhang_documents = Zhang_docs.map(function (Zhang_doc) {
      Zhang_totalChunks += Zhang_doc.Zhang_chunk_count;

      return {
        id: Zhang_doc.Zhang_id,
        name: Zhang_doc.Zhang_name,
        ext: Zhang_doc.Zhang_ext,
        size: Zhang_doc.Zhang_size,
        charCount: Zhang_doc.Zhang_char_count,
        chunkCount: Zhang_doc.Zhang_chunk_count,
        time: Zhang_doc.Zhang_time
      };
    });

    Zhang_res.json({
      code: 0,
      msg: "获取知识库文档成功",
      data: {
        total: Zhang_documents.length,
        totalChunks: Zhang_totalChunks,
        documents: Zhang_documents
      }
    });
  } catch (Zhang_error) {
    console.error("[知识库文档列表失败]", Zhang_error.message);
    Zhang_res.json({
      code: 5009,
      msg: "读取知识库文档失败：" + Zhang_error.message,
      data: null
    });
  }
}

async function Zhang_remove(Zhang_req, Zhang_res) {
  const Zhang_id = Number(Zhang_req.params.id);

  if (!Number.isInteger(Zhang_id) || Zhang_id <= 0) {
    return Zhang_res.status(400).json({
      code: 4006,
      msg: "文档 ID 不合法。",
      data: null
    });
  }

  try {
    const Zhang_deleted = await Zhang_kbModel.Zhang_deleteDocument(Zhang_id);

    if (!Zhang_deleted) {
      return Zhang_res.status(404).json({
        code: 4041,
        msg: "文档不存在或已被删除。",
        data: null
      });
    }

    console.log("[知识库删除] 已删除文档 ID：" + Zhang_id);

    Zhang_res.json({
      code: 0,
      msg: "文档及其分块已删除",
      data: { id: Zhang_id }
    });
  } catch (Zhang_error) {
    console.error("[知识库删除失败]", Zhang_error.message);
    Zhang_res.json({
      code: 5010,
      msg: "删除文档失败：" + Zhang_error.message,
      data: null
    });
  }
}

async function Zhang_ask(Zhang_req, Zhang_res) {
  const Zhang_question =
    Zhang_req.body && typeof Zhang_req.body.question === "string"
      ? Zhang_req.body.question.trim()
      : "";

  if (!Zhang_question) {
    return Zhang_res.status(400).json({
      code: 4007,
      msg: "question 不能为空。",
      data: null
    });
  }

  if (Zhang_question.length > 500) {
    return Zhang_res.status(400).json({
      code: 4008,
      msg: "问题不能超过 500 个字符。",
      data: null
    });
  }

  const Zhang_topK = Number(Zhang_req.body.topK) || 4;

  try {
    console.log("[知识库问答] 收到问题：" + Zhang_question);

    const Zhang_result = await Zhang_kbModel.Zhang_ask(
      Zhang_question,
      Math.min(Math.max(Zhang_topK, 1), 8)
    );

    console.log(
      "[知识库问答] 命中片段 " +
        Zhang_result.Zhang_sources.length +
        " 条，模型 " +
        Zhang_result.Zhang_model
    );

    Zhang_res.json({
      code: 0,
      msg: "知识库问答成功",
      data: {
        answer: Zhang_result.Zhang_answer,
        model: Zhang_result.Zhang_model,
        usage: Zhang_result.Zhang_usage,
        sources: Zhang_result.Zhang_sources
      }
    });
  } catch (Zhang_error) {
    console.error("[知识库问答失败]", Zhang_error.status || "", Zhang_error.message);

    if (Zhang_error.code === 4004) {
      return Zhang_res.json({
        code: 4004,
        msg: Zhang_error.message,
        data: null
      });
    }

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

    if (Zhang_error.status === 429) {
      return Zhang_res.json({
        code: 5005,
        msg: "请求过于频繁，请稍后再试。",
        data: null
      });
    }

    Zhang_res.json({
      code: 5011,
      msg: "知识库问答失败：" + Zhang_error.message,
      data: null
    });
  }
}

module.exports = {
  Zhang_uploadSingle: Zhang_uploadSingle,
  Zhang_upload: Zhang_upload,
  Zhang_list: Zhang_list,
  Zhang_remove: Zhang_remove,
  Zhang_ask: Zhang_ask
};
