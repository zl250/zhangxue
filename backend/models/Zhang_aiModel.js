/*
  姓名：张雪 | 学号：24001010727 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
  说明：AI 聊天数据模型，转发请求到 SiliconFlow 的 DeepSeek 接口
*/

const Zhang_SYSTEM_PROMPT =
  "你是知乎风格的 AI 助手，回答专业、克制、有逻辑，必要时分点说明，使用简体中文。";

const Zhang_BASE_URL =
  process.env.SILICONFLOW_BASE_URL || "https://api.siliconflow.cn/v1";
const Zhang_MODEL =
  process.env.SILICONFLOW_MODEL || "deepseek-ai/DeepSeek-V4-Flash";

async function Zhang_chat(Zhang_messages) {
  const Zhang_payload = {
    model: Zhang_MODEL,
    messages: [{ role: "system", content: Zhang_SYSTEM_PROMPT }].concat(
      Zhang_messages
    )
  };

  console.log("[发送给大模型]", JSON.stringify(Zhang_payload, null, 2));

  const Zhang_response = await fetch(Zhang_BASE_URL + "/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + process.env.SILICONFLOW_API_KEY
    },
    body: JSON.stringify(Zhang_payload),
    signal: AbortSignal.timeout(60000)
  });

  const Zhang_data = await Zhang_response.json();

  console.log("[大模型返回]", JSON.stringify(Zhang_data, null, 2));

  if (!Zhang_response.ok) {
    const Zhang_error = new Error(
      (Zhang_data && Zhang_data.message) || "大模型接口调用失败"
    );
    Zhang_error.status = Zhang_response.status;
    Zhang_error.upstream = Zhang_data;
    throw Zhang_error;
  }

  return {
    Zhang_reply: Zhang_data.choices[0].message.content,
    Zhang_model: Zhang_data.model || Zhang_MODEL,
    Zhang_usage: Zhang_data.usage || null
  };
}

module.exports = {
  Zhang_chat: Zhang_chat
};
