/*
  姓名：张雪 | 学号：24001010727 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
  说明：数据库连接页交互，调用 /api/database/defaults 与 /api/database/connect
*/

(function () {
  "use strict";

  var Zhang_form = document.getElementById("Zhang_dbForm");
  var Zhang_userInput = document.getElementById("Zhang_dbUser");
  var Zhang_passInput = document.getElementById("Zhang_dbPass");
  var Zhang_submitBtn = document.getElementById("Zhang_dbSubmit");
  var Zhang_statusBox = document.getElementById("Zhang_dbStatus");

  if (!Zhang_form || !Zhang_userInput || !Zhang_passInput || !Zhang_submitBtn || !Zhang_statusBox) {
    return;
  }

  function Zhang_showStatus(Zhang_type, Zhang_title, Zhang_detail, Zhang_extra) {
    Zhang_statusBox.hidden = false;
    Zhang_statusBox.className =
      "Zhang_status " + (Zhang_type === "success" ? "is-success" : "is-error");
    Zhang_statusBox.textContent = "";

    var Zhang_titleNode = document.createElement("strong");
    Zhang_titleNode.className = "Zhang_status__title";
    Zhang_titleNode.textContent = Zhang_title;
    Zhang_statusBox.appendChild(Zhang_titleNode);

    if (Zhang_detail) {
      var Zhang_detailNode = document.createElement("span");
      Zhang_detailNode.className = "Zhang_status__detail";
      Zhang_detailNode.textContent = Zhang_detail;
      Zhang_statusBox.appendChild(Zhang_detailNode);
    }

    if (Zhang_extra) {
      var Zhang_metaNode = document.createElement("div");
      Zhang_metaNode.className = "Zhang_status__meta";

      Zhang_extra.forEach(function (Zhang_item) {
        var Zhang_span = document.createElement("span");
        Zhang_span.textContent = Zhang_item;
        Zhang_metaNode.appendChild(Zhang_span);
      });

      Zhang_statusBox.appendChild(Zhang_metaNode);
    }
  }

  function Zhang_setLoading(Zhang_isLoading) {
    Zhang_submitBtn.disabled = Zhang_isLoading;
    Zhang_submitBtn.classList.toggle("is-loading", Zhang_isLoading);
    Zhang_submitBtn.querySelector(".Zhang_dbBtn__text").textContent = Zhang_isLoading
      ? "连接中"
      : "连接数据库";
  }

  function Zhang_loadDefaults() {
    fetch("/api/database/defaults")
      .then(function (Zhang_response) {
        if (!Zhang_response.ok) {
          throw new Error("HTTP " + Zhang_response.status);
        }
        return Zhang_response.json();
      })
      .then(function (Zhang_result) {
        console.log("[默认配置] /api/database/defaults", Zhang_result);

        if (Zhang_result.code !== 0 || !Zhang_result.data) {
          return;
        }

        if (Zhang_result.data.username && !Zhang_userInput.value) {
          Zhang_userInput.value = Zhang_result.data.username;
        }

        if (Zhang_result.data.password && !Zhang_passInput.value) {
          Zhang_passInput.value = Zhang_result.data.password;
        }
      })
      .catch(function (Zhang_error) {
        console.error("[默认配置获取失败] /api/database/defaults", Zhang_error);
      });
  }

  Zhang_form.addEventListener("submit", function (Zhang_event) {
    Zhang_event.preventDefault();

    var Zhang_username = Zhang_userInput.value.trim();
    var Zhang_password = Zhang_passInput.value;

    if (!Zhang_username || !Zhang_password) {
      Zhang_showStatus("error", "请补全连接信息", "用户名和密码都不能为空。");
      return;
    }

    Zhang_setLoading(true);
    Zhang_statusBox.hidden = true;

    fetch("/api/database/connect", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: Zhang_username,
        password: Zhang_password
      })
    })
      .then(function (Zhang_response) {
        var Zhang_contentType = Zhang_response.headers.get("content-type") || "";
        if (Zhang_contentType.indexOf("application/json") === -1) {
          throw new Error("接口返回格式异常（HTTP " + Zhang_response.status + "）");
        }
        return Zhang_response.json();
      })
      .then(function (Zhang_result) {
        console.log("[数据库连接] /api/database/connect", Zhang_result);

        if (Zhang_result.code === 0 && Zhang_result.data) {
          var Zhang_data = Zhang_result.data;
          Zhang_showStatus(
            "success",
            "数据库连接成功",
            "已成功连接到 MySQL 服务，可以继续开发数据表与接口。",
            [
              "用户名：" + Zhang_username,
              "服务版本：" + (Zhang_data.version || "未知"),
              "主机名：" + (Zhang_data.hostname || "未知")
            ]
          );
          return;
        }

        var Zhang_extraInfo = [];
        if (Zhang_result.data && Zhang_result.data.errorCode) {
          Zhang_extraInfo.push("错误码：" + Zhang_result.data.errorCode);
        }
        Zhang_showStatus(
          "error",
          "数据库连接失败",
          Zhang_result.msg || "未知错误，请检查账号信息。",
          Zhang_extraInfo
        );
      })
      .catch(function (Zhang_error) {
        console.error("[数据库连接请求失败] /api/database/connect", Zhang_error);
        Zhang_showStatus(
          "error",
          "无法连接后端服务",
          Zhang_error.message + "，请确认后端已启动（端口 727）。"
        );
      })
      .finally(function () {
        Zhang_setLoading(false);
      });
  });

  Zhang_loadDefaults();
})();
