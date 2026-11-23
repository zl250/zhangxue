/*
  姓名：张雪 | 学号：24001010727 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
  说明：AI 聊天页交互，向 /api/ai/chat 发送对话并在控制台输出收发数据
*/

(function () {
  "use strict";

  var Zhang_messagesBox = document.getElementById("Zhang_chatMessages");
  var Zhang_form = document.getElementById("Zhang_chatForm");
  var Zhang_field = document.getElementById("Zhang_chatField");
  var Zhang_sendBtn = document.getElementById("Zhang_chatSend");
  var Zhang_clearBtn = document.getElementById("Zhang_chatClear");
  var Zhang_state = document.getElementById("Zhang_chatState");

  if (!Zhang_messagesBox || !Zhang_form) {
    return;
  }

  var Zhang_history = [];
  var Zhang_pending = false;

  function Zhang_scrollToBottom() {
    Zhang_messagesBox.scrollTop = Zhang_messagesBox.scrollHeight;
  }

  function Zhang_addBubble(Zhang_role, Zhang_text, Zhang_isError) {
    var Zhang_msg = document.createElement("div");
    Zhang_msg.className =
      "Zhang_msg " + (Zhang_role === "user" ? "Zhang_msg--user" : "Zhang_msg--ai");

    if (Zhang_isError) {
      Zhang_msg.className += " Zhang_msg--error";
    }

    var Zhang_avatar = document.createElement("span");
    Zhang_avatar.className = "Zhang_msg__avatar";
    Zhang_avatar.textContent = Zhang_role === "user" ? "我" : "AI";

    var Zhang_bubble = document.createElement("div");
    Zhang_bubble.className = "Zhang_msg__bubble";
    Zhang_bubble.textContent = Zhang_text;

    Zhang_msg.appendChild(Zhang_avatar);
    Zhang_msg.appendChild(Zhang_bubble);
    Zhang_messagesBox.appendChild(Zhang_msg);
    Zhang_scrollToBottom();

    return Zhang_msg;
  }

  function Zhang_addTyping() {
    var Zhang_msg = document.createElement("div");
    Zhang_msg.className = "Zhang_msg Zhang_msg--ai";

    var Zhang_avatar = document.createElement("span");
    Zhang_avatar.className = "Zhang_msg__avatar";
    Zhang_avatar.textContent = "AI";

    var Zhang_bubble = document.createElement("div");
    Zhang_bubble.className = "Zhang_msg__bubble";

    var Zhang_typing = document.createElement("span");
    Zhang_typing.className = "Zhang_msg__typing";
    Zhang_typing.innerHTML = "<i></i><i></i><i></i>";

    Zhang_bubble.appendChild(Zhang_typing);
    Zhang_msg.appendChild(Zhang_avatar);
    Zhang_msg.appendChild(Zhang_bubble);
    Zhang_messagesBox.appendChild(Zhang_msg);
    Zhang_scrollToBottom();

    return Zhang_msg;
  }

  function Zhang_setPending(Zhang_isPending) {
    Zhang_pending = Zhang_isPending;
    Zhang_sendBtn.disabled = Zhang_isPending;
    Zhang_state.textContent = Zhang_isPending ? "正在思考…" : "在线 · 随时可以提问";
  }

  function Zhang_greet() {
    Zhang_addBubble(
      "assistant",
      "你好，我是知乎 AI 助手。可以问我技术、学习或生活相关的问题。"
    );
  }

  function Zhang_sendMessage(Zhang_text) {
    Zhang_history.push({ role: "user", content: Zhang_text });
    Zhang_addBubble("user", Zhang_text);

    Zhang_field.value = "";
    Zhang_field.style.height = "";
    Zhang_setPending(true);

    var Zhang_typingNode = Zhang_addTyping();
    var Zhang_payload = { messages: Zhang_history.slice() };

    console.log("[发送给大模型] POST /api/ai/chat", Zhang_payload);

    fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Zhang_payload)
    })
      .then(function (Zhang_response) {
        return Zhang_response.json();
      })
      .then(function (Zhang_result) {
        console.log("[收到大模型数据] /api/ai/chat", Zhang_result);

        Zhang_typingNode.remove();

        if (Zhang_result.code !== 0 || !Zhang_result.data) {
          Zhang_addBubble("assistant", "请求失败：" + Zhang_result.msg, true);
          Zhang_history.pop();
          return;
        }

        Zhang_addBubble("assistant", Zhang_result.data.reply);
        Zhang_history.push({ role: "assistant", content: Zhang_result.data.reply });
      })
      .catch(function (Zhang_error) {
        console.error("[AI 聊天请求失败] /api/ai/chat", Zhang_error);
        Zhang_typingNode.remove();
        Zhang_addBubble("assistant", "网络异常：" + Zhang_error.message, true);
        Zhang_history.pop();
      })
      .then(function () {
        Zhang_setPending(false);
        Zhang_field.focus();
      });
  }

  Zhang_form.addEventListener("submit", function (Zhang_event) {
    Zhang_event.preventDefault();

    if (Zhang_pending) {
      return;
    }

    var Zhang_text = Zhang_field.value.trim();

    if (!Zhang_text) {
      Zhang_field.focus();
      return;
    }

    Zhang_sendMessage(Zhang_text);
  });

  Zhang_field.addEventListener("keydown", function (Zhang_event) {
    if (Zhang_event.key === "Enter" && !Zhang_event.shiftKey) {
      Zhang_event.preventDefault();
      Zhang_form.requestSubmit();
    }
  });

  Zhang_field.addEventListener("input", function () {
    Zhang_field.style.height = "auto";
    Zhang_field.style.height = Math.min(Zhang_field.scrollHeight, 140) + "px";
  });

  Zhang_clearBtn.addEventListener("click", function () {
    Zhang_history = [];
    Zhang_messagesBox.textContent = "";
    console.log("[对话已清空]");
    Zhang_greet();
    Zhang_field.focus();
  });

  Zhang_greet();
})();
