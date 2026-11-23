/*
  姓名：张雪 | 学号：24001010727 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
  说明：Harness Engineering 结构化抽取模型，负责商业评论情感/实体抽取与图像识别/OCR
*/

const Zhang_BASE_URL =
  process.env.SILICONFLOW_BASE_URL || "https://api.siliconflow.cn/v1";
const Zhang_CHAT_MODEL =
  process.env.SILICONFLOW_MODEL || "deepseek-ai/DeepSeek-V4-Flash";
const Zhang_VISION_MODEL =
  process.env.SILICONFLOW_VISION_MODEL || "Qwen/Qwen3-VL-30B-A3B-Instruct";

const Zhang_REVIEW_PROMPT = [
  "你是信息抽取引擎，需要把用户输入的中文商业评论转换为严格 JSON，只输出 JSON，不要输出任何解释。",
  "JSON 结构必须如下（所有字段必须存在）：",
  "{",
  '  "sentiment": "positive|neutral|negative",',
  '  "sentimentScore": 0 到 1 的小数，负面趋近 0，正面趋近 1,',
  '  "confidence": 0 到 1 的小数,',
  '  "summary": "不超过 30 字的摘要",',
  '  "aspects": [{"aspect": "方面词", "sentiment": "positive|neutral|negative", "score": 0 到 1, "evidence": "原文依据"}],',
  '  "entities": [{"type": "品牌|商品|商家|人物|地点|时间|金额|订单号|其他", "name": "实体名", "role": "在评论中的作用"}],',
  '  "keywords": ["3 到 6 个关键词"],',
  '  "complaint": {"hasComplaint": true 或 false, "type": "质量|物流|服务|价格|包装|售后|其他|none", "urgency": "low|medium|high", "evidence": "原文依据，没有则为空字符串"}',
  "}",
  "规则：aspects 至少 1 项；entities 没有实体时输出空数组；不要编造评论中不存在的信息。"
].join("\n");

const Zhang_VISION_PROMPT = [
  "你是图像理解与 OCR 引擎。请识别图片并输出严格 JSON，只输出 JSON，不要输出任何解释。",
  "JSON 结构必须如下（所有字段必须存在）：",
  "{",
  '  "type": "text|object|scene|mixed",',
  '  "title": "一句话标题",',
  '  "description": "不超过 80 字的内容描述",',
  '  "language": "zh|en|mixed|unknown",',
  '  "ocrText": "图片中的全部文字，保持原有换行，没有文字则为空字符串",',
  '  "textBlocks": [{"text": "文字块内容", "type": "标题|正文|数字|标签|其他"}],',
  '  "objects": [{"name": "物体或商品名称", "category": "人物|商品|场景|文档|其他", "confidence": 0 到 1}],',
  '  "keywords": ["3 到 6 个关键词"]',
  "}",
  "规则：没有识别到文字时 ocrText 为空字符串、textBlocks 为空数组；不要编造图片中不存在的内容。"
].join("\n");

function Zhang_extractJson(Zhang_text) {
  let Zhang_raw = String(Zhang_text || "").trim();

  if (Zhang_raw.indexOf("```") !== -1) {
    Zhang_raw = Zhang_raw
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();
  }

  const Zhang_start = Zhang_raw.indexOf("{");
  const Zhang_end = Zhang_raw.lastIndexOf("}");

  if (Zhang_start === -1 || Zhang_end === -1 || Zhang_end <= Zhang_start) {
    throw new Error("大模型返回的内容不是合法 JSON");
  }

  return JSON.parse(Zhang_raw.slice(Zhang_start, Zhang_end + 1));
}

async function Zhang_callModel(Zhang_payload) {
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
    Zhang_content: Zhang_data.choices[0].message.content,
    Zhang_model: Zhang_data.model || Zhang_payload.model,
    Zhang_usage: Zhang_data.usage || null
  };
}

function Zhang_clamp(Zhang_value, Zhang_default) {
  const Zhang_num = Number(Zhang_value);

  if (!Number.isFinite(Zhang_num)) {
    return Zhang_default;
  }

  return Math.min(1, Math.max(0, Number(Zhang_num.toFixed(4))));
}

function Zhang_sentiment(Zhang_value) {
  const Zhang_v = String(Zhang_value || "").toLowerCase();
  const Zhang_allowed = ["positive", "neutral", "negative"];

  return Zhang_allowed.indexOf(Zhang_v) === -1 ? "neutral" : Zhang_v;
}

function Zhang_text(Zhang_value) {
  return typeof Zhang_value === "string" ? Zhang_value.trim() : "";
}

function Zhang_list(Zhang_value) {
  return Array.isArray(Zhang_value) ? Zhang_value : [];
}

function Zhang_normalizeReview(Zhang_json) {
  const Zhang_aspects = Zhang_list(Zhang_json.aspects)
    .slice(0, 8)
    .map(function (Zhang_item) {
      return {
        aspect: Zhang_text(Zhang_item && Zhang_item.aspect) || "整体",
        sentiment: Zhang_sentiment(Zhang_item && Zhang_item.sentiment),
        score: Zhang_clamp(Zhang_item && Zhang_item.score, 0.5),
        evidence: Zhang_text(Zhang_item && Zhang_item.evidence)
      };
    });

  const Zhang_entities = Zhang_list(Zhang_json.entities)
    .slice(0, 12)
    .map(function (Zhang_item) {
      return {
        type: Zhang_text(Zhang_item && Zhang_item.type) || "其他",
        name: Zhang_text(Zhang_item && Zhang_item.name),
        role: Zhang_text(Zhang_item && Zhang_item.role)
      };
    })
    .filter(function (Zhang_item) {
      return Zhang_item.name !== "";
    });

  const Zhang_complaint = Zhang_json.complaint || {};
  const Zhang_urgency = String(Zhang_complaint.urgency || "").toLowerCase();

  return {
    sentiment: Zhang_sentiment(Zhang_json.sentiment),
    sentimentScore: Zhang_clamp(Zhang_json.sentimentScore, 0.5),
    confidence: Zhang_clamp(Zhang_json.confidence, 0.5),
    summary: Zhang_text(Zhang_json.summary),
    aspects: Zhang_aspects,
    entities: Zhang_entities,
    keywords: Zhang_list(Zhang_json.keywords)
      .slice(0, 8)
      .map(Zhang_text)
      .filter(Boolean),
    complaint: {
      hasComplaint: Zhang_complaint.hasComplaint === true,
      type: Zhang_text(Zhang_complaint.type) || "none",
      urgency:
        ["low", "medium", "high"].indexOf(Zhang_urgency) === -1
          ? "low"
          : Zhang_urgency,
      evidence: Zhang_text(Zhang_complaint.evidence)
    }
  };
}

function Zhang_normalizeVision(Zhang_json) {
  const Zhang_types = ["text", "object", "scene", "mixed"];
  const Zhang_type = String(Zhang_json.type || "").toLowerCase();

  return {
    type: Zhang_types.indexOf(Zhang_type) === -1 ? "mixed" : Zhang_type,
    title: Zhang_text(Zhang_json.title),
    description: Zhang_text(Zhang_json.description),
    language: Zhang_text(Zhang_json.language) || "unknown",
    ocrText: typeof Zhang_json.ocrText === "string" ? Zhang_json.ocrText.trim() : "",
    textBlocks: Zhang_list(Zhang_json.textBlocks)
      .slice(0, 60)
      .map(function (Zhang_item) {
        return {
          text: Zhang_text(Zhang_item && Zhang_item.text),
          type: Zhang_text(Zhang_item && Zhang_item.type) || "正文"
        };
      })
      .filter(function (Zhang_item) {
        return Zhang_item.text !== "";
      }),
    objects: Zhang_list(Zhang_json.objects)
      .slice(0, 20)
      .map(function (Zhang_item) {
        return {
          name: Zhang_text(Zhang_item && Zhang_item.name),
          category: Zhang_text(Zhang_item && Zhang_item.category) || "其他",
          confidence: Zhang_clamp(Zhang_item && Zhang_item.confidence, 0.5)
        };
      })
      .filter(function (Zhang_item) {
        return Zhang_item.name !== "";
      }),
    keywords: Zhang_list(Zhang_json.keywords)
      .slice(0, 8)
      .map(Zhang_text)
      .filter(Boolean)
  };
}

async function Zhang_analyzeReview(Zhang_reviewText) {
  const Zhang_startedAt = Date.now();
  const Zhang_result = await Zhang_callModel({
    model: Zhang_CHAT_MODEL,
    messages: [
      { role: "system", content: Zhang_REVIEW_PROMPT },
      { role: "user", content: "评论原文：\n" + Zhang_reviewText }
    ],
    response_format: { type: "json_object" }
  });

  const Zhang_json = Zhang_extractJson(Zhang_result.Zhang_content);
  const Zhang_normalized = Zhang_normalizeReview(Zhang_json);

  console.log("[结构化结果]", JSON.stringify(Zhang_normalized, null, 2));

  return {
    meta: {
      textLength: Zhang_reviewText.length,
      model: Zhang_result.Zhang_model,
      elapsedMs: Date.now() - Zhang_startedAt,
      usage: Zhang_result.Zhang_usage
    },
    result: Zhang_normalized
  };
}

async function Zhang_analyzeImage(Zhang_buffer, Zhang_mime) {
  const Zhang_startedAt = Date.now();
  const Zhang_dataUrl =
    "data:" + (Zhang_mime || "image/png") + ";base64," + Zhang_buffer.toString("base64");

  const Zhang_result = await Zhang_callModel({
    model: Zhang_VISION_MODEL,
    messages: [
      { role: "system", content: Zhang_VISION_PROMPT },
      {
        role: "user",
        content: [
          { type: "text", text: "请识别这张图片，并按约定 JSON 结构输出。" },
          { type: "image_url", image_url: { url: Zhang_dataUrl } }
        ]
      }
    ]
  });

  const Zhang_json = Zhang_extractJson(Zhang_result.Zhang_content);
  const Zhang_normalized = Zhang_normalizeVision(Zhang_json);

  console.log("[图像结构化结果]", JSON.stringify(Zhang_normalized, null, 2));

  return {
    meta: {
      model: Zhang_result.Zhang_model,
      elapsedMs: Date.now() - Zhang_startedAt,
      usage: Zhang_result.Zhang_usage
    },
    result: Zhang_normalized
  };
}

module.exports = {
  Zhang_analyzeReview: Zhang_analyzeReview,
  Zhang_analyzeImage: Zhang_analyzeImage
};
