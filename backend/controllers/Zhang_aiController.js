/*
  姓名：张雪 | 学号：24001010727 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
  说明：AI 聊天控制器，校验对话消息并返回模型回复
*/

const Zhang_aiModel = require("../models/Zhang_aiModel");

const Zhang_ROLES = ["user", "assistant"];

function Zhang_parseMessages(Zhang_body) {
  const Zhang_messages = Zhang_body && Zhang_body.messages;

  if (!Array.isArray(Zhang_messages) || Zhang_messages.length === 0) {
    return { Zhang_error: "messages 不能为空，且必须是数组。" };
  }

  if (Zhang_messages.length > 20) {
    return { Zhang_error: "单次对话最多携带 20 条历史消息。" };
  }

  const Zhang_cleaned = [];

  for (let Zhang_i = 0; Zhang_i < Zhang_messages.length; Zhang_i++) {
    const Zhang_item = Zhang_messages[Zhang_i] || {};
    const Zhang_role = Zhang_item.role;
    const Zhang_content =
      typeof Zhang_item.content === "string" ? Zhang_item.content.trim() : "";

    if (Zhang_ROLES.indexOf(Zhang_role) === -1) {
      return { Zhang_error: "消息角色只能是 user 或 assistant。" };
    }

    if (!Zhang_content) {
      return { Zhang_error: "消息内容不能为空。" };
    }

    if (Zhang_content.length > 2000) {
      return { Zhang_error: "单条消息不能超过 2000 个字符。" };
    }

    Zhang_cleaned.push({ role: Zhang_role, content: Zhang_content });
  }

  if (Zhang_cleaned[Zhang_cleaned.length - 1].role !== "user") {
    return { Zhang_error: "最后一条消息必须来自用户。" };
  }

  return { Zhang_messages: Zhang_cleaned };
}

async function Zhang_chat(req, res) {
  const Zhang_parsed = Zhang_parseMessages(req.body);

  if (Zhang_parsed.Zhang_error) {
    return res.status(400).json({
      code: 400,
      msg: Zhang_parsed.Zhang_error,
      data: null
    });
  }

  try {
    const Zhang_result = await Zhang_aiModel.Zhang_chat(
      Zhang_parsed.Zhang_messages
    );

    res.json({
      code: 0,
      msg: "AI 回复成功",
      data: {
        reply: Zhang_result.Zhang_reply,
        model: Zhang_result.Zhang_model,
        usage: Zhang_result.Zhang_usage
      }
    });
  } catch (Zhang_error) {
    console.error("[AI 聊天失败]", Zhang_error.status || "", Zhang_error.message);

    if (Zhang_error.name === "TimeoutError") {
      return res.json({
        code: 5006,
        msg: "大模型响应超时，请稍后重试。",
        data: null
      });
    }

    if (Zhang_error.status === 401) {
      return res.json({
        code: 5004,
        msg: "API 密钥无效，请检查 backend/.env 中的 SILICONFLOW_API_KEY。",
        data: null
      });
    }

    if (Zhang_error.status === 429) {
      return res.json({
        code: 5005,
        msg: "请求过于频繁，请稍后再试。",
        data: null
      });
    }

    res.json({
      code: 5007,
      msg: "AI 服务暂时不可用：" + Zhang_error.message,
      data: null
    });
  }
}

module.exports = {
  Zhang_chat: Zhang_chat
};
