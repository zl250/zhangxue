/*
  姓名：张雪 | 学号：24001010727 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
  说明：科技新闻列表页交互，请求 /api/news 并渲染新闻数据
*/

(function () {
  "use strict";

  var Zhang_list = document.getElementById("Zhang_newsList");
  var Zhang_count = document.getElementById("Zhang_newsCount");

  if (!Zhang_list || !Zhang_count) {
    return;
  }

  function Zhang_formatViews(Zhang_views) {
    return Number(Zhang_views || 0).toLocaleString("zh-CN");
  }

  function Zhang_createNewsItem(Zhang_item, Zhang_index) {
    var Zhang_article = document.createElement("article");
    Zhang_article.className = "Zhang_newsItem";

    var Zhang_head = document.createElement("div");
    Zhang_head.className = "Zhang_newsItem__head";

    var Zhang_tag = document.createElement("span");
    Zhang_tag.className = "Zhang_newsItem__tag";
    Zhang_tag.textContent = Zhang_item.Zhang_category;
    Zhang_head.appendChild(Zhang_tag);

    var Zhang_indexNode = document.createElement("span");
    Zhang_indexNode.className = "Zhang_newsItem__index";
    Zhang_indexNode.textContent = "NO." + String(Zhang_index + 1).padStart(2, "0");
    Zhang_head.appendChild(Zhang_indexNode);

    var Zhang_time = document.createElement("time");
    Zhang_time.className = "Zhang_newsItem__time";
    Zhang_time.textContent = Zhang_item.Zhang_time;
    Zhang_head.appendChild(Zhang_time);

    var Zhang_title = document.createElement("h3");
    Zhang_title.className = "Zhang_newsItem__title";
    Zhang_title.textContent = Zhang_item.Zhang_title;

    var Zhang_summary = document.createElement("p");
    Zhang_summary.className = "Zhang_newsItem__summary";
    Zhang_summary.textContent = Zhang_item.Zhang_summary;

    var Zhang_foot = document.createElement("div");
    Zhang_foot.className = "Zhang_newsItem__foot";

    var Zhang_source = document.createElement("span");
    Zhang_source.textContent = "来源 · " + Zhang_item.Zhang_source;
    Zhang_foot.appendChild(Zhang_source);

    var Zhang_views = document.createElement("span");
    Zhang_views.className = "Zhang_newsItem__views";
    Zhang_views.textContent = "浏览 " + Zhang_formatViews(Zhang_item.Zhang_views);
    Zhang_foot.appendChild(Zhang_views);

    Zhang_article.appendChild(Zhang_head);
    Zhang_article.appendChild(Zhang_title);
    Zhang_article.appendChild(Zhang_summary);
    Zhang_article.appendChild(Zhang_foot);

    return Zhang_article;
  }

  function Zhang_renderList(Zhang_items) {
    Zhang_list.textContent = "";

    Zhang_items.forEach(function (Zhang_item, Zhang_index) {
      Zhang_list.appendChild(Zhang_createNewsItem(Zhang_item, Zhang_index));
    });
  }

  function Zhang_showState(Zhang_message, Zhang_isError) {
    Zhang_list.textContent = "";

    var Zhang_state = document.createElement("div");
    Zhang_state.className = "Zhang_newsState" + (Zhang_isError ? " is-error" : "");
    Zhang_state.textContent = Zhang_message;

    if (Zhang_isError) {
      var Zhang_retry = document.createElement("button");
      Zhang_retry.type = "button";
      Zhang_retry.className = "Zhang_newsRetry";
      Zhang_retry.textContent = "重新加载";
      Zhang_retry.addEventListener("click", Zhang_loadNews);
      Zhang_state.appendChild(document.createElement("br"));
      Zhang_state.appendChild(Zhang_retry);
    }

    Zhang_list.appendChild(Zhang_state);
  }

  function Zhang_loadNews() {
    Zhang_count.textContent = "加载中…";
    Zhang_showState("正在从数据库读取科技新闻…", false);

    fetch("/api/news")
      .then(function (Zhang_response) {
        if (!Zhang_response.ok) {
          throw new Error("HTTP " + Zhang_response.status);
        }
        return Zhang_response.json();
      })
      .then(function (Zhang_result) {
        console.log("[科技新闻] /api/news", Zhang_result);

        if (Zhang_result.code !== 0 || !Zhang_result.data) {
          throw new Error(Zhang_result.msg || "接口返回异常");
        }

        var Zhang_items = Zhang_result.data.list || [];
        Zhang_count.textContent = "共 " + Zhang_result.data.total + " 条";
        Zhang_renderList(Zhang_items);
      })
      .catch(function (Zhang_error) {
        console.error("[科技新闻加载失败] /api/news", Zhang_error);
        Zhang_count.textContent = "加载失败";
        Zhang_showState("新闻加载失败：" + Zhang_error.message + "，请检查后端服务与数据库。", true);
      });
  }

  Zhang_loadNews();
})();
