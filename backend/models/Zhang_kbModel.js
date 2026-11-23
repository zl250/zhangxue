/*
  姓名：张雪 | 学号：24001010727 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
  说明：知识库 RAG 数据模型，负责文档解析、文本分块、向量化、相似度检索与大模型问答
*/

const Zhang_fs = require("fs");
const Zhang_pool = require("../config/Zhang_db");

const Zhang_BASE_URL =
  process.env.SILICONFLOW_BASE_URL || "https://api.siliconflow.cn/v1";
const Zhang_CHAT_MODEL =
  process.env.SILICONFLOW_MODEL || "deepseek-ai/DeepSeek-V4-Flash";
const Zhang_EMBED_MODEL =
  process.env.SILICONFLOW_EMBED_MODEL || "BAAI/bge-m3";

const Zhang_CHUNK_SIZE = 480;
const Zhang_CHUNK_OVERLAP = 80;
const Zhang_EMBED_BATCH = 16;
const Zhang_TOP_K = 4;

const Zhang_SYSTEM_PROMPT =
  "你是「知乎的模仿与创作」项目的知识库客服助手。只能依据用户提供的知识库资料回答，" +
  "回答要用简体中文、条理清晰；资料中没有的信息要明确说明“知识库中未找到相关内容”，不要编造。";

/* ---------------- 文件解析 ---------------- */

function Zhang_extractLegacyPpt(filePath) {
  // 旧版 .ppt 为二进制复合文档，这里做尽力而为的 UTF-16LE 文本抽取
  const Zhang_buf = Zhang_fs.readFileSync(filePath);
  const Zhang_parts = [];
  let Zhang_cur = "";

  function Zhang_isReadable(Zhang_code) {
    return (
      Zhang_code === 9 ||
      Zhang_code === 10 ||
      Zhang_code === 13 ||
      (Zhang_code >= 32 && Zhang_code < 127) ||
      (Zhang_code >= 0x4e00 && Zhang_code <= 0x9fff) ||
      (Zhang_code >= 0x3000 && Zhang_code <= 0x303f) ||
      (Zhang_code >= 0xff00 && Zhang_code <= 0xffef)
    );
  }

  for (let Zhang_i = 0; Zhang_i + 1 < Zhang_buf.length; Zhang_i += 2) {
    const Zhang_code = Zhang_buf.readUInt16LE(Zhang_i);

    if (Zhang_isReadable(Zhang_code)) {
      Zhang_cur += String.fromCharCode(Zhang_code);
    } else {
      if (Zhang_cur.trim().length >= 4) {
        Zhang_parts.push(Zhang_cur.trim());
      }
      Zhang_cur = "";
    }
  }

  if (Zhang_cur.trim().length >= 4) {
    Zhang_parts.push(Zhang_cur.trim());
  }

  return Zhang_parts.join("\n");
}

async function Zhang_parseFile(Zhang_filePath, Zhang_ext) {
  const Zhang_e = String(Zhang_ext || "").toLowerCase();

  if (Zhang_e === ".txt" || Zhang_e === ".md") {
    return Zhang_fs.readFileSync(Zhang_filePath, "utf8");
  }

  if (Zhang_e === ".docx") {
    const Zhang_mammoth = require("mammoth");
    const Zhang_result = await Zhang_mammoth.extractRawText({
      path: Zhang_filePath
    });
    return Zhang_result.value || "";
  }

  if (Zhang_e === ".doc") {
    const Zhang_WordExtractor = require("word-extractor");
    const Zhang_doc = await new Zhang_WordExtractor().extract(Zhang_filePath);
    return [Zhang_doc.getBody(), Zhang_doc.getFootnotes(), Zhang_doc.getEndnotes()]
      .filter(Boolean)
      .join("\n");
  }

  if (Zhang_e === ".pptx" || Zhang_e === ".pdf") {
    const Zhang_officeparser = require("officeparser");
    const Zhang_ast = await Zhang_officeparser.OfficeParser.parseOffice(
      Zhang_filePath
    );
    const Zhang_text = await Zhang_ast.to("text");
    return (Zhang_text && Zhang_text.value) || "";
  }

  if (Zhang_e === ".ppt") {
    return Zhang_extractLegacyPpt(Zhang_filePath);
  }

  throw new Error("暂不支持的文件类型：" + Zhang_ext);
}

/* ---------------- 文本分块 ---------------- */

function Zhang_normalizeText(Zhang_raw) {
  return String(Zhang_raw || "")
    .replace(/\u0000/g, " ")
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t\u00a0]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function Zhang_chunkText(Zhang_raw) {
  const Zhang_text = Zhang_normalizeText(Zhang_raw);
  const Zhang_chunks = [];
  let Zhang_start = 0;

  while (Zhang_start < Zhang_text.length) {
    let Zhang_end = Math.min(Zhang_start + Zhang_CHUNK_SIZE, Zhang_text.length);

    if (Zhang_end < Zhang_text.length) {
      const Zhang_window = Zhang_text.slice(
        Math.max(Zhang_start, Zhang_end - 140),
        Zhang_end
      );
      const Zhang_marks = ["。", "！", "？", "；", "\n", ".", "!", "?", ";"];
      let Zhang_cut = -1;

      for (let Zhang_m = 0; Zhang_m < Zhang_marks.length; Zhang_m++) {
        const Zhang_pos = Zhang_window.lastIndexOf(Zhang_marks[Zhang_m]);
        if (Zhang_pos > Zhang_cut) {
          Zhang_cut = Zhang_pos;
        }
      }

      if (Zhang_cut > 0) {
        Zhang_end = Zhang_end - Zhang_window.length + Zhang_cut + 1;
      }
    }

    const Zhang_piece = Zhang_text.slice(Zhang_start, Zhang_end).trim();

    if (Zhang_piece) {
      if (Zhang_piece.length < 20 && Zhang_chunks.length > 0) {
        Zhang_chunks[Zhang_chunks.length - 1] += "\n" + Zhang_piece;
      } else {
        Zhang_chunks.push(Zhang_piece);
      }
    }

    if (Zhang_end >= Zhang_text.length) {
      break;
    }

    Zhang_start = Math.max(Zhang_end - Zhang_CHUNK_OVERLAP, Zhang_start + 1);
  }

  return Zhang_chunks;
}

/* ---------------- 向量化 ---------------- */

async function Zhang_embedTexts(Zhang_texts) {
  const Zhang_vectors = [];

  for (let Zhang_i = 0; Zhang_i < Zhang_texts.length; Zhang_i += Zhang_EMBED_BATCH) {
    const Zhang_batch = Zhang_texts.slice(
      Zhang_i,
      Zhang_i + Zhang_EMBED_BATCH
    );
    const Zhang_payload = {
      model: Zhang_EMBED_MODEL,
      input: Zhang_batch
    };

    console.log(
      "[知识库向量化] 发送第 " +
        (Zhang_i / Zhang_EMBED_BATCH + 1) +
        " 批，模型 " +
        Zhang_EMBED_MODEL +
        "，文本数 " +
        Zhang_batch.length
    );

    const Zhang_response = await fetch(Zhang_BASE_URL + "/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + process.env.SILICONFLOW_API_KEY
      },
      body: JSON.stringify(Zhang_payload),
      signal: AbortSignal.timeout(60000)
    });

    const Zhang_data = await Zhang_response.json();

    if (!Zhang_response.ok || !Zhang_data.data) {
      const Zhang_error = new Error(
        (Zhang_data && Zhang_data.message) || "向量化接口调用失败"
      );
      Zhang_error.status = Zhang_response.status;
      throw Zhang_error;
    }

    const Zhang_sorted = Zhang_data.data
      .slice()
      .sort(function (Zhang_a, Zhang_b) {
        return Zhang_a.index - Zhang_b.index;
      });

    Zhang_sorted.forEach(function (Zhang_item) {
      Zhang_vectors.push(Zhang_item.embedding);
    });

    console.log(
      "[知识库向量化] 收到向量 " +
        Zhang_sorted.length +
        " 条，维度 " +
        (Zhang_sorted[0] ? Zhang_sorted[0].embedding.length : 0)
    );
  }

  return Zhang_vectors;
}

/* ---------------- 数据库读写 ---------------- */

async function Zhang_createDocument(Zhang_doc) {
  const Zhang_conn = await Zhang_pool.getConnection();

  try {
    await Zhang_conn.beginTransaction();

    const [Zhang_result] = await Zhang_conn.query(
      "INSERT INTO Zhang_kb_document " +
        "(Zhang_name, Zhang_ext, Zhang_size, Zhang_char_count, Zhang_chunk_count, Zhang_path, Zhang_status) " +
        "VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        Zhang_doc.name,
        Zhang_doc.ext,
        Zhang_doc.size,
        Zhang_doc.charCount,
        Zhang_doc.chunks.length,
        Zhang_doc.path,
        "ready"
      ]
    );

    const Zhang_docId = Zhang_result.insertId;
    const Zhang_values = Zhang_doc.chunks.map(function (Zhang_content, Zhang_i) {
      return [
        Zhang_docId,
        Zhang_i + 1,
        Zhang_content,
        JSON.stringify(Zhang_doc.vectors[Zhang_i])
      ];
    });

    await Zhang_conn.query(
      "INSERT INTO Zhang_kb_chunk " +
        "(Zhang_doc_id, Zhang_index, Zhang_content, Zhang_embedding) VALUES ?",
      [Zhang_values]
    );

    await Zhang_conn.commit();
    return Zhang_docId;
  } catch (Zhang_error) {
    await Zhang_conn.rollback();
    throw Zhang_error;
  } finally {
    Zhang_conn.release();
  }
}

async function Zhang_listDocuments() {
  const [Zhang_rows] = await Zhang_pool.query(
    "SELECT Zhang_id, Zhang_name, Zhang_ext, Zhang_size, Zhang_chunk_count, " +
      "Zhang_char_count, Zhang_path, " +
      "DATE_FORMAT(Zhang_created_at, '%Y-%m-%d %H:%i') AS Zhang_time " +
      "FROM Zhang_kb_document ORDER BY Zhang_id DESC"
  );
  return Zhang_rows;
}

async function Zhang_deleteDocument(Zhang_id) {
  const [Zhang_rows] = await Zhang_pool.query(
    "SELECT Zhang_id, Zhang_path FROM Zhang_kb_document WHERE Zhang_id = ?",
    [Zhang_id]
  );

  if (Zhang_rows.length === 0) {
    return null;
  }

  await Zhang_pool.query("DELETE FROM Zhang_kb_chunk WHERE Zhang_doc_id = ?", [
    Zhang_id
  ]);
  await Zhang_pool.query("DELETE FROM Zhang_kb_document WHERE Zhang_id = ?", [
    Zhang_id
  ]);

  const Zhang_filePath = Zhang_rows[0].Zhang_path;

  if (Zhang_filePath && Zhang_fs.existsSync(Zhang_filePath)) {
    Zhang_fs.unlinkSync(Zhang_filePath);
  }

  return Zhang_rows[0];
}

async function Zhang_loadChunks() {
  const [Zhang_rows] = await Zhang_pool.query(
    "SELECT c.Zhang_id, c.Zhang_doc_id, c.Zhang_index, c.Zhang_content, " +
      "c.Zhang_embedding, d.Zhang_name FROM Zhang_kb_chunk c " +
      "JOIN Zhang_kb_document d ON d.Zhang_id = c.Zhang_doc_id"
  );
  return Zhang_rows;
}

/* ---------------- 相似度检索 ---------------- */

function Zhang_cosine(Zhang_a, Zhang_b) {
  if (!Array.isArray(Zhang_a) || !Array.isArray(Zhang_b)) {
    return 0;
  }

  const Zhang_len = Math.min(Zhang_a.length, Zhang_b.length);
  let Zhang_dot = 0;
  let Zhang_na = 0;
  let Zhang_nb = 0;

  for (let Zhang_i = 0; Zhang_i < Zhang_len; Zhang_i++) {
    Zhang_dot += Zhang_a[Zhang_i] * Zhang_b[Zhang_i];
    Zhang_na += Zhang_a[Zhang_i] * Zhang_a[Zhang_i];
    Zhang_nb += Zhang_b[Zhang_i] * Zhang_b[Zhang_i];
  }

  if (Zhang_na === 0 || Zhang_nb === 0) {
    return 0;
  }

  return Zhang_dot / (Math.sqrt(Zhang_na) * Math.sqrt(Zhang_nb));
}

async function Zhang_search(Zhang_question, Zhang_topK) {
  const Zhang_chunks = await Zhang_loadChunks();

  if (Zhang_chunks.length === 0) {
    return [];
  }

  const Zhang_queryVector = (await Zhang_embedTexts([Zhang_question]))[0];
  const Zhang_scored = Zhang_chunks
    .map(function (Zhang_chunk) {
      let Zhang_vector = [];

      try {
        Zhang_vector = JSON.parse(Zhang_chunk.Zhang_embedding || "[]");
      } catch (Zhang_error) {
        Zhang_vector = [];
      }

      return {
        Zhang_docId: Zhang_chunk.Zhang_doc_id,
        Zhang_name: Zhang_chunk.Zhang_name,
        Zhang_index: Zhang_chunk.Zhang_index,
        Zhang_content: Zhang_chunk.Zhang_content,
        Zhang_score: Zhang_cosine(Zhang_queryVector, Zhang_vector)
      };
    })
    .sort(function (Zhang_a, Zhang_b) {
      return Zhang_b.Zhang_score - Zhang_a.Zhang_score;
    });

  return Zhang_scored.slice(0, Zhang_topK || Zhang_TOP_K);
}

/* ---------------- 基于知识库的问答 ---------------- */

async function Zhang_ask(Zhang_question, Zhang_topK) {
  const Zhang_sources = await Zhang_search(Zhang_question, Zhang_topK);

  if (Zhang_sources.length === 0) {
    const Zhang_empty = new Error("知识库中还没有任何内容，请先上传文件。");
    Zhang_empty.code = 4004;
    throw Zhang_empty;
  }

  const Zhang_context = Zhang_sources
    .map(function (Zhang_item, Zhang_i) {
      return (
        "【资料" +
        (Zhang_i + 1) +
        "｜" +
        Zhang_item.Zhang_name +
        "｜片段" +
        Zhang_item.Zhang_index +
        "】\n" +
        Zhang_item.Zhang_content
      );
    })
    .join("\n\n");

  const Zhang_messages = [
    { role: "system", content: Zhang_SYSTEM_PROMPT },
    {
      role: "user",
      content:
        "以下是从知识库中检索到的资料：\n\n" +
        Zhang_context +
        "\n\n请根据以上资料回答问题：\n" +
        Zhang_question
    }
  ];

  const Zhang_payload = {
    model: Zhang_CHAT_MODEL,
    messages: Zhang_messages
  };

  console.log("[发送给大模型]", JSON.stringify(Zhang_payload, null, 2));

  const Zhang_response = await fetch(Zhang_BASE_URL + "/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + process.env.SILICONFLOW_API_KEY
    },
    body: JSON.stringify(Zhang_payload),
    signal: AbortSignal.timeout(90000)
  });

  const Zhang_data = await Zhang_response.json();

  console.log("[大模型返回]", JSON.stringify(Zhang_data, null, 2));

  if (!Zhang_response.ok) {
    const Zhang_error = new Error(
      (Zhang_data && Zhang_data.message) || "大模型接口调用失败"
    );
    Zhang_error.status = Zhang_response.status;
    throw Zhang_error;
  }

  return {
    Zhang_answer: Zhang_data.choices[0].message.content,
    Zhang_model: Zhang_data.model || Zhang_CHAT_MODEL,
    Zhang_usage: Zhang_data.usage || null,
    Zhang_sources: Zhang_sources.map(function (Zhang_item) {
      return {
        docId: Zhang_item.Zhang_docId,
        name: Zhang_item.Zhang_name,
        chunkIndex: Zhang_item.Zhang_index,
        score: Number(Zhang_item.Zhang_score.toFixed(4)),
        content: Zhang_item.Zhang_content
      };
    })
  };
}

module.exports = {
  Zhang_parseFile: Zhang_parseFile,
  Zhang_chunkText: Zhang_chunkText,
  Zhang_embedTexts: Zhang_embedTexts,
  Zhang_createDocument: Zhang_createDocument,
  Zhang_listDocuments: Zhang_listDocuments,
  Zhang_deleteDocument: Zhang_deleteDocument,
  Zhang_ask: Zhang_ask
};
