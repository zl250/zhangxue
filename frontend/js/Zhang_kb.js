/*
  姓名：张雪 | 学号：24001010727 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
  说明：知识库问答页交互，处理文件上传、文档管理与 RAG 问答，并在控制台输出收发数据
*/

(function () {
  "use strict";

  var Zhang_fileInput = document.getElementById("Zhang_kbFile");
  var Zhang_drop = document.getElementById("Zhang_kbDrop");
  var Zhang_status = document.getElementById("Zhang_kbStatus");
  var Zhang_docsBox = document.getElementById("Zhang_kbDocs");
  var Zhang_stats = document.getElementById("Zhang_kbStats");
  var Zhang_refresh = document.getElementById("Zhang_kbRefresh");
  var Zhang_answerBox = document.getElementById("Zhang_kbAnswer");
  var Zhang_form = document.getElementById("Zhang_kbAskForm");
  var Zhang_question = document.getElementById("Zhang_kbQuestion");
  var Zhang_askBtn = document.getElementById("Zhang_kbAskBtn");
  var Zhang_samples = document.getElementById("Zhang_kbSamples");

  if (!Zhang_docsBox || !Zhang_form) {
    return;
  }

  var Zhang_busy = false;

  /* ---------------- 工具函数 ---------------- */

  function Zhang_formatSize(Zhang_bytes) {
    if (!Zhang_bytes) {
      return "0 B";
    }

    if (Zhang_bytes < 1024) {
      return Zhang_bytes + " B";
    }

    if (Zhang_bytes < 1024 * 1024) {
      return (Zhang_bytes / 1024).toFixed(1) + " KB";
    }

    return (Zhang_bytes / 1024 / 1024).toFixed(1) + " MB";
  }

  function Zhang_setStatus(Zhang_text, Zhang_type) {
    Zhang_status.textContent = Zhang_text || "";
    Zhang_status.className = "Zhang_kbStatus";

    if (Zhang_type === "ok") {
      Zhang_status.className += " Zhang_kbStatus--ok";
    } else if (Zhang_type === "error") {
      Zhang_status.className += " Zhang_kbStatus--error";
    }
  }

  /* ---------------- 文档列表 ---------------- */

  function Zhang_renderDocs(Zhang_docs) {
    Zhang_docsBox.textContent = "";

    if (!Zhang_docs || Zhang_docs.length === 0) {
      var Zhang_empty = document.createElement("li");
      Zhang_empty.className = "Zhang_kbDocs__empty";
      Zhang_empty.textContent = "知识库还是空的，先上传一个文件试试。";
      Zhang_docsBox.appendChild(Zhang_empty);
      return;
    }

    Zhang_docs.forEach(function (Zhang_doc) {
      var Zhang_item = document.createElement("li");
      Zhang_item.className = "Zhang_kbDoc";

      var Zhang_ext = document.createElement("span");
      Zhang_ext.className = "Zhang_kbDoc__ext";
      Zhang_ext.textContent = (Zhang_doc.ext || "").replace(".", "");

      var Zhang_body = document.createElement("div");
      Zhang_body.className = "Zhang_kbDoc__body";

      var Zhang_name = document.createElement("p");
      Zhang_name.className = "Zhang_kbDoc__name";
      Zhang_name.textContent = Zhang_doc.name;
      Zhang_name.title = Zhang_doc.name;

      var Zhang_meta = document.createElement("p");
      Zhang_meta.className = "Zhang_kbDoc__meta";
      Zhang_meta.textContent =
        Zhang_formatSize(Zhang_doc.size) +
        " · " +
        Zhang_doc.charCount +
        " 字符 · " +
        Zhang_doc.chunkCount +
        " 个分块 · " +
        Zhang_doc.time;

      Zhang_body.appendChild(Zhang_name);
      Zhang_body.appendChild(Zhang_meta);

      var Zhang_del = document.createElement("button");
      Zhang_del.className = "Zhang_kbDoc__del";
      Zhang_del.type = "button";
      Zhang_del.textContent = "删除";
      Zhang_del.addEventListener("click", function () {
        Zhang_deleteDoc(Zhang_doc);
      });

      Zhang_item.appendChild(Zhang_ext);
      Zhang_item.appendChild(Zhang_body);
      Zhang_item.appendChild(Zhang_del);
      Zhang_docsBox.appendChild(Zhang_item);
    });
  }

  function Zhang_loadDocs() {
    fetch("/api/kb/documents")
      .then(function (Zhang_response) {
        return Zhang_response.json();
      })
      .then(function (Zhang_result) {
        console.log("[收到知识库文档]", Zhang_result);

        if (Zhang_result.code !== 0 || !Zhang_result.data) {
          Zhang_setStatus("读取失败：" + Zhang_result.msg, "error");
          return;
        }

        Zhang_renderDocs(Zhang_result.data.documents);
        Zhang_stats.textContent =
          "文档 " +
          Zhang_result.data.total +
          " 个 · 分块 " +
          Zhang_result.data.totalChunks +
          " 个";
      })
      .catch(function (Zhang_error) {
        console.error("[知识库文档读取失败]", Zhang_error);
        Zhang_setStatus("网络异常：" + Zhang_error.message, "error");
      });
  }

  /* ---------------- 上传 ---------------- */

  function Zhang_uploadOne(Zhang_file) {
    console.log(
      "[发送给后端] POST /api/kb/upload",
      { name: Zhang_file.name, size: Zhang_file.size, type: Zhang_file.type }
    );

    return fetch("/api/kb/upload", {
      method: "POST",
      body: (function () {
        var Zhang_data = new FormData();
        Zhang_data.append("file", Zhang_file);
        return Zhang_data;
      })()
    })
      .then(function (Zhang_response) {
        return Zhang_response.json();
      })
      .then(function (Zhang_result) {
        console.log("[收到上传结果]", Zhang_result);

        if (Zhang_result.code !== 0) {
          throw new Error(Zhang_result.msg);
        }

        Zhang_setStatus(
          "已上传：" +
            Zhang_result.data.name +
            "（" +
            Zhang_result.data.chunkCount +
            " 个分块）",
          "ok"
        );
      });
  }

  function Zhang_uploadFiles(Zhang_files) {
    var Zhang_list = Array.prototype.slice.call(Zhang_files || []);

    if (Zhang_list.length === 0 || Zhang_busy) {
      return;
    }

    Zhang_busy = true;
    Zhang_drop.className = "Zhang_kbDrop Zhang_kbDrop--busy";
    Zhang_setStatus("正在解析并向量化，请稍候…");

    var Zhang_chain = Promise.resolve();

    Zhang_list.forEach(function (Zhang_file) {
      Zhang_chain = Zhang_chain.then(function () {
        Zhang_setStatus("正在上传：" + Zhang_file.name);
        return Zhang_uploadOne(Zhang_file);
      });
    });

    Zhang_chain
      .catch(function (Zhang_error) {
        console.error("[知识库上传失败]", Zhang_error);
        Zhang_setStatus("上传失败：" + Zhang_error.message, "error");
      })
      .then(function () {
        Zhang_busy = false;
        Zhang_drop.className = "Zhang_kbDrop";
        Zhang_fileInput.value = "";
        Zhang_loadDocs();
      });
  }

  function Zhang_deleteDoc(Zhang_doc) {
    if (!window.confirm("确定删除《" + Zhang_doc.name + "》及其全部分块吗？")) {
      return;
    }

    fetch("/api/kb/documents/" + Zhang_doc.id, { method: "DELETE" })
      .then(function (Zhang_response) {
        return Zhang_response.json();
      })
      .then(function (Zhang_result) {
        console.log("[删除知识库文档]", Zhang_result);

        if (Zhang_result.code !== 0) {
          Zhang_setStatus("删除失败：" + Zhang_result.msg, "error");
          return;
        }

        Zhang_setStatus("已删除：" + Zhang_doc.name, "ok");
        Zhang_loadDocs();
      })
      .catch(function (Zhang_error) {
        console.error("[删除知识库文档失败]", Zhang_error);
        Zhang_setStatus("网络异常：" + Zhang_error.message, "error");
      });
  }

  /* ---------------- 问答 ---------------- */

  function Zhang_renderAnswer(Zhang_result) {
    Zhang_answerBox.textContent = "";

    var Zhang_text = document.createElement("div");
    Zhang_text.className = "Zhang_kbAnswer__text";
    Zhang_text.textContent = Zhang_result.answer;
    Zhang_answerBox.appendChild(Zhang_text);

    var Zhang_meta = document.createElement("p");
    Zhang_meta.className = "Zhang_kbAnswer__meta";
    Zhang_meta.textContent =
      "模型：" +
      Zhang_result.model +
      (Zhang_result.usage
        ? " · tokens：" + Zhang_result.usage.total_tokens
        : "");
    Zhang_answerBox.appendChild(Zhang_meta);

    if (Zhang_result.sources && Zhang_result.sources.length > 0) {
      var Zhang_sources = document.createElement("div");
      Zhang_sources.className = "Zhang_kbSources";

      var Zhang_title = document.createElement("p");
      Zhang_title.className = "Zhang_kbSources__title";
      Zhang_title.textContent = "引用来源 · TOP " + Zhang_result.sources.length;
      Zhang_sources.appendChild(Zhang_title);

      Zhang_result.sources.forEach(function (Zhang_source, Zhang_index) {
        var Zhang_card = document.createElement("div");
        Zhang_card.className = "Zhang_kbSource";

        var Zhang_head = document.createElement("button");
        Zhang_head.className = "Zhang_kbSource__head";
        Zhang_head.type = "button";

        var Zhang_label = document.createElement("span");
        Zhang_label.textContent =
          "资料" +
          (Zhang_index + 1) +
          " · " +
          Zhang_source.name +
          " · 片段 " +
          Zhang_source.chunkIndex;

        var Zhang_score = document.createElement("span");
        Zhang_score.className = "Zhang_kbSource__score";
        Zhang_score.textContent = "相似度 " + Zhang_source.score;

        var Zhang_content = document.createElement("p");
        Zhang_content.className = "Zhang_kbSource__content";
        Zhang_content.textContent = Zhang_source.content;

        Zhang_head.appendChild(Zhang_label);
        Zhang_head.appendChild(Zhang_score);
        Zhang_head.addEventListener("click", function () {
          Zhang_card.className =
            Zhang_card.className === "Zhang_kbSource"
              ? "Zhang_kbSource Zhang_kbSource--open"
              : "Zhang_kbSource";
        });

        Zhang_card.appendChild(Zhang_head);
        Zhang_card.appendChild(Zhang_content);
        Zhang_sources.appendChild(Zhang_card);
      });

      Zhang_answerBox.appendChild(Zhang_sources);
    }

    Zhang_answerBox.scrollTop = 0;
  }

  function Zhang_setAskBusy(Zhang_isBusy) {
    Zhang_busy = Zhang_isBusy;
    Zhang_askBtn.disabled = Zhang_isBusy;
    Zhang_askBtn.textContent = Zhang_isBusy ? "检索中…" : "提问";
  }

  function Zhang_ask(Zhang_text) {
    if (Zhang_busy) {
      return;
    }

    var Zhang_payload = { question: Zhang_text };

    Zhang_setAskBusy(true);
    Zhang_answerBox.textContent = "";
    var Zhang_loading = document.createElement("p");
    Zhang_loading.className = "Zhang_kbAnswer__placeholder";
    Zhang_loading.textContent = "正在检索知识库并请求大模型…";
    Zhang_answerBox.appendChild(Zhang_loading);

    console.log("[发送给大模型] POST /api/kb/ask", Zhang_payload);

    fetch("/api/kb/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Zhang_payload)
    })
      .then(function (Zhang_response) {
        return Zhang_response.json();
      })
      .then(function (Zhang_result) {
        console.log("[收到大模型数据] /api/kb/ask", Zhang_result);

        if (Zhang_result.code !== 0 || !Zhang_result.data) {
          Zhang_answerBox.textContent = "";
          var Zhang_err = document.createElement("p");
          Zhang_err.className = "Zhang_kbErr";
          Zhang_err.textContent = "提问失败：" + Zhang_result.msg;
          Zhang_answerBox.appendChild(Zhang_err);
          return;
        }

        Zhang_renderAnswer(Zhang_result.data);
      })
      .catch(function (Zhang_error) {
        console.error("[知识库问答请求失败]", Zhang_error);
        Zhang_answerBox.textContent = "";
        var Zhang_err = document.createElement("p");
        Zhang_err.className = "Zhang_kbErr";
        Zhang_err.textContent = "网络异常：" + Zhang_error.message;
        Zhang_answerBox.appendChild(Zhang_err);
      })
      .then(function () {
        Zhang_setAskBusy(false);
        Zhang_question.focus();
      });
  }

  /* ---------------- 事件绑定 ---------------- */

  if (Zhang_fileInput) {
    Zhang_fileInput.addEventListener("change", function () {
      Zhang_uploadFiles(Zhang_fileInput.files);
    });
  }

  if (Zhang_drop) {
    ["dragenter", "dragover"].forEach(function (Zhang_name) {
      Zhang_drop.addEventListener(Zhang_name, function (Zhang_event) {
        Zhang_event.preventDefault();
        Zhang_drop.className = "Zhang_kbDrop Zhang_kbDrop--over";
      });
    });

    ["dragleave", "drop"].forEach(function (Zhang_name) {
      Zhang_drop.addEventListener(Zhang_name, function (Zhang_event) {
        Zhang_event.preventDefault();

        if (!Zhang_busy) {
          Zhang_drop.className = "Zhang_kbDrop";
        }
      });
    });

    Zhang_drop.addEventListener("drop", function (Zhang_event) {
      if (Zhang_event.dataTransfer && Zhang_event.dataTransfer.files) {
        Zhang_uploadFiles(Zhang_event.dataTransfer.files);
      }
    });
  }

  Zhang_refresh.addEventListener("click", function () {
    Zhang_setStatus("正在刷新文档列表…");
    Zhang_loadDocs();
  });

  Zhang_form.addEventListener("submit", function (Zhang_event) {
    Zhang_event.preventDefault();

    var Zhang_text = Zhang_question.value.trim();

    if (!Zhang_text) {
      Zhang_question.focus();
      return;
    }

    Zhang_ask(Zhang_text);
  });

  Zhang_question.addEventListener("keydown", function (Zhang_event) {
    if (Zhang_event.key === "Enter" && !Zhang_event.shiftKey) {
      Zhang_event.preventDefault();
      Zhang_form.requestSubmit();
    }
  });

  Zhang_question.addEventListener("input", function () {
    Zhang_question.style.height = "auto";
    Zhang_question.style.height =
      Math.min(Zhang_question.scrollHeight, 140) + "px";
  });

  if (Zhang_samples) {
    Zhang_samples.addEventListener("click", function (Zhang_event) {
      var Zhang_target = Zhang_event.target;

      if (
        Zhang_target &&
        Zhang_target.className.indexOf("Zhang_kbSample") === 0
      ) {
        Zhang_question.value = Zhang_target.textContent;
        Zhang_form.requestSubmit();
      }
    });
  }

  Zhang_loadDocs();
})();
